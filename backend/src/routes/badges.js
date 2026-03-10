const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const BADGES = [
  { id: 'first_step', name: 'First Step', emoji: '🎯', description: 'Complete your first lesson', condition: 'lessons >= 1' },
  { id: 'on_fire', name: 'On Fire', emoji: '🔥', description: 'Complete 5 lessons', condition: 'lessons >= 5' },
  { id: 'bookworm', name: 'Bookworm', emoji: '📚', description: 'Enroll in 3 courses', condition: 'enrollments >= 3' },
  { id: 'graduate', name: 'Graduate', emoji: '🏆', description: 'Complete a full course', condition: 'completed_courses >= 1' },
  { id: 'elite', name: 'Elite', emoji: '👑', description: 'Complete 3 courses', condition: 'completed_courses >= 3' },
];

const LEVELS = [
  { level: 1, name: 'Cyber Rookie', min: 0, max: 10, color: '#94a3b8' },
  { level: 2, name: 'Cyber Defender', min: 11, max: 25, color: '#22C55E' },
  { level: 3, name: 'Cyber Guardian', min: 26, max: 50, color: '#2563EB' },
  { level: 4, name: 'Cyber Expert', min: 51, max: 100, color: '#f59e0b' },
  { level: 5, name: 'Cyber Master', min: 101, max: 999999, color: '#ef4444' },
];

router.get('/my', authenticate, async (req, res) => {
  try {
    const { rows: lessonRows } = await db.query(
      `SELECT COUNT(*) as lessons FROM lesson_progress WHERE user_id=$1 AND completed=true`,
      [req.user.id]
    );
    const { rows: enrollRows } = await db.query(
      `SELECT COUNT(*) as enrollments FROM enrollments WHERE user_id=$1 AND payment_status='completed'`,
      [req.user.id]
    );

    const lessons = parseInt(lessonRows[0].lessons) || 0;
    const enrollments = parseInt(enrollRows[0].enrollments) || 0;
    const completed_courses = 0; // simplified for now

    const earnedBadges = BADGES.filter(b => {
      if (b.condition.includes('lessons')) return lessons >= parseInt(b.condition.split('>= ')[1]);
      if (b.condition.includes('enrollments')) return enrollments >= parseInt(b.condition.split('>= ')[1]);
      if (b.condition.includes('completed_courses')) return completed_courses >= parseInt(b.condition.split('>= ')[1]);
      return false;
    });

    const currentLevel = LEVELS.find(l => lessons >= l.min && lessons <= l.max) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
    const progress = nextLevel ? Math.round(((lessons - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100) : 100;

    res.json({
      badges: earnedBadges,
      allBadges: BADGES,
      level: currentLevel,
      nextLevel,
      lessons,
      progress,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

module.exports = router;
