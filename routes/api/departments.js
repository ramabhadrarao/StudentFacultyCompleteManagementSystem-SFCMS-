// routes/api/departments.js
const express = require('express');
const router = express.Router();
const Department = require('../../models/Department');
const Program = require('../../models/Program');
const { isAuthenticated } = require('../../middleware/auth');

// Get departments by college ID
router.get('/by-college/:collegeId', isAuthenticated, async (req, res) => {
  try {
    const collegeId = req.params.collegeId;
    
    // Get departments for this college
    const departments = await Department.find({ 
      college_id: collegeId 
    }).sort({ department_name: 1 });
    
    // For each department, count the number of programs
    const departmentsWithProgramCount = await Promise.all(
      departments.map(async (department) => {
        const programCount = await Program.countDocuments({ 
          department_id: department._id 
        });
        
        return {
          _id: department._id,
          department_name: department.department_name,
          department_code: department.department_code,
          college_id: department.college_id,
          program_count: programCount
        };
      })
    );
    
    res.json({
      success: true,
      departments: departmentsWithProgramCount
    });
  } catch (err) {
    console.error('Error fetching departments by college:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments'
    });
  }
});

module.exports = router;