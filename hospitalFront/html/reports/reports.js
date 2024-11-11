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

const saveReportButton = document.getElementById("saveReportButton");
const filterForm = document.getElementById("filterForm");
saveReportButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const formData = new FormData(filterForm);
  const start = formData.get("start");
  const end = formData.get("end");
  const icdRoots = formData.getAll("icdRoots");

  let requestString =
    "https://mis-api.kreosoft.space/api/report/icdrootsreport?start=" +
    start +
    "&end=" +
    end;
  if (icdRoots) {
    icdRoots.forEach((icdRoot) => (requestString += "&icdRoots=" + icdRoot));
  }
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(requestString, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const table = document.getElementById("table");
    table.classList.remove("d-none");
    const data = await response.json();

    const tableHeaders = document.getElementById("headerTable");
    data.filters.icdRoots.forEach((icdRoot) => {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.innerText = icdRoot;
      tableHeaders.appendChild(th);
    });

    const tableBody = document.getElementById("bodyTable");
    data.records.forEach((record) => {
      const row = document.createElement("tr");

      const patientNameCell = document.createElement("td");
      patientNameCell.innerText = record.patientName;

      const patientGenderCell = document.createElement("td");
      patientGenderCell.innerText = record.gender == "Male" ? "Муж" : "Жен";

      const patientBirthdayCell = document.createElement("td");
      patientBirthdayCell.innerText = record.patientBirthdate
        ? new Date(record.patientBirthdate).toLocaleDateString()
        : "-";

      row.appendChild(patientNameCell);
      row.appendChild(patientGenderCell);
      row.appendChild(patientBirthdayCell);

      data.filters.icdRoots.forEach((icdRoot) => {
        const rootCell = document.createElement("td");
        rootCell.innerText = record.visitsByRoot[icdRoot] || 0;
        row.appendChild(rootCell);
      });

      tableBody.appendChild(row);
    });

    const tableFoot = document.getElementById("footTable");
    data.filters.icdRoots.forEach((icdRoot) => {
      const rootCell = document.createElement("td");
      rootCell.innerText = data.summaryByRoot[icdRoot] || 0;
      tableFoot.appendChild(rootCell);
    });
  } catch (error) {
    console.error("Specialties list error", error);
  }
});
