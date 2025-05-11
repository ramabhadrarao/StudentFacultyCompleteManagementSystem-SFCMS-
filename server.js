// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');

const app = express();

// Start replica set first
try {
  require('./start-mongodb');
} catch (err) {
  console.warn('Warning: Could not start MongoDB replica set automatically:', err.message);
  console.warn('Make sure MongoDB is running before proceeding');
}

// DB connect
const { connectDB } = require('./config/db');
connectDB(); // ensure called after replica starts

// Sessions (must use connected client)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// View engine + public
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Flash & locals
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const adminUserRoutes = require('./routes/admin/users');
const studentRoutes = require('./routes/students');

// Apply routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/profile', profileRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/students', studentRoutes);

// Home route
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadDirs = [
  './public/uploads',
  './public/uploads/students',
  './public/uploads/faculty',
  './public/uploads/documents',
  './public/uploads/certificates'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! ' + (process.env.NODE_ENV === 'development' ? err.message : ''));
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});