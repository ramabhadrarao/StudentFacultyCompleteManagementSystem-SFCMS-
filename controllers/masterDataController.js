// controllers/masterDataController.js
const Batch = require('../models/Batch');
const Gender = require('../models/Gender');
const Nationality = require('../models/Nationality');
const Religion = require('../models/Religion');
const StudentType = require('../models/StudentType');
const Caste = require('../models/Caste');
const SubCaste = require('../models/SubCaste');
const Program = require('../models/Program');
const Department = require('../models/Department');
const College = require('../models/College'); 
const Branch = require('../models/Branch');

const Course = require('../models/Course');
/**
 * Common methods for CRUD operations on master data models
 * @param {Object} model - The Mongoose model
 * @param {Object} options - Configuration options
 * @returns {Object} Controller methods
 */
const createCrudMethods = (model, options = {}) => {
  const modelName = model.modelName;
  const modelNameLower = modelName.toLowerCase();
  const viewPrefix = options.viewPrefix || 'master';
  const itemsPerPage = options.itemsPerPage || 10;
  
  const displayName = options.displayName || modelName;
  const listFields = options.listFields || ['name'];
  const searchFields = options.searchFields || ['name'];
  const requiredFields = options.requiredFields || ['name'];
  const relatedModels = options.relatedModels || {};
  
  return {
    /**
     * List all items with pagination and search
     */
    list: async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || itemsPerPage;
        const skip = (page - 1) * limit;
        const searchTerm = req.query.search || '';
        
        // Build search query
        const query = {};
        if (searchTerm) {
          query.$or = searchFields.map(field => ({ [field]: { $regex: searchTerm, $options: 'i' } }));
        }
        
        // Count total items for pagination
        const total = await model.countDocuments(query);
        
        // Get items with pagination
        let items = await model.find(query)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit);
          
        // Populate related models if needed
        for (const field in relatedModels) {
          if (items[0] && items[0][field]) {
            items = await model.populate(items, { path: field });
          }
        }
        
        // Prepare related data for form
        const relatedData = {};
        for (const field in relatedModels) {
          relatedData[field] = await relatedModels[field].find().sort({ name: 1 });
        }
        
        // Render view with data
        res.render(`${viewPrefix}/${modelNameLower}/index`, {
          title: `${displayName} Management`,
          items,
          modelName,
          displayName,
          listFields,
          requiredFields,
          searchTerm,
          relatedData,
          relatedModels: Object.keys(relatedModels),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (err) {
        console.error(`Error in ${modelName} list:`, err);
        req.flash('error', `Failed to load ${displayName.toLowerCase()} list`);
        res.redirect('/dashboard');
      }
    },
    
    /**
     * Create new item
     */
    create: async (req, res) => {
      try {
        // Check for required fields
        for (const field of requiredFields) {
          if (!req.body[field]) {
            req.flash('error', `${field} is required`);
            return res.redirect(`/master/${modelNameLower}`);
          }
        }
        
        // Check if item with same name exists
        if (req.body.name) {
          const exists = await model.findOne({ name: req.body.name });
          if (exists) {
            req.flash('error', `${displayName} with this name already exists`);
            return res.redirect(`/master/${modelNameLower}`);
          }
        }
        
        // Create new item
        const newItem = new model(req.body);
        await newItem.save();
        
        req.flash('success', `${displayName} created successfully`);
        res.redirect(`/master/${modelNameLower}`);
      } catch (err) {
        console.error(`Error in ${modelName} create:`, err);
        req.flash('error', `Failed to create ${displayName.toLowerCase()}`);
        res.redirect(`/master/${modelNameLower}`);
      }
    },
    
    /**
     * Update existing item
     */
    update: async (req, res) => {
      try {
        const id = req.params.id;
        
        // Check for required fields
        for (const field of requiredFields) {
          if (!req.body[field]) {
            req.flash('error', `${field} is required`);
            return res.redirect(`/master/${modelNameLower}`);
          }
        }
        
        // Check if item with same name exists but different id
        if (req.body.name) {
          const exists = await model.findOne({ 
            name: req.body.name,
            _id: { $ne: id }
          });
          
          if (exists) {
            req.flash('error', `${displayName} with this name already exists`);
            return res.redirect(`/master/${modelNameLower}`);
          }
        }
        
        // Update item
        await model.findByIdAndUpdate(id, req.body);
        
        req.flash('success', `${displayName} updated successfully`);
        res.redirect(`/master/${modelNameLower}`);
      } catch (err) {
        console.error(`Error in ${modelName} update:`, err);
        req.flash('error', `Failed to update ${displayName.toLowerCase()}`);
        res.redirect(`/master/${modelNameLower}`);
      }
    },
    
    /**
     * Delete item
     */
    delete: async (req, res) => {
      try {
        const id = req.params.id;
        
        // Check for related data before deleting
        for (const relationName in options.hasMany || {}) {
          const RelatedModel = options.hasMany[relationName].model;
          const relationField = options.hasMany[relationName].field;
          
          const count = await RelatedModel.countDocuments({ [relationField]: id });
          
          if (count > 0) {
            req.flash('error', `Cannot delete ${displayName.toLowerCase()} because it has ${count} related ${relationName.toLowerCase()}`);
            return res.redirect(`/master/${modelNameLower}`);
          }
        }
        
        // Delete item
        await model.findByIdAndDelete(id);
        
        req.flash('success', `${displayName} deleted successfully`);
        res.redirect(`/master/${modelNameLower}`);
      } catch (err) {
        console.error(`Error in ${modelName} delete:`, err);
        req.flash('error', `Failed to delete ${displayName.toLowerCase()}`);
        res.redirect(`/master/${modelNameLower}`);
      }
    },
    
    /**
     * Get item by ID (for API)
     */
    getById: async (req, res) => {
      try {
        const id = req.params.id;
        const item = await model.findById(id);
        
        if (!item) {
          return res.status(404).json({
            success: false,
            message: `${displayName} not found`
          });
        }
        
        res.json({
          success: true,
          data: item
        });
      } catch (err) {
        console.error(`Error in ${modelName} getById:`, err);
        res.status(500).json({
          success: false,
          message: `Failed to get ${displayName.toLowerCase()}`
        });
      }
    }
  };
};

