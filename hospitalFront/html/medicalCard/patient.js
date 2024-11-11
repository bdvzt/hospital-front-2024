import { navigateTo } from "/hospitalFront/router.js";
import { createPaginationBlock } from "../../javascript/pagination";
import { formatDate } from "../../javascript/functions";

const btnSearch = document.getElementById("btnSearch");
let isDead = false;

async function loadRoots() {
  try {
    const response = await fetch(
      "https://mis-api.kreosoft.space/api/dictionary/icd10/roots"
    );
    const data = await response.json();

    const mkbSelect = document.querySelector("#mkb");
    mkbSelect.innerHTML = "<option disabled hidden>Выбрать</option>";

    data.forEach((code) => {
      const option = document.createElement("option");
      option.value = code.id;
      option.text = `${code.name} (${code.code})`;
      mkbSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Specialties list error", error);
  }
}

loadRoots();

function createInspectionCard(inspection, inspectionsContainer) {
  const inspectionDiv = document.createElement("div");
  inspectionDiv.classList.add(
    "container",
    "mx-auto",
    "rounded",
    "mb-4",
    "p-3",
    "col-md-5"
  );
  inspectionDiv.style.background = "#f5f5fa";

  const rowDiv = document.createElement("div");
  rowDiv.classList.add(
    "row",
    "align-items-center",
    "d-flex",
    "justify-content-between"
  );

  const nameElement = document.createElement("h5");
  nameElement.classList.add("text-primary", "mb-2");
  nameElement.innerHTML = `Амбулаторный осмотр`;

  const dateElement = document.createElement("p");
  dateElement.classList.add("text-muted", "mb-2");
  dateElement.innerHTML = `<strong>Дата:</strong> ${
    inspection.date ? formatDate(inspection.date) : "Не указана"
  }`;

  const diagnosisElement = document.createElement("p");
  diagnosisElement.innerHTML = `<strong>Основной диагноз:</strong> ${
    inspection.diagnosis && inspection.diagnosis.name
      ? inspection.diagnosis.name
      : "Не указано"
  }`;

  const conclusionElement = document.createElement("p");

  let conclusionText = "Не указано";
  if (inspection.conclusion === "Disease") {
    conclusionText = "Болезнь";
  } else if (inspection.conclusion === "Recovery") {
    conclusionText = "Выздоровление";
  } else if (inspection.conclusion === "Death") {
    inspectionDiv.style.background = "#E5A4A4";
    conclusionText = "Смерть";
    isDead = true;
  }

  conclusionElement.innerHTML = `<strong>Заключение:</strong> ${conclusionText}`;

  const doctorElement = document.createElement("p");
  doctorElement.innerHTML = `<strong>Медицинский работник:</strong> ${
    inspection.doctor ? inspection.doctor : "Не указан"
  }`;

  const addInspectionButton = document.createElement("button");
  addInspectionButton.classList.add("btn", "btn-info", "me-2");
  addInspectionButton.textContent = "Добавить осмотр";
  addInspectionButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const path = window.location.pathname.split("/");
    const id = path[path.length - 1];
    navigateTo(`/createInspection?patientId=${id}`);
  });

  const detailsButton = document.createElement("button");
  detailsButton.classList.add("btn", "btn-secondary");
  detailsButton.textContent = "Детали осмотра";
  detailsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log(`Переход к деталям осмотра ${inspection.id}`);
    navigateTo(`/inspection/${inspection.id}`);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("d-flex", "justify-content-end", "mt-3");
  buttonContainer.appendChild(addInspectionButton);
  buttonContainer.appendChild(detailsButton);

  inspectionDiv.appendChild(nameElement);
  inspectionDiv.appendChild(dateElement);
  inspectionDiv.appendChild(diagnosisElement);
  inspectionDiv.appendChild(conclusionElement);
  inspectionDiv.appendChild(doctorElement);
  inspectionDiv.appendChild(buttonContainer);

  inspectionsContainer.appendChild(inspectionDiv);
}

