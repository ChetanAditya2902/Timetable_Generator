async function StoreSemesterCoursesData() {
  await storeUploadedCsv("/InsertSemesterCoursesData", "StoreSemesterCoursesButton");
}
bindClickIfPresent("StoreSemesterCoursesButton", StoreSemesterCoursesData);

// Display courses data
async function ViewSemesterCoursesData() {
    try {
        const response = await fetch(`${API_BASE_URL}/ViewSemesterCoursesData`);
        const data = await response.json();

        if (response.ok) {
        console.log("Data received from server successfully.");
        displayDataInTable(data, 'ViewSemesterCoursesTable');
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
bindClickIfPresent("ViewSemesterCoursesButton", ViewSemesterCoursesData);

function getSemesterCourseValues() {
    return {
        semester: document.getElementById("semester").value.trim(),
        branchName: document.getElementById("branchname").value.trim(),
        courseCode: document.getElementById("code").value.trim(),
    };
}

async function saveSemesterCourse(path, method, values) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status}).`);
    }
}

async function addSemesterCourse() {
    try {
        const values = getSemesterCourseValues();
        if (Object.values(values).some((value) => !value)) {
            throw new Error("Enter a semester, branch, and course code.");
        }
        await saveSemesterCourse("/addSemesterCourse", "POST", values);
        await ViewSemesterCoursesData();
    } catch (error) {
        console.error("Error adding semester course:", error);
        alert(error.message);
    }
}

async function updateSemesterCourse() {
    try {
        const values = getSemesterCourseValues();
        const previousCourseCode = document.getElementById("previousCourseCode").value.trim();
        if (Object.values(values).some((value) => !value) || !previousCourseCode) {
            throw new Error("Enter the semester, branch, current course code, and replacement course code.");
        }
        await saveSemesterCourse("/updateSemesterCourse", "PUT", { ...values, previousCourseCode });
        await ViewSemesterCoursesData();
    } catch (error) {
        console.error("Error updating semester course:", error);
        alert(error.message);
    }
}

async function deleteSemesterCourse() {
    try {
        const values = getSemesterCourseValues();
        if (Object.values(values).some((value) => !value)) {
            throw new Error("Enter a semester, branch, and course code.");
        }
        await saveSemesterCourse("/deleteSemesterCourse", "DELETE", values);
        await ViewSemesterCoursesData();
    } catch (error) {
        console.error("Error deleting semester course:", error);
        alert(error.message);
    }
}
