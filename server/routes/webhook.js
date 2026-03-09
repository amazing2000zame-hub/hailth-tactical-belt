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

// Stripe webhook — must receive raw body
router.post('/stripe', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (webhookSecret && !webhookSecret.includes('REPLACE')) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    // In development without webhook secret, parse the body directly
    event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const cartSessionId = session.metadata?.cart_session_id;

    if (cartSessionId) {
      const db = getDb();

      const cartItems = db.prepare(`
        SELECT ci.quantity, ci.variant_id, p.price
        FROM cart_items ci
        JOIN product_variants pv ON ci.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE ci.session_id = ?
      `).all(cartSessionId);

      if (cartItems.length > 0) {
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const createOrder = db.transaction(() => {
          const order = db.prepare(`
            INSERT INTO orders (session_id, stripe_payment_id, email, total, status, shipping_address)
            VALUES (?, ?, ?, ?, 'completed', ?)
          `).run(
            cartSessionId,
            session.payment_intent,
            session.customer_email || '',
            Math.round(total * 100) / 100,
            JSON.stringify(session.shipping_details || {})
          );

          for (const item of cartItems) {
            db.prepare(`
              INSERT INTO order_items (order_id, variant_id, quantity, price)
              VALUES (?, ?, ?, ?)
            `).run(order.lastInsertRowid, item.variant_id, item.quantity, item.price);
          }

          // Clear cart
          db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(cartSessionId);

          return order.lastInsertRowid;
        });

        const orderId = createOrder();
        console.log(`Order #${orderId} created from Stripe checkout`);
      }
    }
  }

  res.json({ received: true });
});

export default router;
