const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

router.get('/', async (req, res, next) => {
  try {
    const { search, category, price, sort } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      params.push(q);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER("desc") LIKE $${params.length})`;
    }

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    let results = (await query(sql, params)).rows;

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
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = (await query('SELECT * FROM products WHERE id = $1', [+req.params.id])).rows[0];
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) { next(err); }
});

module.exports = router;
