document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/html/login.html';
    return;
  }

  try {
    // Fetch user profile
    const response = await fetch('/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.user) {
      document.getElementById('name').textContent = data.user.name;
      document.getElementById('age').textContent = data.user.age;
      document.getElementById('email').textContent = data.user.email || 'N/A';
      document.getElementById('mobile').textContent = data.user.mobile || 'N/A';
      document.getElementById('address').textContent = data.user.address || 'N/A';
      document.getElementById('role').textContent = data.user.role;
      document.getElementById('isVoted').textContent = data.user.isVoted ? 'Yes' : 'No';

      // Pre-populate update profile form
      document.getElementById('updateName').value = data.user.name || '';
      document.getElementById('updateAge').value = data.user.age || '';
      document.getElementById('updateEmail').value = data.user.email || '';
      document.getElementById('updateMobile').value = data.user.mobile || '';
      document.getElementById('updateAddress').value = data.user.address || '';

      // Show candidate list for both admin and voter, and add button for admin
      if (data.user.role === 'admin') {
        // Show add, update, and delete candidate buttons for admin
        const adminActionsDiv = document.getElementById('adminActions');
        adminActionsDiv.style.display = '';
        adminActionsDiv.innerHTML = `
          <a href="/html/add_candidate.html" class="add-candidate-btn">+ Add Candidate</a>
          <a href="/html/update_candidate.html" class="update-candidate-btn" style="margin-left:12px;background:#28a745;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;">+ Update Candidates</a>
          <a href="/html/delete_candidate.html" class="delete-candidate-btn" style="margin-left:12px;background:#dc3545;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;">+ Delete Candidate</a>
        `;
        document.getElementById('candidateSection').style.display = '';
        await fetchCandidates(token, data.user.isVoted, data.user.role);
      } else {
        document.getElementById('candidateSection').style.display = '';
        document.getElementById('adminActions').style.display = 'none';
        await fetchCandidates(token, data.user.isVoted, data.user.role);
      }

      // Show profile image from base64 if available
      if (data.user.photo) {
        document.getElementById('profileImage').src = 'data:image/png;base64,' + data.user.photo;
      } else {
        document.getElementById('profileImage').src = '/public/image/default.png'; // fallback image
      }
    } else {
      alert('Failed to load user profile.');
      localStorage.removeItem('token');
      window.location.href = '/html/login.html';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    alert('Server error. Please try again later.');
  }
});

