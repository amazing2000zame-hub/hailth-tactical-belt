import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

// Create a new cart
router.post('/', (req, res) => {
  const db = getDb();
  const sessionId = uuidv4();

  db.prepare('INSERT INTO cart_sessions (id) VALUES (?)').run(sessionId);

  const { variantId, quantity } = req.body;
  if (variantId) {
    const variant = db.prepare('SELECT id FROM product_variants WHERE id = ?').get(variantId);
    if (!variant) {
      return res.status(400).json({ error: 'Invalid variant' });
    }
    db.prepare('INSERT INTO cart_items (session_id, variant_id, quantity) VALUES (?, ?, ?)').run(
      sessionId, variantId, quantity || 1
    );
  }

  const cart = getCart(db, sessionId);
  res.status(201).json(cart);
});

// Get cart by session ID
router.get('/:sessionId', (req, res) => {
  const db = getDb();
  const { sessionId } = req.params;

  const session = db.prepare('SELECT * FROM cart_sessions WHERE id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cart = getCart(db, sessionId);
  res.json(cart);
});

// Add/update items in cart
router.put('/:sessionId', (req, res) => {
  const db = getDb();
  const { sessionId } = req.params;
  const { variantId, quantity } = req.body;

  const session = db.prepare('SELECT * FROM cart_sessions WHERE id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  if (!variantId) {
    return res.status(400).json({ error: 'variantId is required' });
  }

  const variant = db.prepare('SELECT id FROM product_variants WHERE id = ?').get(variantId);
  if (!variant) {
    return res.status(400).json({ error: 'Invalid variant' });
  }

  const existing = db.prepare(
    'SELECT * FROM cart_items WHERE session_id = ? AND variant_id = ?'
  ).get(sessionId, variantId);

  if (existing) {
    const newQty = (quantity !== undefined) ? quantity : existing.quantity + 1;
    if (newQty <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(existing.id);
    } else {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    }
  } else {
    db.prepare('INSERT INTO cart_items (session_id, variant_id, quantity) VALUES (?, ?, ?)').run(
      sessionId, variantId, quantity || 1
    );
  }

  db.prepare("UPDATE cart_sessions SET updated_at = datetime('now') WHERE id = ?").run(sessionId);

  const cart = getCart(db, sessionId);
  res.json(cart);
});

// Remove item from cart
router.delete('/:sessionId/:itemId', (req, res) => {
  const db = getDb();
  const { sessionId, itemId } = req.params;

  const session = db.prepare('SELECT * FROM cart_sessions WHERE id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const item = db.prepare(
    'SELECT * FROM cart_items WHERE id = ? AND session_id = ?'
  ).get(itemId, sessionId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
  db.prepare("UPDATE cart_sessions SET updated_at = datetime('now') WHERE id = ?").run(sessionId);

  const cart = getCart(db, sessionId);
  res.json(cart);
});

function getCart(db, sessionId) {
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, ci.variant_id,
           pv.color, pv.size, pv.sku,
           p.name, p.price, p.compare_price, p.image, p.slug
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE ci.session_id = ?
  `).all(sessionId);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    sessionId,
    items,
    total: Math.round(total * 100) / 100,
    itemCount,
  };
}

export default router;
