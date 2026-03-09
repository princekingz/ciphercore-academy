const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, name, email, role, avatar_url, bio, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json({ user: rows[0] });
});

router.put('/profile', authenticate, async (req, res) => {
  const { name, bio } = req.body;
  const { rows } = await db.query(
    'UPDATE users SET name=$1, bio=$2, updated_at=NOW() WHERE id=$3 RETURNING id, name, email, role, bio',
    [name, bio, req.user.id]
  );
  res.json({ user: rows[0] });
});

router.put('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { rows } = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
  const hash = await bcrypt.hash(newPassword, 12);
  await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
  res.json({ message: 'Password updated' });
});

module.exports = router;
