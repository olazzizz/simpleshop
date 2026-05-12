const express = require('express');
const session = require('express-session');
const path = require('path');

// Initialize database (creates file, schema, and seeds products on first run)
require('./db/database');

const app = express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'simpleshop-dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' },
}));

// Serve frontend static files from the project root
app.use(express.static(path.join(__dirname, '..')));

app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/checkout', require('./routes/checkout'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SimpleShop running at http://localhost:${PORT}`);
});
