// controllers/collegeController.js
const College = require('../models/College');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/colleges';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `college-logo-${Date.now()}${path.extname(file.originalname)}`);
  }
});

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed'));
  }
});

// Get all colleges
exports.getColleges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = {};
    
    if (req.query.search) {
      filterQuery.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { college_code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.accreditation) {
      filterQuery.accreditation = req.query.accreditation;
    }
    
    if (req.query.active === 'true') {
      filterQuery.is_active = true;
    } else if (req.query.active === 'false') {
      filterQuery.is_active = false;
    }
    
    // Get total count for pagination
    const total = await College.countDocuments(filterQuery);
    
    // Get colleges with pagination
    const colleges = await College.find(filterQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Render college list view
    res.render('master/college/index', {
      title: 'College Management',
      colleges,
      searchTerm: req.query.search || '',
      accreditation: req.query.accreditation || '',
      active: req.query.active || '',
      accreditations: ['NAAC-A++', 'NAAC-A+', 'NAAC-A', 'NAAC-B++', 'NAAC-B+', 'NAAC-B', 'NAAC-C', 'NBA', 'UGC', 'AICTE', 'Other', 'None'],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching colleges:', err);
    req.flash('error', 'Failed to load colleges');
    res.redirect('/dashboard');
  }
};

// Get college by ID
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    
    if (!college) {
      req.flash('error', 'College not found');
      return res.redirect('/master/college');
    }
    
    res.render('master/college/view', {
      title: 'College Details',
      college
    });
  } catch (err) {
    console.error('Error fetching college:', err);
    req.flash('error', 'Failed to load college details');
    res.redirect('/master/college');
  }
};

// Create college form
exports.createCollegeForm = async (req, res) => {
  try {
    res.render('master/college/create', {
      title: 'Add College',
      accreditations: ['NAAC-A++', 'NAAC-A+', 'NAAC-A', 'NAAC-B++', 'NAAC-B+', 'NAAC-B', 'NAAC-C', 'NBA', 'UGC', 'AICTE', 'Other', 'None']
    });
  } catch (err) {
    console.error('Error loading create college form:', err);
    req.flash('error', 'Failed to load form');
    res.redirect('/master/college');
  }
};

// Create college
exports.createCollege = async (req, res) => {
  try {
    const { 
      name, 
      college_code, 
      address_street, 
      address_city, 
      address_state, 
      address_pincode, 
      address_country,
      contact_email,
      contact_phone,
      contact_website,
      principal_name,
      establishment_year,
      is_active,
      accreditation,
      accreditation_valid_till
    } = req.body;
    
    // Check if college with same code exists
    const collegeExists = await College.findOne({ college_code });
    if (collegeExists) {
      req.flash('error', 'College with this code already exists');
      return res.redirect('/master/college/create');
    }
    
    // Create college object
    const college = new College({
      name,
      college_code,
      address: {
        street: address_street,
        city: address_city,
        state: address_state,
        pincode: address_pincode,
        country: address_country
      },
      contact: {
        email: contact_email,
        phone: contact_phone,
        website: contact_website
      },
      principal_name,
      establishment_year,
      is_active: is_active === 'true',
      accreditation,
      accreditation_valid_till
    });
    
    // Process logo upload if provided
    if (req.file) {
      college.logo = req.file.path.replace('public/', '');
    }
    
    // Process affiliations if provided
    const affiliations = [];
    if (Array.isArray(req.body.affiliation_university)) {
      for (let i = 0; i < req.body.affiliation_university.length; i++) {
        if (req.body.affiliation_university[i]) {
          affiliations.push({
            university: req.body.affiliation_university[i],
            affiliation_number: req.body.affiliation_number[i],
            valid_from: req.body.affiliation_valid_from[i],
            valid_till: req.body.affiliation_valid_till[i]
          });
        }
      }
    } else if (req.body.affiliation_university) {
      affiliations.push({
        university: req.body.affiliation_university,
        affiliation_number: req.body.affiliation_number,
        valid_from: req.body.affiliation_valid_from,
        valid_till: req.body.affiliation_valid_till
      });
    }
    
    college.affiliations = affiliations;
    
    // Save college
    await college.save();
    
    req.flash('success', 'College added successfully');
    res.redirect('/master/college');
  } catch (err) {
    console.error('Error creating college:', err);
    req.flash('error', 'Failed to create college');
    res.redirect('/master/college/create');
  }
};

