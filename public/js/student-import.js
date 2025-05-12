// public/js/student-import.js
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fileInput = document.querySelector('input[type="file"]');
    const importForm = document.querySelector('form[action="/students/import"]');
    const previewBtn = document.getElementById('preview-import');
    const previewContainer = document.getElementById('import-preview');
    
    // Only proceed if we're on the import page
    if (!fileInput || !importForm) return;
    
    // Add validation for file input
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) {
        clearPreview();
        return;
      }
      
      // Validate file type
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showError('Please select a valid CSV file');
        clearPreview();
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size exceeds the maximum limit of 5MB');
        clearPreview();
        return;
      }
      
      // If preview button exists, enable it
      if (previewBtn) {
        previewBtn.removeAttribute('disabled');
      }
    });
    
    // Preview functionality (if available)
    if (previewBtn && previewContainer) {
      previewBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) return;
        
        // Parse and preview the CSV
        parseCSV(file).then(result => {
          showPreview(result);
        }).catch(error => {
          showError('Error parsing CSV: ' + error.message);
        });
      });
    }
    
    // Form submission validation
    importForm.addEventListener('submit', function(e) {
      const file = fileInput.files[0];
      if (!file) {
        e.preventDefault();
        showError('Please select a file to upload');
        return;
      }
    });
    
    // Helper functions
    function parseCSV(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const content = e.target.result;
          
          // Basic CSV parsing
          try {
            const lines = content.split('\n');
            const headers = lines[0].trim().split(',');
            
            // Validate required headers
            const requiredHeaders = ['admission_no', 'name', 'gender', 'batch'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            
            if (missingHeaders.length > 0) {
              reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`));
              return;
            }
            
            // Parse rows
            const rows = [];
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue; // Skip empty lines
              
              const row = {};
              const values = parseCSVLine(lines[i]);
              
              // Map values to headers
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              
              rows.push(row);
            }
            
            resolve({
              headers,
              rows,
              rowCount: rows.length
            });
          } catch (err) {
            reject(err);
          }
        };
        
        reader.onerror = function() {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      });
    }
    
    function parseCSVLine(line) {
      // Simple CSV line parser that handles quoted values
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      
      // Add the last value
      result.push(current);
      
      return result;
    }
    
    function showPreview(result) {
      // Clear previous preview
      clearPreview();
      
      // Create preview table
      const table = document.createElement('table');
      table.className = 'table table-vcenter table-bordered table-hover';
      
      // Create header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      result.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create body rows (showing first 5 rows only)
      const tbody = document.createElement('tbody');
      const previewRows = result.rows.slice(0, 5);
      
      previewRows.forEach(row => {
        const tr = document.createElement('tr');
        
        result.headers.forEach(header => {
          const td = document.createElement('td');
          td.textContent = row[header] || '';
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
      
      // Create info text
      const info = document.createElement('p');
      info.className = 'text-muted mt-2';
      info.textContent = `Showing ${previewRows.length} of ${result.rowCount} rows`;
      
      // Add to preview container
      previewContainer.appendChild(table);
      previewContainer.appendChild(info);
      previewContainer.classList.remove('d-none');
    }
    
    function clearPreview() {
      if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.classList.add('d-none');
      }
      
      if (previewBtn) {
        previewBtn.setAttribute('disabled', 'disabled');
      }
    }
    
    function showError(message) {
      // You can implement this based on your UI - for example, showing an alert or an error message element
      alert(message);
    }
  });