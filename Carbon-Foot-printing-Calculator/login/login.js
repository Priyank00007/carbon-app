let loginBtn = document.getElementById("loginBtn");
const email = document.getElementById("email");
const password = document.getElementById("password");
const storedUser = JSON.parse(localStorage.getItem("user"));
console.log(storedUser);
loginBtn.onclick = function () {
  if (
    storedUser.Email != email.value ||
    storedUser.Password != password.value
  ) {
    alert("wrong credentials!");
  } else {
    window.location.href = "../home/home.html";
  }
};
