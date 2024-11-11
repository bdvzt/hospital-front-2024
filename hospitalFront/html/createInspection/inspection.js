import { navigateTo } from "/hospitalFront/router.js";
import { formatDate } from "../../javascript/functions";

const btnSaveInspection = document.getElementById("btnSaveInspection");
const btnCancelInspection = document.getElementById("btnCancelInspection");
const btnAddDiagnosis = document.getElementById("btnAddDiagnosis");

let diagnosesOptions = [];
let specialitiesList = [];

const nextVisitContainer = document.getElementById("dateNext");
const deathDateContainer = document.getElementById("deathDateContainer");

const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get("patientId");

async function loadSpecialities() {
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=1000"
    );
    const data = await response.json();

    specialitiesList.push(...data.specialties);

    const specialitySelect = document.getElementById("chooseSpeciality");
    specialitiesList.forEach((speciality) => {
      const option = document.createElement("option");
      option.value = speciality.id;
      option.text = speciality.name;
      specialitySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Specialties error", error);
  }
}

loadSpecialities();

const consultationsContainer = document.getElementById(
  "consultationsContainer"
);

document.getElementById("conclusion").addEventListener("change", (event) => {
  const conclusion = event.target.value;

  if (conclusion === "Disease") {
    nextVisitContainer.style.display = "block";
    deathDateContainer.style.display = "none";
  } else if (conclusion === "Death") {
    nextVisitContainer.style.display = "none";
    deathDateContainer.style.display = "block";
  } else {
    nextVisitContainer.style.display = "none";
    deathDateContainer.style.display = "none";
  }
});

document.getElementById("btnAddConsultation").addEventListener("click", () => {
  const consultationDiv = document.createElement("div");
  consultationDiv.classList.add("mb-3", "consultation");

  consultationDiv.innerHTML = `
      <label>Специальность</label>
      <select class="form-select consultation-speciality" required>
        <option value="" disabled selected>Выберите специальность</option>
        ${specialitiesList
          .map(
            (speciality) =>
              `<option value="${speciality.id}">${speciality.name}</option>`
          )
          .join("")}
      </select>
      
      <label>Комментарий к консультации</label>
      <textarea class="form-control consultation-comment" rows="3" placeholder="Комментарий к консультации"></textarea>
    `;

  consultationsContainer.appendChild(consultationDiv);
});

async function loadICDDiagnoses() {
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/dictionary/icd10?page=1&size=1000",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      diagnosesOptions = data.records.map((item) => ({
        id: item.id,
        text: item.name,
      }));

      selectDiagnoses();
    } else {
      console.error("Diagnoses error", response.status);
    }
  } catch (error) {
    console.error(error);
  }
}

loadICDDiagnoses();

function selectDiagnoses() {
  const selectElement = $("#icdDiagnosisId");
  selectElement.select2({
    placeholder: "Выберите диагноз",
    allowClear: true,
    data: diagnosesOptions,
  });
}

document
  .getElementById("needConsultation")
  .addEventListener("change", (event) => {
    const specialityDiv = document.getElementById("speciality");
    const commentField = document.getElementById("consultationsComment");

    if (event.target.checked) {
      specialityDiv.style.display = "block";
      commentField.style.display = "block";
    } else {
      specialityDiv.style.display = "none";
      commentField.style.display = "none";
    }
  });

const diagnosesContainer = document.getElementById("diagnosesContainer");

btnAddDiagnosis.addEventListener("click", () => {
  const newDiagnosis = document.createElement("div");
  newDiagnosis.classList.add("mb-3", "diagnosis");

  newDiagnosis.innerHTML = `
      <label for="icdDiagnosisId" class="form-label">Болезни</label>
      <select class="form-select icd-select" name="icdDiagnosisId" required>
        <option value="" disabled selected>Выберите болезнь</option>
        ${diagnosesOptions
          .map((item) => `<option value="${item.id}">${item.text}</option>`)
          .join("")}
      </select>
      <label for="diagnosisDescription" class="form-label">Описание диагноза</label>
      <textarea class="form-control" name="diagnosisDescription" rows="3" required></textarea>
      <label for="diagnosisType" class="form-label">Тип диагноза</label>
      <select class="form-select" name="diagnosisType" required>
        <option value="Main">Основной</option>
        <option value="Concomitant">Сопутствующий</option>
        <option value="Complication">Осложнение</option>
      </select>
    `;

  diagnosesContainer.appendChild(newDiagnosis);

  $(newDiagnosis.querySelector(".icd-select")).select2({
    placeholder: "Выберите диагноз",
    allowClear: true,
    data: diagnosesOptions,
  });
});

