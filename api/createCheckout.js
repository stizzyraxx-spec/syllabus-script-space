import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { amount, description } = req.body ?? {};
    if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });

    const origin = req.headers.origin || 'https://theconditionofman.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: description || 'Donation — The Condition of Man',
            description: 'Your generous gift supports this ministry.',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      success_url: `${origin}/donate?success=true`,
      cancel_url: `${origin}/donate?cancelled=true`,
      metadata: {},
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
