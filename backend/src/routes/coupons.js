const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// Validate coupon (student uses this)
router.post('/validate', authenticate, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });
  try {
    const { rows } = await db.query('SELECT * FROM coupons WHERE code=$1', [code.toUpperCase()]);
    if (!rows[0]) return res.status(404).json({ error: 'Invalid coupon code' });
    const coupon = rows[0];
    if (coupon.used_by) return res.status(400).json({ error: 'This coupon has already been used' });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.status(400).json({ error: 'This coupon has expired' });
    res.json({ valid: true, discount_percent: coupon.discount_percent, code: coupon.code });
  } catch { res.status(500).json({ error: 'Failed to validate coupon' }); }
});

// Apply coupon (called when payment is made)
router.post('/apply', authenticate, async (req, res) => {
  const { code } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM coupons WHERE code=$1', [code.toUpperCase()]);
    if (!rows[0]) return res.status(404).json({ error: 'Invalid coupon code' });
    const coupon = rows[0];
    if (coupon.used_by) return res.status(400).json({ error: 'This coupon has already been used' });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.status(400).json({ error: 'This coupon has expired' });
    await db.query('UPDATE coupons SET used_by=$1, used_at=NOW() WHERE id=$2', [req.user.id, coupon.id]);
    res.json({ success: true, discount_percent: coupon.discount_percent });
  } catch { res.status(500).json({ error: 'Failed to apply coupon' }); }
});

// ADMIN — Get all coupons
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*, u.name as used_by_name, u.email as used_by_email 
       FROM coupons c LEFT JOIN users u ON c.used_by = u.id 
       ORDER BY c.created_at DESC`
    );
    res.json({ coupons: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch coupons' }); }
});

// ADMIN — Create coupon
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { code, discount_percent, expires_at } = req.body;
  if (!code || !discount_percent) return res.status(400).json({ error: 'Code and discount are required' });
  try {
    const { rows } = await db.query(
      'INSERT INTO coupons (code, discount_percent, expires_at) VALUES ($1,$2,$3) RETURNING *',
      [code.toUpperCase(), discount_percent, expires_at || null]
    );
    res.json({ coupon: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Coupon code already exists' });
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// ADMIN — Delete coupon
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM coupons WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete coupon' }); }
});

module.exports = router;
