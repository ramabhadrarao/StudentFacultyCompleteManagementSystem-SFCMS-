// public/js/master-data.js
document.addEventListener('DOMContentLoaded', function() {
    // Handle program → branch dependency
    const programSelect = document.querySelector('select[name="program_id"]');
    const branchSelect = document.querySelector('select[name="branch_id"]');
    
    if (programSelect && branchSelect) {
      programSelect.addEventListener('change', function() {
        const programId = this.value;
        
        if (!programId) {
          branchSelect.innerHTML = '<option value="">Select Branch</option>';
          branchSelect.disabled = true;
          return;
        }
        
        // Fetch branches for selected program
        fetch(`/api/branches/by-program/${programId}`)
          .then(response => response.json())
          .then(data => {
            branchSelect.innerHTML = '<option value="">Select Branch</option>';
            
            if (data.success && data.branches.length > 0) {
              data.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch._id;
                option.textContent = branch.branch_name;
                branchSelect.appendChild(option);
              });
              branchSelect.disabled = false;
            } else {
              branchSelect.innerHTML = '<option value="">No branches found</option>';
              branchSelect.disabled = true;
            }
          })
          .catch(error => {
            console.error('Error fetching branches:', error);
            branchSelect.innerHTML = '<option value="">Error loading branches</option>';
            branchSelect.disabled = true;
          });
      });
    }
    
    // Similarly, handle department → program dependency
    const departmentSelect = document.querySelector('select[name="department_id"]');
    const programSelectByDept = document.querySelector('select[name="program_id"]');
    
    if (departmentSelect && programSelectByDept) {
      departmentSelect.addEventListener('change', function() {
        const departmentId = this.value;
        
        if (!departmentId) {
          programSelectByDept.innerHTML = '<option value="">Select Program</option>';
          programSelectByDept.disabled = true;
          return;
        }
        
        // Fetch programs for selected department
        fetch(`/api/programs/by-department/${departmentId}`)
          .then(response => response.json())
          .then(data => {
            programSelectByDept.innerHTML = '<option value="">Select Program</option>';
            
            if (data.success && data.programs.length > 0) {
              data.programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program._id;
                option.textContent = program.program_name;
                programSelectByDept.appendChild(option);
              });
              programSelectByDept.disabled = false;
            } else {
              programSelectByDept.innerHTML = '<option value="">No programs found</option>';
              programSelectByDept.disabled = true;
            }
          })
          .catch(error => {
            console.error('Error fetching programs:', error);
            programSelectByDept.innerHTML = '<option value="">Error loading programs</option>';
            programSelectByDept.disabled = true;
          });
      });
    }
  });