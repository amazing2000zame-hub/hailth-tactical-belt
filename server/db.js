import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = process.env.DB_DIR || __dirname;
const DB_PATH = path.join(DB_DIR, 'hailth.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedIfEmpty();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      compare_price REAL,
      currency TEXT DEFAULT 'USD',
      image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      color TEXT NOT NULL,
      size TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      stock INTEGER DEFAULT 100,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS cart_sessions (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      variant_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (session_id) REFERENCES cart_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      stripe_payment_id TEXT,
      email TEXT,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      variant_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
  if (count.c > 0) return;

  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, description, price, compare_price, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (product_id, color, size, sku, stock)
    VALUES (?, ?, ?, ?, ?)
  `);

  const product = insertProduct.run(
    'HAILTH Tactical Metal Hook Elastic Belt',
    'tactical-metal-hook-elastic-belt',
    'Premium tactical elastic belt with durable metal hook buckle. Designed for comfort and durability, this belt stretches to fit perfectly while maintaining a secure hold. Perfect for everyday wear, outdoor activities, and tactical use.',
    29.99,
    49.99,
    '/images/belt-black.jpg'
  );

  const productId = product.lastInsertRowid;

  const colors = ['Black', 'Army Green', 'Khaki', 'Brown', 'Navy', 'Gray', 'Camo'];
  const sizes = [
    { code: 'S', label: '28"-32"' },
    { code: 'M', label: '32"-36"' },
    { code: 'L', label: '36"-40"' },
    { code: 'XL', label: '40"-44"' },
    { code: '2XL', label: '44"-50"' },
  ];

  const seedVariants = db.transaction(() => {
    for (const color of colors) {
      for (const size of sizes) {
        const colorSlug = color.toLowerCase().replace(/\s+/g, '-');
        const sku = `HAILTH-BELT-${colorSlug.toUpperCase()}-${size.code}`;
        insertVariant.run(productId, color, size.code, sku, 100);
      }
    }
  });

  seedVariants();
  console.log(`Seeded product with ${colors.length * sizes.length} variants`);
}
