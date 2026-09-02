import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { requireAuth } from '../../middleware/auth.guard.js';
import { env } from '../../config/env.js';
import { getSupabaseAdmin } from '../../config/supabase.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia' as any,
  appInfo: {
    name: 'Adviza AI',
    version: '1.0.0',
  },
});

export async function billingRoutes(fastify: FastifyInstance) {
  // POST /v1/billing/checkout
  fastify.post('/billing/checkout', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const priceId = body.priceId || process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return reply.status(400).send({ error: 'Price ID is required for checkout' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.FRONTEND_URL}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${env.FRONTEND_URL}/pricing?canceled=true`,
        metadata: {
          userId: user.id,
          firmId: user.firm_id,
        },
      });

      return reply.send({ url: session.url });
    } catch (err: any) {
      req.log.error(err, 'Stripe checkout error');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /v1/billing/portal
  fastify.post('/billing/portal', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data: firm } = await supabase
      .from('firms')
      .select('stripe_customer_id')
      .eq('id', user.firm_id)
      .maybeSingle();

    if (!firm?.stripe_customer_id) {
      return reply.status(400).send({ error: 'No active Stripe customer found for this firm.' });
    }

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: firm.stripe_customer_id,
        return_url: `${env.FRONTEND_URL}/settings`,
      });

      return reply.send({ url: portalSession.url });
    } catch (err: any) {
      req.log.error(err, 'Stripe portal error');
      return reply.status(500).send({ error: err.message });
    }
  });
}
