import ast
import copy
import json

# import psycopg2
from tabulate import tabulate

# from Data import dfcourses, dfelectivecourses
# from LabAllocation import timetable, labtimetable

table = [
    ['M1', 'A11', 'F11', 'E12', 'D13', 'M3', 'A11', 'F11', 'E12', 'D13'],
    ['C14', 'B11', 'A12', 'F12', 'E13', 'C14', 'B11', 'A12', 'F12', 'E13'],
    ['D14', 'C11', 'B12', 'A13', 'F13', 'D14', 'C11', 'B12', 'A13', 'F13'],
    ['E14', 'D11', 'C12', 'B13', 'A14', 'E14', 'D11', 'C12', 'B13', 'A14'],
    ['M2', 'E11', 'D12', 'C13', 'B14', 'M4', 'E11', 'D12', 'C13', 'B14', ]
]

lab_table = [
    ['M1', 'BL11', 'BL12', 'CL11', 'CL12', 'N1', 'BL11', 'BL12', 'CL11', 'CL12'],
    ['M2', 'DL11', 'DL12', 'BL13', 'BL14', 'N2', 'DL11', 'DL12', 'BL13', 'BL14'],
    ['M3', 'EL11', 'EL12', 'DL13', 'DL14', 'N3', 'EL11', 'EL12', 'DL13', 'DL14'],
    ['M4', 'AL13', 'AL14', 'EL13', 'EL14', 'N4', 'AL13', 'AL14', 'EL13', 'EL14'],
    ['M5', 'AL12', 'AL12', 'FL13', 'FL14', 'N5', 'AL11', 'AL12', 'FL11', 'FL12']
]

fn_table = [
    ['M1', 'A11', 'F11', 'E12', 'D13'],
    ['C14', 'B11', 'A12', 'F12', 'E13'],
    ['D14', 'C11', 'B12', 'A13', 'F13'],
    ['E14', 'D11', 'C12', 'B13', 'A14'],
    ['M2', 'E11', 'D12', 'C13', 'B14']
]

an_table = [
    ['M3', 'A11', 'F11', 'E12', 'D13'],
    ['C14', 'B11', 'A12', 'F12', 'E13'],
    ['D14', 'C11', 'B12', 'A13', 'F13'],
    ['E14', 'D11', 'C12', 'B13', 'A14'],
    ['M4', 'E11', 'D12', 'C13', 'B14']
]

fn_table_copy = copy.deepcopy(fn_table)
an_table_copy = copy.deepcopy(an_table)

fn_lab_table = [
    ['M1', 'BL11', 'BL12', 'CL11', 'CL12'],
    ['M2', 'DL11', 'DL12', 'BL13', 'BL14'],
    ['M3', 'EL11', 'EL12', 'DL13', 'DL14'],
    ['M4', 'AL13', 'AL14', 'EL13', 'EL14'],
    ['M5', 'AL12', 'AL12', 'FL13', 'FL14']
]

an_lab_table = [
    ['N1', 'BL11', 'BL12', 'CL11', 'CL12'],
    ['N2', 'DL11', 'DL12', 'BL13', 'BL14'],
    ['N3', 'EL11', 'EL12', 'DL13', 'DL14'],
    ['N4', 'AL13', 'AL14', 'EL13', 'EL14'],
    ['N5', 'AL11', 'AL12', 'FL11', 'FL12']
]

fn_lab_table_copy = copy.deepcopy(fn_lab_table)
an_lab_table_copy = copy.deepcopy(an_lab_table)

FNLEC_ANLAB = [
    ['M1', 'A11', 'F11', 'E12', 'D13', 'N1', 'BL11', 'BL12', 'CL11', 'CL12'],
    ['C14', 'B11', 'A12', 'F12', 'E13', 'N1', 'DL11', 'DL12', 'BL13', 'BL14'],
    ['D14', 'C11', 'B12', 'A13', 'F13', 'N3', 'EL11', 'EL12', 'DL13', 'DL14'],
    ['E14', 'D11', 'C12', 'B13', 'A14', 'N4', 'AL13', 'AL14', 'EL13', 'EL14'],
    ['M2', 'E11', 'D12', 'C13', 'B14', 'N5', 'AL11', 'AL12', 'FL11', 'FL12']
]

