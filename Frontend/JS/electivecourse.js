async function StoreElectiveCoursesData() {
  try {
    const response = await fetch("http://localhost:3005/InsertElectiveCoursesData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonArray),
    });

    if (response.ok) {
      console.log("Data sent to server successfully.");
    } else {
      console.error(
        "Error sending data to server:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error sending data to server:", error);
  }
}
bindClickIfPresent("StoreElectiveCoursesButton", StoreElectiveCoursesData);

// Display courses data
async function ViewElectiveCoursesData() {
    try {
        const response = await fetch("http://localhost:3005/ViewElectiveCoursesData");
        const data = await response.json();

        if (response.ok) {
        console.log("Data received from server successfully.");
        displayDataInTable(data, 'ViewElectiveCoursesTable');
        } else {
        console.error(
            "Error receiving data from server:",
            response.status,
            response.statusText
        );
        }
    } catch (error) {
        console.error("Error receiving data from server:", error);
    }
}
bindClickIfPresent("ViewElectiveCoursesButton", ViewElectiveCoursesData);