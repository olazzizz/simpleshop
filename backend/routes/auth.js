const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const { query } = require('../db/database');

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if ((await query('SELECT id FROM users WHERE username = $1', [username])).rows[0]) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    if ((await query('SELECT id FROM users WHERE email = $1', [email])).rows[0]) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hash]
    );
    const id = result.rows[0].id;
    req.session.userId = id;
    res.status(201).json({ id, username, email });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const user = (await query('SELECT * FROM users WHERE username = $1', [username])).rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    const user = (await query('SELECT id, username, email FROM users WHERE id = $1', [req.session.userId])).rows[0];
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
