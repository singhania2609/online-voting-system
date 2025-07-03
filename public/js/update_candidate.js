document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/html/login.html';
        return;
    }

    let selectedCandidate = null;

    // Load and display candidates
    loadCandidates();

    // Handle back to list button
    document.getElementById('backToList').addEventListener('click', function() {
        document.getElementById('candidateSelection').style.display = 'block';
        document.getElementById('updateForm').style.display = 'none';
        document.getElementById('message').textContent = '';
    });

    async function loadCandidates() {
        const candidateListDiv = document.getElementById('candidateList');
        try {
            const response = await fetch('/candidate');
            if (!response.ok) throw new Error('Failed to fetch candidates');
            const candidates = await response.json();
            
            if (Array.isArray(candidates) && candidates.length > 0) {
                candidateListDiv.innerHTML = '';
                candidates.forEach(candidate => {
                    const div = document.createElement('div');
                    div.className = 'candidate';
                    div.style.border = '1px solid #ddd';
                    div.style.padding = '15px';
                    div.style.margin = '10px 0';
                    div.style.borderRadius = '5px';
                    div.style.backgroundColor = '#f9f9f9';
                    
                    div.innerHTML = `
                        <strong>${candidate.name}</strong> (${candidate.party}) - <span>Votes: ${candidate.voteCount ?? 0}</span>
                        <br><small>Age: ${candidate.age} | Area: ${candidate.Area_Standing_election}</small>
                    `;
                    
                    const updateBtn = document.createElement('button');
                    updateBtn.textContent = 'Update';
                    updateBtn.style.marginLeft = '10px';
                    updateBtn.style.backgroundColor = '#28a745';
                    updateBtn.style.color = 'white';
                    updateBtn.style.border = 'none';
                    updateBtn.style.padding = '8px 15px';
                    updateBtn.style.borderRadius = '4px';
                    updateBtn.style.cursor = 'pointer';
                    updateBtn.onclick = () => selectCandidateForUpdate(candidate);
                    
                    div.appendChild(updateBtn);
                    candidateListDiv.appendChild(div);
                });
            } else {
                candidateListDiv.innerHTML = '<p>No candidates available.</p>';
            }
        } catch (error) {
            candidateListDiv.innerHTML = '<p>Failed to load candidates.</p>';
            console.error('Error:', error);
        }
    }

    function selectCandidateForUpdate(candidate) {
        selectedCandidate = candidate;
        
        // Pre-populate the form with existing candidate data
        document.getElementById('name').value = candidate.name || '';
        document.getElementById('age').value = candidate.age || '';
        document.getElementById('party').value = candidate.party || '';
        document.getElementById('Area_Standing_election').value = candidate.Area_Standing_election || '';
        document.getElementById('address').value = candidate.address || '';
        document.getElementById('email').value = candidate.email || '';
        document.getElementById('mobile').value = candidate.mobile || '';

        // Show the update form
        document.getElementById('candidateSelection').style.display = 'none';
        document.getElementById('updateForm').style.display = 'block';
    }

    // Handle form submission
    document.getElementById('updateCandidateForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!selectedCandidate) {
            alert('No candidate selected for update.');
            return;
        }
        
        const messageDiv = document.getElementById('message');
        const submitButton = document.querySelector('button[type="submit"]');
        
        // Disable submit button to prevent double submission
        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';
        
        // Get form data (excluding aadharCardNumber as it cannot be updated)
        const formData = {
            name: document.getElementById('name').value.trim(),
            age: parseInt(document.getElementById('age').value),
            party: document.getElementById('party').value.trim(),
            Area_Standing_election: document.getElementById('Area_Standing_election').value.trim(),
            address: document.getElementById('address').value.trim(),
            email: document.getElementById('email').value.trim(),
            mobile: document.getElementById('mobile').value.trim()
        };

        // Validation
        if (formData.age < 18) {
            messageDiv.textContent = 'Age must be at least 18 years.';
            messageDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = 'Update Candidate';
            return;
        }



        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            messageDiv.textContent = 'Please enter a valid email address.';
            messageDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = 'Update Candidate';
            return;
        }

        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            messageDiv.textContent = 'Mobile number must be exactly 10 digits.';
            messageDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = 'Update Candidate';
            return;
        }

        try {
            const response = await fetch(`/candidate/${selectedCandidate._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Candidate updated successfully!';
                messageDiv.style.color = 'green';
                
                // Reset form and go back to list
                setTimeout(() => {
                    document.getElementById('updateCandidateForm').reset();
                    document.getElementById('candidateSelection').style.display = 'block';
                    document.getElementById('updateForm').style.display = 'none';
                    document.getElementById('message').textContent = '';
                    loadCandidates(); // Reload the candidate list
                }, 2000);
            } else {
                messageDiv.textContent = data.message || data.error || 'Failed to update candidate.';
                messageDiv.style.color = 'red';
                submitButton.disabled = false;
                submitButton.textContent = 'Update Candidate';
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = 'Server error. Please try again.';
            messageDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = 'Update Candidate';
        }
    });
}); 