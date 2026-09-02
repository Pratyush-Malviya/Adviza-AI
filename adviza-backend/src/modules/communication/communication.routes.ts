import { FastifyInstance } from 'fastify';
import { Resend } from 'resend';
import { requireAuth } from '../../middleware/auth.guard.js';
import { env } from '../../config/env.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';

const resend = new Resend(env.RESEND_API_KEY || process.env.RESEND_API_KEY);

export async function communicationRoutes(fastify: FastifyInstance) {
  // POST /v1/emails/follow-up
  fastify.post('/emails/follow-up', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { to, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return reply.status(400).send({
        error: 'Missing required email fields: "to", "subject", and "html" or "text"',
      });
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Adviza AI <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html: html || text,
      });

      // Audit log the outbound email
      const supabase = getSupabaseAdmin();
      await supabase.from('audit_logs').insert(
        scopeFirm(
          {
            action: 'send_email',
            actor: user.email,
            resource: 'resend_email',
            payload: { to, subject, emailId: result.data?.id },
            timestamp: new Date().toISOString(),
          },
          user.firm_id
        )
      );

      return reply.send({ success: true, result });
    } catch (err: any) {
      req.log.error(err, 'Resend email error');
      return reply.status(500).send({ error: err.message || 'Failed to dispatch email' });
    }
  });
}
