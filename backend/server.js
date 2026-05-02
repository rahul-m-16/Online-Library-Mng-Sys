require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect Database
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/books',    require('./routes/books'));
app.use('/api/students', require('./routes/students'));
app.use('/api/issues',   require('./routes/issues'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler (must be last)
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV}`);
});
