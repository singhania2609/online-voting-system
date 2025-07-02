document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/html/login.html';
    return;
  }

  const candidateListDiv = document.getElementById('candidateList');
  try {
    // Fetch candidates
    const res = await fetch('/candidate');
    const candidates = await res.json();

    if (Array.isArray(candidates) && candidates.length > 0) {
      candidateListDiv.innerHTML = '';
      candidates.forEach(candidate => {
        const div = document.createElement('div');
        div.className = 'candidate';
        div.innerHTML = `
          <strong>${candidate.name}</strong> (${candidate.party})
          <button class="voteBtn" data-id="${candidate._id || candidate.id}">Vote</button>
        `;
        candidateListDiv.appendChild(div);
      });

      // Add event listeners to vote buttons
      document.querySelectorAll('.voteBtn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const candidateId = btn.getAttribute('data-id');
          try {
            const voteRes = await fetch(`/candidate/vote/${candidateId}`, {
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
        });
      });
    } else {
      candidateListDiv.textContent = 'No candidates available.';
    }
  } catch (err) {
    candidateListDiv.textContent = 'Failed to load candidates.';
  }
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/html/login.html';
}




