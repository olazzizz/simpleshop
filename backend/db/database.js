const Database = require('better-sqlite3');
const path = require('path');
const PRODUCTS = require('../data/products');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'simpleshop.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY,
    name     TEXT    NOT NULL,
    category TEXT    NOT NULL,
    desc     TEXT    NOT NULL,
    price    REAL    NOT NULL,
    rating   REAL    NOT NULL,
    reviews  INTEGER NOT NULL,
    emoji    TEXT    NOT NULL,
    discount INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    session_id TEXT    NOT NULL,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (session_id, product_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    session_id TEXT    NOT NULL,
    product_id INTEGER NOT NULL,
    PRIMARY KEY (session_id, product_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT    NOT NULL,
    total      REAL    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL,
    unit_price REAL    NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Seed products (upsert so re-starts don't duplicate)
const upsertProduct = db.prepare(`
  INSERT INTO products (id, name, category, desc, price, rating, reviews, emoji, discount)
  VALUES (@id, @name, @category, @desc, @price, @rating, @reviews, @emoji, @discount)
  ON CONFLICT(id) DO UPDATE SET
    name     = excluded.name,
    category = excluded.category,
    desc     = excluded.desc,
    price    = excluded.price,
    rating   = excluded.rating,
    reviews  = excluded.reviews,
    emoji    = excluded.emoji,
    discount = excluded.discount
`);

const seedAll = db.transaction((products) => {
  for (const p of products) upsertProduct.run(p);
});

seedAll(PRODUCTS);

module.exports = db;
