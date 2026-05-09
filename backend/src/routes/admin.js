const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  const [u, c, r, e] = await Promise.all([
    db.query('SELECT COUNT(*) FROM users'),
    db.query("SELECT COUNT(*) FROM courses WHERE status='published'"),
    db.query("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='completed'"),
    db.query("SELECT COUNT(*) FROM enrollments WHERE payment_status='completed'"),
  ]);
  res.json({ stats: { total_users: u.rows[0].count, published_courses: c.rows[0].count, total_revenue: r.rows[0].total, total_enrollments: e.rows[0].count } });
});

router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100');
  res.json({ users: rows });
});

router.patch('/users/:id/role', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role', [req.body.role, req.params.id]);
  res.json({ user: rows[0] });
});

router.patch('/courses/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { is_locked, next_intake } = req.body;
    const updates = [];
    const values = [];
    let i = 1;
    if (is_locked !== undefined) { updates.push(`is_locked=$${i++}`); values.push(is_locked); }
    if (next_intake !== undefined) { updates.push(`next_intake=$${i++}`); values.push(next_intake); }
    values.push(req.params.id);
    await db.query(`UPDATE courses SET ${updates.join(',')} WHERE id=$${i}`, values);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to update course' }); }
});

router.get('/payments', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, u.name as user_name, u.email, c.title as course_title FROM payments p JOIN users u ON p.user_id=u.id JOIN courses c ON p.course_id=c.id ORDER BY p.created_at DESC LIMIT 100`
  );
  res.json({ payments: rows });
});

router.post('/payments/:id/confirm', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { rows: payment } = await db.query('SELECT * FROM payments WHERE id=$1', [req.params.id]);
    if (!payment[0]) return res.status(404).json({ error: 'Payment not found' });
    await db.query('UPDATE payments SET status=$1 WHERE id=$2', ['completed', req.params.id]);
    await db.query(
      `INSERT INTO enrollments (user_id, course_id, payment_method, payment_status, amount_paid)
       VALUES ($1,$2,'mpesa_manual','completed',$3)
       ON CONFLICT (user_id, course_id) DO UPDATE SET payment_status='completed'`,
      [payment[0].user_id, payment[0].course_id, payment[0].amount]
    );
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to confirm payment' }); }
});
module.exports = router;
