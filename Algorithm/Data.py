import psycopg2
import psycopg2.extras
from db_config import get_db_config
conn = psycopg2.connect(**get_db_config())


def get_courses():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM Course")
        rows = cur.fetchall()
        dfcourses = [dict(row) for row in rows]
        return dfcourses
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []


dfcourses = get_courses()
#print(dfcourses)


def get_Course_Elective():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM Course_Elective")
        rows = cur.fetchall()
        dfelectivecourses = [dict(row) for row in rows]
        return dfelectivecourses
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []

dfelectivecourses = get_Course_Elective()

def get_teachers():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM Teacher")
        rows = cur.fetchall()
        dfteachers = [dict(row) for row in rows]
        return dfteachers
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []

dfteachers = get_teachers()
#print(dfteachers)
# teacherdetails = {}
# for teachers in dfteachers:
#     teacher_id = teachers['teacher_id']
#     teacher_name = teachers['teacher_name']
#     teacherdetails[teacher_id] = teacher_name
# print(teacherdetails)


def get_rooms():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM classroom")
        rows = cur.fetchall()
        dfrooms = [dict(row) for row in rows]
        return dfrooms
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []


dfrooms = get_rooms()
#print(dfrooms)


def get_batch():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM batch")
        rows = cur.fetchall()
        dfbatch = [dict(row) for row in rows]
        return dfbatch
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []


dfbatch = get_batch()
#print(dfbatch)


def get_course_teacher():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM courseteacher")
        rows = cur.fetchall()
        dfcourseteacher = [dict(row) for row in rows]
        return dfcourseteacher
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []


dfcourseteacher = get_course_teacher()
#print(dfcourseteacher)


def get_semester_course():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM semestercourses")
        rows = cur.fetchall()
        dfsemester_course = [dict(row) for row in rows]
        return dfsemester_course
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []


dfsemester_course = get_semester_course()
#print(dfsemester_course)

def Send_BatchCourseClassroom(batch, room, session, course, teacher, slot):
    try:
        conn = psycopg2.connect(**get_db_config())
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        Batch_Name = batch[2:]

        query = """INSERT INTO BatchCourseClassroom
                    (Semester, Batch_Name, Room_No, sessions, Course_Display_Name, Teacher_ID, Slot)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)"""

        # Executing the query with parameters
        cur.execute(query, (batch[0:2], Batch_Name, room, session, course, teacher, slot))
        conn.commit()
        conn.close()
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []

def get_batch_course_classroom():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM BatchCourseClassroom")
        rows = cur.fetchall()
        dfbatch_course_classroom = [dict(row) for row in rows]
        return dfbatch_course_classroom
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []

dfbatch_course_classroom = get_batch_course_classroom()
#print(dfbatch_course_classroom)

def get_timetable():
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT DISTINCT semester, batch FROM timetable")
        batches = cur.fetchall()
        timetable = []
        for semester, batch in batches:
            tables = {}
            cur.execute(
                """SELECT day, slot_0, slot_1, slot_2, slot_3, slot_4,
                          slot_5, slot_6, slot_7, slot_8, slot_9
                   FROM timetable WHERE semester = %s AND batch = %s
                   ORDER BY CASE day
                     WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2
                     WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4
                     WHEN 'Friday' THEN 5 ELSE 6 END""",
                (semester, batch),
            )
            rows1 = cur.fetchall()
            tables['data'] = rows1
            tables['semester'] = semester
            tables['batch'] = batch
            timetable.append(tables)
        return timetable
    except psycopg2.Error as e:
        print("Database query error:", e)
        return []

df_timetable = get_timetable()
