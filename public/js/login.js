document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const aadharCardNumber = document.getElementById('aadharCardNumber').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;
  const message = document.getElementById('loginMessage');

  if (!/^\d{12}$/.test(aadharCardNumber)) {
    message.textContent = 'Aadhar must be exactly 12 digits.';
    return;
  }

  try {
    const response = await fetch('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aadharCardNumber, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      message.style.color = 'green';
      message.textContent = 'Login successful! Redirecting...';

      setTimeout(() => {
        window.location.href = '/html/dashboard.htm';
      }, 1500);
    } else {
      message.style.color = 'red';
      message.textContent = data.error || 'Login failed.';
    }
  } catch (err) {
    console.error('Error during login:', err);
    message.textContent = 'Server error. Please try again.';
  }
});

// Clear error message on input
['aadharCardNumber', 'password', 'role'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      message.textContent = '';
    });
  }
});
