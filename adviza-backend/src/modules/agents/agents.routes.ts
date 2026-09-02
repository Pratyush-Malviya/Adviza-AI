import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import { generateClientBriefing } from './briefing-agent.js';
import { runComplianceAudit } from './compliance-agent.js';
import { processMeetingIntelligence } from './meeting-agent.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';

export async function agentRoutes(fastify: FastifyInstance) {
  // POST /v1/agents/briefing
  fastify.post('/agents/briefing', { preHandler: [requireAuth] }, async (req, reply) => {
    const body = (req.body as any) || {};
    try {
      const briefing = await generateClientBriefing(body);
      return reply.send({ briefing });
    } catch (err: any) {
      req.log.error(err, 'Briefing agent error');
      return reply.status(500).send({ error: err.message || 'Failed to generate briefing' });
    }
  });

  // POST /v1/agents/compliance
  fastify.post('/agents/compliance', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    try {
      const audit = await runComplianceAudit(body.content, body.contentType || 'email');

      // Log compliance audit to audit_logs
      const supabase = getSupabaseAdmin();
      await supabase.from('audit_logs').insert(
        scopeFirm(
          {
            action: 'compliance_audit',
            actor: user.email,
            resource: body.contentType || 'document',
            compliance_score: audit.complianceStatus === 'compliant' ? 95 : 70,
            flagged_items: audit.regulatoryFlags?.map((f: any) => f.flag) || [],
            payload: {
              contentLength: body.content?.length,
              status: audit.complianceStatus,
            },
            timestamp: new Date().toISOString(),
          },
          user.firm_id
        )
      );

      return reply.send({ audit });
    } catch (err: any) {
      req.log.error(err, 'Compliance agent error');
      return reply.status(500).send({ error: err.message || 'Failed to audit content' });
    }
  });

  // POST /v1/agents/meeting-intelligence
  fastify.post('/agents/meeting-intelligence', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    try {
      const result = await processMeetingIntelligence(body);

      // Persist action items if meetingId provided
      if (body.meetingId && Array.isArray(result.actionItems)) {
        const supabase = getSupabaseAdmin();
        const items = result.actionItems.map((ai: any) =>
          scopeFirm(
            {
              meeting_id: body.meetingId,
              description: ai.task,
              status: 'pending',
              due_date: ai.dueDate,
            },
            user.firm_id
          )
        );
        await supabase.from('action_items').insert(items);
      }

      return reply.send(result);
    } catch (err: any) {
      req.log.error(err, 'Meeting intelligence error');
      return reply.status(500).send({ error: err.message || 'Failed to analyze meeting' });
    }
  });
}
