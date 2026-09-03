import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Step 4.E: Server-Side Payment Verification Endpoint
// POST /api/payment/verify
// Re-verifies HMAC-SHA256 signature from frontend Razorpay checkout callback.
// ONLY after server-side cryptographic verification does it upgrade the firm plan.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId = "pro",
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment verification tokens." }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: "Server misconfiguration: Gateway secret missing." }, { status: 500 });
    }

    // 2. Cryptographic HMAC-SHA256 verification (Razorpay standard: order_id + "|" + payment_id)
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Mark transaction as failed in database
      await supabase
        .from("payments")
        .update({
          status: "failed",
          payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", razorpay_order_id);

      return NextResponse.json(
        { error: "Payment verification failed: cryptographic signature mismatch." },
        { status: 400 }
      );
    }

    // 3. Signature is 100% valid — update payment record to 'paid'
    const { data: paymentRecord } = await supabase
      .from("payments")
      .update({
        status: "paid",
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", razorpay_order_id)
      .select("firm_id, amount, plan")
      .single();

    const firmId = paymentRecord?.firm_id;

    if (firmId) {
      // 4. Upgrade firm subscription plan & allocate usage quotas
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

      // 5. Log tamper-proof audit trail event
      await supabase.from("audit_logs").insert({
        firm_id: firmId,
        user_id: user.id,
        action: "subscription.upgrade.razorpay",
        entity_type: "firm",
        entity_id: firmId,
        metadata: {
          plan: planId,
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          verified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and subscription activated.",
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("[Razorpay Verify Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal verification error." },
      { status: 500 }
    );
  }
}
