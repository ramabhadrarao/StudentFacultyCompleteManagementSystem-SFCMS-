// scripts/create-master-views.js
const fs = require('fs');
const path = require('path');

// Base directory for views
const viewsDir = path.join(__dirname, '..', 'views');

// Master data entities
const entities = [
  'gender',
  'nationality',
  'religion',
  'studenttype',
  'caste',
  'subcaste',
  'batch',
  'department',
  'program'
];

// Create directories for each entity
entities.forEach(entity => {
  const entityDir = path.join(viewsDir, 'master', entity);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(entityDir)) {
    fs.mkdirSync(entityDir, { recursive: true });
    console.log(`Created directory: ${entityDir}`);
  } else {
    console.log(`Directory already exists: ${entityDir}`);
  }
  
  // Create index.ejs file that includes the generic template
  const indexFilePath = path.join(entityDir, 'index.ejs');
  
  if (!fs.existsSync(indexFilePath)) {
    const indexContent = `<%- include('../../master/generic-index', { 
      title: '${entity.charAt(0).toUpperCase() + entity.slice(1)} Management',
      modelName: '${entity}',
      displayName: '${entity.charAt(0).toUpperCase() + entity.slice(1)}',
      items: items || [],
      listFields: listFields || ['name'],
      requiredFields: requiredFields || ['name'],
      relatedModels: relatedModels || [],
      relatedData: relatedData || {},
      searchTerm: searchTerm || '',
      pagination: pagination || { page: 1, limit: 10, total: 0, pages: 0 }
    }) %>`;
    
    fs.writeFileSync(indexFilePath, indexContent);
    console.log(`Created file: ${indexFilePath}`);
  } else {
    console.log(`File already exists: ${indexFilePath}`);
  }
});

// Create the generic template file
const genericTemplateFilePath = path.join(viewsDir, 'master', 'generic-index.ejs');

// We'll copy the generic template content from the previous artifact
// This is just a placeholder - you need to fill this with the actual template
if (!fs.existsSync(genericTemplateFilePath)) {
  console.log(`Please create the generic template file: ${genericTemplateFilePath}`);
  console.log('You can use the file content from the generic-master-view artifact');
}

console.log('Master data view directories and files created successfully!');