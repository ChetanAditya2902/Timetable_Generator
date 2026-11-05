const FIELD_ALIASES = {
  category: ["category"],
  course_code: ["coursecode", "code"],
  course_name: ["coursename", "name"],
  elective_name: ["electivename"],
  lecture_hours: ["lecturehours", "lecture", "l"],
  tutorial_hours: ["tutorialhours", "tutorial", "t"],
  practical_hours: ["practicalhours", "practical", "p"],
  teacher_id: ["teacherid"],
  teacher_name: ["teachername"],
  room_no: ["roomno", "roomnumber"],
  room_capacity: ["roomcapacity", "capacity"],
  semester: ["semester"],
  batch_name: ["batchname"],
  branch_name: ["branchname"],
  batch_size: ["batchsize"],
};

const RESOURCE_FIELDS = {
  courses: {
    required: ["category", "course_code", "course_name", "lecture_hours", "tutorial_hours", "practical_hours"],
    optional: ["elective_name"],
    integerFields: ["lecture_hours", "tutorial_hours", "practical_hours"],
    maxLengths: { category: 255, course_code: 10, course_name: 255, elective_name: 255 },
  },
  teachers: {
    required: ["teacher_id", "teacher_name"],
    optional: [],
    integerFields: ["teacher_id"],
    maxLengths: { teacher_name: 255 },
  },
  rooms: {
    required: ["room_no", "room_capacity"],
    optional: [],
    integerFields: ["room_capacity"],
    maxLengths: { room_no: 10 },
  },
  batches: {
    required: ["semester", "batch_name", "branch_name", "batch_size"],
    optional: [],
    integerFields: ["batch_size"],
    maxLengths: { semester: 2, batch_name: 255, branch_name: 255 },
  },
  courseTeachers: {
    required: ["course_code", "teacher_id"],
    optional: [],
    integerFields: ["teacher_id"],
    maxLengths: { course_code: 10 },
  },
  semesterCourses: {
    required: ["semester", "branch_name", "course_code"],
    optional: [],
    integerFields: [],
    maxLengths: { semester: 2, branch_name: 255, course_code: 10 },
  },
};

function normalizeHeader(header) {
  return String(header).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function fieldValue(row, field) {
  const aliases = FIELD_ALIASES[field];
  const rowHeaders = new Map(
    Object.entries(row).map(([header, value]) => [normalizeHeader(header), value]),
  );

  for (const alias of aliases) {
    if (rowHeaders.has(alias)) {
      return rowHeaders.get(alias);
    }
  }

  return undefined;
}

function parseInteger(value, field, rowNumber) {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 2147483647
  ) {
    return value;
  }

  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text) || Number(text) > 2147483647) {
    throw new Error(`Row ${rowNumber}: ${field.replace(/_/g, " ")} must be a valid non-negative 32-bit integer.`);
  }

  return Number(text);
}

export function prepareImportRows(resource, input) {
  const schema = RESOURCE_FIELDS[resource];
  if (!schema) {
    throw new Error("Unsupported CSV import type.");
  }
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("Choose a CSV file containing at least one data row.");
  }

  return input.map((row, index) => {
    const rowNumber = index + 2;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new Error(`Row ${rowNumber}: expected a CSV data row.`);
    }

    const result = {};
    for (const field of [...schema.required, ...schema.optional]) {
      const value = fieldValue(row, field);
      if (schema.required.includes(field) && (value === undefined || String(value).trim() === "")) {
        throw new Error(`Row ${rowNumber}: ${field.replace(/_/g, " ")} is required.`);
      }

      if (schema.optional.includes(field) && value === undefined) {
        continue;
      }

      if (schema.integerFields.includes(field)) {
        result[field] = parseInteger(value, field, rowNumber);
      } else {
        const text = String(value ?? "").trim();
        if (text.length > (schema.maxLengths[field] || Infinity)) {
          throw new Error(`Row ${rowNumber}: ${field.replace(/_/g, " ")} exceeds the maximum length of ${schema.maxLengths[field]}.`);
        }
        result[field] = text;
      }
    }

    return result;
  });
}
