// controllers/studentController.js
const Student = require('../models/Student');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Gender = require('../models/Gender');
const BloodGroup = require('../models/BloodGroup');
const Nationality = require('../models/Nationality');
const Religion = require('../models/Religion');
const StudentType = require('../models/StudentType');
const Caste = require('../models/Caste');
const SubCaste = require('../models/SubCaste');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Get all students (admin, principal, hod, faculty)
exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = {};
    
    if (req.query.batch) {
      filterQuery.batch_id = req.query.batch;
    }
    
    if (req.query.name) {
      filterQuery.name = { $regex: req.query.name, $options: 'i' };
    }
    
    if (req.query.admission_no) {
      filterQuery.admission_no = { $regex: req.query.admission_no, $options: 'i' };
    }

    if (req.query.student_type) {
      filterQuery.student_type_id = req.query.student_type;
    }

    if (req.query.is_frozen) {
      filterQuery.is_frozen = req.query.is_frozen === 'true';
    }
    
    // Get total count for pagination
    const total = await Student.countDocuments(filterQuery);
    
    // Get students with pagination
    const students = await Student.find(filterQuery)
      .populate('batch_id')
      .populate('gender_id')
      .populate('blood_group_id')
      .populate('student_type_id')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Get batches for filter dropdown
    const batches = await Batch.find().sort({ start_year: -1 });
    const studentTypes = await StudentType.find().sort({ name: 1 });
    
    res.render('students/index', {
      title: 'Student Management',
      students,
      batches,
      studentTypes,
      selectedBatch: req.query.batch || '',
      selectedStudentType: req.query.student_type || '',
      searchName: req.query.name || '',
      searchAdmission: req.query.admission_no || '',
      isFrozen: req.query.is_frozen || '',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    req.flash('error', 'Failed to load student list');
    res.redirect('/dashboard');
  }
};

// Get student by ID (admin, principal, hod, faculty, self-student)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('batch_id')
      .populate('gender_id')
      .populate('blood_group_id')
      .populate('nationality_id')
      .populate('religion_id')
      .populate('student_type_id')
      .populate('caste_id')
      .populate('sub_caste_id')
      .populate('user_id');
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Check if the logged-in user is the student or an authorized role
    const isOwnProfile = req.session.user && student.user_id && 
                         student.user_id._id.toString() === req.session.user.id;
    
    if (!isOwnProfile && !['admin', 'principal', 'hod', 'faculty'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to view this student');
      return res.redirect('/dashboard');
    }
    
    res.render('students/view', {
      title: 'Student Details',
      student,
      isOwnProfile
    });
  } catch (err) {
    console.error('Error fetching student:', err);
    req.flash('error', 'Failed to load student details');
    res.redirect('/students');
  }
};

// Get sub-castes by caste ID (AJAX)
exports.getSubcastesByCaste = async (req, res) => {
  try {
    const subcastes = await SubCaste.find({ caste_id: req.params.casteId }).sort({ name: 1 });
    res.json(subcastes);
  } catch (err) {
    console.error('Error fetching subcastes:', err);
    res.status(500).json({ error: 'Failed to fetch subcastes' });
  }
};

// Create student form
exports.createStudentForm = async (req, res) => {
  try {
    // Get lookup data for dropdowns
    const batches = await Batch.find().sort({ start_year: -1 });
    const genders = await Gender.find().sort({ name: 1 });
    const bloodGroups = await BloodGroup.find().sort({ name: 1 });
    const nationalities = await Nationality.find().sort({ name: 1 });
    const religions = await Religion.find().sort({ name: 1 });
    const studentTypes = await StudentType.find().sort({ name: 1 });
    const castes = await Caste.find().sort({ name: 1 });
    
    res.render('students/create', {
      title: 'Add Student',
      batches,
      genders,
      bloodGroups,
      nationalities,
      religions,
      studentTypes,
      castes,
      subcastes: []
    });
  } catch (err) {
    console.error('Error loading create student form:', err);
    req.flash('error', 'Failed to load form');
    res.redirect('/students');
  }
};

// Create student
exports.createStudent = async (req, res) => {
  try {
    const { 
      admission_no, 
      regd_no, 
      name, 
      gender_id, 
      blood_group_id,
      email, 
      mobile, 
      father_name, 
      mother_name, 
      father_mobile,
      mother_mobile,
      aadhar, 
      father_aadhar,
      mother_aadhar,
      address,
      batch_id, 
      nationality_id, 
      religion_id, 
      student_type_id, 
      caste_id, 
      sub_caste_id 
    } = req.body;
    
    // Check if student with same admission number exists
    const studentExists = await Student.findOne({ admission_no });
    if (studentExists) {
      req.flash('error', 'Student with this admission number already exists');
      return res.redirect('/students/create');
    }
    
    // Check if student with same aadhar exists (if provided)
    if (aadhar) {
      const aadharExists = await Student.findOne({ aadhar });
      if (aadharExists) {
        req.flash('error', 'Student with this Aadhar number already exists');
        return res.redirect('/students/create');
      }
    }
    
    // Create user account if email is provided
    let userId = null;
    if (email) {
      // Check if email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        req.flash('error', 'Email already in use by another user');
        return res.redirect('/students/create');
      }
      
      // Create user with default password (admission number)
      const user = new User({
        username: email.split('@')[0], // Use part before @ as username
        email,
        password_hash: await bcrypt.hash(admission_no, 10), // Use admission_no as default password
        role: 'student',
        is_active: true
      });
      
      await user.save();
      userId = user._id;
    }
    
    // Create student
    const student = new Student({
      admission_no,
      regd_no,
      name,
      gender_id,
      blood_group_id,
      email,
      mobile,
      father_name,
      mother_name,
      father_mobile,
      mother_mobile,
      aadhar,
      father_aadhar,
      mother_aadhar,
      address,
      batch_id,
      user_id: userId,
      nationality_id,
      religion_id,
      student_type_id,
      caste_id,
      sub_caste_id,
      is_frozen: false
    });
    
    await student.save();
    
    // Handle photo upload if provided
    if (req.file) {
      student.photo = req.file.path.replace('public/', '');
      await student.save();
    }
    
    req.flash('success', 'Student added successfully');
    res.redirect('/students');
  } catch (err) {
    console.error('Error creating student:', err);
    req.flash('error', 'Failed to create student');
    res.redirect('/students/create');
  }
};

