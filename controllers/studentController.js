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

// Create student
exports.createStudent = async (req, res) => {
  try {
    const { 
      admission_no, 
      regd_no, 
      name, 
      gender_id, 
      email, 
      mobile, 
      father_name, 
      mother_name, 
      aadhar, 
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
      email,
      mobile,
      father_name,
      mother_name,
      aadhar,
      batch_id,
      user_id: userId,
      nationality_id,
      religion_id,
      student_type_id,
      caste_id,
      sub_caste_id
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
    
    // Get lookup data for dropdowns
    const batches = await Batch.find().sort({ start_year: -1 });
    const genders = await Gender.find().sort({ name: 1 });
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
      nationalities,
      religions,
      studentTypes,
      castes,
      subcastes
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
      email, 
      mobile, 
      father_name, 
      mother_name, 
      aadhar, 
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
    
    // Update student
    student.admission_no = admission_no;
    student.regd_no = regd_no;
    student.name = name;
    student.gender_id = gender_id;
    student.email = email;
    student.mobile = mobile;
    student.father_name = father_name;
    student.mother_name = mother_name;
    student.aadhar = aadhar;
    student.batch_id = batch_id;
    student.nationality_id = nationality_id;
    student.religion_id = religion_id;
    student.student_type_id = student_type_id;
    student.caste_id = caste_id;
    student.sub_caste_id = sub_caste_id;
    
    // Handle photo upload if provided
    if (req.file) {
      student.photo = req.file.path.replace('public/', '');
    }
    
    await student.save();
    
    req.flash('success', 'Student updated successfully');
    res.redirect('/students');
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
    
    // Delete associated user account if exists
    if (student.user_id) {
      await User.findByIdAndDelete(student.user_id);
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

// Import students from CSV
exports.importStudentsForm = (req, res) => {
  res.render('students/import', {
    title: 'Import Students'
  });
};

// Process CSV import
exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please upload a CSV file');
      return res.redirect('/students/import');
    }
    
    // Parse CSV using csvtojson or similar library
    // For this example, assuming req.file.buffer contains the CSV content
    const csv = require('csvtojson');
    const students = await csv().fromString(req.file.buffer.toString());
    
    // Process each student
    let successCount = 0;
    let errorCount = 0;
    let errors = [];
    
    for (const [index, studentData] of students.entries()) {
      try {
        // Required fields validation
        if (!studentData.admission_no || !studentData.name || !studentData.batch_id) {
          errors.push(`Row ${index + 1}: Missing required fields (admission_no, name, batch_id)`);
          errorCount++;
          continue;
        }
        
        // Check if student already exists
        const studentExists = await Student.findOne({ admission_no: studentData.admission_no });
        if (studentExists) {
          errors.push(`Row ${index + 1}: Student with admission number ${studentData.admission_no} already exists`);
          errorCount++;
          continue;
        }
        
        // Create user account if email is provided
        let userId = null;
        if (studentData.email) {
          const emailExists = await User.findOne({ email: studentData.email });
          if (emailExists) {
            errors.push(`Row ${index + 1}: Email ${studentData.email} already in use`);
            errorCount++;
            continue;
          }
          
          const user = new User({
            username: studentData.email.split('@')[0],
            email: studentData.email,
            password_hash: await bcrypt.hash(studentData.admission_no, 10),
            role: 'student',
            is_active: true
          });
          
          await user.save();
          userId = user._id;
        }
        
        // Create student
        const student = new Student({
          admission_no: studentData.admission_no,
          regd_no: studentData.regd_no || '',
          name: studentData.name,
          gender_id: studentData.gender_id || null,
          email: studentData.email || '',
          mobile: studentData.mobile || '',
          father_name: studentData.father_name || '',
          mother_name: studentData.mother_name || '',
          aadhar: studentData.aadhar || '',
          batch_id: studentData.batch_id,
          user_id: userId,
          nationality_id: studentData.nationality_id || null,
          religion_id: studentData.religion_id || null,
          student_type_id: studentData.student_type_id || null,
          caste_id: studentData.caste_id || null,
          sub_caste_id: studentData.sub_caste_id || null
        });
        
        await student.save();
        successCount++;
      } catch (err) {
        console.error(`Error importing student at row ${index + 1}:`, err);
        errors.push(`Row ${index + 1}: ${err.message}`);
        errorCount++;
      }
    }
    
    // Return result
    if (errorCount === 0) {
      req.flash('success', `Successfully imported ${successCount} students`);
    } else {
      req.flash('warning', `Imported ${successCount} students with ${errorCount} errors`);
      // Store errors in session for display
      req.session.importErrors = errors;
    }
    
    res.redirect('/students/import/result');
  } catch (err) {
    console.error('Error importing students:', err);
    req.flash('error', 'Failed to import students');
    res.redirect('/students/import');
  }
};

// Show import results
exports.importResult = (req, res) => {
  const errors = req.session.importErrors || [];
  // Clear errors from session
  req.session.importErrors = null;
  
  res.render('students/import-result', {
    title: 'Import Results',
    errors
  });
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
    
    // Get students
    const students = await Student.find(filterQuery)
      .populate('batch_id')
      .populate('gender_id')
      .populate('nationality_id')
      .populate('religion_id')
      .populate('student_type_id')
      .populate('caste_id')
      .populate('sub_caste_id')
      .sort({ name: 1 });
    
    // Convert to CSV
    const { Parser } = require('json2csv');
    
    // Prepare data for CSV
    const data = students.map(student => ({
      'Admission No': student.admission_no,
      'Registration No': student.regd_no,
      'Name': student.name,
      'Gender': student.gender_id ? student.gender_id.name : '',
      'Email': student.email,
      'Mobile': student.mobile,
      'Father Name': student.father_name,
      'Mother Name': student.mother_name,
      'Aadhar': student.aadhar,
      'Batch': student.batch_id ? student.batch_id.batch_name : '',
      'Nationality': student.nationality_id ? student.nationality_id.name : '',
      'Religion': student.religion_id ? student.religion_id.name : '',
      'Student Type': student.student_type_id ? student.student_type_id.name : '',
      'Caste': student.caste_id ? student.caste_id.name : '',
      'Sub Caste': student.sub_caste_id ? student.sub_caste_id.name : ''
    }));
    
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);
    
    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    
    // Send CSV
    res.send(csv);
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