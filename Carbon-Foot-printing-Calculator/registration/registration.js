const registerBtn = document.getElementById("registerBtn");

registerBtn.onclick = function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const gender = document.getElementById("gender");
  const address = document.getElementById("address").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  if (!email.includes("@")) {
    alert("Invalid Email Format!");
    return;
  }
  if (
    name === "" ||
    email === "" ||
    address === "" ||
    gender.options[gender.selectedIndex].text === "Select Gender" ||
    password === "" ||
    confirmPassword === ""
  ) {
    alert("Complete all details!");
  } else if (password !== confirmPassword) {
    alert("Passwords do not match!");
  } else {
    const user = {
      Name: name,
      Email: email,
      Address: address,
      Gender: gender.options[gender.selectedIndex].text,
      Password: password,
    };
    localStorage.setItem("user", user);
    console.log(user);
    // Send data to backend
    fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        alert(data.message);
        window.location.href = "../login/login.html";
      })
      .catch((error) => console.error("Error:", error));
  }
};
