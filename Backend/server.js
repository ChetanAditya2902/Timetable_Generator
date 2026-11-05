// server.js
import express from "express";
import pgPromise from "pg-promise";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { prepareImportRows } from "./csv-import.js";

const app = express();
const port = Number(process.env.PORT || 3005);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, "../Frontend")));

const pgp = pgPromise();
const db = pgp({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "Timetable",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

app.get("/testDatabaseConnection", async (req, res) => {
  try {
    const result = await db.one("SELECT $1 AS message", ["Database is connected"]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    res.status(500).json({ error: "Database connection error" });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await db.one("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

const csvImportConfig = [
  { resource: "courses", route: "/InsertCoursesData", viewRoute: "/ViewCoursesData", select: "SELECT * FROM Course" },
  { resource: "teachers", route: "/InsertTeachersData", viewRoute: "/ViewTeachersData", select: "SELECT * FROM Teacher" },
  { resource: "rooms", route: "/InsertRoomsData", viewRoute: "/ViewRoomsData", select: "SELECT * FROM Classroom" },
  { resource: "batches", route: "/InsertBatchData", viewRoute: "/ViewBatchData", select: "SELECT * FROM Batch" },
  { resource: "courseTeachers", route: "/InsertCourseTeacherData", viewRoute: "/ViewCourseTeacherData", select: "SELECT * FROM CourseTeacher" },
  { resource: "semesterCourses", route: "/InsertSemesterCoursesData", viewRoute: "/ViewSemesterCoursesData", select: "SELECT * FROM SemesterCourses" },
];

async function mergeImportedRows(resource, rows) {
  await db.tx(async (transaction) => {
    for (const row of rows) {
      switch (resource) {
        case "courses":
          await transaction.none(
            `INSERT INTO Course
              (Category, Course_Code, Course_Name, Lecture_Hours, Tutorial_Hours, Practical_Hours)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (Course_Code) DO UPDATE SET
               Category = EXCLUDED.Category,
               Course_Name = EXCLUDED.Course_Name,
               Lecture_Hours = EXCLUDED.Lecture_Hours,
               Tutorial_Hours = EXCLUDED.Tutorial_Hours,
               Practical_Hours = EXCLUDED.Practical_Hours`,
            [row.category, row.course_code, row.course_name, row.lecture_hours, row.tutorial_hours, row.practical_hours],
          );
          if (Object.hasOwn(row, "elective_name")) {
            await transaction.none("DELETE FROM Course_Elective WHERE Course_Code = $1", [row.course_code]);
            if (row.elective_name) {
              await transaction.none(
                "INSERT INTO Course_Elective (Course_Code, Elective_Name) VALUES ($1, $2)",
                [row.course_code, row.elective_name],
              );
            }
          }
          break;
        case "teachers":
          await transaction.none(
            `INSERT INTO Teacher (Teacher_ID, Teacher_Name) VALUES ($1, $2)
             ON CONFLICT (Teacher_ID) DO UPDATE SET Teacher_Name = EXCLUDED.Teacher_Name`,
            [row.teacher_id, row.teacher_name],
          );
          break;
        case "rooms":
          await transaction.none(
            `INSERT INTO Classroom (Room_No, Room_Capacity) VALUES ($1, $2)
             ON CONFLICT (Room_No) DO UPDATE SET Room_Capacity = EXCLUDED.Room_Capacity`,
            [row.room_no, row.room_capacity],
          );
          break;
        case "batches":
          await transaction.none(
            `INSERT INTO Batch (Semester, Batch_Name, Branch_Name, Batch_Size) VALUES ($1, $2, $3, $4)
             ON CONFLICT (Semester, Batch_Name) DO UPDATE SET
               Branch_Name = EXCLUDED.Branch_Name,
               Batch_Size = EXCLUDED.Batch_Size`,
            [row.semester, row.batch_name, row.branch_name, row.batch_size],
          );
          break;
        case "courseTeachers":
          await transaction.none(
            `INSERT INTO CourseTeacher (Course_Code, Teacher_ID)
             SELECT $1, $2
             WHERE NOT EXISTS (
               SELECT 1 FROM CourseTeacher WHERE Course_Code = $1 AND Teacher_ID = $2
             )`,
            [row.course_code, row.teacher_id],
          );
          break;
        case "semesterCourses":
          await transaction.none(
            `INSERT INTO SemesterCourses (Semester, Branch_Name, Course_Code)
             SELECT $1, $2, $3
             WHERE NOT EXISTS (
               SELECT 1 FROM SemesterCourses
               WHERE Semester = $1 AND Branch_Name = $2 AND Course_Code = $3
             )`,
            [row.semester, row.branch_name, row.course_code],
          );
          break;
        default:
          throw new Error(`Unsupported import resource: ${resource}`);
      }
    }
  });
}

csvImportConfig.forEach(({ resource, route, viewRoute, select }) => {
  app.post(route, async (req, res) => {
    let rows;
    try {
      rows = prepareImportRows(resource, req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    try {
      await mergeImportedRows(resource, rows);
      return res.status(200).json({
        message: "CSV data imported successfully.",
        imported: rows.length,
      });
    } catch (error) {
      console.error(`Error importing ${resource}:`, error.message);
      return res.status(500).json({
        error: "Import failed. No rows from this upload were saved.",
        detail: error.message,
      });
    }
  });

  app.get(viewRoute, async (req, res) => {
    try {
      const data = await db.any(select);
      return res.status(200).json(data);
    } catch (error) {
      console.error(`Error fetching ${resource}:`, error.message);
      return res.status(500).json({ error: "Could not load data from the database." });
    }
  });
});

app.post("/addCourse", async (req, res) => {
  try {
    const { category, code, name, electiveName, lectureHours, tutorialHours, practicalHours } = req.body;
    await db.tx(async (transaction) => {
      await transaction.none(
        `INSERT INTO Course
          (Category, Course_Code, Course_Name, Lecture_Hours, Tutorial_Hours, Practical_Hours)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [category, code, name, lectureHours, tutorialHours, practicalHours],
      );
      if (electiveName) {
        await transaction.none(
          "INSERT INTO Course_Elective (Course_Code, Elective_Name) VALUES ($1, $2)",
          [code, electiveName],
        );
      }
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("Error adding course:", error);
    res.sendStatus(500);
  }
});

app.put("/updateCourse", async (req, res) => {
  try {
    const { category, code, name, electiveName, lectureHours, tutorialHours, practicalHours } = req.body;
    await db.tx(async (transaction) => {
      await transaction.none(
        `UPDATE Course
         SET Category = $1, Course_Name = $2, Lecture_Hours = $3, Tutorial_Hours = $4, Practical_Hours = $5
         WHERE Course_Code = $6`,
        [category, name, lectureHours, tutorialHours, practicalHours, code],
      );
      await transaction.none("DELETE FROM Course_Elective WHERE Course_Code = $1", [code]);
      if (electiveName) {
        await transaction.none(
          "INSERT INTO Course_Elective (Course_Code, Elective_Name) VALUES ($1, $2)",
          [code, electiveName],
        );
      }
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating course:", error);
    res.sendStatus(500);
  }
});

app.delete("/deleteCourse", async (req, res) => {
  try {
    const { code } = req.body;
    await db.tx(async (transaction) => {
      await transaction.none("DELETE FROM Course_Elective WHERE Course_Code = $1", [code]);
      await transaction.none("DELETE FROM CourseTeacher WHERE Course_Code = $1", [code]);
      await transaction.none("DELETE FROM SemesterCourses WHERE Course_Code = $1", [code]);
      await transaction.none("DELETE FROM Course WHERE Course_Code = $1", [code]);
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting course:", error);
    res.sendStatus(500);
  }
});

app.post("/addTeacher", async (req, res) => {
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

app.put("/updateTeacher", async (req, res) => {
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

app.delete("/deleteTeacher", async (req, res) => {
  try {
    const { teacherId } = req.body;
    const query = `DELETE FROM Teacher WHERE Teacher_ID = $1;`;
    await db.none(query, [teacherId]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.sendStatus(500);
  }
});

app.post("/addRoom", async (req, res) => {
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

app.put("/updateRoom", async (req, res) => {
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

app.delete("/deleteRoom", async (req, res) => {
  try {
    const { roomNo } = req.body;
    const query = `DELETE FROM Classroom WHERE Room_No = $1;`;
    await db.none(query, [roomNo]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting room:", error);
    res.sendStatus(500);
  }
});

app.post("/addBatch", async (req, res) => {
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

app.put("/updateBatch", async (req, res) => {
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

app.delete("/deleteBatch", async (req, res) => {
  try {
    const { Semester, batchName } = req.body;
    const query = `DELETE FROM Batch WHERE Semester = $1 AND Batch_Name = $2;`;
    await db.none(query, [Semester, batchName]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.sendStatus(500);
  }
});

app.post("/addCourseTeacher", async (req, res) => {
  try {
    const { CourseCode, TeacherID } = req.body;
    const query = `
      INSERT INTO CourseTeacher (Course_Code, Teacher_ID)
      SELECT $1, $2
      WHERE NOT EXISTS (
        SELECT 1 FROM CourseTeacher WHERE Course_Code = $1 AND Teacher_ID = $2
      );
    `;
    await db.none(query, [CourseCode, TeacherID]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error adding course teacher:", error);
    res.sendStatus(500);
  }
});

app.post("/addSemesterCourse", async (req, res) => {
  try {
    const { semester, branchName, courseCode } = req.body;
    await db.none(
      `INSERT INTO SemesterCourses (Semester, Branch_Name, Course_Code)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (
         SELECT 1 FROM SemesterCourses
         WHERE Semester = $1 AND Branch_Name = $2 AND Course_Code = $3
       )`,
      [semester, branchName, courseCode],
    );
    res.sendStatus(200);
  } catch (error) {
    console.error("Error adding semester course:", error);
    res.sendStatus(500);
  }
});

app.put("/updateSemesterCourse", async (req, res) => {
  try {
    const { semester, branchName, courseCode, previousCourseCode } = req.body;
    await db.none(
      `UPDATE SemesterCourses
       SET Course_Code = $1
       WHERE Semester = $2 AND Branch_Name = $3 AND Course_Code = $4`,
      [courseCode, semester, branchName, previousCourseCode],
    );
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating semester course:", error);
    res.sendStatus(500);
  }
});

app.delete("/deleteSemesterCourse", async (req, res) => {
  try {
    const { semester, branchName, courseCode } = req.body;
    await db.none(
      "DELETE FROM SemesterCourses WHERE Semester = $1 AND Branch_Name = $2 AND Course_Code = $3",
      [semester, branchName, courseCode],
    );
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting semester course:", error);
    res.sendStatus(500);
  }
});

app.delete("/deleteCourseTeacher", async (req, res) => {
  try {
    const { CourseCode, TeacherID } = req.body;
    const query = `DELETE FROM CourseTeacher WHERE Course_Code = $1 AND Teacher_ID = $2;`;
    await db.none(query, [CourseCode, TeacherID]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting course teacher:", error);
    res.sendStatus(500);
  }
});

function runPythonScript(scriptName, captureOutput = true) {
  const algorithmPath = path.resolve(__dirname, "../Algorithm");
  const scriptPath = path.join(algorithmPath, scriptName);
  const python = process.env.PYTHON_EXECUTABLE || "python";

  return new Promise((resolve, reject) => {
    const processHandle = spawn(python, [scriptPath], {
      cwd: algorithmPath,
      env: process.env,
    });
    let output = "";
    let errors = "";

    processHandle.stdout.on("data", (chunk) => {
      if (captureOutput) {
        output += chunk.toString();
      }
    });
    processHandle.stderr.on("data", (chunk) => {
      errors += chunk.toString();
    });
    processHandle.on("error", reject);
    processHandle.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(errors.trim() || `${scriptName} exited with code ${code}.`));
      }
    });
  });
}

let timetableGenerationInProgress = false;

app.get("/generate-timetable", async (req, res) => {
  if (timetableGenerationInProgress) {
    return res.status(409).json({ error: "Timetable generation is already in progress." });
  }

  timetableGenerationInProgress = true;
  try {
    await runPythonScript("Sendata.py", false);
    await runPythonScript("TimeTableGenerator.py", false);
    const timetableHtml = await runPythonScript("PrintTimetable.py");
    if (!timetableHtml.trim()) {
      return res.status(409).json({
        error: "No timetable was generated. Check that courses, rooms, batches, and course mappings are available.",
      });
    }
    res.type("html").send(timetableHtml);
  } catch (error) {
    console.error("Error generating timetable:", error.message);
    res.status(500).json({
      error: "Timetable generation failed. Check the database, Python dependencies, and server logs.",
    });
  } finally {
    timetableGenerationInProgress = false;
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../Frontend/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
