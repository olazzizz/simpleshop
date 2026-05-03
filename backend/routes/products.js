const express = require('express');
const router = express.Router();
const PRODUCTS = require('../data/products');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

router.get('/', (req, res) => {
  const { search, category, price, sort } = req.query;

  let results = [...PRODUCTS];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
  }

  if (category) {
    results = results.filter(p => p.category === category);
  }

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
  const p = PRODUCTS.find(p => p.id === +req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

module.exports = router;
