import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback if testing without secret verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const firmId = session.metadata?.firm_id || session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (firmId) {
          await supabase
            .from("firms")
            .update({
              plan: "pro",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              meetings_limit: 100, // Upgrade meeting allowance
            })
            .eq("id", firmId);

          await supabase.from("audit_logs").insert({
            firm_id: firmId,
            user_id: session.metadata?.user_id || null,
            action: "billing.upgraded_to_pro",
            entity_type: "firm",
            entity_id: firmId,
            metadata: {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: firms } = await supabase
          .from("firms")
          .select("id")
          .eq("stripe_customer_id", customerId);

        if (firms && firms.length > 0) {
          for (const firm of firms) {
            await supabase
              .from("firms")
              .update({
                plan: "free",
                stripe_subscription_id: null,
                meetings_limit: 10,
              })
              .eq("id", firm.id);

            await supabase.from("audit_logs").insert({
              firm_id: firm.id,
              action: "billing.downgraded_to_free",
              entity_type: "firm",
              entity_id: firm.id,
              metadata: {
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Reset monthly meeting usage on renewal
        if (invoice.billing_reason === "subscription_cycle") {
          await supabase
            .from("firms")
            .update({ meetings_used: 0 })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
