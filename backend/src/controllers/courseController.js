const db = require('../utils/db');

exports.getAll = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let where = ["c.status = 'published'"];
    const params = [];
    if (category && category !== 'All') { params.push(category); where.push(`c.category = $${params.length}`); }
    if (level && level !== 'All') { params.push(level); where.push(`c.level = $${params.length}`); }
    if (search) { params.push(`%${search}%`); where.push(`(c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`); }
    const whereClause = where.join(' AND ');
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
      WHERE ${whereClause}
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    const countParams = params.slice(0, -2);
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM courses c WHERE ${whereClause}`, countParams);
    res.json({ courses: rows, total: parseInt(countRows[0].count), page: parseInt(page) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*, u.name as instructor_name,
        COUNT(DISTINCT e.id) as enrollment_count,
        COALESCE(AVG(r.rating), 0) as avg_rating
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
};

exports.getBySlug = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*, u.name as instructor_name, u.bio as instructor_bio, u.avatar_url as instructor_avatar,
        COUNT(DISTINCT e.id) as enrollment_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'completed'
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.slug = $1
      GROUP BY c.id, u.name, u.bio, u.avatar_url
    `, [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    const { rows: modules } = await db.query(`
      SELECT m.*, json_agg(
        json_build_object('id', l.id, 'title', l.title, 'duration', l.duration, 'is_preview', l.is_preview)
        ORDER BY l.order_index
      ) FILTER (WHERE l.id IS NOT NULL) as lessons
      FROM course_modules m
      LEFT JOIN lessons l ON m.id = l.module_id
      WHERE m.course_id = $1
      GROUP BY m.id ORDER BY m.order_index
    `, [rows[0].id]);
    res.json({ course: { ...rows[0], modules } });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

exports.create = async (req, res) => {
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
    res.status(500).json({ error: 'Failed to create course' });
  }
};

exports.publish = async (req, res) => {
  try {
    const { rows } = await db.query(
      "UPDATE courses SET status='published' WHERE id=$1 AND (instructor_id=$2 OR $3='admin') RETURNING *",
      [req.params.id, req.user.id, req.user.role]
    );
    res.json({ course: rows[0] });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
};
