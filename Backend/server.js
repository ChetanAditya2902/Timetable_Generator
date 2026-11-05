// server.js
import express from "express";
import bodyParser from "body-parser";
import pgPromise from "pg-promise";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { spawn } from 'child_process';

const app = express();
const port = 3005;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Define the PostgreSQL database configuration
const pgp = pgPromise();
const db = pgp({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function cleanObject(obj) {
  const cleanedObj = {};
  Object.keys(obj).forEach(key => {
    const cleanKey = key.replace(/\r/g, ''); // Remove carriage return from keys
    const cleanValue = obj[key].replace(/\r/g, ''); // Remove carriage return from values
    cleanedObj[cleanKey] = cleanValue;
  });
  return cleanedObj;
}

// Test route to check if the database is connected
app.get("/testDatabaseConnection", async (req, res) => {
  try {
    const result = await db.one("SELECT $1 AS message", [
      "Database is connected",
    ]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    res.status(500).json({ error: "Database connection error" });
  }
});

// Route for inserting data into the database
app.post("/InsertCoursesData", async (req, res) => {
  try {
    var jsonArray = req.body;
    jsonArray = jsonArray.map(cleanObject);
    console.log(jsonArray);

    if (!jsonArray || jsonArray.length === 0) {
      throw new Error("JSON data is empty or undefined");
    }

    const tableExists = await db.oneOrNone("SELECT to_regclass('Course')");

    if (tableExists) {
      console.log("Table 'Course' exists. Inserting data into the existing table.");
    } else {
      console.log("Table 'Course' does not exist. Creating a new table.");

      // If the table does not exist, create a new table
      const columns = Object.keys(jsonArray[0]);
      columns.forEach((column, index) => {
        columns[index] = column.replace(/\s+/g, "_");
      });
      console.log(columns, "columns1");
      const query1 = `CREATE TABLE Course (${columns
        .map((column) => `"${column}" text`)
        .join(",")})`;
      const res = await db.none(query1);
      console.log(res, "table created1");
    }

    // Insert data into the existing or newly created "Course" table
    for (let i = 0; i < jsonArray.length; i++) {
      const jsonData = jsonArray[i];

      const values = Object.values(jsonData);
      console.log(values, "values");

      const query = `INSERT INTO Course VALUES (${values
        .map((value) => `'${value}'`)
        .join(",")})`;

      await db.none(query);
    }

    res.status(200).send("Data inserted into PostgreSQL");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error.message);
    res.status(500).send("Error inserting data into PostgreSQL");
  }
});

// Route for fetching data from the database
app.get("/ViewCoursesData", async (req, res) => {
  try {
    const data = await db.any("SELECT * FROM Course");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error.message);
    res.status(500).send("Error fetching data from PostgreSQL");
  }
});

app.post("/InsertTeachersData", async (req, res) => {
  try {
    var jsonArray = req.body;
    jsonArray = jsonArray.map(cleanObject);
    console.log(jsonArray);

    if (!jsonArray || jsonArray.length === 0) {
      throw new Error("JSON data is empty or undefined");
    }

    const tableExists = await db.oneOrNone("SELECT to_regclass('Teacher')");

    if (tableExists) {
      console.log("Table 'Teacher' exists. Inserting data into the existing table.");
    } else {
      console.log("Table 'Teacher' does not exist. Creating a new table.");

      // If the table does not exist, create a new table
      const columns = Object.keys(jsonArray[0]);
      columns.forEach((column, index) => {
        columns[index] = column.replace(/\s+/g, "_");
      });
      console.log(columns, "columns1");
      const query1 = `CREATE TABLE Teacher (${columns
        .map((column) => `"${column}" text`)
        .join(",")})`;
      const res = await db.none(query1);
      console.log(res, "table created1");
    }

    // Insert data into the existing or newly created "Course" table
    for (let i = 0; i < jsonArray.length; i++) {
      const jsonData = jsonArray[i];

      const values = Object.values(jsonData);
      console.log(values, "values");

      const query = `INSERT INTO Teacher VALUES (${values
        .map((value) => `'${value}'`)
        .join(",")})`;

      await db.none(query);
    }

    res.status(200).send("Data inserted into PostgreSQL");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error.message);
    res.status(500).send("Error inserting data into PostgreSQL");
  }
});

// Route for fetching data from the database
app.get("/ViewTeachersData", async (req, res) => {
  try {
    const data = await db.any("SELECT * FROM Teacher");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error.message);
    res.status(500).send("Error fetching data from PostgreSQL");
  }
});