async function fetchPatient() {
  console.log("trying to fetch");
  try {
    const token = localStorage.getItem("token");

    if (token) {
      const response = await fetch(
        `https://mis-api.kreosoft.space/api/patient/${patientId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const patientData = await response.json();

        const patientNameElement = document.getElementById("patientName");
        const birthDateElement = document.getElementById("birthDate");

        patientNameElement.innerHTML = `${patientData.name} <img src="${
          patientData.gender === "Male"
            ? "/hospitalFront/mars.png"
            : "/hospitalFront/femenine.png"
        }" width="25" height="25"/>`;

        birthDateElement.textContent = `Дата рождения: ${
          patientData.birthday ? formatDate(patientData.birthday) : "не указана"
        }`;

        console.log("Successful profile:", patientData);
      } else {
        console.error("Profile error:", response.status);
      }
    } else {
      navigateTo("/login");
    }
  } catch (error) {
    console.error(error);
  }
}

fetchPatient();

btnSaveInspection.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token || !patientId) {
    console.error("Токен или ID пациента отсутствует");
    return;
  }

  const dateInput = document.getElementById("date").value;
  const formattedDate = new Date(dateInput + ":00Z").toISOString();
  const nextVisitDateInput = document.getElementById("dateNext").value;
  const formattedNextVisitDate = new Date(
    nextVisitDateInput + ":00Z"
  ).toISOString();

  const diagnoses = [];

  const firstDiagnosis = {
    icdDiagnosisId: document.getElementById("icdDiagnosisId").value,
    description: document.getElementById("diagnosisDescription").value,
    type: document.getElementById("diagnosisType").value,
  };

  if (firstDiagnosis.icdDiagnosisId && firstDiagnosis.type) {
    diagnoses.push(firstDiagnosis);
  }

  const diagnosisElements = document.querySelectorAll(
    ".diagnosis:not(:first-child)"
  );

  Array.from(diagnosisElements).forEach((diagnosis) => {
    diagnoses.push({
      icdDiagnosisId: diagnosis.querySelector('select[name="icdDiagnosisId"]')
        .value,
      description: diagnosis.querySelector(
        'textarea[name="diagnosisDescription"]'
      ).value,
      type: diagnosis.querySelector('select[name="diagnosisType"]').value,
    });
  });
  const mainDiagnoses = diagnoses.filter((d) => d.type === "Main");
  if (mainDiagnoses.length === 0) {
    alert("Должен быть хотя бы один диагноз с типом 'Основной'.");
    return;
  }
  if (mainDiagnoses.length > 1) {
    alert("Только один диагноз может быть с типом 'Основной'. Удалите лишние.");
    return;
  }

  const consultations = [];
  const specialityIds = new Set();

  let duplicateSpecialityFound = false;
  document
    .querySelectorAll("#consultationsContainer .consultation")
    .forEach((consultationDiv) => {
      const specialityId = consultationDiv.querySelector(
        ".consultation-speciality"
      ).value;
      const commentContent = consultationDiv.querySelector(
        ".consultation-comment"
      ).value;

      if (specialityId) {
        if (specialityIds.has(specialityId)) {
          alert(
            `Консультация с выбранной специальностью уже добавлена: ID ${specialityId}`
          );
          duplicateSpecialityFound = true;
        } else {
          specialityIds.add(specialityId);
          consultations.push({
            specialityId: specialityId,
            comment: {
              content: commentContent,
            },
          });
        }
      }
    });

  if (duplicateSpecialityFound) {
    alert(
      "Осмотр не может иметь несколько консультаций с одинаковой специальностью врача"
    );
    return;
  }

  const inspectionData = {
    date: formattedDate,
    anamnesis: document.getElementById("anamnesis").value,
    complaints: document.getElementById("complaints").value,
    treatment: document.getElementById("treatment").value,
    conclusion: document.getElementById("conclusion").value,
    nextVisitDate: null,
    diagnoses: diagnoses,
    consultations: consultations,
    deathDate: null,
  };

  if (inspectionData.conclusion === "Death") {
    const deathDateInput = document.getElementById("deathDate").value;
    inspectionData.deathDate = deathDateInput
      ? new Date(deathDateInput + ":00Z").toISOString()
      : null;
    inspectionData.nextVisitDate = null;
  } else if (inspectionData.conclusion === "Disease") {
    const nextVisitDateInput = document.getElementById("dateNext").value;
    inspectionData.nextVisitDate = nextVisitDateInput
      ? new Date(nextVisitDateInput + ":00Z").toISOString()
      : null;
  } else {
    inspectionData.nextVisitDate = null;
    inspectionData.deathDate = null;
  }

  if (document.getElementById("needConsultation").checked) {
    const specialityId = document.getElementById("chooseSpeciality").value;
    const commentContent = document.getElementById(
      "consultationsComment"
    ).value;

    inspectionData.consultations.push({
      specialityId: specialityId,
      comment: {
        content: commentContent,
      },
    });
  }

  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/patient/${patientId}/inspections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inspectionData),
      }
    );

    if (response.ok) {
      alert("Осмотр успешно сохранен");
    } else {
      const errorData = await response.json();
      console.error(errorData);
    }
  } catch (error) {
    console.error(error);
  }
});

btnCancelInspection.addEventListener("click", () => {
  navigateTo(`/patient/${patientId}`);
});
