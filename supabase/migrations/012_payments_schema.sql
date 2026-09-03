-- ============================================================
-- Adviza AI — Payments & Transactions Schema
-- Migration: 012_payments_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  firm_id          UUID         REFERENCES public.firms(id) ON DELETE CASCADE,
  order_id         TEXT         NOT NULL,
  payment_id       TEXT,
  amount           NUMERIC(10,2) NOT NULL,
  currency         TEXT         NOT NULL DEFAULT 'INR',
  plan             TEXT         NOT NULL,
  status           TEXT         NOT NULL DEFAULT 'created'
                                CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  gateway          TEXT         NOT NULL DEFAULT 'razorpay',
  webhook_payload  JSONB        DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by order_id and payment_id
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_firm_id ON public.payments(firm_id);

-- RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Firm owners and compliance officers can view payments
CREATE POLICY "payments: firm admins can view own payments"
  ON public.payments FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'compliance')
    )
  );

-- Service role has full access
CREATE POLICY "payments: service role can manage all"
  ON public.payments FOR ALL
  USING (true)
  WITH CHECK (true);
