import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import {
  parseCustodianCSV,
  reconcilePortfolioDrift,
  STANDARD_MODELS,
} from './portfolio-engine.js';
import { CustodianHolding, CustodianType, TargetModelPortfolio, RebalanceOrder } from '../../types/portfolio.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';
import { runPortfolioMonitorJob, generateDriftAlertHtml } from './portfolio-monitor.js';
import {
  generateFixOrderBatch,
  simulateFixExecution,
  FixMessage,
} from './fix-protocol.js';

export async function portfolioRoutes(fastify: FastifyInstance) {
  // GET /v1/portfolio/models
  fastify.get('/portfolio/models', { preHandler: [requireAuth] }, async (_req, reply) => {
    return reply.send({
      models: Object.values(STANDARD_MODELS),
    });
  });

  // POST /v1/portfolio/parse-csv
  fastify.post('/portfolio/parse-csv', { preHandler: [requireAuth] }, async (req, reply) => {
    const body = (req.body as any) || {};
    const { csvContent, custodian = 'generic' } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'A valid "csvContent" string is required.',
      });
    }

    try {
      const holdings = parseCustodianCSV(csvContent, custodian as CustodianType);
      return reply.send({
        custodian,
        totalPositions: holdings.length,
        holdings,
      });
    } catch (err: any) {
      req.log.error(err, 'Failed to parse custodian CSV');
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Failed to parse custodian CSV format.',
      });
    }
  });

  // POST /v1/portfolio/reconcile
  fastify.post('/portfolio/reconcile', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const {
      csvContent,
      holdings: rawHoldings,
      modelId = 'MODERATE_GROWTH',
      customModel,
      custodian = 'generic',
      clientId,
    } = body;

    let holdings: CustodianHolding[] = [];

    if (csvContent && typeof csvContent === 'string') {
      holdings = parseCustodianCSV(csvContent, custodian as CustodianType);
    } else if (Array.isArray(rawHoldings) && rawHoldings.length > 0) {
      holdings = rawHoldings;
    }

    if (holdings.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Either "csvContent" or a non-empty "holdings" array must be provided.',
      });
    }

    const selectedModel: TargetModelPortfolio =
      customModel || STANDARD_MODELS[modelId] || STANDARD_MODELS.MODERATE_GROWTH;

    try {
      const result = reconcilePortfolioDrift(holdings, selectedModel, custodian as CustodianType);

      // Audit trail persistence
      const supabase = getSupabaseAdmin();
      const auditPayload = scopeFirm(
        {
          action: 'PORTFOLIO_RECONCILIATION',
          user_id: user.id,
          client_id: clientId || null,
          metadata: {
            custodian,
            modelId: selectedModel.id,
            totalMarketValue: result.totalMarketValue,
            requiresRebalance: result.requiresRebalance,
            orderCount: result.recommendedOrders.length,
            taxHarvestOpportunities: result.taxHarvestOpportunities.length,
          },
        },
        user.firm_id
      );

      try {
        await supabase.from('audit_logs').insert(auditPayload);
      } catch {}

      return reply.send(result);
    } catch (err: any) {
      req.log.error(err, 'Portfolio reconciliation error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: err.message || 'Failed to execute portfolio drift reconciliation.',
      });
    }
  });

  // POST /v1/portfolio/fix/generate (Generate FIX 4.4 Orders)
  fastify.post('/portfolio/fix/generate', { preHandler: [requireAuth] }, async (req, reply) => {
    const body = (req.body as any) || {};
    const { orders = [], accountNumber = 'ACC-882190', custodian = 'schwab' } = body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'A non-empty array of "orders" is required.',
      });
    }

    try {
      const fixMessages = generateFixOrderBatch(orders as RebalanceOrder[], accountNumber, custodian as CustodianType);
      return reply.send({
        custodian,
        accountNumber,
        totalOrders: fixMessages.length,
        fixMessages,
      });
    } catch (err: any) {
      req.log.error(err, 'Error generating FIX messages');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/portfolio/fix/transmit (Fiduciary HITL Order Transmission & Fill Simulator)
  fastify.post('/portfolio/fix/transmit', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { fixMessages = [], clientName = 'Sarah Jenkins', notes } = body;

    if (!Array.isArray(fixMessages) || fixMessages.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Array of "fixMessages" is required for transmission.',
      });
    }

    try {
      const executionReports = (fixMessages as FixMessage[]).map((msg) => simulateFixExecution(msg));
      const totalExecutedValue = executionReports.reduce((sum, r) => sum + r.lastPx * r.lastQty, 0);

      // Write WORM Compliance Audit Log
      const supabase = getSupabaseAdmin();
      const auditEntry = scopeFirm(
        {
          action: 'FIX_PROTOCOL_ORDERS_TRANSMITTED',
          user_id: user.id,
          entity_type: 'trade_order_batch',
          details: {
            clientName,
            notes: notes || 'Advisor signed-off rebalance execution via FIX Protocol',
            orderCount: fixMessages.length,
            totalExecutedValue,
            custodian: fixMessages[0]?.custodian || 'schwab',
            reports: executionReports.map((r) => ({
              clOrdId: r.clOrdId,
              execId: r.execId,
              symbol: r.symbol,
              side: r.side,
              qty: r.orderQty,
              avgPx: r.avgPx,
              status: r.ordStatus,
            })),
          },
          timestamp: new Date().toISOString(),
        },
        user.firm_id
      );

      try {
        await supabase.from('audit_logs').insert(auditEntry);
      } catch {}

      return reply.send({
        success: true,
        message: `Successfully routed ${executionReports.length} FIX orders to ${fixMessages[0]?.custodian?.toUpperCase() || 'SCHWAB'} FIX gateway.`,
        totalExecutedValue,
        executionReports,
      });
    } catch (err: any) {
      req.log.error(err, 'Error transmitting FIX orders');
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /v1/portfolio/fix/history (Retrieve past FIX transmissions)
  fastify.get('/portfolio/fix/history', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('firm_id', user.firm_id)
        .eq('action', 'FIX_PROTOCOL_ORDERS_TRANSMITTED')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return reply.status(500).send({ error: error.message });
      }

      return reply.send({ history: data || [] });
    } catch (err: any) {
      req.log.error(err, 'Error retrieving FIX order history');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/portfolio/monitor/run (Scheduled / On-Demand Portfolio Drift Monitor Job)
  fastify.post('/portfolio/monitor/run', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { advisorEmail = user.email, advisorName = user.email.split('@')[0], sendEmail = false } = body;

    try {
      const report = await runPortfolioMonitorJob({
        firmId: user.firm_id,
        advisorEmail,
        advisorName,
        sendEmail,
      });

      return reply.send(report);
    } catch (err: any) {
      req.log.error(err, 'Portfolio monitor job error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: err.message || 'Failed to execute portfolio drift monitor job.',
      });
    }
  });

  // GET /v1/portfolio/monitor/preview (HTML Preview of Resend Advisor Alert Template)
  fastify.get('/portfolio/monitor/preview', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    try {
      const report = await runPortfolioMonitorJob({
        firmId: user.firm_id,
        advisorEmail: user.email,
        sendEmail: false,
      });

      const html = generateDriftAlertHtml(report, user.email.split('@')[0]);
      return reply.type('text/html; charset=utf-8').send(html);
    } catch (err: any) {
      req.log.error(err, 'Portfolio monitor preview error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: err.message || 'Failed to generate alert preview.',
      });
    }
  });
}
