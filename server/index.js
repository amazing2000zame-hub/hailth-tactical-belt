import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import contactRouter from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4322;
const STATIC_DIR = process.env.STATIC_DIR;

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

// In production, serve Astro static files
if (STATIC_DIR) {
  const staticPath = path.resolve(__dirname, STATIC_DIR);
  app.use(express.static(staticPath));
  // SPA-style fallback: serve index.html for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    const filePath = path.join(staticPath, req.path, 'index.html');
    res.sendFile(filePath, (err) => {
      if (err) {
        res.sendFile(path.join(staticPath, 'index.html'), (err2) => {
          if (err2) next();
        });
      }
    });
  });
}

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
  if (STATIC_DIR) console.log(`Serving static files from ${path.resolve(__dirname, STATIC_DIR)}`);
});
