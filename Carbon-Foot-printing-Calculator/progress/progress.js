async function fetchUserRank() {
  let username = document.getElementById("username").value.trim();
  let rankResult = document.getElementById("rankResult");
  if (!username) {
    rankResult.innerHTML =
      "<span class='error'>Please enter a username!</span>";
    return;
  }

  try {
    let response = await fetch(`/user-rank/${username}`);

    if (!response.ok) {
      throw new Error("User not found");
    }

    let data = await response.json();
    console.log(data);
    if (data.Emission === null) {
      rankResult.innerHTML =
        "<span class='error'>Error fetching rank: " +
        "No Emission Data Found!" +
        "</span>";
    } else {
      rankResult.innerHTML = `<strong>${data.Email}</strong> is ranked <strong>#${data.rank}</strong> with a carbon score of <strong>${data.Emission}</strong>.`;
    }
  } catch (error) {
    rankResult.innerHTML =
      "<span class='error'>Error fetching rank: " + error.message + "</span>";
  }
}