// Edit college form
exports.editCollegeForm = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    
    if (!college) {
      req.flash('error', 'College not found');
      return res.redirect('/master/college');
    }
    
    res.render('master/college/edit', {
      title: 'Edit College',
      college,
      accreditations: ['NAAC-A++', 'NAAC-A+', 'NAAC-A', 'NAAC-B++', 'NAAC-B+', 'NAAC-B', 'NAAC-C', 'NBA', 'UGC', 'AICTE', 'Other', 'None']
    });
  } catch (err) {
    console.error('Error loading edit college form:', err);
    req.flash('error', 'Failed to load edit form');
    res.redirect('/master/college');
  }
};

// Update college
exports.updateCollege = async (req, res) => {
  try {
    const { 
      name, 
      college_code, 
      address_street, 
      address_city, 
      address_state, 
      address_pincode, 
      address_country,
      contact_email,
      contact_phone,
      contact_website,
      principal_name,
      establishment_year,
      is_active,
      accreditation,
      accreditation_valid_till
    } = req.body;
    
    // Find college
    const college = await College.findById(req.params.id);
    
    if (!college) {
      req.flash('error', 'College not found');
      return res.redirect('/master/college');
    }
    
    // Check if college code is already in use by another college
    if (college_code !== college.college_code) {
      const codeExists = await College.findOne({ 
        college_code, 
        _id: { $ne: college._id } 
      });
      
      if (codeExists) {
        req.flash('error', 'College code already in use');
        return res.redirect(`/master/college/edit/${college._id}`);
      }
    }
    
    // Update college
    college.name = name;
    college.college_code = college_code;
    college.address = {
      street: address_street,
      city: address_city,
      state: address_state,
      pincode: address_pincode,
      country: address_country
    };
    college.contact = {
      email: contact_email,
      phone: contact_phone,
      website: contact_website
    };
    college.principal_name = principal_name;
    college.establishment_year = establishment_year;
    college.is_active = is_active === 'true';
    college.accreditation = accreditation;
    college.accreditation_valid_till = accreditation_valid_till;
    
    // Process logo upload if provided
    if (req.file) {
      // Remove old logo if exists
      if (college.logo) {
        const oldLogoPath = path.join(__dirname, '..', 'public', college.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      college.logo = req.file.path.replace('public/', '');
    }
    
    // Process affiliations if provided
    const affiliations = [];
    if (Array.isArray(req.body.affiliation_university)) {
      for (let i = 0; i < req.body.affiliation_university.length; i++) {
        if (req.body.affiliation_university[i]) {
          affiliations.push({
            university: req.body.affiliation_university[i],
            affiliation_number: req.body.affiliation_number[i],
            valid_from: req.body.affiliation_valid_from[i],
            valid_till: req.body.affiliation_valid_till[i]
          });
        }
      }
    } else if (req.body.affiliation_university) {
      affiliations.push({
        university: req.body.affiliation_university,
        affiliation_number: req.body.affiliation_number,
        valid_from: req.body.affiliation_valid_from,
        valid_till: req.body.affiliation_valid_till
      });
    }
    
    college.affiliations = affiliations;
    
    // Save college
    await college.save();
    
    req.flash('success', 'College updated successfully');
    res.redirect('/master/college');
  } catch (err) {
    console.error('Error updating college:', err);
    req.flash('error', 'Failed to update college');
    res.redirect(`/master/college/edit/${req.params.id}`);
  }
};

// Delete college
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    
    if (!college) {
      req.flash('error', 'College not found');
      return res.redirect('/master/college');
    }
    
    // Check if any departments are associated with this college
    const Department = require('../models/Department');
    const hasRelatedDepartments = await Department.countDocuments({ college_id: college._id });
    
    if (hasRelatedDepartments > 0) {
      req.flash('error', `Cannot delete college because it has ${hasRelatedDepartments} related departments`);
      return res.redirect('/master/college');
    }
    
    // Delete logo file if exists
    if (college.logo) {
      const logoPath = path.join(__dirname, '..', 'public', college.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    // Delete college
    await College.findByIdAndDelete(req.params.id);
    
    req.flash('success', 'College deleted successfully');
    res.redirect('/master/college');
  } catch (err) {
    console.error('Error deleting college:', err);
    req.flash('error', 'Failed to delete college');
    res.redirect('/master/college');
  }
};