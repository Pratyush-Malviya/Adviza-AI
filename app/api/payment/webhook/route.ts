import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Step 4.D: Razorpay Webhook Handler Endpoint
// POST /api/payment/webhook
// Cryptographically verifies x-razorpay-signature using raw request body
// Idempotently updates the firm's subscription and logs transaction
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook Error]: RAZORPAY_WEBHOOK_SECRET not configured.");
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header." }, { status: 400 });
    }

    // 1. Get raw text body for cryptographic signature verification
    const rawBody = await req.text();

    // 2. Validate webhook signature using Razorpay official SDK method
    const isSignatureValid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);

    if (!isSignatureValid) {
      console.warn("[Webhook Security Alert]: Invalid Razorpay webhook signature received.");
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    // 3. Parse validated JSON payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Use service-role client for background webhook updates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // 4. Handle Event Types
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || event.payload?.order?.entity?.notes || {};
      const firmId = notes.firm_id;
      const planId = notes.plan_id || "pro";

      if (orderId) {
        // Idempotent payment record update
        await supabase
          .from("payments")
          .update({
            status: "paid",
            payment_id: paymentId,
            webhook_payload: event,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      }

      if (firmId) {
        // Upgrade firm access
        const planLimits =
          planId === "enterprise"
            ? { max_users: 25, max_clients: 5000, max_ai_requests_per_month: 5000, max_workflows: 50 }
            : { max_users: 3, max_clients: 200, max_ai_requests_per_month: 500, max_workflows: 10 };

        await supabase
          .from("firms")
          .update({
            plan: planId === "enterprise" ? "enterprise" : "pro",
            subscription_status: "active",
            ...planLimits,
            updated_at: new Date().toISOString(),
          })
          .eq("id", firmId);

        // Append audit log
        await supabase.from("audit_logs").insert({
          firm_id: firmId,
          action: "webhook.payment.captured",
          entity_type: "firm",
          entity_id: firmId,
          metadata: {
            event: eventType,
            orderId,
            paymentId,
            plan: planId,
          },
        });
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            payment_id: paymentId,
            webhook_payload: event,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      }
    }

    // 5. Acknowledge receipt with HTTP 200 to prevent Razorpay retries
    return NextResponse.json({ received: true, event: eventType });
  } catch (error: any) {
    console.error("[Razorpay Webhook Handler Error]:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing error." }, { status: 500 });
  }
}
