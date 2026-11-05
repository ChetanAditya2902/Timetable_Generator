async function StoreRoomsData() {
  await storeUploadedCsv("/InsertRoomsData", "StoreRoomsButton");
}
bindClickIfPresent("StoreRoomsButton", StoreRoomsData);

async function ViewRoomsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/ViewRoomsData`);
        const data = await response.json();

        if (response.ok) {
        console.log("Data received from server successfully.");
        displayDataInTable(data, 'ViewRoomsTable');
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
bindClickIfPresent("ViewRoomsButton", ViewRoomsData);

async function addRooms() {
    try {
        const roomNo = document.getElementById("roomNo").value;
        const roomCapacity = document.getElementById("roomCapacity").value;

        const response = await fetch(`${API_BASE_URL}/addRoom`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roomNo,
                roomCapacity
            }),
        });

        if (response.ok) {
            console.log("Room added successfully.");
        } else {
            console.error(
                "Error adding room:",
                response.status,
                response.statusText
            );
        }
    } catch (error) {
        console.error("Error adding room:", error);
    }
}

async function updateRooms() {
    try {
        const roomNo = document.getElementById("roomNo").value;
        const roomCapacity = document.getElementById("roomCapacity").value;

        const response = await fetch(`${API_BASE_URL}/updateRoom`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roomNo,
                roomCapacity
            }),
        });

        if (response.ok) {
            console.log("Room updated successfully.");
        } else {
            console.error(
                "Error updating room:",
                response.status,
                response.statusText
            );
        }
    } catch (error) {
        console.error("Error updating room:", error);
    }
}

async function deleteRooms() {
    try {
        const roomNo = document.getElementById("roomNo").value;

        const response = await fetch(`${API_BASE_URL}/deleteRoom`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roomNo
            }),
        });

        if (response.ok) {
            console.log("Room deleted successfully.");
        } else {
            console.error(
                "Error deleting room:",
                response.status,
                response.statusText
            );
        }
    } catch (error) {
        console.error("Error deleting room:", error);
    }
}