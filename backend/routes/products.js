const express = require('express');
const router = express.Router();
const db = require('../db/database');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

router.get('/', (req, res) => {
  const { search, category, price, sort } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (LOWER(name) LIKE ? OR LOWER(desc) LIKE ?)';
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  let results = db.prepare(query).all(...params);

  if (price) {
    const [min, max] = price.split('-').map(Number);
    results = results.filter(p => {
      const disc = discountedPrice(p);
      return disc >= min && disc <= max;
    });
  }

  if (sort === 'price-asc')  results.sort((a, b) => discountedPrice(a) - discountedPrice(b));
  if (sort === 'price-desc') results.sort((a, b) => discountedPrice(b) - discountedPrice(a));
  if (sort === 'rating')     results.sort((a, b) => b.rating - a.rating);

  res.json(results);
});

router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(+req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

module.exports = router;
