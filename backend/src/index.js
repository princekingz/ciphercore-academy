require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Run migrations on start
const { runMigrations } = require('./utils/db');
runMigrations().then(() => {
  console.log('Database ready');
}).catch(err => console.error('Migration warning:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/instructor', require('./routes/instructor'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'CipherCore API' }));
app.use('*', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`CipherCore API on port ${PORT}`));
