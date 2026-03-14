const saveBtn = document.getElementById("saveBtn");
const name = document.getElementById("name");
const email = document.getElementById("email");
const gender = document.getElementById("gender");
const address = document.getElementById("address");
const password = document.getElementById("password");
saveBtn.onclick = function () {
  const user = {
    Name: name.value,
    Email: email.value,
    Address: address.value,
    Gender: gender.options[gender.selectedIndex].text,
    Password: password.value,
  };
  localStorage.setItem("user", JSON.stringify(user));
  window.location.href = "viewprofile.html";
};
function populateData() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  console.log(storedUser);
  name.value = storedUser.Name;
  email.value = storedUser.Email;
  address.value = storedUser.Address;
  password.value = storedUser.Password;
  gender.options[gender.selectedIndex].text = storedUser.Gender;
}
populateData();
