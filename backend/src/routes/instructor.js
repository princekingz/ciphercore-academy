const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', authenticate, requireRole('instructor', 'admin'), async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      COUNT(DISTINCT c.id) as total_courses,
      COUNT(DISTINCT e.id) as total_students,
      COALESCE(SUM(p.amount), 0) as total_earnings,
      COALESCE(AVG(r.rating), 0) as avg_rating
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'completed'
    LEFT JOIN payments p ON c.id = p.course_id AND p.status = 'completed'
    LEFT JOIN reviews r ON c.id = r.course_id
    WHERE c.instructor_id = $1
  `, [req.user.id]);
  res.json({ stats: rows[0] });
});

router.get('/courses', authenticate, requireRole('instructor', 'admin'), async (req, res) => {
  const { rows } = await db.query(`
    SELECT c.*, COUNT(DISTINCT e.id) as student_count, COALESCE(AVG(r.rating), 0) as avg_rating
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'completed'
    LEFT JOIN reviews r ON c.id = r.course_id
    WHERE c.instructor_id = $1
    GROUP BY c.id ORDER BY c.created_at DESC
  `, [req.user.id]);
  res.json({ courses: rows });
});

router.get('/students', authenticate, requireRole('instructor', 'admin'), async (req, res) => {
  const { rows } = await db.query(`
    SELECT DISTINCT u.id, u.name, u.email, e.created_at as enrolled_at, c.title as course_title
    FROM enrollments e
    JOIN users u ON e.user_id = u.id
    JOIN courses c ON e.course_id = c.id
    WHERE c.instructor_id = $1 AND e.payment_status = 'completed'
    ORDER BY e.created_at DESC
  `, [req.user.id]);
  res.json({ students: rows });
});

module.exports = router;
