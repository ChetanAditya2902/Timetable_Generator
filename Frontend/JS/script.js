// JavaScript to handle file input and display CSV content

let jsonArray = [];

const API_BASE_URL = window.location.port === "5500"
  ? "http://localhost:3005"
  : window.location.origin;

function parseCSV(csvData) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < csvData.length; index += 1) {
    const character = csvData[index];
    if (character === '"') {
      if (quoted && csvData[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csvData[index + 1] === "\n") {
        index += 1;
      }
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unclosed quoted field.");
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== "")) {
    rows.push(row);
  }
  return rows;
}

function bindClickIfPresent(id, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("click", handler);
  }
}

function getUploadStatus(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) {
    return null;
  }

  let status = document.getElementById(`${buttonId}Status`);
  if (!status) {
    status = document.createElement("p");
    status.id = `${buttonId}Status`;
    status.setAttribute("role", "status");
    button.insertAdjacentElement("afterend", status);
  }
  return status;
}

async function storeUploadedCsv(endpoint, buttonId) {
  const button = document.getElementById(buttonId);
  const status = getUploadStatus(buttonId);
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    if (status) {
      status.textContent = "Choose and preview a valid CSV file before storing it.";
    }
    return;
  }

  if (button) {
    button.disabled = true;
  }
  if (status) {
    status.textContent = "Saving rows…";
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonArray),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || result.detail || `Server returned ${response.status}.`);
    }

    if (status) {
      status.textContent = result.message || `Saved ${result.imported} rows successfully.`;
      status.dataset.state = "success";
    }
  } catch (error) {
    console.error("Could not store CSV data:", error);
    if (status) {
      status.textContent = error.message || "Could not store CSV data. Check the server and database.";
      status.dataset.state = "error";
    }
  } finally {
    if (button) {
      button.disabled = false;
    }
  }
}

function convertCSVtoJSON(inputId, tableId, storeButtonIds) {
  const fileInput = document.getElementById(inputId);
  const tableResult = document.getElementById(tableId);

  if (!fileInput || !tableResult) {
    console.error("CSV upload controls not found on this page.");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a CSV file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const rows = parseCSV(String(event.target.result || ""));
      if (rows.length < 2) {
        throw new Error("CSV file is empty or missing data.");
      }

      const headers = rows[0].map((header) => header.replace(/^\uFEFF/, ""));
      if (headers.some((header) => !header)) {
        throw new Error("Every CSV column must have a header.");
      }
      const importedRows = rows.slice(1).map((currentLine, index) => {
        if (currentLine.length !== headers.length) {
          throw new Error(`CSV row ${index + 2} has an unexpected number of columns.`);
        }

        return Object.fromEntries(headers.map((header, columnIndex) => [header, currentLine[columnIndex]]));
      });
      jsonArray = importedRows;

      const table = document.createElement("table");
      const headerRow = table.insertRow();
      headers.forEach((header) => {
        const cell = document.createElement("th");
        cell.textContent = header;
        headerRow.appendChild(cell);
      });

      importedRows.forEach((item) => {
        const tableRow = table.insertRow();
        headers.forEach((header) => {
          const cell = tableRow.insertCell();
          cell.textContent = item[header] ?? "";
        });
      });

      tableResult.replaceChildren(table);
    } catch (error) {
      jsonArray = [];
      tableResult.textContent = error.message;
      alert(error.message);
      return;
    }

    storeButtonIds.forEach((buttonId) => {
      const storeButton = document.getElementById(buttonId);
      if (storeButton) {
        storeButton.style.display = "block";
      } else {
        console.error("Button with ID '" + buttonId + "' not found.");
      }
    });
  };

  reader.readAsText(file);
}

function displayDataInTable(data, tableId) {
  const tableDiv = document.getElementById(tableId);
  if (!tableDiv) {
    console.error("Table target '" + tableId + "' not found.");
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    tableDiv.innerHTML = "<p>No data available.</p>";
    return;
  }

  const headers = Object.keys(data[0]);
  const table = document.createElement("table");
  const headerRow = table.insertRow();
  headers.forEach((header) => {
    const cell = document.createElement("th");
    cell.textContent = header;
    headerRow.appendChild(cell);
  });

  data.forEach((row) => {
    const tableRow = table.insertRow();
    headers.forEach((header) => {
      const cell = tableRow.insertCell();
      cell.textContent = row[header] ?? "";
    });
  });

  tableDiv.replaceChildren(table);
}
