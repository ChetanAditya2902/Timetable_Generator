function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportTimetableCsv() {
  const container = document.getElementById("timetable-container");
  const tables = Array.from(container.querySelectorAll("table"));
  const status = document.getElementById("timetable-status");

  if (!tables.length) {
    status.textContent = "Generate a timetable before exporting.";
    status.dataset.state = "error";
    return;
  }

  const rows = [];
  tables.forEach((table, tableIndex) => {
    if (tableIndex > 0) {
      rows.push([]);
    }
    Array.from(table.rows).forEach((row) => {
      rows.push(Array.from(row.cells, (cell) => csvEscape(cell.textContent.trim())));
    });
  });

  const csv = rows.map((row) => row.join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `timetable-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = `Exported ${tables.length} timetable${tables.length === 1 ? "" : "s"} to CSV.`;
  delete status.dataset.state;
}

async function generateTimetable() {
  const container = document.getElementById("timetable-container");
  const status = document.getElementById("timetable-status");
  const generateButton = document.getElementById("GenerateTimetableButton");
  const exportButton = document.getElementById("ExportTimetableButton");
  generateButton.disabled = true;
  exportButton.hidden = true;
  exportButton.disabled = true;
  status.textContent = "Generating your timetable…";
  delete status.dataset.state;
  container.replaceChildren();

  try {
    const response = await fetch(`${API_BASE_URL}/generate-timetable`);
    const result = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(typeof result === "object" ? result.error : result);
    }

    container.innerHTML = result;
    const hasTimetable = container.querySelector("table") !== null;
    if (!hasTimetable) {
      throw new Error("The server returned no timetable to display.");
    }

    status.textContent = "Timetable generated. You can export all displayed schedules as CSV.";
    exportButton.hidden = false;
    exportButton.disabled = false;
  } catch (error) {
    console.error("Error generating timetable:", error);
    status.textContent = error.message || "Timetable generation failed.";
    status.dataset.state = "error";
  } finally {
    generateButton.disabled = false;
  }
}
