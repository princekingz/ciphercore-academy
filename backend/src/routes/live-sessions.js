const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

// Get live sessions for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM live_sessions WHERE course_id=$1 ORDER BY scheduled_at ASC`,
      [req.params.courseId]
    );
    res.json({ sessions: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});

// Get all upcoming sessions for a student
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ls.*, c.title as course_title, c.slug as course_slug
       FROM live_sessions ls
       JOIN courses c ON ls.course_id = c.id
       JOIN enrollments e ON e.course_id = ls.course_id
       WHERE e.user_id=$1 AND e.payment_status='completed'
       AND ls.scheduled_at >= NOW() - INTERVAL '2 hours'
       ORDER BY ls.scheduled_at ASC`,
      [req.user.id]
    );
    res.json({ sessions: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});

// INSTRUCTOR — Create live session
router.post('/course/:courseId', authenticate, async (req, res) => {
  const { title, meet_link, scheduled_at, duration_minutes, description } = req.body;
  if (!title || !meet_link || !scheduled_at) return res.status(400).json({ error: 'Title, meet link and date are required' });
  try {
    const { rows } = await db.query(
      `INSERT INTO live_sessions (course_id, title, meet_link, scheduled_at, duration_minutes, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.courseId, title, meet_link, scheduled_at, duration_minutes || 60, description]
    );
    res.json({ session: rows[0] });
  } catch { res.status(500).json({ error: 'Failed to create session' }); }
});

// INSTRUCTOR — Delete live session
router.delete('/:sessionId', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM live_sessions WHERE id=$1', [req.params.sessionId]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete session' }); }
});

// Mark attendance
router.post('/:sessionId/attend', authenticate, async (req, res) => {
  try {
    await db.query(
      `INSERT INTO attendance (session_id, user_id) VALUES ($1,$2) ON CONFLICT (session_id, user_id) DO NOTHING`,
      [req.params.sessionId, req.user.id]
    );
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to mark attendance' }); }
});

// Get attendance for a session (instructor)
router.get('/:sessionId/attendance', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, u.name, u.email FROM attendance a JOIN users u ON a.user_id=u.id WHERE a.session_id=$1`,
      [req.params.sessionId]
    );
    res.json({ attendance: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch attendance' }); }
});

module.exports = router;
