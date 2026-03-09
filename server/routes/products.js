import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const products = db.prepare('SELECT * FROM products').all();

  const result = products.map((p) => {
    const variants = db.prepare(
      'SELECT id, color, size, sku, stock FROM product_variants WHERE product_id = ?'
    ).all(p.id);

    const colors = [...new Set(variants.map((v) => v.color))];
    const sizes = [...new Set(variants.map((v) => v.size))];

    return { ...p, variants, colors, sizes };
  });

  res.json(result);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;

  const product = Number.isInteger(Number(id))
    ? db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    : db.prepare('SELECT * FROM products WHERE slug = ?').get(id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const variants = db.prepare(
    'SELECT id, color, size, sku, stock FROM product_variants WHERE product_id = ?'
  ).all(product.id);

  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];

  res.json({ ...product, variants, colors, sizes });
});

export default router;
