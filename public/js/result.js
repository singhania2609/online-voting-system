document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/candidate");
    if (!res.ok) throw new Error('Failed to fetch candidates: ' + res.status);
    let data = await res.json();

    const tableBody = document.getElementById("candidateTableBody");
    tableBody.innerHTML = '';
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((candidate) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${candidate.name ?? '(no name)'}</td>
          <td>${candidate.party ?? '(no party)'}</td>
          <td>${candidate.Area_Standing_election ?? '(no area)'}</td>
          <td>${candidate.voteCount ?? 0}</td>
        `;
        tableBody.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="4">No candidates available.</td>';
      tableBody.appendChild(tr);
    }
  } catch (err) {
    console.error("Error fetching candidates:", err);
    const tableBody = document.getElementById("candidateTableBody");
    tableBody.innerHTML = '<tr><td colspan="4">Failed to load candidates. Please check if your backend is running and has candidates.</td></tr>';
  }
});

document.getElementById('userProfileImage').src = user.profileImage || '/default-profile.png';

document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  // Optionally, you can add validation here

  const res = await fetch('/user/signup', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (res.ok) {
    // Redirect or show success
    window.location.href = '/html/login.html';
  } else {
    alert(data.error || 'Signup failed');
  }
});
