const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

// Get exam for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { rows: exams } = await db.query(
      'SELECT * FROM exams WHERE course_id=$1', [req.params.courseId]
    );
    if (!exams[0]) return res.json({ exam: null });
    
    const { rows: questions } = await db.query(
      'SELECT id, question, option_a, option_b, option_c, option_d, order_index FROM exam_questions WHERE exam_id=$1 ORDER BY order_index',
      [exams[0].id]
    );
    res.json({ exam: exams[0], questions });
  } catch { res.status(500).json({ error: 'Failed to fetch exam' }); }
});

// Get exam result for current user
router.get('/result/:courseId', authenticate, async (req, res) => {
  try {
    const { rows: exams } = await db.query('SELECT id FROM exams WHERE course_id=$1', [req.params.courseId]);
    if (!exams[0]) return res.json({ result: null });
    const { rows } = await db.query(
      'SELECT * FROM exam_results WHERE user_id=$1 AND exam_id=$2',
      [req.user.id, exams[0].id]
    );
    res.json({ result: rows[0] || null });
  } catch { res.status(500).json({ error: 'Failed to fetch result' }); }
});

// Submit exam
router.post('/submit/:courseId', authenticate, async (req, res) => {
  const { answers } = req.body;
  try {
    const { rows: exams } = await db.query('SELECT * FROM exams WHERE course_id=$1', [req.params.courseId]);
    if (!exams[0]) return res.status(404).json({ error: 'No exam found' });
    
    const { rows: questions } = await db.query(
      'SELECT id, correct_answer FROM exam_questions WHERE exam_id=$1', [exams[0].id]
    );

    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= exams[0].pass_mark;

    // Generate certificate if passed
    if (passed) {
      const { v4: uuidv4 } = require('uuid');
      const certId = 'CC-' + uuidv4().replace(/-/g,'').substring(0,12).toUpperCase();
      await db.query(
        `INSERT INTO certificates (user_id, course_id, certificate_id) VALUES ($1,$2,$3) ON CONFLICT (user_id, course_id) DO NOTHING`,
        [req.user.id, req.params.courseId, certId]
      );
    }

    const { rows } = await db.query(
      `INSERT INTO exam_results (user_id, exam_id, score, passed, answers)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, exam_id) DO UPDATE SET score=$3, passed=$4, answers=$5, taken_at=NOW()
       RETURNING *`,
      [req.user.id, exams[0].id, score, passed, JSON.stringify(answers)]
    );

    res.json({ result: rows[0], score, passed, correct, total: questions.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// INSTRUCTOR — Create exam for a course
router.post('/course/:courseId/create', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO exams (course_id, title, pass_mark, total_questions)
       VALUES ($1,$2,70,20) ON CONFLICT (course_id) DO UPDATE SET title=$2 RETURNING *`,
      [req.params.courseId, req.body.title || 'Final Exam']
    );
    res.json({ exam: rows[0] });
  } catch { res.status(500).json({ error: 'Failed to create exam' }); }
});

// INSTRUCTOR — Add question to exam
router.post('/exam/:examId/question', authenticate, async (req, res) => {
  const { question, option_a, option_b, option_c, option_d, correct_answer, order_index } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO exam_questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.examId, question, option_a, option_b, option_c, option_d, correct_answer, order_index || 0]
    );
    res.json({ question: rows[0] });
  } catch { res.status(500).json({ error: 'Failed to add question' }); }
});

// INSTRUCTOR — Get exam with answers (for instructor only)
router.get('/exam/:examId/questions', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM exam_questions WHERE exam_id=$1 ORDER BY order_index', [req.params.examId]
    );
    res.json({ questions: rows });
  } catch { res.status(500).json({ error: 'Failed to fetch questions' }); }
});

// INSTRUCTOR — Delete question
router.delete('/question/:questionId', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM exam_questions WHERE id=$1', [req.params.questionId]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete question' }); }
});

module.exports = router;