// Fetch and display the candidate list
async function fetchCandidates(token, isVoted, userRole) {
  const candidateListDiv = document.getElementById('candidateList');
  try {
    const res = await fetch('/candidate');
    if (!res.ok) throw new Error('Failed to fetch candidates');
    const candidates = await res.json();
    if (Array.isArray(candidates) && candidates.length > 0) {
      candidateListDiv.innerHTML = '';
      candidates.forEach(candidate => {
        const div = document.createElement('div');
        div.className = 'candidate';

        // Always show candidate image and party symbol, use fallback if missing
        let candidateImg = candidate.candidateImage
          ? `<img src='data:image/png;base64,${candidate.candidateImage}' alt='Candidate' class='candidate-img'>`
          : `<img src='/public/image/default.png' alt='Candidate' class='candidate-img'>`;
        let partyImg = candidate.partySymbol
          ? `<img src='data:image/png;base64,${candidate.partySymbol}' alt='Party Symbol' class='party-img'>`
          : `<img src='/public/image/default-party.png' alt='Party Symbol' class='party-img'>`;

        div.innerHTML = `
          <div style='display: flex; align-items: center; width: 100%; gap: 16px;'>
            <div style='display: flex; align-items: center; gap: 8px;'>
              <span style='font-size: 0.95em; color: #888;'>Candidate</span>
              ${candidateImg}
            </div>
            <div class='candidate-info' style='flex:1; min-width:0; display: flex; align-items: center; gap: 10px;'>
              <strong>${candidate.name}</strong> (${candidate.party})
              <div style='display: flex; align-items: center; gap: 8px; margin-left: 14px;'>
                <span style='font-size: 0.95em; color: #888;'>Party Symbol</span>
                ${partyImg}
              </div>
              <span>Votes: ${candidate.voteCount ?? 0}</span>
            </div>
          </div>
        `;

        // Only show the vote button if user is not admin and hasn't voted
        if (userRole !== 'admin' && !isVoted) {
          const voteBtn = document.createElement('button');
          voteBtn.textContent = 'Vote';
          voteBtn.onclick = async () => {
            try {
              const voteRes = await fetch(`/candidate/vote/${candidate._id}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const voteData = await voteRes.json();
              if (voteRes.ok) {
                alert('Vote recorded successfully!');
                window.location.reload();
              } else {
                alert(voteData.message || 'Failed to vote.');
              }
            } catch (err) {
              alert('Server error. Please try again.');
            }
          };
          div.appendChild(voteBtn);
        }
        candidateListDiv.appendChild(div);
      });
    } else {
      candidateListDiv.textContent = 'No candidates available.';
    }
  } catch (err) {
    candidateListDiv.textContent = 'Failed to load candidates.';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/html/login.html';
}

// Show/hide change password form
const showChangePasswordBtn = document.getElementById('showChangePasswordBtn');
if (showChangePasswordBtn) {
  showChangePasswordBtn.onclick = function() {
    const section = document.getElementById('changePasswordSection');
    section.style.display = section.style.display === 'none' ? '' : 'none';
    // Hide update profile section when showing password section
    document.getElementById('updateProfileSection').style.display = 'none';
  };
}

// Show/hide update profile form
const showUpdateProfileBtn = document.getElementById('showUpdateProfileBtn');
if (showUpdateProfileBtn) {
  showUpdateProfileBtn.onclick = function() {
    const section = document.getElementById('updateProfileSection');
    section.style.display = section.style.display === 'none' ? '' : 'none';
    // Hide password section when showing profile section
    document.getElementById('changePasswordSection').style.display = 'none';
  };
}

// Handle password change form submission
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const message = document.getElementById('changePasswordMessage');

    if (newPassword.length < 6) {
      message.style.color = 'red';
      message.textContent = 'New password must be at least 6 characters.';
      return;
    }

    try {
      const res = await fetch('/user/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        message.style.color = 'green';
        message.textContent = 'Password updated successfully!';
        this.reset();
      } else {
        message.style.color = 'red';
        message.textContent = data.error || 'Failed to update password.';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Server error. Please try again.';
    }
  });
}

// Handle profile update form submission
const updateProfileForm = document.getElementById('updateProfileForm');
if (updateProfileForm) {
  updateProfileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const name = document.getElementById('updateName').value.trim();
    const age = parseInt(document.getElementById('updateAge').value);
    const email = document.getElementById('updateEmail').value.trim();
    const mobile = document.getElementById('updateMobile').value.trim();
    const address = document.getElementById('updateAddress').value.trim();
    const message = document.getElementById('updateProfileMessage');

    // Validation
    if (name.length < 2) {
      message.style.color = 'red';
      message.textContent = 'Name must be at least 2 characters.';
      return;
    }

    if (age < 18) {
      message.style.color = 'red';
      message.textContent = 'Age must be at least 18 years.';
      return;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      message.style.color = 'red';
      message.textContent = 'Please enter a valid email address.';
      return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      message.style.color = 'red';
      message.textContent = 'Mobile number must be exactly 10 digits.';
      return;
    }

    if (!address || address.length < 5) {
      message.style.color = 'red';
      message.textContent = 'Address must be at least 5 characters.';
      return;
    }

    try {
      const res = await fetch('/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, age, email, mobile, address })
      });
      const data = await res.json();
      if (res.ok) {
        message.style.color = 'green';
        message.textContent = 'Profile updated successfully!';
        // Update the displayed profile information
        document.getElementById('name').textContent = name;
        document.getElementById('age').textContent = age;
        document.getElementById('email').textContent = email || 'N/A';
        document.getElementById('mobile').textContent = mobile || 'N/A';
        document.getElementById('address').textContent = address || 'N/A';
      } else {
        message.style.color = 'red';
        message.textContent = data.error || 'Failed to update profile.';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Server error. Please try again.';
    }
  });
}


