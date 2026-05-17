const Database = require('better-sqlite3');
const path = require('path');
const PRODUCTS = require('../data/products');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'simpleshop.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Drop session-based tables if migrating to user-based schema
const hasUsers = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
if (!hasUsers) {
  db.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS wishlist_items;
    DROP TABLE IF EXISTS cart_items;
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

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
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    total      REAL    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
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
