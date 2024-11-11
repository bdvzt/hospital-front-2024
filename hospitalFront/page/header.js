import { navigateTo } from "/hospitalFront/router.js";

const btnLogout = document.getElementById("btnLogout");

export function updateNavigation() {
  const token = localStorage.getItem("token");
  const fio = localStorage.getItem("fio");

  const userDropdown = document.getElementById("fioButtons");
  const login = document.getElementById("login");
  const fioElement = document.getElementById("fio");

  const patientsItem = document.getElementById("listPatients");
  const consultationItem = document.getElementById("consultation");
  const statisticsItem = document.getElementById("reports");

  if (token) {
    userDropdown.style.display = "block";
    login.style.display = "none";
    fioElement.textContent = fio || "Профиль";

    patientsItem.style.display = "block";
    consultationItem.style.display = "block";
    statisticsItem.style.display = "block";
  } else {
    userDropdown.style.display = "none";
    login.style.display = "block";
    fioElement.textContent = "";

    patientsItem.style.display = "none";
    consultationItem.style.display = "none";
    statisticsItem.style.display = "none";
    navigateTo("/login");
  }
}

updateNavigation();

btnLogout.addEventListener("click", async (event) => {
  event.preventDefault();
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/doctor/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      console.log("Successful logout");
      localStorage.removeItem("token");
      localStorage.removeItem("fio");
      updateNavigation();
      navigateTo("/login");
      console.log(token);
    } else {
      console.error("Logout error", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
