const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

// Get reviews for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, u.name as user_name, u.avatar_url 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.course_id = $1 
       ORDER BY r.created_at DESC`,
      [req.params.courseId]
    );
    res.json({ reviews: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch reviews' }); }
});

// Add a review
router.post('/course/:courseId', authenticate, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
  try {
    const { rows: enrolled } = await db.query(
      `SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2 AND payment_status='completed'`,
      [req.user.id, req.params.courseId]
    );
    if (!enrolled[0]) return res.status(403).json({ error: 'You must be enrolled to review' });
    const { rows } = await db.query(
      `INSERT INTO reviews (course_id, user_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (course_id, user_id) 
       DO UPDATE SET rating=$3, comment=$4, created_at=NOW()
       RETURNING *`,
      [req.params.courseId, req.user.id, rating, comment]
    );
    res.status(201).json({ review: rows[0] });
  } catch { res.status(500).json({ error: 'Failed to submit review' }); }
});

// Delete a review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id=$1 AND user_id=$2', [req.params.reviewId, req.user.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete review' }); }
});

module.exports = router;
