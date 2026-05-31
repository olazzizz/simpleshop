const { Pool } = require('pg');
const PRODUCTS = require('../data/products');

const pool = new Pool({
  host:     process.env.PGHOST     || 'localhost',
  port:     process.env.PGPORT     || 5432,
  database: process.env.PGDATABASE || 'simpleshop',
  user:     process.env.PGUSER     || 'simpleshop',
  password: process.env.PGPASSWORD || '',
});

async function query(text, params) {
  return pool.query(text, params);
}

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      TEXT        NOT NULL UNIQUE,
      email         TEXT        NOT NULL UNIQUE,
      password_hash TEXT        NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id       INTEGER PRIMARY KEY,
      name     TEXT    NOT NULL,
      category TEXT    NOT NULL,
      "desc"   TEXT    NOT NULL,
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
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER     NOT NULL,
      total      REAL        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         SERIAL PRIMARY KEY,
      order_id   INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL,
      unit_price REAL    NOT NULL,
      FOREIGN KEY (order_id)   REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  for (const p of PRODUCTS) {
    await pool.query(`
      INSERT INTO products (id, name, category, "desc", price, rating, reviews, emoji, discount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name     = EXCLUDED.name,
        category = EXCLUDED.category,
        "desc"   = EXCLUDED."desc",
        price    = EXCLUDED.price,
        rating   = EXCLUDED.rating,
        reviews  = EXCLUDED.reviews,
        emoji    = EXCLUDED.emoji,
        discount = EXCLUDED.discount
    `, [p.id, p.name, p.category, p.desc, p.price, p.rating, p.reviews, p.emoji, p.discount]);
  }
}

module.exports = { query, pool, init };
