// JavaScript to handle file input and display CSV content

async function StoreTeachersData() {
  await storeUploadedCsv("/InsertTeachersData", "StoreTeachersButton");
}
bindClickIfPresent("StoreTeachersButton", StoreTeachersData);

async function ViewTeachersData() {
    try {
        const response = await fetch(`${API_BASE_URL}/ViewTeachersData`);
        const data = await response.json();

        if (response.ok) {
        console.log("Data received from server successfully.");
        displayDataInTable(data, 'ViewTeachersTable');
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
bindClickIfPresent("ViewTeachersButton", ViewTeachersData);

function clearInputFields() {
    document.getElementById("teacherId").value = "";
    document.getElementById("teacherName").value = "";
}

async function addTeacher() {
    try {
        const teacherId = document.getElementById("teacherId").value;
        const teacherName = document.getElementById("teacherName").value;

        const response = await fetch(`${API_BASE_URL}/addTeacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teacherId,
                teacherName
            }),
        });

        if (response.ok) {
            console.log("Teacher added successfully.");
            clearInputFields();
        } else {
            console.error("Error adding teacher:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error adding teacher:", error);
    }
}

async function updateTeacher() {
    try {
        const teacherId = document.getElementById("teacherId").value;
        const teacherName = document.getElementById("teacherName").value;

        const response = await fetch(`${API_BASE_URL}/updateTeacher`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teacherId,
                teacherName
            }),
        });

        if (response.ok) {
            console.log("Teacher updated successfully.");
            clearInputFields();
        } else {
            console.error("Error updating teacher:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error updating teacher:", error);
    }
}

async function deleteTeacher() {
    try {
        const teacherId = document.getElementById("teacherId").value;

        const response = await fetch(`${API_BASE_URL}/deleteTeacher`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teacherId
            }),
        });

        if (response.ok) {
            console.log("Teacher deleted successfully.");
            clearInputFields();
        } else {
            console.error("Error deleting teacher:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error deleting teacher:", error);
    }
}
