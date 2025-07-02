// Show dynamic greeting message based on time of day
document.addEventListener("DOMContentLoaded", () => {
  const greeting = document.getElementById("greeting");
  const hour = new Date().getHours();

  let message = "Welcome to the platform!";
  if (hour < 12) {
    message = "Good morning! Ready to vote?";
  } else if (hour < 18) {
    message = "Good afternoon! Ready to vote?";
  } else {
    message = "Good evening! Ready to vote?";
  }

  greeting.textContent = message;
});
