document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value.trim());
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const address = document.getElementById("address").value.trim();
  const aadharCardNumber = document.getElementById("aadharCardNumber").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!/^\d{12}$/.test(aadharCardNumber)) {
    alert("Aadhar number must be exactly 12 digits.");
    return;
  }

  if (mobile && !/^\d{10}$/.test(mobile)) {
    alert("Mobile number must be exactly 10 digits.");
    return;
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    alert("Invalid email format.");
    return;
  }

  if (age < 18) {
    alert("Age must be 18 or older.");
    return;
  }

  const userData = {
    name,
    age,
    email,
    mobile,
    address,
    aadharCardNumber,
    password,
    role,
  };

  try {
    const response = await fetch("/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || data.message || "Signup failed");
    } else {
      alert("Signup successful!");
      localStorage.setItem("token", data.token);
      window.location.href = "/html/dashboard.htm";
    }
  } catch (err) {
    console.error("Signup error:", err);
    alert("An error occurred. Please try again later.");
  }
});
