const editBtn = document.getElementById("editBtn");
const name = document.getElementById("name");
const email = document.getElementById("email");
const gender = document.getElementById("gender");
const address = document.getElementById("address");
const password = document.getElementById("password");
editBtn.onclick = function () {
  window.location.href = "editprofile.html";
};
function populateData() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  console.log(storedUser);
  name.value = storedUser.Name;
  email.value = storedUser.Email;
  address.value = storedUser.Address;
  password.value = storedUser.Password;
  gender.value = storedUser.Gender;
}
populateData();
