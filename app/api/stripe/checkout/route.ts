import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, firms(*)")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.firm_id) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const firm = (profile as any).firms;
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: firm.id,
      metadata: {
        firm_id: firm.id,
        user_id: user.id,
      },
      success_url: `${origin}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/dashboard/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
