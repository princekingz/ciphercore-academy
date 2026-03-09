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

router.get('/payments', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, u.name as user_name, u.email, c.title as course_title FROM payments p JOIN users u ON p.user_id=u.id JOIN courses c ON p.course_id=c.id ORDER BY p.created_at DESC LIMIT 100`
  );
  res.json({ payments: rows });
});

module.exports = router;
