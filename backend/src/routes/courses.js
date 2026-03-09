const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let where = ["c.status = 'published'"];
    const params = [];
    if (category && category !== 'All') { params.push(category); where.push(`c.category = $${params.length}`); }
    if (level && level !== 'All') { params.push(level); where.push(`c.level = $${params.length}`); }
    if (search) { params.push(`%${search}%`); where.push(`(c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`); }
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    const { rows } = await db.query(`
      SELECT c.*, u.name as instructor_name,
        COUNT(DISTINCT e.id) as enrollment_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'completed'
      LEFT JOIN reviews r ON c.id = r.course_id
      ${whereStr}
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM courses c ${whereStr}`, params.slice(0, -2));
    res.json({ courses: rows, total: parseInt(countRows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*, u.name as instructor_name,
        COUNT(DISTINCT e.id) as enrollment_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'completed'
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.status = 'published' AND c.is_featured = true
      GROUP BY c.id, u.name
      ORDER BY enrollment_count DESC LIMIT 6
    `);
    res.json({ courses: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*, u.name as instructor_name, u.bio as instructor_bio,
        COUNT(DISTINCT e.id) as enrollment_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'completed'
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.slug = $1
      GROUP BY c.id, u.name, u.bio
    `, [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json({ course: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/', authenticate, requireRole('instructor', 'admin'), async (req, res) => {
  const { title, description, short_description, category, level, price, original_price, thumbnail_url, what_you_learn, requirements } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  try {
    const { rows } = await db.query(
      `INSERT INTO courses (title, slug, description, short_description, category, level, price, original_price, thumbnail_url, what_you_learn, requirements, instructor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [title, slug, description, short_description, category, level, price, original_price, thumbnail_url, what_you_learn, requirements, req.user.id]
    );
    res.status(201).json({ course: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/:id/publish', authenticate, requireRole('instructor', 'admin'), async (req, res) => {
  const { rows } = await db.query(
    "UPDATE courses SET status='published', updated_at=NOW() WHERE id=$1 RETURNING *",
    [req.params.id]
  );
  res.json({ course: rows[0] });
});

module.exports = router;
