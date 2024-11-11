import { navigateTo } from "/hospitalFront/router.js";
import { updateNavigation } from "/hospitalFront/page/header.js";

document.addEventListener("DOMContentLoaded", fetchProfile);

const btnEdit = document.getElementById("btnEdit");

async function fetchProfile() {
  try {
    const token = localStorage.getItem("token");
    console.log(token);
    if (token) {
      const response = await fetch(
        "https://mis-api.kreosoft.space/api/doctor/profile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const profileData = await response.json();
        document.getElementById("inputName").value = profileData.name;
        document.getElementById("chooseGender").value = profileData.gender;
        document.getElementById("chooseBirthday").value =
          profileData.birthday.slice(0, 10);
        document.getElementById("phoneInput").value = profileData.phone;
        document.getElementById("inputEmail").value = profileData.email;
        localStorage.setItem("fio", profileData.name);
        updateNavigation();
        console.log("Successful profile:", profileData);
      } else {
        console.error("Profile error:", response.status);
      }
    } else {
      navigateTo("/login");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchProfile();
updateNavigation();

btnEdit.addEventListener("click", async (event) => {
  event.preventDefault();

  const nameInput = document.getElementById("inputName");
  const genderSelect = document.getElementById("chooseGender");
  const birthdayInput = document.getElementById("chooseBirthday");
  const phoneInput = document.getElementById("phoneInput");
  const emailInput = document.getElementById("inputEmail");

  const name = nameInput.value;
  const gender = genderSelect.value;
  const birthday = birthdayInput.value;
  const phone = phoneInput.value;
  const email = emailInput.value;

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch(
        "https://mis-api.kreosoft.space/api/doctor/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name,
            gender: gender,
            birthday: birthday,
            phone: phone,
            email: email,
          }),
        }
      );
      if (response.ok) {
        console.log("Profile updated successfully!");
        updateNavigation();
      } else {
        const error = await response.json();
        console.error("Profile update error:", error);
      }
    } else {
      navigateTo("/login");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
