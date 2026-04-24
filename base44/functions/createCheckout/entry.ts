import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const { amount, description } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://app.base44.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || "Donation — The Condition of Man",
              description: "Your generous gift supports this ministry.",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/donate?success=true`,
      cancel_url: `${origin}/donate?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});