import { navigateTo } from "/hospitalFront/router.js";
import { createPaginationBlock } from "../../javascript/pagination";
import { formatDate } from "../../javascript/functions";

const btnSort = document.getElementById("btnSort");
const btnRegisterPatient = document.getElementById("btnRegisterPatient");

function createPatientCard(patient, patientsContainer) {
  const patientDiv = document.createElement("div");
  patientDiv.classList.add(
    "container",
    "mx-auto",
    "rounded",
    "mb-3",
    "p-3",
    "col-md-5"
  );
  patientDiv.style.background = "#f5f5fa";
  patientDiv.addEventListener("click", () => {
    navigateTo(`/patient/${patient.id}`);
  });

  const rowDiv = document.createElement("div");
  rowDiv.classList.add(
    "row",
    "align-items-center",
    "d-flex",
    "justify-content-between"
  );

  const nameElement = document.createElement("h5");
  nameElement.classList.add("text-primary", "mb-2");
  nameElement.innerHTML = `${patient.name}`;

  const genderLabel = document.createElement("p");
  genderLabel.classList.add("text-muted", "mb-2");
  genderLabel.innerHTML = `<strong>Пол:</strong> ${
    patient.gender === "Male" ? "Мужчина" : "Женщина"
  }`;

  const birthDateLabel = document.createElement("p");
  birthDateLabel.classList.add("text-muted", "mb-2");
  birthDateLabel.innerHTML = `<strong>Дата рождения:</strong> ${
    patient.birthday ? formatDate(patient.birthday) : "Не указана"
  }`;

  patientDiv.appendChild(nameElement);
  patientDiv.appendChild(genderLabel);
  patientDiv.appendChild(birthDateLabel);

  patientsContainer.appendChild(patientDiv);
}

async function initPatients() {
  const token = localStorage.getItem("token");

  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name") || "";
  const conclusions = urlParams.get("conclusions") || "Disease";
  const scheduledVisits = urlParams.get("scheduledVisits") === "true";
  const onlyMine = urlParams.get("onlyMine") === "true";
  const sorting = urlParams.get("sorting") || "NameAsc";
  const page = urlParams.get("page") || "1";
  const size = parseInt(urlParams.get("size"), 10) || 4;

  const queryParams = new URLSearchParams({
    name,
    conclusions,
    scheduledVisits,
    onlyMine,
    sorting,
    page,
    size,
  });

  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/patient?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Patients loaded successfully");
      createPaginationBlock(data.pagination);

      const patientsContainer = document.getElementById("patientsStorage");
      patientsContainer.innerHTML = "";

      data.patients.forEach((patient) => {
        createPatientCard(patient, patientsContainer);
      });
    } else {
      console.error("Error loading patients:", await response.json());
    }
  } catch (error) {
    console.error(error);
  }
}

initPatients();

btnSort.addEventListener("click", async (event) => {
  event.preventDefault();

  const name = document.querySelector('input[name="name"]').value || "";
  const conclusions = Array.from(
    document.querySelector('select[name="conclusions"]').selectedOptions
  )
    .map((option) => option.value)
    .join(",");
  const scheduledVisits = document.getElementById("scheduledVisits").checked;
  const onlyMine = document.getElementById("onlyMine").checked;
  const sorting = document.querySelector('select[name="sorting"]').value;
  const size =
    parseInt(document.querySelector('input[name="size"]').value, 10) || 4;

  const queryParams = new URLSearchParams({
    name,
    conclusions,
    scheduledVisits,
    onlyMine,
    sorting,
    page: 1,
    size,
  });

  const newUrl = `/patients?${queryParams.toString()}`;
  window.history.pushState(null, "", newUrl);

  await initPatients();
});

const formRegisterPatient = document.getElementById("formRegisterPatient");

btnRegisterPatient.addEventListener("click", async (event) => {
  event.preventDefault();

  const formData = new FormData(formRegisterPatient);
  const data = Object.fromEntries(formData.entries());

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("https://mis-api.kreosoft.space/api/patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Successful patient registration");
      const modal = new bootstrap.Modal(
        document.getElementById("createPatient")
      );
      modal.hide();

      formRegisterPatient.reset();
    } else {
      const error = await response.json();
      console.error("Registration patient error", error);
    }
  } catch (error) {
    console.error(error);
  }
});
