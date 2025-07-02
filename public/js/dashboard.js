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
      document.getElementById('role').textContent = data.user.role;
      document.getElementById('isVoted').textContent = data.user.isVoted ? 'Yes' : 'No';

      // Show candidate list for both admin and voter, and add button for admin
      if (data.user.role === 'admin') {
        // Show add and delete candidate buttons for admin
        const adminActionsDiv = document.getElementById('adminActions');
        adminActionsDiv.style.display = '';
        adminActionsDiv.innerHTML = `
          <a href="/html/add_candidate.html" class="add-candidate-btn">+ Add Candidate</a>
          <a href="/html/delete_candidate.html" class="delete-candidate-btn" style="margin-left:12px;background:#dc3545;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;">+ Delete Candidate</a>
        `;
        document.getElementById('candidateSection').style.display = '';
        await fetchCandidates(token, data.user.isVoted, data.user.role);
      } else {
        document.getElementById('candidateSection').style.display = '';
        document.getElementById('adminActions').style.display = 'none';
        await fetchCandidates(token, data.user.isVoted, data.user.role);
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
        // Show name, party, and vote count
        div.innerHTML = `<strong>${candidate.name}</strong> (${candidate.party}) - <span>Votes: ${candidate.voteCount ?? 0}</span>`;
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


