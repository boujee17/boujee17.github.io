// app.js
require('dotenv').config();                  // NEW: load .env first

const path = require('path');
const express = require('express');
const hbs = require('hbs');

const app = express();                       // Create the app first

// === NEW: security & logging middleware ===
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// const morgan = require('morgan');          // optional: uncomment if you want request logs
// ==========================================

app.use(cors()); // allow all origins in dev
// ====================================================================

const PORT = process.env.PORT || 3000;

// ===== NEW: load DB + models, and API router =====
require('./app_api/models/db');              // connects to Atlas and compiles models
const apiRouter = require('./app_api/routes');
// ================================================

// === NEW: apply security headers early ===
app.use(helmet());
// Optional dev logger
// app.use(morgan('dev'));

// === NEW: basic rate limiting on API to reduce abuse ===
app.set('trust proxy', 1); // if behind proxy (Heroku/Render/NGINX)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                  // adjust per your needs
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// View engine (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'app_server', 'views'));
hbs.registerPartials(path.join(__dirname, 'app_server', 'views', 'partials'));
hbs.registerHelper('year', () => new Date().getFullYear());

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MVC routes
const indexRouter = require('./app_server/routes/index');
const travelersRouter = require('./app_server/routes/travelers');
app.use('/', indexRouter);
app.use('/travelers', travelersRouter);

// ===== NEW: mount API under /api =====
app.use('/api', apiRouter);
// =====================================

// === NEW: 404 handlers (API vs Web) ===
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found', path: req.path });
  }
  // 404
  res.status(404).render('404', { title: '404 - Not Found' });
});

// === NEW: centralized error handler (API vs Web) ===
/* 
  Any route/controller can call next(err). This handler ensures:
  - JSON errors for /api routes
  - A friendly error page for the MVC site
*/
app.use((err, req, res, next) => {
  // Minimal structured log; in production consider a logger like pino/winston
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  const status = err.status || err.statusCode || 500;

  if (req.path.startsWith('/api')) {
    return res.status(status).json({
      error: err.publicMessage || 'Something went wrong',
      status,
      // expose details only in development
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // For web routes, you can pass an error page (optional)
  res.status(status).render('500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Travlr-MVC running at http://localhost:${PORT}`);
});

module.exports = app;

