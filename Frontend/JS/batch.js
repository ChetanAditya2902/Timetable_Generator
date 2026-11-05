async function StoreCBatchData() {
  await storeUploadedCsv("/InsertBatchData", "StoreBatchButton");
}
bindClickIfPresent("StoreBatchButton", StoreCBatchData);

async function ViewBatchData() {
    try {
        const response = await fetch(`${API_BASE_URL}/ViewBatchData`);
        const data = await response.json();

        if (response.ok) {
        console.log("Data received from server successfully.");
        displayDataInTable(data, 'ViewBatchTable');
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
bindClickIfPresent("ViewBatchButton", ViewBatchData);

async function addBatch() {
    try {
        const Semester = document.getElementById("Semester").value;
        const batchName = document.getElementById("batchName").value;
        const branchName = document.getElementById("branchName").value;
        const batchSize = document.getElementById("batchSize").value;

        const response = await fetch(`${API_BASE_URL}/addBatch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Semester,
                batchName,
                branchName,
                batchSize
            }),
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

async function updateBatch() {
    try {
        const Semester = document.getElementById("Semester").value;
        const batchName = document.getElementById("batchName").value;
        const branchName = document.getElementById("branchName").value;
        const batchSize = document.getElementById("batchSize").value;

        const response = await fetch(`${API_BASE_URL}/updateBatch`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Semester,
                batchName,
                branchName,
                batchSize
            }),
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

async function deleteBatch() {
    try {
        const Semester = document.getElementById("Semester").value;
        const batchName = document.getElementById("batchName").value;

        const response = await fetch(`${API_BASE_URL}/deleteBatch`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Semester,
                batchName
            }),
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