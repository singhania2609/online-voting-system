// Redirect to login if not logged in
if (!localStorage.getItem('token')) {
  window.location.href = '/html/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const candidateSelect = document.getElementById('candidateSelect');
  const message = document.getElementById('deleteCandidateMessage');

  // Fetch candidates and populate the dropdown
  try {
    const res = await fetch('/candidate');
    if (!res.ok) throw new Error('Failed to fetch candidates');
    const candidates = await res.json();
    candidates.forEach(candidate => {
      const option = document.createElement('option');
      option.value = candidate._id;
      option.textContent = `${candidate.name} (${candidate.party}) - Votes: ${candidate.voteCount ?? 0}`;
      candidateSelect.appendChild(option);
    });
  } catch (err) {
    message.style.color = 'red';
    message.textContent = 'Failed to load candidates.';
  }

  // Handle delete form submission
  document.getElementById('deleteCandidateForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const candidateId = candidateSelect.value;
    if (!candidateId) {
      message.style.color = 'red';
      message.textContent = 'Please select a candidate to delete.';
      return;
    }
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const delRes = await fetch(`/candidate/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const delData = await delRes.json();
      if (delRes.ok) {
        message.style.color = 'green';
        message.textContent = 'Candidate deleted successfully!';
        candidateSelect.querySelector(`option[value="${candidateId}"]`).remove();
      } else {
        message.style.color = 'red';
        message.textContent = delData.message || 'Failed to delete candidate.';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Server error. Please try again.';
    }
  });
}); 