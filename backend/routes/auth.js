const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');

const findByUsername = db.prepare('SELECT * FROM users WHERE username = ?');
const findByEmail    = db.prepare('SELECT * FROM users WHERE email = ?');
const findById       = db.prepare('SELECT id, username, email FROM users WHERE id = ?');
const insertUser     = db.prepare(
  'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
);

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }
  if (findByUsername.get(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  if (findByEmail.get(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const { lastInsertRowid: id } = insertUser.run(username, email, hash);
  req.session.userId = id;
  res.status(201).json({ id, username, email });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = findByUsername.get(username);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  res.json({ id: user.id, username: user.username, email: user.email });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = findById.get(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(user);
});

module.exports = router;