async function initCard() {
  const token = localStorage.getItem("token");

  const urlParams = new URLSearchParams(window.location.search);
  const grouped = urlParams.get("grouped") === "true";
  const page = urlParams.get("page") || "1";
  const size = urlParams.get("size") || "5";
  const icdRoots = urlParams.getAll("icdRoots");

  const path = window.location.pathname.split("/");
  const patientId = path[path.length - 1];

  const queryParams = new URLSearchParams({
    grouped: grouped,
    page: page,
    size: size,
  });

  icdRoots.forEach((root) => queryParams.append("icdRoots", root));

  // console.log('help ',patientId);
  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/patient/${patientId}/inspections?${queryParams.toString()}`,
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
      createPaginationBlock(data.pagination);
      console.log(data.inspections);
      console.log("Inspections loaded successfully");

      const inspectionsContainer =
        document.getElementById("patientInspections");
      inspectionsContainer.innerHTML = "";

      data.inspections.forEach((inspection) => {
        createInspectionCard(inspection, inspectionsContainer);
      });
    } else {
      const error = await response.json();
      console.error("Patients error", error);
    }
  } catch (error) {
    console.error(error);
  }
}

initCard();

btnSearch.addEventListener("click", async function (event) {
  event.preventDefault();

  const mkbSelect = document.getElementById("mkb");
  const grouped =
    document.querySelector('input[name="grouped"]:checked').value === "true";
  const amountInspections = document.getElementById("amountInspections").value;

  const icdRoots = Array.from(mkbSelect.selectedOptions).map(
    (option) => option.value
  );

  const path = window.location.pathname.split("/");
  const patientId = path[path.length - 1];
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams({
    grouped: grouped,
    page: 1,
    size: amountInspections,
  });

  icdRoots.forEach((root) => queryParams.append("icdRoots", root));

  const newUrl = `/patient/${patientId}?${queryParams.toString()}`;
  window.history.pushState(null, "", newUrl);

  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/patient/${patientId}/inspections?${queryParams.toString()}`,
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
      createPaginationBlock(data.pagination);
      console.log(data.inspections);

      const inspectionsContainer =
        document.getElementById("patientInspections");
      inspectionsContainer.innerHTML = "";

      data.inspections.forEach((inspection) => {
        createInspectionCard(inspection, inspectionsContainer);
      });
    } else {
      const error = await response.json();
      console.error("Patients error", error);
    }
  } catch (error) {
    console.error(error);
  }
});

async function loadNextInspection(currentInspectionId, token, container) {
  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/inspection/${currentInspectionId}/chain`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const nextInspections = await response.json();
      if (nextInspections.length === 0) {
        console.error("Нет следующего осмотра в цепочке.");
        return;
      }

      const nextInspection = nextInspections[0];

      const nextInspectionDiv = document.createElement("div");
      nextInspectionDiv.classList.add(
        "container",
        "mx-auto",
        "rounded",
        "mb-3",
        "p-3",
        "bg-light"
      );

      nextInspectionDiv.innerHTML = `
          <div class="card p-3" style="margin-left: 20px;">
            <div class="card-body">
              <h5 class="card-title text-primary">Следующий осмотр</h5>
              <p class="card-text text-muted">Дата: ${formatDate(
                nextInspection.date
              )}</p>
              <p class="card-text"><strong>Основной диагноз:</strong> ${
                nextInspection.diagnosis.name
              }</p>
              <p class="card-text"><strong>Заключение:</strong> ${
                nextInspection.conclusion
              }</p>
              <p class="card-text"><strong>Медицинский работник:</strong> ${
                nextInspection.doctor
              }</p>
            </div>
          </div>`;

      container.appendChild(nextInspectionDiv);
    } else {
      console.error("Ошибка загрузки следующего осмотра в цепочке");
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchPatient() {
  console.log("trying to fetch");
  try {
    const path = window.location.pathname.split("/");
    const id = path[path.length - 1];

    const token = localStorage.getItem("token");
    console.log(token);
    if (token) {
      const response = await fetch(
        `https://mis-api.kreosoft.space/api/patient/${id}`,
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

const addInspection = document.getElementById("addInspection");

addInspection.addEventListener("click", () => {
  try {
    const path = window.location.pathname.split("/");
    const id = path[path.length - 1];
    if (!isDead) {
      navigateTo(`/createInspection?patientId=${id}`);
    } else {
      alert("Пациент мертв");
    }
  } catch (error) {
    console.error("Navigation error", error);
  }
});