FNLAB_ANLEC = [
    ['M1', 'BL11', 'BL12', 'CL11', 'CL12', 'M3', 'A11', 'F11', 'E12', 'D13'],
    ['M2', 'DL11', 'DL12', 'BL13', 'BL14', 'C14', 'B11', 'A12', 'F12', 'E13'],
    ['M3', 'EL11', 'EL12', 'DL13', 'DL14', 'D14', 'C11', 'B12', 'A13', 'F13'],
    ['M4', 'AL13', 'AL14', 'EL13', 'EL14', 'E14', 'D11', 'C12', 'B13', 'A14'],
    ['M5', 'AL11', 'AL12', 'FL11', 'FL12', 'M4', 'E11', 'D12', 'C13', 'B14']
]

FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)

headers = ["8.20-9.10", "9.10-10.00", "10.00-10.50", "11.00-11.50", "11.50-12.40", "12.40-1.30", "1.30-2.20",
           "2.30-3.20", "3.20-4.10", "4.10-5.00"]
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

fn_slots = ["8.20-9.10", "9.10-10.00", "10.00-10.50", "11.00-11.50", "11.50-12.40"]
an_slots = ["12.40-1.30", "1.30-2.20", "2.30-3.20", "3.20-4.10", "4.10-5.00"]

for i in range(len(table)):
    table[i].insert(0, days[i])

print(tabulate(table, headers))

course_lecture_hours = {}

# for course_detail in dfcourses:
#    course_lecture_hours[course_detail['course_code']] = course_detail['lecture_hours'] + course_detail[
#        'tutorial_hours']

# cursor = db_connection.cursor()

from TimeTableGenerator import teachers_timetable as timetable

print(timetable)
for teacher, batches in timetable.items():
    print(f"Timetable for Teacher {teacher}")
    for batch in batches:
        course = batch['course']
        session = batch['session']
        semester = batch['semester']
        print(f"Timetable for {batch['batch']}")
        if session == "fn":
            course_code = ""
            #                for electivecourse in dfelectivecourses:
            #                    if course['course_code'] in electivecourse['elective_name']:
            #                        course_code = electivecourse['course_code']
            #                        break
            #                lecture_hours = course_lecture_hours[course_code]
            lecture_hours = 1
            for i in FNLEC_ANLAB_copy:
                for j in range(1, len(i)):
                    if lecture_hours > 0 and j < 5:
                        i[j] = f"{course} ({teacher})"
                        lecture_hours -= 1
            for i in FNLEC_ANLAB_copy:
                for j in range(0, 1):
                    if lecture_hours > 0:
                        i[j] = f"{course} ({teacher})"
                        lecture_hours -= 1

            for i in range(len(FNLEC_ANLAB_copy)):
                day = days[i]
                values = (semester, batch, day) + tuple(FNLEC_ANLAB_copy[i])
                columns = ['semester', 'batch', 'day'] + [f'slot_{j}' for j in range(0, len(values) - 3)]
                placeholders = ','.join(['%s'] * len(values))
            #                    cursor.execute(f"INSERT INTO timetable ({','.join(columns)}) VALUES ({placeholders})", values)

            for i in range(len(FNLEC_ANLAB_copy)):
                FNLEC_ANLAB_copy[i].insert(0, days[i])
            print(tabulate(FNLEC_ANLAB_copy, headers=[f"{batch['batch']}/{teacher}/{session}"] + headers))
            FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
        else:
            course_code = ""
            #                for electivecourse in dfelectivecourses:
            #                    if course['course_code'] in electivecourse['elective_name']:
            #                        course_code = electivecourse['course_code']
            #                        break
            #             lecture_hours = course_lecture_hours[course_code]
            lecture_hours = 1
            for i in FNLAB_ANLEC_copy:
                for j in range(0, len(i)):
                    if lecture_hours > 0 and j > 5:
                        i[j] = f"{course} ({teacher})"
                        lecture_hours -= 1
            for i in FNLAB_ANLEC_copy:
                for j in range(5, 6):
                    if lecture_hours > 0:
                        i[j] = f"{course} ({teacher})"
                        lecture_hours -= 1
            for i in range(len(FNLAB_ANLEC_copy)):
                day = days[i]
                values = (semester, batch, day) + tuple(FNLAB_ANLEC_copy[i])
                columns = ['semester', 'batch', 'day'] + [f'slot_{j}' for j in range(0, len(values) - 3)]
                placeholders = ','.join(['%s'] * len(values))
            #                    cursor.execute(f"INSERT INTO timetable ({','.join(columns)}) VALUES ({placeholders})", values)

            for i in range(len(FNLAB_ANLEC_copy)):
                FNLAB_ANLEC_copy[i].insert(0, days[i])
            print(tabulate(FNLAB_ANLEC_copy, headers=[f"{batch['batch']}/{teacher}/{session}"] + headers))
            FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)
