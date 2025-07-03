// Redirect to login if not logged in
if (!localStorage.getItem('token')) {
  window.location.href = '/html/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Handle add candidate form submission
  document.getElementById('addCandidateForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(document.getElementById('addCandidateForm'));

    const token = localStorage.getItem('token');
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value.trim());
    const party = document.getElementById('party').value.trim();
    const Area_Standing_election = document.getElementById('Area_Standing_election').value.trim();
    const address = document.getElementById('address').value.trim();
    const aadharCardNumber = document.getElementById('aadharCardNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const message = document.getElementById('addCandidateMessage');

    const candidateData = {
      name, age, party, Area_Standing_election, address, aadharCardNumber, email, mobile
    };

    try {
      const response = await fetch('/candidate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        message.style.color = 'green';
        message.textContent = 'Candidate added successfully!';
        this.reset();
        fetchCandidateList();
      } else {
        message.style.color = 'red';
        message.textContent = result.error || result.message || 'Failed to add candidate';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Server error. Please try again.';
    }
  });

  // Fetch and display the candidate list
  fetchCandidateList();
});

async function fetchCandidateList() {
  const candidateListDiv = document.getElementById('candidateList');
  try {
    const res = await fetch('/candidate');
    if (!res.ok) throw new Error('Failed to fetch candidates');
    const candidates = await res.json();
    candidateListDiv.innerHTML = '';
    if (Array.isArray(candidates) && candidates.length > 0) {
      candidates.forEach(candidate => {
        const div = document.createElement('div');
        div.className = 'candidate-result';
        div.textContent = `${candidate.name ?? '(no name)'} (${candidate.party ?? '(no party)'}) - Votes: ${candidate.voteCount ?? 0}`;
        candidateListDiv.appendChild(div);
      });
    } else {
      candidateListDiv.textContent = 'No candidates available.';
    }
  } catch (err) {
    candidateListDiv.textContent = 'Failed to load candidates.';
  }
} 