import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import { getSupabaseAdmin } from '../../config/supabase.js';
import {
  initiateComposioConnection,
  getComposioConnections,
  executeComposioAction,
  fetchComposioToolkits,
} from './composio.js';

export async function integrationRoutes(fastify: FastifyInstance) {
  // GET /v1/integrations/composio/connections
  fastify.get('/integrations/composio/connections', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    try {
      // 1. Fetch DB stored firm connections
      const { data: dbConnections, error: dbError } = await supabase
        .from('firm_connections')
        .select('*')
        .eq('firm_id', user.firm_id);

      if (dbError) {
        req.log.warn(dbError, 'Error fetching firm connections from DB');
      }

      // 2. Fetch live Composio connections
      const liveConnections = await getComposioConnections(user.id);

      // Merge results
      const connectionMap = new Map<string, any>();

      (dbConnections || []).forEach((c) => {
        const slug = (c.app_slug || c.provider || '').toLowerCase();
        connectionMap.set(slug, {
          id: c.id,
          appName: c.app_slug || c.provider,
          status: c.status || 'CONNECTED',
          userUuid: user.id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          email: c.account_email,
        });
      });

      liveConnections.forEach((c) => {
        const slug = (c.appName || '').toLowerCase();
        connectionMap.set(slug, {
          ...connectionMap.get(slug),
          ...c,
        });
      });

      return reply.send({ connections: Array.from(connectionMap.values()) });
    } catch (err: any) {
      req.log.error(err, 'Failed to list connections');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/integrations/composio/connections (Register / Activate connection)
  fastify.post('/integrations/composio/connections', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const appSlug = (body.appSlug || body.appName || '').toLowerCase();
    const appName = body.appName || body.appSlug;

    if (!appSlug) {
      return reply.status(400).send({ error: 'appSlug is required' });
    }

    try {
      const supabase = getSupabaseAdmin();
      const { data: connection, error } = await supabase
        .from('firm_connections')
        .upsert(
          {
            firm_id: user.firm_id,
            user_id: user.id,
            app_slug: appSlug,
            provider: appName || appSlug,
            status: 'CONNECTED',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'firm_id,app_slug' }
        )
        .select()
        .single();

      if (error) {
        req.log.error(error, 'Error upserting firm connection');
        return reply.status(500).send({ error: error.message });
      }

      // Write WORM audit log
      await supabase.from('audit_logs').insert({
        firm_id: user.firm_id,
        user_id: user.id,
        action: 'INTEGRATION_CONNECTED',
        entity_type: 'connector',
        details: {
          appSlug,
          appName: appName || appSlug,
          connectionId: connection?.id,
        },
        timestamp: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        connection: {
          id: connection?.id || `conn_${Date.now()}`,
          appName: appName || appSlug,
          status: 'CONNECTED',
          userUuid: user.id,
          createdAt: connection?.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      req.log.error(err, 'Failed to save connection');
      return reply.status(500).send({ error: err.message });
    }
  });

  // DELETE /v1/integrations/composio/connections (Revoke / Disconnect connection)
  fastify.delete('/integrations/composio/connections', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const appSlug = (body.appSlug || body.appName || '').toLowerCase();

    if (!appSlug) {
      return reply.status(400).send({ error: 'appSlug is required' });
    }

    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from('firm_connections')
        .delete()
        .eq('firm_id', user.firm_id)
        .eq('app_slug', appSlug);

      if (error) {
        req.log.error(error, 'Error deleting firm connection');
        return reply.status(500).send({ error: error.message });
      }

      // Write WORM audit log
      await supabase.from('audit_logs').insert({
        firm_id: user.firm_id,
        user_id: user.id,
        action: 'INTEGRATION_DISCONNECTED',
        entity_type: 'connector',
        details: { appSlug },
        timestamp: new Date().toISOString(),
      });

      return reply.send({ success: true, message: `Disconnected ${appSlug}` });
    } catch (err: any) {
      req.log.error(err, 'Failed to disconnect');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/integrations/composio/connect (Initiate OAuth)
  fastify.post('/integrations/composio/connect', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { appName, redirectUrl } = body;

    if (!appName) {
      return reply.status(400).send({ error: 'appName is required' });
    }

    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const targetRedirect = redirectUrl || `${frontendUrl}/dashboard/settings?connected=${encodeURIComponent(appName)}`;

      const result = await initiateComposioConnection(user.id, appName, targetRedirect);

      const supabase = getSupabaseAdmin();
      await supabase
        .from('firm_connections')
        .upsert(
          {
            firm_id: user.firm_id,
            user_id: user.id,
            app_slug: appName.toLowerCase(),
            provider: appName.toLowerCase(),
            status: 'INITIATED',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'firm_id,app_slug' }
        )
        .select()
        .maybeSingle();

      return reply.send(result);
    } catch (err: any) {
      req.log.error(err, 'Composio connect error');
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /v1/integrations/composio/toolkits
  fastify.get('/integrations/composio/toolkits', async (req, reply) => {
    const query = (req.query as any) || {};
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 48;
    const search = query.search || undefined;
    const category = query.category || undefined;

    try {
      const data = await fetchComposioToolkits({
        page,
        limit,
        search,
        category,
      });
      return reply.send(data);
    } catch (err: any) {
      req.log.error(err, 'Error fetching toolkits');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/integrations/composio/send-email
  fastify.post('/integrations/composio/send-email', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { to, recipientEmail, subject, body: emailBody, content, clientName } = body;

    const targetRecipient = to || recipientEmail;
    const targetBody = emailBody || content;

    if (!targetRecipient || !subject || !targetBody) {
      return reply.status(400).send({
        error: 'Missing required parameters: to (or recipientEmail), subject, and body (or content) are required.',
      });
    }

    try {
      const result = await executeComposioAction(user.id, 'GMAIL_SEND_EMAIL', {
        recipient_email: targetRecipient,
        subject,
        body: targetBody,
        clientName,
      });

      // Write WORM Audit Log
      const supabase = getSupabaseAdmin();
      await supabase.from('audit_logs').insert({
        firm_id: user.firm_id,
        user_id: user.id,
        action: 'EMAIL_DISPATCHED',
        entity_type: 'email',
        details: {
          recipient: targetRecipient,
          subject,
          clientName: clientName || null,
          provider: result.mock ? 'mock_gateway' : 'composio_gmail',
          success: result.success,
        },
        timestamp: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        message: 'Email successfully sent and audited',
        details: result,
      });
    } catch (err: any) {
      req.log.error(err, 'Failed to send email via Composio');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/integrations/composio/sync-calendar
  fastify.post('/integrations/composio/sync-calendar', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { timeMin, timeMax, maxResults } = body;

    try {
      const result = await executeComposioAction(user.id, 'GOOGLECALENDAR_FIND_EVENTS', {
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults: maxResults || 25,
      });

      const events = result.events || [];
      const supabase = getSupabaseAdmin();

      let syncedCount = 0;
      if (Array.isArray(events) && events.length > 0) {
        for (const evt of events) {
          if (evt.summary) {
            await supabase.from('meetings').upsert(
              {
                firm_id: user.firm_id,
                title: evt.summary,
                meeting_date: evt.start?.dateTime || evt.start?.date || new Date().toISOString(),
                status: 'scheduled',
                notes: evt.description || 'Imported from Google Calendar via Composio',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'firm_id,title,meeting_date' }
            );
            syncedCount++;
          }
        }
      }

      // Write WORM audit log
      await supabase.from('audit_logs').insert({
        firm_id: user.firm_id,
        user_id: user.id,
        action: 'CALENDAR_SYNCED',
        entity_type: 'calendar',
        details: {
          eventCount: events.length,
          syncedCount,
          provider: result.mock ? 'mock_calendar' : 'composio_googlecalendar',
        },
        timestamp: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        totalEvents: events.length,
        syncedCount,
        events,
        mock: result.mock,
      });
    } catch (err: any) {
      req.log.error(err, 'Failed to sync calendar via Composio');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/integrations/composio/execute
  fastify.post('/integrations/composio/execute', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { action, parameters } = body;

    if (!action) {
      return reply.status(400).send({ error: 'action parameter is required' });
    }

    try {
      const result = await executeComposioAction(user.id, action, parameters || {});

      const supabase = getSupabaseAdmin();
      await supabase.from('audit_logs').insert({
        firm_id: user.firm_id,
        user_id: user.id,
        action: 'INTEGRATION_TOOL_EXECUTED',
        entity_type: 'composio_action',
        details: {
          action,
          parameters: parameters || {},
          success: result.success,
          mock: result.mock,
        },
        timestamp: new Date().toISOString(),
      });

      return reply.send(result);
    } catch (err: any) {
      req.log.error(err, `Failed to execute action ${action}`);
      return reply.status(500).send({ error: err.message });
    }
  });
}
