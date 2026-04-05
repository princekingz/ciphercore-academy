const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Reserve a spot
router.post('/course/:courseId', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    await db.query(
      `INSERT INTO reservations (course_id, name, email, phone) VALUES ($1,$2,$3,$4) ON CONFLICT (course_id, email) DO NOTHING`,
      [req.params.courseId, name, email, phone || null]
    );
    res.json({ success: true, message: 'Spot reserved! We will notify you when enrollment opens.' });
  } catch { res.status(500).json({ error: 'Failed to reserve spot' }); }
});

// ADMIN — Get all reservations for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM reservations WHERE course_id=$1 ORDER BY created_at DESC`,
      [req.params.courseId]
    );
    res.json({ reservations: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch reservations' }); }
});

module.exports = router;
