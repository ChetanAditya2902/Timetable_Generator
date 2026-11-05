async function generateTimetable() {
  const container = document.getElementById("timetable-container");
  container.textContent = "Generating timetable…";

  try {
    const response = await fetch(`${API_BASE_URL}/generate-timetable`);
    const result = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(typeof result === "object" ? result.error : result);
    }

    container.innerHTML = result;
  } catch (error) {
    console.error("Error generating timetable:", error);
    container.textContent = error.message || "Timetable generation failed.";
  }
}