app.post("/InsertRoomsData", async (req, res) => {
  try {
    var jsonArray = req.body;
    jsonArray = jsonArray.map(cleanObject);
    console.log(jsonArray);

    if (!jsonArray || jsonArray.length === 0) {
      throw new Error("JSON data is empty or undefined");
    }

    const tableExists = await db.oneOrNone("SELECT to_regclass('Classroom')");

    if (tableExists) {
      console.log("Table 'Classroom' exists. Inserting data into the existing table.");
    } else {
      console.log("Table 'Classroom' does not exist. Creating a new table.");

      // If the table does not exist, create a new table
      const columns = Object.keys(jsonArray[0]);
      columns.forEach((column, index) => {
        columns[index] = column.replace(/\s+/g, "_");
      });
      console.log(columns, "columns1");
      const query1 = `CREATE TABLE Classroom (${columns
        .map((column) => `"${column}" text`)
        .join(",")})`;
      const res = await db.none(query1);
      console.log(res, "table created1");
    }

    // Insert data into the existing or newly created "Course" table
    for (let i = 0; i < jsonArray.length; i++) {
      const jsonData = jsonArray[i];

      const values = Object.values(jsonData);
      console.log(values, "values");

      const query = `INSERT INTO Classroom VALUES (${values
        .map((value) => `'${value}'`)
        .join(",")})`;

      await db.none(query);
    }

    res.status(200).send("Data inserted into PostgreSQL");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error.message);
    res.status(500).send("Error inserting data into PostgreSQL");
  }
});

// Route for fetching data from the database
app.get("/ViewRoomsData", async (req, res) => {
  try {
    const data = await db.any("SELECT * FROM Classroom");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error.message);
    res.status(500).send("Error fetching data from PostgreSQL");
  }
});

app.post("/InsertBatchData", async (req, res) => {
  try {
    var jsonArray = req.body;
    jsonArray = jsonArray.map(cleanObject);
    console.log(jsonArray);

    if (!jsonArray || jsonArray.length === 0) {
      throw new Error("JSON data is empty or undefined");
    }

    const tableExists = await db.oneOrNone("SELECT to_regclass('Batch')");

    if (tableExists) {
      console.log("Table 'Batch' exists. Inserting data into the existing table.");
    } else {
      console.log("Table 'Batch' does not exist. Creating a new table.");

      // If the table does not exist, create a new table
      const columns = Object.keys(jsonArray[0]);
      columns.forEach((column, index) => {
        columns[index] = column.replace(/\s+/g, "_");
      });
      console.log(columns, "columns1");
      const query1 = `CREATE TABLE Batch (${columns
        .map((column) => `"${column}" text`)
        .join(",")})`;
      const res = await db.none(query1);
      console.log(res, "table created1");
    }

    // Insert data into the existing or newly created "Course" table
    for (let i = 0; i < jsonArray.length; i++) {
      const jsonData = jsonArray[i];

      const values = Object.values(jsonData);
      console.log(values, "values");

      const query = `INSERT INTO Batch VALUES (${values
        .map((value) => `'${value}'`)
        .join(",")})`;

      await db.none(query);
    }

    res.status(200).send("Data inserted into PostgreSQL");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error.message);
    res.status(500).send("Error inserting data into PostgreSQL");
  }
});

// Route for fetching data from the database
app.get("/ViewBatchData", async (req, res) => {
  try {
    const data = await db.any("SELECT * FROM Batch");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error.message);
    res.status(500).send("Error fetching data from PostgreSQL");
  }
});

app.post("/InsertCourseTeacherData", async (req, res) => {
  try {
    var jsonArray = req.body;
    jsonArray = jsonArray.map(cleanObject);
    console.log(jsonArray);

    if (!jsonArray || jsonArray.length === 0) {
      throw new Error("JSON data is empty or undefined");
    }

    const tableExists = await db.oneOrNone("SELECT to_regclass('CourseTeacher')");

    if (tableExists) {
      console.log("Table 'CourseTeacher' exists. Inserting data into the existing table.");
    } else {
      console.log("Table 'CourseTeacher' does not exist. Creating a new table.");

      // If the table does not exist, create a new table
      const columns = Object.keys(jsonArray[0]);
      columns.forEach((column, index) => {
        columns[index] = column.replace(/\s+/g, "_");
      });
      console.log(columns, "columns1");
      const query1 = `CREATE TABLE CourseTeacher (${columns
        .map((column) => `"${column}" text`)
        .join(",")})`;
      const res = await db.none(query1);
      console.log(res, "table created1");
    }

    // Insert data into the existing or newly created "Course" table
    for (let i = 0; i < jsonArray.length; i++) {
      const jsonData = jsonArray[i];

      const values = Object.values(jsonData);
      console.log(values, "values");

      const query = `INSERT INTO CourseTeacher VALUES (${values
        .map((value) => `'${value}'`)
        .join(",")})`;

      await db.none(query);
    }

    res.status(200).send("Data inserted into PostgreSQL");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error.message);
    res.status(500).send("Error inserting data into PostgreSQL");
  }
});

