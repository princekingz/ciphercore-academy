const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

router.get('/my', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT e.*, c.title, c.slug, c.thumbnail_url, c.category, c.level, u.name as instructor_name,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT lp.id) FILTER (WHERE lp.completed = true) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = e.user_id
      WHERE e.user_id = $1 AND e.payment_status = 'completed'
      GROUP BY e.id, c.title, c.slug, c.thumbnail_url, c.category, c.level, u.name
      ORDER BY e.created_at DESC
    `, [req.user.id]);
    res.json({ enrollments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/check/:courseId', authenticate, async (req, res) => {
  const { rows } = await db.query(
    "SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2 AND payment_status='completed'",
    [req.user.id, req.params.courseId]
  );
  res.json({ enrolled: !!rows[0] });
});

module.exports = router;
