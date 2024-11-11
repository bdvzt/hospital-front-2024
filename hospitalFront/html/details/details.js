import { navigateTo } from "/hospitalFront/router.js";

const btnSaveInspection = document.getElementById("btnSaveInspection");
const btnCancelInspection = document.getElementById("btnCancelInspection");

let diagnosesOptions = [];

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

      initSelect2();
    } else {
      console.error("Diagnoses error", response.status);
    }
  } catch (error) {
    console.error(error);
  }
}

loadICDDiagnoses();

function initSelect2() {
  const selectElement = $("#icdDiagnosisId");
  selectElement.select2({
    placeholder: "Выберите диагноз",
    allowClear: true,
    data: diagnosesOptions,
  });
}

async function loadInspection() {
  const path = window.location.pathname.split("/");
  const inspectionId = path[path.length - 1];
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/inspection/${inspectionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const inspection = await response.json();
      const formatDate = (dateStr) => new Date(dateStr).toLocaleString("ru-RU");

      document.getElementById(
        "inspectionDate"
      ).textContent = `Амбулаторный осмотр от ${formatDate(inspection.date)}`;
      document.getElementById(
        "patientName"
      ).textContent = `Пациент: ${inspection.patient.name}`;
      document.getElementById("patientGender").textContent = `Пол: ${
        inspection.patient.gender === "Male" ? "Мужской" : "Женский"
      }`;
      document.getElementById(
        "patientBirthday"
      ).textContent = `Дата рождения: ${formatDate(
        inspection.patient.birthday
      )}`;
      document.getElementById(
        "doctorName"
      ).textContent = `Медицинский работник: ${
        inspection.doctor.name || "Не указано"
      }`;

      document.getElementById("complaints").textContent =
        inspection.complaints || "Нет данных";
      document.getElementById("anamnesis").textContent =
        inspection.anamnesis || "Нет данных";
      document.getElementById("treatment").textContent =
        inspection.treatment || "Нет данных";

      let conclusionText = "Не указано";
      if (inspection.conclusion === "Disease") {
        conclusionText = "Болезнь";
      } else if (inspection.conclusion === "Recovery") {
        conclusionText = "Выздоровление";
      } else if (inspection.conclusion === "Death") {
        conclusionText = "Смерть";
      }
      document.getElementById("conclusion").textContent = conclusionText;

      if (inspection.nextVisitDate && inspection.conclusion === "Disease") {
        document.getElementById(
          "nextVisitDate"
        ).textContent = `Дата следующего визита: ${formatDate(
          inspection.nextVisitDate
        )}`;
        document.getElementById("nextVisitDate").style.display = "block";
      }

      const consultationsContainer = document.getElementById(
        "consultationsContainer"
      );
      consultationsContainer.innerHTML = inspection.consultations
        .map(
          (c) => `
        <p>Консультант: ${c.rootComment.author.name}</p>
        <p>Специализация: ${c.speciality.name}</p>
      `
        )
        .join("");

      const commentsContainer = document.getElementById("commentsContainer");
      commentsContainer.innerHTML = inspection.consultations
        .map(
          (c) => `
        <div>
          <p>(${c.rootComment.author.name}, ${c.speciality.name}) ${
            c.rootComment.content
          }</p>
          <p><small>${formatDate(c.rootComment.createTime)}</small></p>
          <button class="btn btn-link">Показать ответы</button>
        </div>
      `
        )
        .join("");

      const diagnosesContainer = document.getElementById("diagnosesContainer");
      diagnosesContainer.innerHTML = inspection.diagnoses
        .map(
          (d) => `
        <p>Код: ${d.code} - Название: ${d.name}</p>
        <p>Тип: ${d.type}</p>
        <p>Расшифровка: ${d.description || "Нет данных"}</p>
      `
        )
        .join("");

      document.getElementById("complaints1").value =
        inspection.complaints || "";
      document.getElementById("anamnesis1").value = inspection.anamnesis || "";
      document.getElementById("treatment1").value = inspection.treatment || "";
      const diagnosesContainer1 = document.getElementById(
        "diagnosesContainer1"
      );
      diagnosesContainer1.innerHTML = inspection.diagnoses
        .map(
          (d, index) => `
      <div class="mb-3 diagnosis">
        <label for="icdDiagnosisId${index}" class="form-label">Болезни</label>
        <select class="form-select icd-select" id="icdDiagnosisId${index}" name="icdDiagnosisId" required>
          <option value="${d.code}" selected>${d.name}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="diagnosisDescription${index}" class="form-label">Описание диагноза</label>
        <textarea class="form-control" id="diagnosisDescription${index}" name="diagnosisDescription" rows="3">${
            d.description || ""
          }</textarea>
      </div>
      <div class="mb-3">
        <label for="diagnosisType${index}" class="form-label">Тип диагноза</label>
        <select class="form-select" id="diagnosisType${index}" name="diagnosisType" required>
          <option value="Main" ${
            d.type === "Main" ? "selected" : ""
          }>Основной</option>
          <option value="Concomitant" ${
            d.type === "Concomitant" ? "selected" : ""
          }>Сопутствующий</option>
          <option value="Complication" ${
            d.type === "Complication" ? "selected" : ""
          }>Осложнение</option>
        </select>
      </div>
    `
        )
        .join("");
      document.getElementById("conclusion1").value =
        inspection.conclusion || "Disease";

      if (inspection.nextVisitDate && inspection.conclusion === "Disease") {
        document.getElementById(
          "dateNext1"
        ).textContent = `Дата следующего визита: ${formatDate(
          inspection.nextVisitDate
        )}`;
        document.getElementById("dateNext1").style.display = "block";
      } else if (inspection.conclusion === "Death") {
        document.getElementById("dateNext1").style.display = "none";
        document.getElementById("dateNext1").value = "";
      }
    } else {
      console.error(response.status);
    }
  } catch (error) {
    console.error(error);
  }
}

