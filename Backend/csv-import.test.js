import test from "node:test";
import assert from "node:assert/strict";
import { prepareImportRows } from "./csv-import.js";

test("maps the shipped course CSV columns to the database field names", () => {
  const rows = prepareImportRows("courses", [{
    Category: "SCI",
    Course_Code: "MATH101",
    Course_Name: "Calculus, I",
    Elective_Name: "Open Elective",
    L: "3",
    T: "0",
    P: "2",
  }]);

  assert.deepEqual(rows, [{
    category: "SCI",
    course_code: "MATH101",
    course_name: "Calculus, I",
    elective_name: "Open Elective",
    lecture_hours: 3,
    tutorial_hours: 0,
    practical_hours: 2,
  }]);
});

test("supports schema column names and trims optional elective values", () => {
  const rows = prepareImportRows("courses", [{
    Category: "CSE",
    Course_Code: "CSE101",
    Course_Name: "Algorithms",
    Lecture_Hours: "2",
    Tutorial_Hours: "1",
    Practical_Hours: "2",
  }]);

  assert.equal(rows[0].lecture_hours, 2);
  assert.equal(Object.hasOwn(rows[0], "elective_name"), false);
});

test("rejects incomplete or invalid numeric CSV rows before saving", () => {
  assert.throws(
    () => prepareImportRows("teachers", [{ Teacher_ID: "not-an-id", Teacher_Name: "Ada" }]),
    /teacher id must be a valid non-negative 32-bit integer/i,
  );
  assert.throws(
    () => prepareImportRows("rooms", [{ Room_No: "A101" }]),
    /room capacity is required/i,
  );
  assert.throws(
    () => prepareImportRows("courses", [{
      Category: "SCI",
      Course_Code: "COURSE-CODE-TOO-LONG",
      Course_Name: "Calculus",
      L: "2",
      T: "0",
      P: "1",
    }]),
    /course code exceeds the maximum length/i,
  );
});

test("maps the relationship CSV headers", () => {
  assert.deepEqual(
    prepareImportRows("semesterCourses", [{
      Semester: "S1",
      Branch_Name: "Computer Science",
      Course_Code: "CSE101",
    }]),
    [{ semester: "S1", branch_name: "Computer Science", course_code: "CSE101" }],
  );
});
