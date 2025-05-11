// scripts/create-directories.js
const fs = require('fs');
const path = require('path');

// Define directories to create
const directories = [
  './public/uploads',
  './public/uploads/students',
  './public/uploads/faculty',
  './public/uploads/documents',
  './public/uploads/certificates',
  './public/css',
  './public/js'
];

// Create directories
directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
});

// Create empty CSS file if it doesn't exist
const cssFile = path.join(__dirname, '..', 'public/css/style.css');
if (!fs.existsSync(cssFile)) {
  fs.writeFileSync(cssFile, '/* Custom styles for College ERP */');
  console.log(`Created CSS file: ${cssFile}`);
}

console.log('Directory setup completed');