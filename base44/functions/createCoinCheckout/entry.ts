import Stripe from 'npm:stripe@14.15.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const COIN_PACKAGES = {
  "100": { coins: 100, priceId: "price_1TJoLtPiRy1L88wKRettSg3W", name: "100 Coins" },
  "600": { coins: 600, priceId: "price_1TJoLtPiRy1L88wKARyMa9NK", name: "600 Coins (10% Bonus)" },
  "1300": { coins: 1300, priceId: "price_1TJoLtPiRy1L88wKsuJAgJEG", name: "1300 Coins (20% Bonus)" },
  "3000": { coins: 3000, priceId: "price_1TJoLtPiRy1L88wKd1AnguP8", name: "3000 Coins (30% Bonus)" },
  "6500": { coins: 6500, priceId: "price_1TJoLtPiRy1L88wKiiRHkDrw", name: "6500 Coins (40% Bonus)" },
  "13000": { coins: 13000, priceId: "price_1TJoLtPiRy1L88wK4yWRMWpU", name: "13000 Coins (50% Bonus)" },
  "20000": { coins: 20000, priceId: "price_1TJoLtPiRy1L88wKXxOcqv77", name: "20000 Coins (60% Bonus)" },
};

Deno.serve(async (req) => {
  try {
    const { packageId, playerEmail } = await req.json();

    if (!packageId || !playerEmail || !COIN_PACKAGES[packageId]) {
      return Response.json({ error: "Invalid package or email" }, { status: 400 });
    }

    const pkg = COIN_PACKAGES[packageId];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: pkg.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/games?game=rpg&coins_success=true`,
      cancel_url: `${req.headers.get("origin")}/games?game=rpg`,
      metadata: {
        player_email: playerEmail,
        coins: pkg.coins,
        package_id: packageId,
      },
    });

    console.log(`Checkout session created for ${playerEmail}: ${session.id}`);

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});