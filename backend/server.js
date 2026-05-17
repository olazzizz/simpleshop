const express = require('express');
const session = require('express-session');
const path = require('path');

require('./db/database');

const requireAuth = require('./middleware/requireAuth');
const app = express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'simpleshop-dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' },
}));

app.use(express.static(path.join(__dirname, '..')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     requireAuth, require('./routes/cart'));
app.use('/api/wishlist', requireAuth, require('./routes/wishlist'));
app.use('/api/checkout', requireAuth, require('./routes/checkout'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SimpleShop running at http://localhost:${PORT}`);
});
