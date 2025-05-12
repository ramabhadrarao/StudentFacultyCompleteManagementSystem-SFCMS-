// scripts/create-batch-view.js
const fs = require('fs');
const path = require('path');

// Base directory for views
const viewsDir = path.join(__dirname, '..', 'views');

// Create batch directory
const batchDir = path.join(viewsDir, 'master', 'batch');

// Create directory if it doesn't exist
if (!fs.existsSync(batchDir)) {
  fs.mkdirSync(batchDir, { recursive: true });
  console.log(`Created directory: ${batchDir}`);
} else {
  console.log(`Directory already exists: ${batchDir}`);
}

// Define batch-specific fields
const batchFields = {
  listFields: ['batch_name', 'start_year', 'end_year', 'program_id', 'branch_id'],
  requiredFields: ['batch_name', 'start_year', 'end_year', 'program_id'],
  relatedModels: ['program_id', 'branch_id']
};

// Create index.ejs file
const indexFilePath = path.join(batchDir, 'index.ejs');

if (!fs.existsSync(indexFilePath)) {
  const indexContent = `<%- include('../../master/generic-index', { 
    title: 'Batch Management',
    modelName: 'batch',
    displayName: 'Batch',
    items: items || [],
    listFields: listFields || ${JSON.stringify(batchFields.listFields)},
    requiredFields: requiredFields || ${JSON.stringify(batchFields.requiredFields)},
    relatedModels: relatedModels || ${JSON.stringify(batchFields.relatedModels)},
    relatedData: relatedData || {},
    searchTerm: searchTerm || '',
    pagination: pagination || { page: 1, limit: 10, total: 0, pages: 0 }
  }) %>`;
  
  fs.writeFileSync(indexFilePath, indexContent);
  console.log(`Created file: ${indexFilePath}`);
} else {
  console.log(`File already exists: ${indexFilePath}`);
}

console.log('Batch view file created successfully!');