// routes/api/dependencies.js
const express = require('express');
const router = express.Router();
const Program = require('../../models/Program');
const Branch = require('../../models/Branch');

// Get programs by department ID
router.get('/programs/by-department/:departmentId', async (req, res) => {
  try {
    const programs = await Program.find({ 
      department_id: req.params.departmentId 
    }).sort({ program_name: 1 });
    
    res.json({
      success: true,
      programs
    });
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programs'
    });
  }
});

// Get branches by program ID
router.get('/branches/by-program/:programId', async (req, res) => {
  try {
    const branches = await Branch.find({ 
      program_id: req.params.programId 
    }).sort({ branch_name: 1 });
    
    res.json({
      success: true,
      branches
    });
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branches'
    });
  }
});

module.exports = router;