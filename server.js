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
require('./start-mongodb');

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

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/student');
const attendanceRoutes = require('./routes/attendance');
const resultsRoutes = require('./routes/results');
const hostelRoutes = require('./routes/hostel');
const transportRoutes = require('./routes/transport');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/results', resultsRoutes);
app.use('/hostel', hostelRoutes);
app.use('/transport', transportRoutes);
app.use('/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash('error', 'Something went wrong');
  res.status(500).render('error', { 
    error: process.env.NODE_ENV === 'development' ? err : 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});