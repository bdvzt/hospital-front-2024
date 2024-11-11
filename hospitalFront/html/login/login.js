import { navigateTo } from "/hospitalFront/router.js";

const btnLogin = document.getElementById("btnLogin");
const btnSignUp = document.getElementById("btnSignUp");

const formLogin = document.getElementById("formLogin");

btnLogin.addEventListener("click", async (event) => {
  event.preventDefault();
  console.log(formLogin);
  const formData = new FormData(formLogin);

  const data = Object.fromEntries(formData.entries());
  console.log(data);
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/doctor/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      const token = responseData.token;

      localStorage.setItem("token", token);
      console.log(token);
      navigateTo("/profile");
    } else {
      console.error("Login error", error);
    }
  } catch (error) {
    console.error(error);
  }
});

btnSignUp.addEventListener("click", () => {
  try {
    navigateTo("/registration");
  } catch (error) {
    console.error("Navigation error", error);
  }
});
