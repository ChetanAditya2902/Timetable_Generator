// JavaScript to handle file input and display CSV content

let jsonArray = [];
const selectedCsvFiles = new Map();
const csvPreviewVersions = new Map();

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

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function renderFileSelection(inputId, files) {
  const selection = document.getElementById(`${inputId}Selection`);
  if (!selection) {
    return;
  }

  selection.replaceChildren();
  if (!files.length) {
    return;
  }

  const list = document.createElement("ul");
  list.className = "selected-file-list";
  files.forEach((file) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.className = "selected-file-name";
    name.textContent = file.name;
    name.title = file.name;
    const size = document.createElement("small");
    size.textContent = formatFileSize(file.size);
    item.append(name, size);
    list.appendChild(item);
  });

  const summary = document.createElement("div");
  summary.className = "file-selection-summary";
  const count = document.createElement("span");
  count.textContent = `${files.length} file${files.length === 1 ? "" : "s"} selected`;
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "clear-files-button";
  clearButton.textContent = "Clear";
  clearButton.addEventListener("click", () => clearCsvSelection(inputId));
  summary.append(count, clearButton);
  selection.append(summary, list);
}

function resetCsvPreview(inputId) {
  csvPreviewVersions.set(inputId, (csvPreviewVersions.get(inputId) || 0) + 1);
  jsonArray = [];
  const input = document.getElementById(inputId);
  const preview = document.getElementById(input?.dataset.previewTarget);
  if (preview) {
    preview.replaceChildren();
  }

  const buttonIds = (input?.dataset.storeButtons || "").split(",").filter(Boolean);
  buttonIds.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.hidden = true;
    }
    const status = document.getElementById(`${buttonId}Status`);
    if (status) {
      status.textContent = "";
      delete status.dataset.state;
    }
  });
}

function updateSelectedCsvFiles(inputId, files) {
  const allFiles = Array.from(files);
  const csvFiles = allFiles.filter((file) => file.name.toLowerCase().endsWith(".csv"));
  selectedCsvFiles.set(inputId, csvFiles);
  renderFileSelection(inputId, csvFiles);
  resetCsvPreview(inputId);

  if (allFiles.length !== csvFiles.length) {
    const selection = document.getElementById(`${inputId}Selection`);
    const message = document.createElement("p");
    message.dataset.state = "error";
    message.textContent = "Only .csv files are supported; unsupported files were not selected.";
    selection?.appendChild(message);
  }
}

function clearCsvSelection(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
  }
  selectedCsvFiles.delete(inputId);
  renderFileSelection(inputId, []);
  resetCsvPreview(inputId);
}

function readCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsText(file);
  });
}

document.querySelectorAll(".csv-file-input").forEach((input) => {
  input.dataset.previewTarget = input.closest(".form-section")?.querySelector(".csv-display-table")?.id || "";
  input.addEventListener("change", () => updateSelectedCsvFiles(input.id, input.files));

  const dropZone = input.parentElement.querySelector(".file-drop-zone");
  if (dropZone) {
    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.remove("is-dragover");
      });
    });
    dropZone.addEventListener("drop", (event) => {
      updateSelectedCsvFiles(input.id, event.dataTransfer.files);
    });
  }
});

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

async function convertCSVtoJSON(inputId, tableId, storeButtonIds) {
  const fileInput = document.getElementById(inputId);
  const tableResult = document.getElementById(tableId);

  if (!fileInput || !tableResult) {
    console.error("CSV upload controls not found on this page.");
    return;
  }

  jsonArray = [];
  const previewVersion = (csvPreviewVersions.get(inputId) || 0) + 1;
  csvPreviewVersions.set(inputId, previewVersion);
  storeButtonIds.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.hidden = true;
    }
  });

  const files = selectedCsvFiles.get(inputId) || Array.from(fileInput.files);
  if (!files.length) {
    tableResult.textContent = "Choose one or more CSV files to preview.";
    return;
  }

  tableResult.textContent = `Reading ${files.length} file${files.length === 1 ? "" : "s"}…`;

  try {
    const previews = await Promise.all(files.map(async (file) => {
      const rows = parseCSV(await readCsvFile(file));
      if (rows.length < 2) {
        throw new Error(`${file.name}: file is empty or missing data.`);
      }

      const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
      if (headers.some((header) => !header)) {
        throw new Error(`${file.name}: every CSV column must have a header.`);
      }
      const uniqueHeaders = new Set(headers.map((header) => header.toLowerCase()));
      if (uniqueHeaders.size !== headers.length) {
        throw new Error(`${file.name}: column headers must be unique.`);
      }

      const importedRows = rows.slice(1).map((currentLine, index) => {
        if (currentLine.length !== headers.length) {
          throw new Error(`${file.name}, row ${index + 2}: unexpected number of columns.`);
        }

        return Object.fromEntries(headers.map((header, columnIndex) => [header, currentLine[columnIndex]]));
      });
      return { fileName: file.name, headers, rows: importedRows };
    }));

    if (csvPreviewVersions.get(inputId) !== previewVersion) {
      return;
    }

    jsonArray = previews.flatMap((preview) => preview.rows);
    const fragment = document.createDocumentFragment();
    const summary = document.createElement("p");
    summary.className = "preview-summary";
    summary.textContent = `${previews.length} file${previews.length === 1 ? "" : "s"} · ${jsonArray.length} total rows ready to save`;
    fragment.appendChild(summary);

    previews.forEach(({ fileName, headers, rows }) => {
      const section = document.createElement("section");
      section.className = "csv-file-preview";
      const title = document.createElement("h3");
      title.textContent = fileName;
      const count = document.createElement("p");
      const previewRows = rows.slice(0, 20);
      count.textContent = rows.length > previewRows.length
        ? `${rows.length} rows · showing the first ${previewRows.length}`
        : `${rows.length} row${rows.length === 1 ? "" : "s"}`;
      section.append(title, count);

      const table = document.createElement("table");
      const headerRow = table.insertRow();
      headers.forEach((header) => {
        const cell = document.createElement("th");
        cell.textContent = header;
        headerRow.appendChild(cell);
      });
      previewRows.forEach((item) => {
        const tableRow = table.insertRow();
        headers.forEach((header) => {
          const cell = tableRow.insertCell();
          cell.textContent = item[header] ?? "";
        });
      });
      section.appendChild(table);
      fragment.appendChild(section);
    });

    tableResult.replaceChildren(fragment);
    storeButtonIds.forEach((buttonId) => {
      const storeButton = document.getElementById(buttonId);
      if (storeButton) {
        storeButton.hidden = false;
      }
    });
  } catch (error) {
    if (csvPreviewVersions.get(inputId) !== previewVersion) {
      return;
    }
    jsonArray = [];
    tableResult.textContent = error.message || "Could not read the selected CSV files.";
  }
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