// Edit student form
exports.editStudentForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Check if user has permission to edit
    const isOwnProfile = req.session.user && student.user_id && 
                         student.user_id.toString() === req.session.user.id;
    
    if (!isOwnProfile && !['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to edit this student');
      return res.redirect('/dashboard');
    }
    
    // Check if profile is frozen
    if (student.is_frozen && isOwnProfile) {
      req.flash('error', 'Your profile is currently frozen. Please submit an unfreeze request to make changes.');
      return res.redirect('/students/view/' + student._id);
    }
    
    // Get lookup data for dropdowns
    const batches = await Batch.find().sort({ start_year: -1 });
    const genders = await Gender.find().sort({ name: 1 });
    const bloodGroups = await BloodGroup.find().sort({ name: 1 });
    const nationalities = await Nationality.find().sort({ name: 1 });
    const religions = await Religion.find().sort({ name: 1 });
    const studentTypes = await StudentType.find().sort({ name: 1 });
    const castes = await Caste.find().sort({ name: 1 });
    
    // Get subcaste options for the selected caste
    let subcastes = [];
    if (student.caste_id) {
      subcastes = await SubCaste.find({ caste_id: student.caste_id }).sort({ name: 1 });
    }
    
    res.render('students/edit', {
      title: 'Edit Student',
      student,
      batches,
      genders,
      bloodGroups,
      nationalities,
      religions,
      studentTypes,
      castes,
      subcastes,
      isOwnProfile
    });
  } catch (err) {
    console.error('Error loading edit student form:', err);
    req.flash('error', 'Failed to load edit form');
    res.redirect('/students');
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { 
      admission_no, 
      regd_no, 
      name, 
      gender_id, 
      blood_group_id,
      email, 
      mobile, 
      father_name, 
      mother_name, 
      father_mobile,
      mother_mobile,
      aadhar, 
      father_aadhar,
      mother_aadhar,
      address,
      batch_id, 
      nationality_id, 
      religion_id, 
      student_type_id, 
      caste_id, 
      sub_caste_id 
    } = req.body;
    
    // Find student
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Check if user has permission to update
    const isOwnProfile = req.session.user && student.user_id && 
                         student.user_id.toString() === req.session.user.id;
    
    if (!isOwnProfile && !['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to update this student');
      return res.redirect('/dashboard');
    }
    
    // Check if profile is frozen
    if (student.is_frozen && isOwnProfile) {
      req.flash('error', 'Your profile is currently frozen. Please submit an unfreeze request to make changes.');
      return res.redirect('/students/view/' + student._id);
    }
    
    // Check if admission number is already used by another student
    if (admission_no !== student.admission_no) {
      const admissionExists = await Student.findOne({ 
        admission_no, 
        _id: { $ne: student._id } 
      });
      
      if (admissionExists) {
        req.flash('error', 'Admission number already in use');
        return res.redirect(`/students/edit/${student._id}`);
      }
    }
    
    // Check if aadhar is already used by another student (if provided)
    if (aadhar && aadhar !== student.aadhar) {
      const aadharExists = await Student.findOne({ 
        aadhar, 
        _id: { $ne: student._id } 
      });
      
      if (aadharExists) {
        req.flash('error', 'Aadhar number already in use');
        return res.redirect(`/students/edit/${student._id}`);
      }
    }
    
    // Handle email and user account
    if (email !== student.email) {
      // Check if email is already used by another user
      const emailExists = await User.findOne({ email });
      
      if (emailExists && (!student.user_id || emailExists._id.toString() !== student.user_id.toString())) {
        req.flash('error', 'Email already in use by another user');
        return res.redirect(`/students/edit/${student._id}`);
      }
      
      // Update existing user or create new one
      if (student.user_id) {
        // Update existing user
        await User.findByIdAndUpdate(student.user_id, { email });
      } else if (email) {
        // Create new user
        const user = new User({
          username: email.split('@')[0],
          email,
          password_hash: await bcrypt.hash(admission_no, 10),
          role: 'student',
          is_active: true
        });
        
        await user.save();
        student.user_id = user._id;
      }
    }
    
    // Only allow certain fields to be updated by students themselves
    if (isOwnProfile) {
      // Students can only update some fields of their own profile
      student.mobile = mobile;
      student.email = email;
      student.address = address;
      
      // Handle photo upload if provided
      if (req.file) {
        // Remove old photo if exists
        if (student.photo) {
          const oldPhotoPath = path.join(__dirname, '..', 'public', student.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        
        student.photo = req.file.path.replace('public/', '');
      }
    } else {
      // Admin/staff can update all fields
      student.admission_no = admission_no;
      student.regd_no = regd_no;
      student.name = name;
      student.gender_id = gender_id;
      student.blood_group_id = blood_group_id;
      student.email = email;
      student.mobile = mobile;
      student.father_name = father_name;
      student.mother_name = mother_name;
      student.father_mobile = father_mobile;
      student.mother_mobile = mother_mobile;
      student.aadhar = aadhar;
      student.father_aadhar = father_aadhar;
      student.mother_aadhar = mother_aadhar;
      student.address = address;
      student.batch_id = batch_id;
      student.nationality_id = nationality_id;
      student.religion_id = religion_id;
      student.student_type_id = student_type_id;
      student.caste_id = caste_id;
      student.sub_caste_id = sub_caste_id;
      
      // Handle photo upload if provided
      if (req.file) {
        // Remove old photo if exists
        if (student.photo) {
          const oldPhotoPath = path.join(__dirname, '..', 'public', student.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        
        student.photo = req.file.path.replace('public/', '');
      }
    }
    
    await student.save();
    
    req.flash('success', 'Student updated successfully');
    res.redirect('/students/view/' + student._id);
  } catch (err) {
    console.error('Error updating student:', err);
    req.flash('error', 'Failed to update student');
    res.redirect(`/students/edit/${req.params.id}`);
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Only admin/principal/hod can delete students
    if (!['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to delete students');
      return res.redirect('/dashboard');
    }
    
    // Delete associated user account if exists
    if (student.user_id) {
      await User.findByIdAndDelete(student.user_id);
    }
    
    // Delete student photo if exists
    if (student.photo) {
      const photoPath = path.join(__dirname, '..', 'public', student.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Delete student
    await Student.findByIdAndDelete(req.params.id);
    
    req.flash('success', 'Student deleted successfully');
    res.redirect('/students');
  } catch (err) {
    console.error('Error deleting student:', err);
    req.flash('error', 'Failed to delete student');
    res.redirect('/students');
  }
};

// Freeze student profile (self or admin)
// exports.freezeProfile = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
    
//     if (!student) {
//       req.flash('error', 'Student not found');
//       return res.redirect('/students');
//     }
    
//     // Check if user has permission to freeze
//     const isOwnProfile = req.session.user && student.user_id && 
//                          student.user_id.toString() === req.session.user.id;
    
//     if (!isOwnProfile && !['admin', 'principal', 'hod'].includes(req.session.user.role)) {
//       req.flash('error', 'You do not have permission to freeze this profile');
//       return res.redirect('/dashboard');
//     }
    
//     // Update freeze status
//     student.is_frozen = true;
//     student.frozen_at = new Date();
//     student.frozen_by = req.session.user.id;
    
//     await student.save();
    
//     req.flash('success', 'Student profile has been frozen');
//     res.redirect('/students/view/' + student._id);
//   } catch (err) {
//     console.error('Error freezing student profile:', err);
//     req.flash('error', 'Failed to freeze student profile');
//     res.redirect('/students/view/' + req.params.id);
//   }
// };

// Unfreeze student profile (admin only)
// exports.unfreezeProfile = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
    
//     if (!student) {
//       req.flash('error', 'Student not found');
//       return res.redirect('/students');
//     }
    
//     // Only admin/principal/hod can unfreeze profiles
//     if (!['admin', 'principal', 'hod'].includes(req.session.user.role)) {
//       req.flash('error', 'You do not have permission to unfreeze profiles');
//       return res.redirect('/dashboard');
//     }
    
//     // Update freeze status
//     student.is_frozen = false;
//     student.frozen_at = null;
//     student.frozen_by = null;
    
//     // Clear pending unfreeze requests
//     student.unfreeze_requests = student.unfreeze_requests.map(request => {
//       if (request.status === 'pending') {
//         return {
//           ...request,
//           status: 'approved',
//           processed_at: new Date(),
//           processed_by: req.session.user.id
//         };
//       }
//       return request;
//     });
    
//     await student.save();
    
//     req.flash('success', 'Student profile has been unfrozen');
//     res.redirect('/students/view/' + student._id);
//   } catch (err) {
//     console.error('Error unfreezing student profile:', err);
//     req.flash('error', 'Failed to unfreeze student profile');
//     res.redirect('/students/view/' + req.params.id);
//   }
// };

// Submit unfreeze request (student)
// exports.requestUnfreeze = async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const student = await Student.findById(req.params.id);
    
//     if (!student) {
//       req.flash('error', 'Student not found');
//       return res.redirect('/students');
//     }
    
//     // Check if user is the student
//     const isOwnProfile = req.session.user && student.user_id && 
//                          student.user_id.toString() === req.session.user.id;
    
//     if (!isOwnProfile) {
//       req.flash('error', 'You can only request to unfreeze your own profile');
//       return res.redirect('/dashboard');
//     }
    
//     // Check if profile is frozen
//     if (!student.is_frozen) {
//       req.flash('error', 'Your profile is not frozen');
//       return res.redirect('/students/view/' + student._id);
//     }
    
//     // Check for existing pending request
//     const hasPendingRequest = student.unfreeze_requests.some(request => request.status === 'pending');
    
//     if (hasPendingRequest) {
//       req.flash('error', 'You already have a pending unfreeze request');
//       return res.redirect('/students/view/' + student._id);
//     }
    
//     // Add unfreeze request
//     student.unfreeze_requests.push({
//       requested_at: new Date(),
//       reason,
//       status: 'pending'
//     });
    
//     await student.save();
    
//     req.flash('success', 'Unfreeze request submitted successfully');
//     res.redirect('/students/view/' + student._id);
//   } catch (err) {
//     console.error('Error submitting unfreeze request:', err);
//     req.flash('error', 'Failed to submit unfreeze request');
//     res.redirect('/students/view/' + req.params.id);
//   }
// };

// Process unfreeze request (admin)
// exports.processUnfreezeRequest = async (req, res) => {
//   try {
//     const { requestId, action } = req.body;
//     const student = await Student.findById(req.params.id);
    
//     if (!student) {
//       req.flash('error', 'Student not found');
//       return res.redirect('/students');
//     }
    
//     // Only admin/principal/hod can process unfreeze requests
//     if (!['admin', 'principal', 'hod'].includes(req.session.user.role)) {
//       req.flash('error', 'You do not have permission to process unfreeze requests');
//       return res.redirect('/dashboard');
//     }
    
//     // Find the request
//     const requestIndex = student.unfreeze_requests.findIndex(
//       request => request._id.toString() === requestId
//     );
    
//     if (requestIndex === -1) {
//       req.flash('error', 'Unfreeze request not found');
//       return res.redirect('/students/view/' + student._id);
//     }
    
//     // Update request status
//     student.unfreeze_requests[requestIndex].status = action === 'approve' ? 'approved' : 'rejected';
//     student.unfreeze_requests[requestIndex].processed_at = new Date();
//     student.unfreeze_requests[requestIndex].processed_by = req.session.user.id;
    
//     // If approved, unfreeze the profile
//     if (action === 'approve') {
//       student.is_frozen = false;
//       student.frozen_at = null;
//       student.frozen_by = null;
//     }
    
//     await student.save();
    
//     req.flash('success', `Unfreeze request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
//     res.redirect('/students/view/' + student._id);
//   } catch (err) {
//     console.error('Error processing unfreeze request:', err);
//     req.flash('error', 'Failed to process unfreeze request');
//     res.redirect('/students/view/' + req.params.id);
//   }
// };

// Import students form
exports.importStudentsForm = async (req, res) => {
  try {
    // Get lookup data for template
    const batches = await Batch.find().sort({ start_year: -1 });
    const genders = await Gender.find().sort({ name: 1 });
    const bloodGroups = await BloodGroup.find().sort({ name: 1 });
    const nationalities = await Nationality.find().sort({ name: 1 });
    const religions = await Religion.find().sort({ name: 1 });
    const studentTypes = await StudentType.find().sort({ name: 1 });
    
    res.render('students/import', {
      title: 'Import Students',
      batches,
      genders,
      bloodGroups,
      nationalities,
      religions,
      studentTypes,
      templateFields: [
        { field: 'admission_no', required: true, description: 'Admission Number (Required)' },
        { field: 'regd_no', required: false, description: 'Registration Number' },
        { field: 'name', required: true, description: 'Student Name (Required)' },
        { field: 'gender', required: true, description: 'Gender (Required) - Use values from dropdown' },
        { field: 'blood_group', required: false, description: 'Blood Group - Use values from dropdown' },
        { field: 'email', required: false, description: 'Email' },
        { field: 'mobile', required: false, description: 'Mobile Number' },
        { field: 'father_name', required: false, description: 'Father\'s Name' },
        { field: 'mother_name', required: false, description: 'Mother\'s Name' },
        { field: 'father_mobile', required: false, description: 'Father\'s Mobile' },
        { field: 'mother_mobile', required: false, description: 'Mother\'s Mobile' },
        { field: 'aadhar', required: false, description: 'Aadhar Number' },
        { field: 'father_aadhar', required: false, description: 'Father\'s Aadhar' },
        { field: 'mother_aadhar', required: false, description: 'Mother\'s Aadhar' },
        { field: 'address', required: false, description: 'Address' },
        { field: 'batch', required: true, description: 'Batch (Required) - Use values from dropdown' },
        { field: 'nationality', required: true, description: 'Nationality (Required) - Use values from dropdown' },
        { field: 'religion', required: true, description: 'Religion (Required) - Use values from dropdown' },
        { field: 'student_type', required: true, description: 'Student Type (Required) - Use values from dropdown' },
        { field: 'caste', required: false, description: 'Caste - Use valid caste name' },
        { field: 'sub_caste', required: false, description: 'Sub Caste - Must be valid for the given caste' }
      ]
    });
  } catch (err) {
    console.error('Error loading import form:', err);
    req.flash('error', 'Failed to load import form');
    res.redirect('/students');
  }
};

// Generate CSV template for import
exports.generateImportTemplate = async (req, res) => {
  try {
    // Get lookup data for template
    const batches = await Batch.find().sort({ start_year: -1 });
    const genders = await Gender.find().sort({ name: 1 });
    const bloodGroups = await BloodGroup.find().sort({ name: 1 });
    const nationalities = await Nationality.find().sort({ name: 1 });
    const religions = await Religion.find().sort({ name: 1 });
    const studentTypes = await StudentType.find().sort({ name: 1 });
    const castes = await Caste.find().sort({ name: 1 });
    
    // Create CSV header
    const header = [
      'admission_no',
      'regd_no',
      'name',
      'gender',
      'blood_group',
      'email',
      'mobile',
      'father_name',
      'mother_name',
      'father_mobile',
      'mother_mobile',
      'aadhar',
      'father_aadhar',
      'mother_aadhar',
      'address',
      'batch',
      'nationality',
      'religion',
      'student_type',
      'caste',
      'sub_caste'
    ];
    
    // Create CSV content
    let csvContent = header.join(',') + '\n';
    
    // Add example row
    const exampleRow = [
      'ADM001', // admission_no
      'REG001', // regd_no
      'John Doe', // name
      genders.length > 0 ? genders[0].name : 'Male', // gender
      bloodGroups.length > 0 ? bloodGroups[0].name : 'A+', // blood_group
      'john.doe@example.com', // email
      '9876543210', // mobile
      'Father Name', // father_name
      'Mother Name', // mother_name
      '9876543211', // father_mobile
      '9876543212', // mother_mobile
      '123456789012', // aadhar
      '123456789013', // father_aadhar
      '123456789014', // mother_aadhar
      '123 Main St, City', // address
      batches.length > 0 ? batches[0].batch_name : 'Batch 2023-2027', // batch
      nationalities.length > 0 ? nationalities[0].name : 'Indian', // nationality
      religions.length > 0 ? religions[0].name : 'Hindu', // religion
      studentTypes.length > 0 ? studentTypes[0].name : 'Regular', // student_type
      castes.length > 0 ? castes[0].name : 'General', // caste
      '' // sub_caste
    ];
    
    csvContent += exampleRow.join(',') + '\n';
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.csv');
    
    // Send the CSV content
    res.send(csvContent);
  } catch (err) {
    console.error('Error generating import template:', err);
    req.flash('error', 'Failed to generate import template');
    res.redirect('/students/import');
  }
};

// Process CSV import
exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please upload a CSV file');
      return res.redirect('/students/import');
    }
    
    // Get lookup data for reference
    const batches = await Batch.find();
    const genders = await Gender.find();
    const bloodGroups = await BloodGroup.find();
    const nationalities = await Nationality.find();
    const religions = await Religion.find();
    const studentTypes = await StudentType.find();
    const castes = await Caste.find();
    
    // Create lookup maps for easy reference
    const batchMap = new Map(batches.map(batch => [batch.batch_name, batch._id]));
    const genderMap = new Map(genders.map(gender => [gender.name, gender._id]));
    const bloodGroupMap = new Map(bloodGroups.map(bg => [bg.name, bg._id]));
    const nationalityMap = new Map(nationalities.map(nat => [nat.name, nat._id]));
    const religionMap = new Map(religions.map(rel => [rel.name, rel._id]));
    const studentTypeMap = new Map(studentTypes.map(type => [type.name, type._id]));
    const casteMap = new Map(castes.map(caste => [caste.name, caste._id]));
    
    // Load subcaste data - create a map of caste_id to array of subcaste objects
    const subcastes = await SubCaste.find();
    const subcasteMap = new Map();
    
    subcastes.forEach(subcaste => {
      const casteId = subcaste.caste_id.toString();
      if (!subcasteMap.has(casteId)) {
        subcasteMap.set(casteId, []);
      }
      subcasteMap.get(casteId).push(subcaste);
    });
    
    // Initialize arrays for results
    const successList = [];
    const errorList = [];
    const rowsToProcess = [];
    
    // Read CSV file
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    
    fileStream
      .pipe(csv())
      .on('data', (row) => {
        rowsToProcess.push(row);
      })
      .on('end', async () => {
        // Remove temporary file
        fs.unlinkSync(filePath);
        
        // Process each row
        for (const row of rowsToProcess) {
          try {
            // Validate required fields
            if (!row.admission_no || !row.name || !row.gender || !row.batch || 
                !row.nationality || !row.religion || !row.student_type) {
              errorList.push({
                row: JSON.stringify(row),
                error: 'Missing required fields'
              });
              continue;
            }
            
            // Check if student with admission number already exists
            const existingStudent = await Student.findOne({ admission_no: row.admission_no });
            if (existingStudent) {
              errorList.push({
                row: JSON.stringify(row),
                error: `Student with admission number ${row.admission_no} already exists`
              });
              continue;
            }
            
            // Validate and map reference data
            if (!genderMap.has(row.gender)) {
              errorList.push({
                row: JSON.stringify(row),
                error: `Invalid gender: ${row.gender}`
              });
              continue;
            }
            
            if (!batchMap.has(row.batch)) {
              errorList.push({
                row: JSON.stringify(row),
                error: `Invalid batch: ${row.batch}`
              });
              continue;
            }
            
            if (!nationalityMap.has(row.nationality)) {
              errorList.push({
                row: JSON.stringify(row),
                error: `Invalid nationality: ${row.nationality}`
              });
              continue;
            }
            
            if (!religionMap.has(row.religion)) {
              errorList.push({
                row: JSON.stringify(row),
                error: `Invalid religion: ${row.religion}`
              });
              continue;
            }
            
            if (!studentTypeMap.has(row.student_type)) {
              errorList.push({
                row: JSON.stringify(row),
                error: `Invalid student type: ${row.student_type}`
              });
              continue;
            }
            
            let casteId = null;
            if (row.caste) {
              if (!casteMap.has(row.caste)) {
                errorList.push({
                  row: JSON.stringify(row),
                  error: `Invalid caste: ${row.caste}`
                });
                continue;
              }
              casteId = casteMap.get(row.caste);
            }
            
            let subcasteId = null;
            if (row.sub_caste && casteId) {
              // Find the subcaste in the right caste
              const casteSubcastes = subcasteMap.get(casteId.toString()) || [];
              const subcaste = casteSubcastes.find(sc => sc.name === row.sub_caste);
              
              if (!subcaste) {
                errorList.push({
                  row: JSON.stringify(row),
                  error: `Invalid sub caste: ${row.sub_caste} for caste: ${row.caste}`
                });
                continue;
              }
              
              subcasteId = subcaste._id;
            }
            
            let bloodGroupId = null;
            if (row.blood_group) {
              if (!bloodGroupMap.has(row.blood_group)) {
                errorList.push({
                  row: JSON.stringify(row),
                  error: `Invalid blood group: ${row.blood_group}`
                });
                continue;
              }
              bloodGroupId = bloodGroupMap.get(row.blood_group);
            }
            
            // Create user account if email is provided
            let userId = null;
            if (row.email) {
              // Check if email already exists
              const emailExists = await User.findOne({ email: row.email });
              if (emailExists) {
                errorList.push({
                  row: JSON.stringify(row),
                  error: `Email already in use: ${row.email}`
                });
                continue;
              }
              
              // Create user with default password (admission number)
              const user = new User({
                username: row.email.split('@')[0], // Use part before @ as username
                email: row.email,
                password_hash: await bcrypt.hash(row.admission_no, 10), // Use admission_no as default password
                role: 'student',
                is_active: true
              });
              
              await user.save();
              userId = user._id;
            }
            
            // Create student
            const student = new Student({
              admission_no: row.admission_no,
              regd_no: row.regd_no,
              name: row.name,
              gender_id: genderMap.get(row.gender),
              blood_group_id: bloodGroupId,
              email: row.email,
              mobile: row.mobile,
              father_name: row.father_name,
              mother_name: row.mother_name,
              father_mobile: row.father_mobile,
              mother_mobile: row.mother_mobile,
              aadhar: row.aadhar,
              father_aadhar: row.father_aadhar,
              mother_aadhar: row.mother_aadhar,
              address: row.address,
              batch_id: batchMap.get(row.batch),
              user_id: userId,
              nationality_id: nationalityMap.get(row.nationality),
              religion_id: religionMap.get(row.religion),
              student_type_id: studentTypeMap.get(row.student_type),
              caste_id: casteId,
              sub_caste_id: subcasteId,
              is_frozen: false
            });
            
            await student.save();
            
            successList.push({
              admission_no: row.admission_no,
              name: row.name
            });
          } catch (err) {
            console.error('Error processing row:', err);
            errorList.push({
              row: JSON.stringify(row),
              error: err.message
            });
          }
        }
        
        // Store results in session for the result page
        req.session.importResults = {
          total: rowsToProcess.length,
          success: successList,
          errors: errorList
        };
        
        res.redirect('/students/import/result');
      });
  } catch (err) {
    console.error('Error importing students:', err);
    req.flash('error', 'Failed to import students');
    res.redirect('/students/import');
  }
};

// Show import results
exports.importResult = (req, res) => {
  try {
    const results = req.session.importResults || { total: 0, success: [], errors: [] };
    
    // Clear results from session
    req.session.importResults = null;
    
    res.render('students/import-result', {
      title: 'Import Results',
      results
    });
  } catch (err) {
    console.error('Error rendering import results:', err);
    req.flash('error', 'Failed to display import results');
    res.redirect('/students');
  }
};

// Export students to CSV
exports.exportStudents = async (req, res) => {
  try {
    // Build filter query
    const filterQuery = {};
    
    if (req.query.batch) {
      filterQuery.batch_id = req.query.batch;
    }
    
    if (req.query.name) {
      filterQuery.name = { $regex: req.query.name, $options: 'i' };
    }
    
    if (req.query.admission_no) {
      filterQuery.admission_no = { $regex: req.query.admission_no, $options: 'i' };
    }
    
    if (req.query.student_type) {
      filterQuery.student_type_id = req.query.student_type;
    }
    
    // Get students
    const students = await Student.find(filterQuery)
      .populate('batch_id')
      .populate('gender_id')
      .populate('blood_group_id')
      .populate('nationality_id')
      .populate('religion_id')
      .populate('student_type_id')
      .populate('caste_id')
      .populate('sub_caste_id')
      .sort({ name: 1 });
    
    // Create CSV header
    const header = [
      'Admission No',
      'Registration No',
      'Name',
      'Gender',
      'Blood Group',
      'Email',
      'Mobile',
      'Father Name',
      'Mother Name',
      'Father Mobile',
      'Mother Mobile',
      'Aadhar',
      'Father Aadhar',
      'Mother Aadhar',
      'Address',
      'Batch',
      'Nationality',
      'Religion',
      'Student Type',
      'Caste',
      'Sub Caste',
      'Frozen'
    ];
    
    // Create CSV content
    let csvContent = header.join(',') + '\n';
    
    // Add rows for each student
    students.forEach(student => {
      const row = [
        student.admission_no,
        student.regd_no || '',
        student.name,
        student.gender_id ? student.gender_id.name : '',
        student.blood_group_id ? student.blood_group_id.name : '',
        student.email || '',
        student.mobile || '',
        student.father_name || '',
        student.mother_name || '',
        student.father_mobile || '',
        student.mother_mobile || '',
        student.aadhar || '',
        student.father_aadhar || '',
        student.mother_aadhar || '',
        student.address || '',
        student.batch_id ? student.batch_id.batch_name : '',
        student.nationality_id ? student.nationality_id.name : '',
        student.religion_id ? student.religion_id.name : '',
        student.student_type_id ? student.student_type_id.name : '',
        student.caste_id ? student.caste_id.name : '',
        student.sub_caste_id ? student.sub_caste_id.name : '',
        student.is_frozen ? 'Yes' : 'No'
      ];
      
      // Escape commas and quotes in the data
      const escapedRow = row.map(field => {
        if (field && (field.includes(',') || field.includes('"'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      
      csvContent += escapedRow.join(',') + '\n';
    });
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students_export.csv');
    
    // Send the CSV content
    res.send(csvContent);
  } catch (err) {
    console.error('Error exporting students:', err);
    req.flash('error', 'Failed to export students');
    res.redirect('/students');
  }
};

// Reset student password
exports.resetPassword = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    if (!student.user_id) {
      req.flash('error', 'Student does not have an account');
      return res.redirect(`/students/view/${student._id}`);
    }
    
    // Only admin/principal/hod can reset passwords
    if (!['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to reset passwords');
      return res.redirect('/dashboard');
    }
    
    // Reset password to admission number
    const user = await User.findById(student.user_id);
    user.password_hash = await bcrypt.hash(student.admission_no, 10);
    await user.save();
    
    req.flash('success', 'Password reset successfully to admission number');
    res.redirect(`/students/view/${student._id}`);
  } catch (err) {
    console.error('Error resetting password:', err);
    req.flash('error', 'Failed to reset password');
    res.redirect(`/students/view/${req.params.id}`);
  }
};

// Add these functions to controllers/studentController.js

// Freeze student profile (self or admin)
exports.freezeProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Check if user has permission to freeze
    const isOwnProfile = req.session.user && student.user_id && 
                       student.user_id.toString() === req.session.user.id;
    
    if (!isOwnProfile && !['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to freeze this profile');
      return res.redirect('/dashboard');
    }
    
    // Update freeze status
    student.is_frozen = true;
    student.frozen_at = new Date();
    student.frozen_by = req.session.user.id;
    
    await student.save();
    
    req.flash('success', 'Student profile has been frozen');
    res.redirect('/students/view/' + student._id);
  } catch (err) {
    console.error('Error freezing student profile:', err);
    req.flash('error', 'Failed to freeze student profile');
    res.redirect('/students/view/' + req.params.id);
  }
};

// Unfreeze student profile (admin only)
exports.unfreezeProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Only admin/principal/hod can unfreeze profiles
    if (!['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to unfreeze profiles');
      return res.redirect('/dashboard');
    }
    
    // Update freeze status
    student.is_frozen = false;
    student.frozen_at = null;
    student.frozen_by = null;
    
    // Clear pending unfreeze requests
    student.unfreeze_requests = student.unfreeze_requests.map(request => {
      if (request.status === 'pending') {
        return {
          ...request,
          status: 'approved',
          processed_at: new Date(),
          processed_by: req.session.user.id
        };
      }
      return request;
    });
    
    await student.save();
    
    req.flash('success', 'Student profile has been unfrozen');
    res.redirect('/students/view/' + student._id);
  } catch (err) {
    console.error('Error unfreezing student profile:', err);
    req.flash('error', 'Failed to unfreeze student profile');
    res.redirect('/students/view/' + req.params.id);
  }
};

// Submit unfreeze request (student)
exports.requestUnfreeze = async (req, res) => {
  try {
    const { reason } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Check if user is the student
    const isOwnProfile = req.session.user && student.user_id && 
                       student.user_id.toString() === req.session.user.id;
    
    if (!isOwnProfile) {
      req.flash('error', 'You can only request to unfreeze your own profile');
      return res.redirect('/dashboard');
    }
    
    // Check if profile is frozen
    if (!student.is_frozen) {
      req.flash('error', 'Your profile is not frozen');
      return res.redirect('/students/view/' + student._id);
    }
    
    // Check for existing pending request
    const hasPendingRequest = student.unfreeze_requests.some(request => request.status === 'pending');
    
    if (hasPendingRequest) {
      req.flash('error', 'You already have a pending unfreeze request');
      return res.redirect('/students/view/' + student._id);
    }
    
    // Add unfreeze request
    student.unfreeze_requests.push({
      requested_at: new Date(),
      reason,
      status: 'pending'
    });
    
    await student.save();
    
    req.flash('success', 'Unfreeze request submitted successfully');
    res.redirect('/students/view/' + student._id);
  } catch (err) {
    console.error('Error submitting unfreeze request:', err);
    req.flash('error', 'Failed to submit unfreeze request');
    res.redirect('/students/view/' + req.params.id);
  }
};

// Process unfreeze request (admin)
exports.processUnfreezeRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect('/students');
    }
    
    // Only admin/principal/hod can process unfreeze requests
    if (!['admin', 'principal', 'hod'].includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to process unfreeze requests');
      return res.redirect('/dashboard');
    }
    
    // Find the request
    const requestIndex = student.unfreeze_requests.findIndex(
      request => request._id.toString() === requestId
    );
    
    if (requestIndex === -1) {
      req.flash('error', 'Unfreeze request not found');
      return res.redirect('/students/view/' + student._id);
    }
    
    // Update request status
    student.unfreeze_requests[requestIndex].status = action === 'approve' ? 'approved' : 'rejected';
    student.unfreeze_requests[requestIndex].processed_at = new Date();
    student.unfreeze_requests[requestIndex].processed_by = req.session.user.id;
    
    // If approved, unfreeze the profile
    if (action === 'approve') {
      student.is_frozen = false;
      student.frozen_at = null;
      student.frozen_by = null;
    }
    
    await student.save();
    
    req.flash('success', `Unfreeze request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    res.redirect('/students/view/' + student._id);
  } catch (err) {
    console.error('Error processing unfreeze request:', err);
    req.flash('error', 'Failed to process unfreeze request');
    res.redirect('/students/view/' + req.params.id);
  }
};

// Add these helper functions to controllers/studentController.js

/**
 * Create or update a user account for a student
 * @param {String} email - Student email
 * @param {String} name - Student name
 * @param {String} admission_no - Student admission number (used as default password)
 * @param {ObjectId} existingUserId - Existing user ID if any
 * @returns {Promise<Object>} - Created or updated user object
 */
async function createOrUpdateUserAccount(email, name, admission_no, existingUserId = null) {
  try {
    if (!email) {
      return null;
    }
    
    // Generate a username from email or name
    const username = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '.');
    
    if (existingUserId) {
      // Update existing user
      const user = await User.findById(existingUserId);
      if (!user) {
        throw new Error('Existing user not found');
      }
      
      user.username = username;
      user.email = email;
      // Don't update password unless requested specifically
      await user.save();
      
      return user;
    } else {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use by another user');
      }
      
      // Create new user with default password (admission number)
      const user = new User({
        username,
        email,
        password_hash: await bcrypt.hash(admission_no, 10),
        role: 'student',
        is_active: true
      });
      
      await user.save();
      return user;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Handle the creation of a student with potential user account
 * @param {Object} studentData - Student data from request body
 * @param {File} photoFile - Photo file if uploaded
 * @returns {Promise<Object>} - Created student object
 */
async function createStudentWithUser(studentData, photoFile = null) {
  try {
    const { 
      admission_no, 
      regd_no, 
      name, 
      gender_id, 
      blood_group_id,
      email, 
      mobile, 
      father_name, 
      mother_name, 
      father_mobile,
      mother_mobile,
      aadhar, 
      father_aadhar,
      mother_aadhar,
      address,
      batch_id, 
      nationality_id, 
      religion_id, 
      student_type_id, 
      caste_id, 
      sub_caste_id 
    } = studentData;
    
    // Check if student with same admission number exists
    const studentExists = await Student.findOne({ admission_no });
    if (studentExists) {
      throw new Error('Student with this admission number already exists');
    }
    
    // Check if student with same aadhar exists (if provided)
    if (aadhar) {
      const aadharExists = await Student.findOne({ aadhar });
      if (aadharExists) {
        throw new Error('Student with this Aadhar number already exists');
      }
    }
    
    // Create user account if email is provided
    let userId = null;
    if (email) {
      try {
        const user = await createOrUpdateUserAccount(email, name, admission_no);
        userId = user._id;
      } catch (error) {
        throw error;
      }
    }
    
    // Create student
    const student = new Student({
      admission_no,
      regd_no,
      name,
      gender_id,
      blood_group_id,
      email,
      mobile,
      father_name,
      mother_name,
      father_mobile,
      mother_mobile,
      aadhar,
      father_aadhar,
      mother_aadhar,
      address,
      batch_id,
      user_id: userId,
      nationality_id,
      religion_id,
      student_type_id,
      caste_id,
      sub_caste_id,
      is_frozen: false
    });
    
    // Process photo if provided
    if (photoFile) {
      student.photo = photoFile.path.replace('public/', '');
    }
    
    await student.save();
    return student;
  } catch (error) {
    throw error;
  }
}

/**
 * Handle updating a student with potential user account changes
 * @param {String} studentId - Student ID
 * @param {Object} studentData - Updated student data
 * @param {File} photoFile - New photo file if uploaded
 * @param {Boolean} isOwnProfile - Whether the update is being done by the student themselves
 * @returns {Promise<Object>} - Updated student object
 */
async function updateStudentWithUser(studentId, studentData, photoFile = null, isOwnProfile = false) {
  try {
    // Find student
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Check if profile is frozen and it's the student trying to update
    if (student.is_frozen && isOwnProfile) {
      throw new Error('Your profile is currently frozen. Please submit an unfreeze request to make changes.');
    }
    
    const { 
      admission_no, 
      regd_no, 
      name, 
      gender_id, 
      blood_group_id,
      email, 
      mobile, 
      father_name, 
      mother_name, 
      father_mobile,
      mother_mobile,
      aadhar, 
      father_aadhar,
      mother_aadhar,
      address,
      batch_id, 
      nationality_id, 
      religion_id, 
      student_type_id, 
      caste_id, 
      sub_caste_id 
    } = studentData;
    
    // Check if admission number is already used by another student
    if (admission_no !== student.admission_no) {
      const admissionExists = await Student.findOne({ 
        admission_no, 
        _id: { $ne: student._id } 
      });
      
      if (admissionExists) {
        throw new Error('Admission number already in use');
      }
    }
    
    // Check if aadhar is already used by another student (if provided)
    if (aadhar && aadhar !== student.aadhar) {
      const aadharExists = await Student.findOne({ 
        aadhar, 
        _id: { $ne: student._id } 
      });
      
      if (aadharExists) {
        throw new Error('Aadhar number already in use');
      }
    }
    
    // Handle email and user account
    if (email !== student.email) {
      try {
        await createOrUpdateUserAccount(email, name, admission_no, student.user_id);
      } catch (error) {
        throw error;
      }
    }
    
    // Only allow certain fields to be updated by students themselves
    if (isOwnProfile) {
      // Students can only update some fields of their own profile
      student.mobile = mobile;
      student.email = email;
      student.address = address;
      
      // Handle photo upload if provided
      if (photoFile) {
        // Remove old photo if exists
        if (student.photo) {
          const oldPhotoPath = path.join(__dirname, '..', 'public', student.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        
        student.photo = photoFile.path.replace('public/', '');
      }
    } else {
      // Admin/staff can update all fields
      student.admission_no = admission_no;
      student.regd_no = regd_no;
      student.name = name;
      student.gender_id = gender_id;
      student.blood_group_id = blood_group_id;
      student.email = email;
      student.mobile = mobile;
      student.father_name = father_name;
      student.mother_name = mother_name;
      student.father_mobile = father_mobile;
      student.mother_mobile = mother_mobile;
      student.aadhar = aadhar;
      student.father_aadhar = father_aadhar;
      student.mother_aadhar = mother_aadhar;
      student.address = address;
      student.batch_id = batch_id;
      student.nationality_id = nationality_id;
      student.religion_id = religion_id;
      student.student_type_id = student_type_id;
      student.caste_id = caste_id;
      student.sub_caste_id = sub_caste_id;
      
      // Handle photo upload if provided
      if (photoFile) {
        // Remove old photo if exists
        if (student.photo) {
          const oldPhotoPath = path.join(__dirname, '..', 'public', student.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        
        student.photo = photoFile.path.replace('public/', '');
      }
    }
    
    await student.save();
    return student;
  } catch (error) {
    throw error;
  }
}