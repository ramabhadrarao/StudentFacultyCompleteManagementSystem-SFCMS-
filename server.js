// server.js (updated)
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

// Routes - Only include routes that exist
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const profileRoutes = require('./routes/profile');
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/profile', profileRoutes);


// Home route
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! ' + (process.env.NODE_ENV === 'development' ? err.message : ''));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});