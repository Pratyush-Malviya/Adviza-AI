import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Step 4.C: Create Order / Payment Session Endpoint
// POST /api/payment/create-order
// Accepts: { planId, amount, currency }
// Creates a new Razorpay order and logs a pending transaction in Supabase
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required to initiate payment." }, { status: 401 });
    }

    // 2. Fetch user's firm and profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, firm_id, email, full_name")
      .eq("id", user.id)
      .single();

    if (!profile?.firm_id) {
      return NextResponse.json({ error: "User is not associated with an active organization." }, { status: 400 });
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const { planId = "pro", amount = 7999, currency = "INR" } = body;

    // Validate minimum order amount (Razorpay minimum is 100 paise = 1 INR)
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    // 4. Initialize the official Razorpay SDK
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Payment gateway credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // 5. Create order with Razorpay (amount must be in smallest currency unit: paise/cents)
    const amountInSmallestUnit = Math.round(amount * 100);
    const receipt = `rcpt_${profile.firm_id.slice(0, 8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      receipt,
      notes: {
        firm_id: profile.firm_id,
        user_id: user.id,
        plan_id: planId,
        user_email: profile.email,
      },
    });

    // 6. Record transaction in Supabase database with status 'created'
    await supabase.from("payments").insert({
      user_id: user.id,
      firm_id: profile.firm_id,
      order_id: order.id,
      amount,
      currency: currency.toUpperCase(),
      plan: planId,
      status: "created",
      gateway: "razorpay",
      webhook_payload: order as any,
    });

    // 7. Return order ID and details to the client for checkout modal launch
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
      firmName: "Adviza AI",
      userEmail: profile.email,
      userName: profile.full_name,
    });
  } catch (error: any) {
    console.error("[Razorpay Create Order Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment order." },
      { status: 500 }
    );
  }
}