// Route for fetching data from the database
app.get("/ViewCourseTeacherData", async (req, res) => {
  try {
    const data = await db.any("SELECT * FROM CourseTeacher");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error.message);
    res.status(500).send("Error fetching data from PostgreSQL");
  }
});

app.post("/InsertSemesterCoursesData", async (req, res) => {
  try {
    var jsonArray = req.body;
    jsonArray = jsonArray.map(cleanObject);
    console.log(jsonArray);

    if (!jsonArray || jsonArray.length === 0) {
      throw new Error("JSON data is empty or undefined");
    }

    const tableExists = await db.oneOrNone("SELECT to_regclass('SemesterCourses')");

    if (tableExists) {
      console.log("Table 'SemesterCourses' exists. Inserting data into the existing table.");
    } else {
      console.log("Table 'SemesterCourses' does not exist. Creating a new table.");

      // If the table does not exist, create a new table
      const columns = Object.keys(jsonArray[0]);
      columns.forEach((column, index) => {
        columns[index] = column.replace(/\s+/g, "_");
      });
      console.log(columns, "columns1");
      const query1 = `CREATE TABLE SemesterCourses (${columns
        .map((column) => `"${column}" text`)
        .join(",")})`;
      const res = await db.none(query1);
      console.log(res, "table created1");
    }

    // Insert data into the existing or newly created "Course" table
    for (let i = 0; i < jsonArray.length; i++) {
      const jsonData = jsonArray[i];

      const values = Object.values(jsonData);
      console.log(values, "values");

      const query = `INSERT INTO SemesterCourses VALUES (${values
        .map((value) => `'${value}'`)
        .join(",")})`;

      await db.none(query);
    }

    res.status(200).send("Data inserted into PostgreSQL");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error.message);
    res.status(500).send("Error inserting data into PostgreSQL");
  }
});

// Route for fetching data from the database
app.get("/ViewSemesterCoursesData", async (req, res) => {
  try {
    const data = await db.any("SELECT * FROM SemesterCourses");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error.message);
    res.status(500).send("Error fetching data from PostgreSQL");
  }
});