loadInspection();

btnSaveInspection.addEventListener("click", async () => {
  await loadInspection();
  const path = window.location.pathname.split("/");
  const inspectionId = path[path.length - 1];
  const token = localStorage.getItem("token");

  const complaints = document.getElementById("complaints1").value;
  const anamnesis = document.getElementById("anamnesis1").value;
  const treatment = document.getElementById("treatment1").value;
  const conclusion = document.getElementById("conclusion1").value;
  const nextVisitDate = document.getElementById("dateNext1").value;
  const deathDate = document.getElementById("deathDate1").value || null;

  let diagnosisCounter = 1;
  const diagnosesContainer1 = document.getElementById("diagnosesContainer1");
  document.getElementById("btnAddDiagnosis1").addEventListener("click", () => {
    diagnosisCounter++;
    const newDiagnosisDiv = document.createElement("div");
    newDiagnosisDiv.classList.add("diagnosis");

    newDiagnosisDiv.innerHTML = `
      <div class="mb-3">
        <label for="icdDiagnosisId${diagnosisCounter}" class="form-label">Болезни</label>
        <select id="icdDiagnosisId${diagnosisCounter}" class="form-select icd-select" required></select>
      </div>
      <div class="mb-3">
        <label for="diagnosisDescription${diagnosisCounter}" class="form-label">Описание диагноза</label>
        <textarea id="diagnosisDescription${diagnosisCounter}" class="form-control" rows="3"></textarea>
      </div>
      <div class="mb-3">
        <label for="diagnosisType${diagnosisCounter}" class="form-label">Тип диагноза</label>
        <select id="diagnosisType${diagnosisCounter}" class="form-select" required>
          <option value="Main">Основной</option>
          <option value="Concomitant">Сопутствующий</option>
          <option value="Complication">Осложнение</option>
        </select>
      </div>
    `;

    diagnosesContainer1.appendChild(newDiagnosisDiv);
  });

  const diagnoses = [];
  const diagnosisElements = diagnosesContainer1.querySelectorAll(".diagnosis");

  diagnosisElements.forEach((diagnosisDiv) => {
    const code = diagnosisDiv.querySelector(".icd-select").value;
    const description = diagnosisDiv.querySelector("textarea").value;
    const type = diagnosisDiv.querySelector(".form-select").value;

    diagnoses.push({
      code: code,
      description: description,
      type: type,
    });
  });

  const updatedInspection = {
    complaints,
    anamnesis,
    treatment,
    conclusion,
    nextVisitDate: conclusion === "Disease" ? nextVisitDate : null,
    deathDate: conclusion === "Death" ? deathDate : null,
    diagnoses,
  };

  try {
    const response = await fetch(
      `https://mis-api.kreosoft.space/api/inspection/${inspectionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedInspection),
      }
    );

    if (response.ok) {
      document.getElementById("registrationOk").textContent =
        "Изменения успешно сохранены";
      await loadInspection();
    } else {
      console.error(response.status);
    }
  } catch (error) {
    console.error(error);
  }
});

btnCancelInspection.addEventListener("click", () => {
  document.getElementById("registrationOk").textContent = "";
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editInspection")
  );
  modal.hide();
});
