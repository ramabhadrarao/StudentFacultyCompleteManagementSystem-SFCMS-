// routes/api/branches.js
const express = require('express');
const router = express.Router();
const Branch = require('../../models/Branch');

// Get branches by program ID
router.get('/program/:programId', async (req, res) => {
  try {
    const branches = await Branch.find({ 
      program_id: req.params.programId,
      is_active: true
    }).sort({ branch_name: 1 });
    
    res.json({
      success: true,
      data: branches
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