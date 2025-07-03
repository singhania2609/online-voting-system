document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const response = await fetch("/user/signup", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  if (response.ok) {
    alert("Signup successful!");
    localStorage.setItem("token", result.token);
    window.location.href = "/html/dashboard.htm";
  } else {
    document.getElementById("signupError").textContent = result.error || result.message || "Signup failed";
  }
});
