import { navigateTo } from "/hospitalFront/router.js";
import IMask from "imask";

async function loadSpecialities() {
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=1000"
    );
    const data = await response.json();

    const specialitySelect = document.querySelector(
      'select[name="speciality"]'
    );
    data.specialties.forEach((speciality) => {
      const option = document.createElement("option");
      option.value = speciality.id;
      option.text = speciality.name;
      specialitySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Specialties list error", error);
  }
}

loadSpecialities();

const phoneInput = document.getElementById("inputPhone");
const btnRegister = document.getElementById("btnRegister");

const mask = new IMask(phoneInput, {
  mask: "+{7}(000)000-00-00",
});

const formSignUp = document.getElementById("formSignUp");

btnRegister.addEventListener("click", async (event) => {
  event.preventDefault();
  const formData = new FormData(formSignUp);

  if (formData.get("phone")) {
    formData.set("phone", mask.unmaskedValue);
  }

  const data = Object.fromEntries(formData.entries());
  console.log(data);
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/doctor/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      console.log("Successful registration");
      const responseData = await response.json();
      const token = responseData.token;

      localStorage.setItem("token", token);

      console.log("Successful login");
      navigateTo("/profile");
    } else {
      const error = await response.json();
      console.error("Registration error", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
