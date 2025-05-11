// middleware/auth.js
// middleware/auth.js
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/login');
};

exports.hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please log in to access this page');
      return res.redirect('/login');
    }
    
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/dashboard');
  };
};
exports.hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please log in to access this page');
      return res.redirect('/login');
    }
    
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/dashboard');
  };
};