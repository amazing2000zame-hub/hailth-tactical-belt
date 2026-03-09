import { Router } from 'express';
import Stripe from 'stripe';
import { getDb } from '../db.js';

const router = Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Create Stripe Checkout Session
router.post('/', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not configured. Set STRIPE_SECRET_KEY in server/.env',
    });
  }

  const { sessionId, email } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const db = getDb();
  const items = db.prepare(`
    SELECT ci.quantity, ci.variant_id,
           pv.color, pv.size, pv.sku,
           p.name, p.price, p.image
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE ci.session_id = ?
  `).all(sessionId);

  if (items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: `Color: ${item.color} | Size: ${item.size}`,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/cancel`,
    customer_email: email || undefined,
    metadata: {
      cart_session_id: sessionId,
    },
  });

  res.json({
    url: checkoutSession.url,
    sessionId: checkoutSession.id,
  });
});

export default router;
