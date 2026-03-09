const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

router.get('/my', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cert.*, c.title as course_title FROM certificates cert JOIN courses c ON cert.course_id=c.id WHERE cert.user_id=$1 ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );
    res.json({ certificates: rows });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.post('/generate/:courseId', authenticate, async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT * FROM certificates WHERE user_id=$1 AND course_id=$2', [req.user.id, req.params.courseId]);
    if (existing[0]) return res.json({ certificate: existing[0] });
    const certId = 'CC-' + uuidv4().replace(/-/g,'').substring(0,12).toUpperCase();
    const { rows } = await db.query(
      'INSERT INTO certificates (user_id, course_id, certificate_id) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, req.params.courseId, certId]
    );
    res.json({ certificate: rows[0] });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.get('/verify/:certId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cert.*, u.name as student_name, c.title as course_title FROM certificates cert JOIN users u ON cert.user_id=u.id JOIN courses c ON cert.course_id=c.id WHERE cert.certificate_id=$1`,
      [req.params.certId]
    );
    if (!rows[0]) return res.status(404).json({ valid: false });
    res.json({ valid: true, certificate: rows[0] });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