// Textfield inserting of data into the database
app.post('/addCourse', async (req, res) => {
    try {
        const { category, code, name, electiveName, lectureHours, tutorialHours, practicalHours } = req.body;
        const query = `
            INSERT INTO Course (Category, Course_Code, Course_Name, Elective_Name, Lecture_Hours, Tutorial_Hours, Practical_Hours)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        await db.none(query, [category, code, name, electiveName, lectureHours, tutorialHours, practicalHours]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error adding course:", error);
        res.sendStatus(500);
    }
});

app.put('/updateCourse', async (req, res) => {
    try {
        const { category, code, name, electiveName, lectureHours, tutorialHours, practicalHours } = req.body;
        const query = `
            UPDATE Course
            SET Category = $1, Course_Name = $2, Elective_Name = $3, Lecture_Hours = $4, Tutorial_Hours = $5, Practical_Hours = $6
            WHERE Course_Code = $7;
        `;
        await db.none(query, [category, name, electiveName, lectureHours, tutorialHours, practicalHours, code]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error updating course:", error);
        res.sendStatus(500);
    }
});

app.delete('/deleteCourse', async (req, res) => {
    try {
        const { code } = req.body;
        console.log("Deleting course with code:", code); // Log the course code
        const query = `
            DELETE FROM Course
            WHERE Course_Code = $1;
        `;
        await db.none(query, [code]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting course:", error);
        res.sendStatus(500);
    }
});

app.post('/addTeacher', async (req, res) => {
    try {
        const { teacherId, teacherName } = req.body;
        const query = `
            INSERT INTO Teacher (Teacher_ID, Teacher_Name)
            VALUES ($1, $2);
        `;
        await db.none(query, [teacherId, teacherName]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error adding teacher:", error);
        res.sendStatus(500);
    }
});

app.put('/updateTeacher', async (req, res) => {
    try {
        const { teacherId, teacherName } = req.body;
        const query = `
            UPDATE Teacher
            SET Teacher_Name = $1
            WHERE Teacher_ID = $2;
        `;
        await db.none(query, [teacherName, teacherId]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error updating teacher:", error);
        res.sendStatus(500);
    }
});

app.delete('/deleteTeacher', async (req, res) => {
    try {
        const { teacherId } = req.body;
        console.log("Deleting teacher with ID:", teacherId); // Log the teacher ID
        const query = `
            DELETE FROM Teacher
            WHERE Teacher_ID = $1;
        `;
        await db.none(query, [teacherId]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting teacher:", error);
        res.sendStatus(500);
    }
});

app.post('/addRoom', async (req, res) => {
    try {
        const { roomNo, roomCapacity } = req.body;
        const query = `
            INSERT INTO Classroom (Room_No, Room_Capacity)
            VALUES ($1, $2);
        `;
        await db.none(query, [roomNo, roomCapacity]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error adding room:", error);
        res.sendStatus(500);
    }
});

app.put('/updateRoom', async (req, res) => {
    try {
        const { roomNo, roomCapacity } = req.body;
        const query = `
            UPDATE Classroom
            SET Room_Capacity = $2
            WHERE Room_No = $1;
        `;
        await db.none(query, [roomNo, roomCapacity]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error updating room:", error);
        res.sendStatus(500);
    }
});

app.delete('/deleteRoom', async (req, res) => {
    try {
        const { roomNo } = req.body;
        console.log("Deleting room with ID:", roomNo); // Log the room ID
        const query = `
            DELETE FROM Classroom
            WHERE Room_No = $1;
        `;
        await db.none(query, [roomNo]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting room:", error);
        res.sendStatus(500);
    }
});

app.post('/addBatch', async (req, res) => {
    try {
        const { Semester, batchName, branchName, batchSize } = req.body;
        const query = `
            INSERT INTO Batch (Semester, Batch_Name, Branch_Name, Batch_Size)
            VALUES ($1, $2, $3, $4);
        `;
        await db.none(query, [Semester, batchName, branchName, batchSize]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error adding batch:", error);
        res.sendStatus(500);
    }
});

app.put('/updateBatch', async (req, res) => {
    try {
        const { Semester, batchName, branchName, batchSize } = req.body;
        const query = `
            UPDATE Batch
            SET Branch_Name = $3, Batch_Size = $4
            WHERE Semester = $1 AND Batch_Name = $2;
        `;
        await db.none(query, [Semester, batchName, branchName, batchSize]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error updating batch:", error);
        res.sendStatus(500);
    }
});

app.delete('/deleteBatch', async (req, res) => {
    try {
        const { Semester, batchName } = req.body;
        console.log("Deleting batch:", Semester, batchName); // Log the batch details
        const query = `
            DELETE FROM Batch
            WHERE Semester = $1 AND Batch_Name = $2;
        `;
        await db.none(query, [Semester, batchName]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting batch:", error);
        res.sendStatus(500);
    }
});

app.post('/addCourseTeacher', async (req, res) => {
    try {
        const { CourseCode, TeacherID } = req.body;
        const query = `
            INSERT INTO CourseTeacher (Course_Code, Teacher_ID)
            VALUES ($1, $2);
        `;
        await db.none(query, [CourseCode, TeacherID]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error adding course teacher:", error);
        res.sendStatus(500);
    }
});


app.delete('/deleteCourseTeacher', async (req, res) => {
    try {
        const { CourseCode, TeacherID } = req.body;
        console.log("Deleting course teacher with code:", CourseCode); // Log the course code
        const query = `
            DELETE FROM CourseTeacher
            WHERE Course_Code = $1 AND Teacher_ID = $2;
        `;
        await db.none(query, [CourseCode, TeacherID]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting course teacher:", error);
        res.sendStatus(500);
    }
});


//app.get("/generate-timetable", (req, res) => {
//  const pythonProcess = spawn('python', ['C:/Users/cheta/Downloads/tt/Algorithm/PrintTimetable.py']);
//
//  pythonProcess.stdout.on('data', (data) => {
//    // Assuming the Python script outputs HTML for the timetable
//    res.send(data.toString());
//  });
//
//  pythonProcess.stderr.on('data', (data) => {
//    console.error(`Python script error: ${data}`);
//    res.status(500).send("An error occurred while generating the timetable.");
//  });
//});

app.get("/generate-timetable", (req, res) => {
  const pythonProcess = spawn('python', ['C:/Users/cheta/Downloads/tt/Algorithm/PrintTimetable.py']);

  let responseData = '';

  pythonProcess.stdout.on('data', (data) => {
    responseData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
    res.status(500).send("An error occurred while generating the timetable.");
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.send(responseData);
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
