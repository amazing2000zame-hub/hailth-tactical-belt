import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import contactRouter from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';

const app = express();
const PORT = process.env.PORT || 4322;

// Middleware
app.use(cors({
  origin: ['http://localhost:4321', 'http://127.0.0.1:4321'],
  credentials: true,
}));

// Webhook route needs raw body for Stripe signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  const db = getDb();
  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const variantCount = db.prepare('SELECT COUNT(*) as c FROM product_variants').get().c;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    products: productCount,
    variants: variantCount,
  });
});

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhook', webhookRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize DB on startup
getDb();

app.listen(PORT, () => {
  console.log(`HAILTH API server running on http://localhost:${PORT}`);
});
