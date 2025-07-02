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
          <td>${candidate.voteCount ?? 0}</td>
        `;
        tableBody.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="3">No candidates available.</td>';
      tableBody.appendChild(tr);
    }
  } catch (err) {
    console.error("Error fetching candidates:", err);
    const tableBody = document.getElementById("candidateTableBody");
    tableBody.innerHTML = '<tr><td colspan="3">Failed to load candidates. Please check if your backend is running and has candidates.</td></tr>';
  }
});