// Create individual controllers for each model
exports.genderController = createCrudMethods(Gender, {
  displayName: 'Gender',
  searchFields: ['name']
});

exports.nationalityController = createCrudMethods(Nationality, {
  displayName: 'Nationality',
  searchFields: ['name']
});

exports.religionController = createCrudMethods(Religion, {
  displayName: 'Religion',
  searchFields: ['name']
});

exports.studentTypeController = createCrudMethods(StudentType, {
  displayName: 'Student Type',
  searchFields: ['name']
});

exports.casteController = createCrudMethods(Caste, {
  displayName: 'Caste',
  searchFields: ['name'],
  hasMany: {
    'SubCastes': {
      model: SubCaste,
      field: 'caste_id'
    }
  }
});

exports.subCasteController = createCrudMethods(SubCaste, {
  displayName: 'Sub Caste',
  searchFields: ['name'],
  requiredFields: ['name', 'caste_id'],
  relatedModels: {
    'caste_id': Caste
  },
  listFields: ['name', 'caste_id']
});

exports.batchController = createCrudMethods(Batch, {
  displayName: 'Batch',
  searchFields: ['batch_name'],
  requiredFields: ['batch_name', 'start_year', 'end_year'],
  relatedModels: {
    'program_id': Program,
    'branch_id': Department
  },
  listFields: ['batch_name', 'start_year', 'end_year', 'program_id', 'branch_id']
});

exports.departmentController = createCrudMethods(Department, {
  displayName: 'Department',
  searchFields: ['department_name', 'department_code'],
  requiredFields: ['department_name', 'department_code'],
  listFields: ['department_name', 'department_code','college_id'],
  relatedModels: { 
    'college_id': College
  }
});

exports.programController = createCrudMethods(Program, {
  displayName: 'Program',
  searchFields: ['program_name', 'program_code'],
  requiredFields: ['program_name', 'program_code'],
  relatedModels: {
    'department_id': Department
  },
  listFields: ['program_name', 'program_code', 'department_id']
});

// Branch Controller
// Add this to your controllers/masterDataController.js file
exports.branchController = createCrudMethods(Branch, {
  displayName: 'Branch',
  searchFields: ['branch_name', 'branch_code'],
  requiredFields: ['branch_name', 'branch_code', 'program_id', 'department_id'],
  relatedModels: {
    'program_id': Program,
    'department_id': Department
  },
  listFields: ['branch_name', 'branch_code', 'program_id', 'department_id']
});