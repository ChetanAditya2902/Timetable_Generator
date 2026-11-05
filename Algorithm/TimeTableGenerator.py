import copy

import psycopg2
from tabulate import tabulate

from Data import dfcourses, dfelectivecourses
from db_config import get_db_config
from LabAllocation import timetable, labtimetable

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

for course_detail in dfcourses:
    course_lecture_hours[course_detail['course_code']] = course_detail['lecture_hours'] + course_detail[
        'tutorial_hours']

elective_slots = set()

for semester, batches in timetable.items():
    for batch, rooms in batches.items():
        for room, sessions in rooms.items():
            for session, courses in sessions.items():
                for course in courses:
                    if 'elective' in course['course_code'].lower():
                        if course['slot'] == "A":
                            elective_slots.add('BL11')
                            elective_slots.add('BL12')
                            elective_slots.add('DL11')
                            elective_slots.add('DL12')
                            elective_slots.add('DL13')
                            elective_slots.add('DL14')
                            elective_slots.add('EL13')
                            elective_slots.add('EL14')
                        elif course['slot'] == "B":
                            elective_slots.add('DL11')
                            elective_slots.add('DL12')
                            elective_slots.add('EL11')
                            elective_slots.add('EL12')
                            elective_slots.add('EL13')
                            elective_slots.add('EL14')
                            elective_slots.add('FL11')
                            elective_slots.add('FL12')
                        elif course['slot'] == "C":
                            elective_slots.add("EL11")
                            elective_slots.add("EL12")
                            elective_slots.add("AL13")
                            elective_slots.add("AL14")
                            elective_slots.add("FL11")
                            elective_slots.add("FL12")
                        elif course['slot'] == "D":
                            elective_slots.add("AL11")
                            elective_slots.add("AL12")
                            elective_slots.add("AL13")
                            elective_slots.add("AL14")
                            elective_slots.add("CL11")
                            elective_slots.add("CL12")
                        elif course['slot'] == "E":
                            elective_slots.add("BL13")
                            elective_slots.add("BL14")
                            elective_slots.add("CL11")
                            elective_slots.add("CL12")
                            elective_slots.add("AL11")
                            elective_slots.add("AL12")
                        elif course['slot'] == "F":
                            elective_slots.add("BL11")
                            elective_slots.add("BL12")
                            elective_slots.add("BL13")
                            elective_slots.add("BL14")
                            elective_slots.add("DL13")
                            elective_slots.add("DL14")

print("Elective Slots:", elective_slots)

alternative_slots = {}


def alternativeslots(alternative_slots):
    alternative_slots['A'] = ['CL11', 'CL12', 'CL13', 'CL14', 'FL11', 'FL12']
    alternative_slots['B'] = ['CL11', 'CL12', 'CL13', 'CL14']
    alternative_slots['C'] = ['DL11', 'DL12', 'DL13', 'DL14', 'BL11', 'BL12', 'BL13', 'BL14']
    alternative_slots['D'] = ['BL11', 'BL12', 'BL13', 'BL14', 'EL11', 'EL12', 'EL13', 'EL14']
    alternative_slots['E'] = ['DL11', 'DL12', 'DL13', 'DL14', 'FL11', 'FL12']
    alternative_slots['F'] = ['AL11', 'AL12', 'AL13', 'AL14', 'EL11', 'EL12', 'EL13', 'EL14']
    # remove elective slots from alternative slots
    for slot in elective_slots:
        for key, value in alternative_slots.items():
            if slot in value:
                value.remove(slot)
    print(alternative_slots)


alternativeslots(alternative_slots)

db_connection = psycopg2.connect(**get_db_config())
cursor = db_connection.cursor()
cursor.execute("DELETE FROM timetable")

print(timetable)
for semester, batches in timetable.items():
    print(f"Timetable for Semester {semester}")
    for batch, rooms in batches.items():
        for room, sessions in rooms.items():
            for session, courses in sessions.items():
                print(f"Timetable for {batch}")
                if session == "fn":
                    for course in courses:
                        course_code = ""
                        for electivecourse in dfelectivecourses:
                            if course['course_code'] in electivecourse['elective_name']:
                                course_code = electivecourse['course_code']
                                break
                        if course_code != "":
                            lecture_hours = course_lecture_hours[course_code]
                            print(course_code, lecture_hours)
                        else:
                            lecture_hours = course_lecture_hours[course['course_code']]
                            print(course['course_code'], lecture_hours)
                        for i in FNLEC_ANLAB_copy:
                            for j in range(1, len(i)):
                                print(course)
                                if i[j].startswith(course['slot']) and lecture_hours > 0 and j < 5:
                                    i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                    lecture_hours -= 1
                        for i in FNLEC_ANLAB_copy:
                            for j in range(0, 1):
                                if i[j].startswith(course['slot']) and lecture_hours > 0:
                                    i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                    lecture_hours -= 1

                    for i in range(len(FNLEC_ANLAB_copy)):
                        day = days[i]
                        values = (semester, batch, day) + tuple(FNLEC_ANLAB_copy[i])
                        columns = ['semester', 'batch', 'day'] + [f'slot_{j}' for j in range(0, len(values) - 3)]
                        placeholders = ','.join(['%s'] * len(values))
                        cursor.execute(f"INSERT INTO timetable ({','.join(columns)}) VALUES ({placeholders})", values)

                    for i in range(len(FNLEC_ANLAB_copy)):
                        FNLEC_ANLAB_copy[i].insert(0, days[i])
                    print(tabulate(FNLEC_ANLAB_copy, headers=[f'{batch}/{room}/{session}'] + headers))
                    FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
                else:
                    for course in courses:
                        course_code = ""
                        for electivecourse in dfelectivecourses:
                            if course['course_code'] in electivecourse['elective_name']:
                                course_code = electivecourse['course_code']
                                break
                        if course_code != "":
                            lecture_hours = course_lecture_hours[course_code]
                        else:
                            lecture_hours = course_lecture_hours[course['course_code']]
                        for i in FNLAB_ANLEC_copy:
                            for j in range(0, len(i)):
                                if i[j].startswith(course['slot']) and lecture_hours > 0 and j > 5:
                                    i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                    lecture_hours -= 1
                        for i in FNLAB_ANLEC_copy:
                            for j in range(5, 6):
                                if i[j].startswith(course['slot']) and lecture_hours > 0:
                                    i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                    lecture_hours -= 1
                    for i in range(len(FNLAB_ANLEC_copy)):
                        day = days[i]
                        values = (semester, batch, day) + tuple(FNLAB_ANLEC_copy[i])
                        columns = ['semester', 'batch', 'day'] + [f'slot_{j}' for j in range(0, len(values) - 3)]
                        placeholders = ','.join(['%s'] * len(values))
                        cursor.execute(f"INSERT INTO timetable ({','.join(columns)}) VALUES ({placeholders})", values)

                    for i in range(len(FNLAB_ANLEC_copy)):
                        FNLAB_ANLEC_copy[i].insert(0, days[i])
                    print(tabulate(FNLAB_ANLEC_copy, headers=[f'{batch}/{room}/{session}'] + headers))
                    FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)

print(labtimetable)
fn_allocate_lab_rooms = {}
an_allocate_lab_rooms = {}
for semester, batches in labtimetable.items():
    print(f"Timetable for Semester {semester}")
    for batch, rooms in batches.items():
        for room, sessions in rooms.items():
            for session, courses in sessions.items():
                print(f"Timetable for {batch}")
                if session == "an":
                    for course in courses:
                        is_allocated = False
                        for i in FNLEC_ANLAB_copy:
                            for j in range(6, len(i), 2):
                                alloc_slots = []
                                if room in fn_allocate_lab_rooms.keys():
                                    alloc_slots = fn_allocate_lab_rooms[room]
                                if i[j] not in alloc_slots and i[j + 1] not in alloc_slots:
                                    altslot = []
                                    if i[j] in elective_slots:
                                        altslot = alternative_slots[course['slot']]
                                        print("alternate", course['slot'], altslot)
                                    if i[j] not in elective_slots and (i[j].startswith(course['slot']) or len(altslot) != 0) and (j >= 5) and (not is_allocated):
                                        if room not in fn_allocate_lab_rooms.keys():
                                            fn_allocate_lab_rooms[room] = {}
                                            allocated_slots = []
                                            if i[j] not in elective_slots and i[j].startswith(course['slot']):
                                                allocated_slots.append(i[j])
                                                allocated_slots.append(i[j + 1])
                                            elif len(altslot) != 0 and altslot[0] not in elective_slots:
                                                allocated_slots.append(altslot[0])
                                                allocated_slots.append(altslot[1])
                                                altslot.pop(0)
                                                altslot.pop(0)
                                            fn_allocate_lab_rooms[room] = allocated_slots
                                        else:
                                            if room in fn_allocate_lab_rooms.keys():
                                                allocated_slots = fn_allocate_lab_rooms[room]
                                                if i[j] not in elective_slots and i[j].startswith(course['slot']):
                                                    allocated_slots.append(i[j])
                                                    allocated_slots.append(i[j + 1])
                                                elif len(altslot) != 0 and altslot[0] not in elective_slots:
                                                    allocated_slots.append(altslot[0])
                                                    allocated_slots.append(altslot[1])
                                                    altslot.pop(0)
                                                    altslot.pop(0)
                                                fn_allocate_lab_rooms[room] = allocated_slots

                                        i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                        i[j + 1] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                        is_allocated = True
                    for i in range(len(FNLEC_ANLAB_copy)):
                        day = days[i]
                        values = tuple(FNLEC_ANLAB_copy[i][6:])
                        for j in range(6, 10):
                            if not values[j - 6].startswith(('A', 'B', 'C', 'D', 'E', 'F')):
                                column = f"slot_{j} = '{values[j - 6]}'"
                                update_query = f"UPDATE timetable SET {column} WHERE semester='{semester}' AND batch='{batch}' AND day='{day}'"
                                cursor.execute(update_query)
                    for i in range(len(FNLEC_ANLAB_copy)):
                        FNLEC_ANLAB_copy[i].insert(0, days[i])
                    print(tabulate(FNLEC_ANLAB_copy, headers=[f'{batch}/{room}/{session}'] + headers))
                    FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
                else:
                    for course in courses:
                        is_allocated = False
                        for i in FNLAB_ANLEC_copy:
                            for j in range(0, 5, 2):
                                alloc_slots = []
                                if room in an_allocate_lab_rooms.keys():
                                    alloc_slots = an_allocate_lab_rooms[room]
                                if i[j] not in alloc_slots and i[j + 1] not in alloc_slots:
                                    altslot = []
                                    if i[j] in elective_slots:
                                        altslot = alternative_slots[course['slot']]
                                        print("alternate1", course['slot'], altslot)
                                    if i[j] not in elective_slots and (i[j].startswith(course['slot']) or len(altslot) != 0) and (j < 5) and (not is_allocated):
                                        if room not in an_allocate_lab_rooms.keys():
                                            an_allocate_lab_rooms[room] = {}
                                            allocated_slots = []
                                            if i[j] not in elective_slots and i[j].startswith(course['slot']):
                                                allocated_slots.append(i[j])
                                                allocated_slots.append(i[j + 1])
                                            elif len(altslot) != 0 and altslot[0] not in elective_slots:
                                                allocated_slots.append(altslot[0])
                                                allocated_slots.append(altslot[1])
                                                altslot.pop(0)
                                                altslot.pop(0)
                                            an_allocate_lab_rooms[room] = allocated_slots
                                        else:
                                            if room in an_allocate_lab_rooms.keys():
                                                allocated_slots = an_allocate_lab_rooms[room]
                                                if i[j] not in elective_slots and i[j].startswith(course['slot']):
                                                    allocated_slots.append(i[j])
                                                    allocated_slots.append(i[j + 1])
                                                elif len(altslot) != 0 and altslot[0] not in elective_slots:
                                                    allocated_slots.append(altslot[0])
                                                    allocated_slots.append(altslot[1])
                                                    altslot.pop(0)
                                                    altslot.pop(0)
                                                an_allocate_lab_rooms[room] = allocated_slots
                                        i[j - 1] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                        i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
                                        is_allocated = True
                    for i in range(len(FNLAB_ANLEC_copy)):
                        day = days[i]
                        values = tuple(FNLAB_ANLEC_copy[i][1:5])
                        for j in range(1, 5):
                            if not values[j - 1].startswith(('A', 'B', 'C', 'D', 'E', 'F')):
                                column = f"slot_{j} = '{values[j - 1]}'"
                                update_query = f"UPDATE timetable SET {column} WHERE semester='{semester}' AND batch='{batch}' AND day='{day}'"
                                cursor.execute(update_query)
                    for i in range(len(FNLAB_ANLEC_copy)):
                        FNLAB_ANLEC_copy[i].insert(0, days[i])
                    print(tabulate(FNLAB_ANLEC_copy, headers=[f'{batch}/{room}/{session}'] + headers))
                    FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)
    alternativeslots(alternative_slots={})

db_connection.commit()
db_connection.close()

teachers_timetable = {}

for semester, batches in timetable.items():
    for batch, rooms in batches.items():
        for room, sessions in rooms.items():
            for session, courses in sessions.items():
                for course in courses:
                    if 'teacher_id' in course:
                        teacher_id = course['teacher_id']
                        if teacher_id not in teachers_timetable:
                            teachers_timetable[teacher_id] = []

                        teachers_timetable[teacher_id].append({
                            'semester': semester,
                            'batch': batch,
                            'course': course['course_code'],
                            'session': session,
                            'room': room
                        })

print(teachers_timetable)


# import copy
#
# import psycopg2
# from tabulate import tabulate
#
# from Data import dfcourses, dfelectivecourses
# from LabAllocation import timetable, labtimetable
#
# table = [
#     ['M1', 'A11', 'F11', 'E12', 'D13', 'M3', 'A11', 'F11', 'E12', 'D13'],
#     ['C14', 'B11', 'A12', 'F12', 'E13', 'C14', 'B11', 'A12', 'F12', 'E13'],
#     ['D14', 'C11', 'B12', 'A13', 'F13', 'D14', 'C11', 'B12', 'A13', 'F13'],
#     ['E14', 'D11', 'C12', 'B13', 'A14', 'E14', 'D11', 'C12', 'B13', 'A14'],
#     ['M2', 'E11', 'D12', 'C13', 'B14', 'M4', 'E11', 'D12', 'C13', 'B14', ]
# ]
#
# lab_table = [
#     ['M1', 'BL11', 'BL12', 'CL11', 'CL12', 'N1', 'BL11', 'BL12', 'CL11', 'CL12'],
#     ['M2', 'DL11', 'DL12', 'BL13', 'BL14', 'N2', 'DL11', 'DL12', 'BL13', 'BL14'],
#     ['M3', 'EL11', 'EL12', 'DL13', 'DL14', 'N3', 'EL11', 'EL12', 'DL13', 'DL14'],
#     ['M4', 'AL13', 'AL14', 'EL13', 'EL14', 'N4', 'AL13', 'AL14', 'EL13', 'EL14'],
#     ['M5', 'AL12', 'AL12', 'FL13', 'FL14', 'N5', 'AL11', 'AL12', 'FL11', 'FL12']
# ]
#
# fn_table = [
#     ['M1', 'A11', 'F11', 'E12', 'D13'],
#     ['C14', 'B11', 'A12', 'F12', 'E13'],
#     ['D14', 'C11', 'B12', 'A13', 'F13'],
#     ['E14', 'D11', 'C12', 'B13', 'A14'],
#     ['M2', 'E11', 'D12', 'C13', 'B14']
# ]
#
# an_table = [
#     ['M3', 'A11', 'F11', 'E12', 'D13'],
#     ['C14', 'B11', 'A12', 'F12', 'E13'],
#     ['D14', 'C11', 'B12', 'A13', 'F13'],
#     ['E14', 'D11', 'C12', 'B13', 'A14'],
#     ['M4', 'E11', 'D12', 'C13', 'B14']
# ]
#
# fn_table_copy = copy.deepcopy(fn_table)
# an_table_copy = copy.deepcopy(an_table)
#
# fn_lab_table = [
#     ['M1', 'BL11', 'BL12', 'CL11', 'CL12'],
#     ['M2', 'DL11', 'DL12', 'BL13', 'BL14'],
#     ['M3', 'EL11', 'EL12', 'DL13', 'DL14'],
#     ['M4', 'AL13', 'AL14', 'EL13', 'EL14'],
#     ['M5', 'AL12', 'AL12', 'FL13', 'FL14']
# ]
#
# an_lab_table = [
#     ['N1', 'BL11', 'BL12', 'CL11', 'CL12'],
#     ['N2', 'DL11', 'DL12', 'BL13', 'BL14'],
#     ['N3', 'EL11', 'EL12', 'DL13', 'DL14'],
#     ['N4', 'AL13', 'AL14', 'EL13', 'EL14'],
#     ['N5', 'AL11', 'AL12', 'FL11', 'FL12']
# ]
#
# fn_lab_table_copy = copy.deepcopy(fn_lab_table)
# an_lab_table_copy = copy.deepcopy(an_lab_table)
#
# FNLEC_ANLAB = [
#     ['M1', 'A11', 'F11', 'E12', 'D13', 'N1', 'BL11', 'BL12', 'CL11', 'CL12'],
#     ['C14', 'B11', 'A12', 'F12', 'E13', 'N1', 'DL11', 'DL12', 'BL13', 'BL14'],
#     ['D14', 'C11', 'B12', 'A13', 'F13', 'N3', 'EL11', 'EL12', 'DL13', 'DL14'],
#     ['E14', 'D11', 'C12', 'B13', 'A14', 'N4', 'AL13', 'AL14', 'EL13', 'EL14'],
#     ['M2', 'E11', 'D12', 'C13', 'B14', 'N5', 'AL11', 'AL12', 'FL11', 'FL12']
# ]
#
# FNLAB_ANLEC = [
#     ['M1', 'BL11', 'BL12', 'CL11', 'CL12', 'M3', 'A11', 'F11', 'E12', 'D13'],
#     ['M2', 'DL11', 'DL12', 'BL13', 'BL14', 'C14', 'B11', 'A12', 'F12', 'E13'],
#     ['M3', 'EL11', 'EL12', 'DL13', 'DL14', 'D14', 'C11', 'B12', 'A13', 'F13'],
#     ['M4', 'AL13', 'AL14', 'EL13', 'EL14', 'E14', 'D11', 'C12', 'B13', 'A14'],
#     ['M5', 'AL11', 'AL12', 'FL11', 'FL12', 'M4', 'E11', 'D12', 'C13', 'B14']
# ]
#
# FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
# FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)
#
# headers = ["8.20-9.10", "9.10-10.00", "10.00-10.50", "11.00-11.50", "11.50-12.40", "12.40-1.30", "1.30-2.20",
#            "2.30-3.20", "3.20-4.10", "4.10-5.00"]
# days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
#
# fn_slots = ["8.20-9.10", "9.10-10.00", "10.00-10.50", "11.00-11.50", "11.50-12.40"]
# an_slots = ["12.40-1.30", "1.30-2.20", "2.30-3.20", "3.20-4.10", "4.10-5.00"]
#
# for i in range(len(table)):
#     table[i].insert(0, days[i])
#
# print(tabulate(table, headers))
#
# course_lecture_hours = {}
#
# for course_detail in dfcourses:
#     course_lecture_hours[course_detail['course_code']] = course_detail['lecture_hours'] + course_detail[
#         'tutorial_hours']
#
# elective_slots = set()
#
# for semester, batches in timetable.items():
#     for batch, rooms in batches.items():
#         for room, sessions in rooms.items():
#             for session, courses in sessions.items():
#                 for course in courses:
#                     if 'elective' in course['course_code'].lower():
#                         if course['slot'] == "A":
#                             elective_slots.add('BL11')
#                             elective_slots.add('BL12')
#                             elective_slots.add('DL11')
#                             elective_slots.add('DL12')
#                             elective_slots.add('DL13')
#                             elective_slots.add('DL14')
#                             elective_slots.add('EL13')
#                             elective_slots.add('EL14')
#                         elif course['slot'] == "B":
#                             elective_slots.add('DL11')
#                             elective_slots.add('DL12')
#                             elective_slots.add('EL11')
#                             elective_slots.add('EL12')
#                             elective_slots.add('EL13')
#                             elective_slots.add('EL14')
#                             elective_slots.add('FL11')
#                             elective_slots.add('FL12')
#                         elif course['slot'] == "C":
#                             elective_slots.add("EL11")
#                             elective_slots.add("EL12")
#                             elective_slots.add("AL13")
#                             elective_slots.add("AL14")
#                             elective_slots.add("FL11")
#                             elective_slots.add("FL12")
#                         elif course['slot'] == "D":
#                             elective_slots.add("AL11")
#                             elective_slots.add("AL12")
#                             elective_slots.add("AL13")
#                             elective_slots.add("AL14")
#                             elective_slots.add("CL11")
#                             elective_slots.add("CL12")
#                         elif course['slot'] == "E":
#                             elective_slots.add("BL13")
#                             elective_slots.add("BL14")
#                             elective_slots.add("CL11")
#                             elective_slots.add("CL12")
#                             elective_slots.add("AL11")
#                             elective_slots.add("AL12")
#                         elif course['slot'] == "F":
#                             elective_slots.add("BL11")
#                             elective_slots.add("BL12")
#                             elective_slots.add("BL13")
#                             elective_slots.add("BL14")
#                             elective_slots.add("DL13")
#                             elective_slots.add("DL14")
#
# print("Elective Slots:", elective_slots)
#
# alternative_slots = {}
#
#
# def alternativeslots(alternative_slots):
#     alternative_slots['A'] = ['CL11', 'CL12', 'FL11', 'FL12']
#     alternative_slots['B'] = ['CL11', 'CL12']
#     alternative_slots['C'] = ['DL11', 'DL12', 'DL13', 'DL14', 'BL11', 'BL12', 'BL13', 'BL14']
#     alternative_slots['D'] = ['BL11', 'BL12', 'BL13', 'BL14', 'EL11', 'EL12', 'EL13', 'EL14']
#     alternative_slots['E'] = ['DL11', 'DL12', 'DL13', 'DL14', 'FL11', 'FL12']
#     alternative_slots['F'] = ['AL11', 'AL12', 'AL13', 'AL14', 'EL11', 'EL12', 'EL13', 'EL14']
#     # remove elective slots from alternative slots
#     for slot in elective_slots:
#         for key, value in alternative_slots.items():
#             if slot in value:
#                 value.remove(slot)
#     print(alternative_slots)
#
#
# alternativeslots(alternative_slots)
#
# cursor = db_connection.cursor()
#
# print(timetable)
# for semester, batches in timetable.items():
#     print(f"Timetable for Semester {semester}")
#     for batch, rooms in batches.items():
#         for room, sessions in rooms.items():
#             for session, courses in sessions.items():
#                 print(f"Timetable for {batch}")
#                 if session == "fn":
#                     for course in courses:
#                         course_code = ""
#                         for electivecourse in dfelectivecourses:
#                             if course['course_code'] in electivecourse['elective_name']:
#                                 course_code = electivecourse['course_code']
#                                 break
#                         if course_code != "":
#                             lecture_hours = course_lecture_hours[course_code]
#                             print(course_code, lecture_hours)
#                         else:
#                             lecture_hours = course_lecture_hours[course['course_code']]
#                             print(course['course_code'], lecture_hours)
#                         for i in FNLEC_ANLAB_copy:
#                             for j in range(1, len(i)):
#                                 print(course)
#                                 if i[j].startswith(course['slot']) and lecture_hours > 0 and j < 5:
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     lecture_hours -= 1
#                         for i in FNLEC_ANLAB_copy:
#                             for j in range(0, 1):
#                                 if i[j].startswith(course['slot']) and lecture_hours > 0:
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     lecture_hours -= 1
#
#                     for i in range(len(FNLEC_ANLAB_copy)):
#                         day = days[i]
#                         values = (semester, batch, day) + tuple(FNLEC_ANLAB_copy[i])
#                         columns = ['semester', 'batch', 'day'] + [f'slot_{j}' for j in range(0, len(values) - 3)]
#                         placeholders = ','.join(['%s'] * len(values))
#                         cursor.execute(f"INSERT INTO timetable ({','.join(columns)}) VALUES ({placeholders})", values)
#
#                     for i in range(len(FNLEC_ANLAB_copy)):
#                         FNLEC_ANLAB_copy[i].insert(0, days[i])
#                     print(tabulate(FNLEC_ANLAB_copy, headers=[f'{batch}/{room}/{session}'] + headers))
#                     FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
#                 else:
#                     for course in courses:
#                         course_code = ""
#                         for electivecourse in dfelectivecourses:
#                             if course['course_code'] in electivecourse['elective_name']:
#                                 course_code = electivecourse['course_code']
#                                 break
#                         if course_code != "":
#                             lecture_hours = course_lecture_hours[course_code]
#                         else:
#                             lecture_hours = course_lecture_hours[course['course_code']]
#                         for i in FNLAB_ANLEC_copy:
#                             for j in range(0, len(i)):
#                                 if i[j].startswith(course['slot']) and lecture_hours > 0 and j > 5:
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     lecture_hours -= 1
#                         for i in FNLAB_ANLEC_copy:
#                             for j in range(5, 6):
#                                 if i[j].startswith(course['slot']) and lecture_hours > 0:
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     lecture_hours -= 1
#                     for i in range(len(FNLAB_ANLEC_copy)):
#                         day = days[i]
#                         values = (semester, batch, day) + tuple(FNLAB_ANLEC_copy[i])
#                         columns = ['semester', 'batch', 'day'] + [f'slot_{j}' for j in range(0, len(values) - 3)]
#                         placeholders = ','.join(['%s'] * len(values))
#                         cursor.execute(f"INSERT INTO timetable ({','.join(columns)}) VALUES ({placeholders})", values)
#
#                     for i in range(len(FNLAB_ANLEC_copy)):
#                         FNLAB_ANLEC_copy[i].insert(0, days[i])
#                     print(tabulate(FNLAB_ANLEC_copy, headers=[f'{batch}/{room}/{session}'] + headers))
#                     FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)
#
# db_connection.commit()
#
# print(labtimetable)
# fn_allocate_lab_rooms = {}
# an_allocate_lab_rooms = {}
# for semester, batches in labtimetable.items():
#     print(f"Timetable for Semester {semester}")
#     for batch, rooms in batches.items():
#         for room, sessions in rooms.items():
#             courselist = set()
#             for session, courses in sessions.items():
#                 print(f"Timetable for {batch}")
#                 if session == "an":
#                     for course in courses:
#                         is_allocated = False
#                         for i in FNLEC_ANLAB_copy:
#                             for j in range(6, len(i), 2):
#                                 alloc_slots = []
#                                 if room in fn_allocate_lab_rooms.keys():
#                                     alloc_slots = fn_allocate_lab_rooms[room]
#                                 if i[j] not in elective_slots and i[j].startswith(course['slot']) and (j >= 5) and (not is_allocated):
#                                     if room not in fn_allocate_lab_rooms.keys():
#                                         fn_allocate_lab_rooms[room] = {}
#                                         allocated_slots = []
#                                     else:
#                                         allocated_slots = fn_allocate_lab_rooms[room]
#                                     allocated_slots.append(i[j])
#                                     allocated_slots.append(i[j + 1])
#                                     fn_allocate_lab_rooms[room] = allocated_slots
#                                     is_allocated = True
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     i[j + 1] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     courselist.add(i[j])
#                                     courselist.add(i[j+1])
#                                     break
#
#                         for i in FNLEC_ANLAB_copy:
#                             for j in range(6, len(i), 2):
#                                 altslot = []
#                                 altslot = alternative_slots[course['slot']]
#                                 print("alternate", course['slot'], altslot)
#                                 if not is_allocated and j >= 5 and len(altslot) != 0 and altslot[0] not in elective_slots and altslot[1] not in elective_slots and i[j] not in elective_slots and i[j] not in courselist:
#                                     if room not in fn_allocate_lab_rooms.keys():
#                                         fn_allocate_lab_rooms[room] = {}
#                                         allocated_slots = []
#                                     else:
#                                         allocated_slots = fn_allocate_lab_rooms[room]
#                                     allocated_slots.append(altslot[0])
#                                     allocated_slots.append(altslot[1])
#                                     altslot.pop(0)
#                                     altslot.pop(0)
#                                     fn_allocate_lab_rooms[room] = allocated_slots
#                                     is_allocated = True
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     i[j + 1] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     courselist.add(i[j])
#                                     courselist.add(i[j + 1])
#
#                     for i in range(len(FNLEC_ANLAB_copy)):
#                         day = days[i]
#                         values = tuple(FNLEC_ANLAB_copy[i][6:])
#                         for j in range(6, 10):
#                             if not values[j - 6].startswith(('A', 'B', 'C', 'D', 'E', 'F')):
#                                 column = f"slot_{j} = '{values[j - 6]}'"
#                                 update_query = f"UPDATE timetable SET {column} WHERE semester='{semester}' AND batch='{batch}' AND day='{day}'"
#                                 cursor.execute(update_query)
#                     for i in range(len(FNLEC_ANLAB_copy)):
#                         FNLEC_ANLAB_copy[i].insert(0, days[i])
#                     print(tabulate(FNLEC_ANLAB_copy, headers=[f'{batch}/{room}/{session}'] + headers))
#                     FNLEC_ANLAB_copy = copy.deepcopy(FNLEC_ANLAB)
#                 else:
#                     for course in courses:
#                         is_allocated = False
#                         for i in FNLAB_ANLEC_copy:
#                             for j in range(0, 5, 2):
#                                 alloc_slots = []
#                                 if room in an_allocate_lab_rooms.keys():
#                                     alloc_slots = an_allocate_lab_rooms[room]
#                                 if i[j] not in elective_slots and i[j].startswith(course['slot']) and (j < 5) and (not is_allocated):
#                                     if room not in an_allocate_lab_rooms.keys():
#                                         an_allocate_lab_rooms[room] = {}
#                                         allocated_slots = []
#                                     else:
#                                         allocated_slots = an_allocate_lab_rooms[room]
#                                     allocated_slots.append(i[j-1])
#                                     allocated_slots.append(i[j])
#                                     an_allocate_lab_rooms[room] = allocated_slots
#                                     is_allocated = True
#                                     i[j-1] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     courselist.add(i[j-1])
#                                     courselist.add(i[j])
#                                     break
#
#                         for i in FNLAB_ANLEC_copy:
#                             for j in range(0, 5, 2):
#                                 altslot = alternative_slots[course['slot']]
#                                 print("alternate1", course['slot'], altslot)
#                                 if not is_allocated and j < 5 and len(altslot) != 0 and altslot[0] not in elective_slots and altslot[1] not in elective_slots and i[j] not in elective_slots and i[j] not in courselist:
#                                     if room not in an_allocate_lab_rooms.keys():
#                                         an_allocate_lab_rooms[room] = {}
#                                         allocated_slots = []
#                                     else:
#                                         allocated_slots = an_allocate_lab_rooms[room]
#                                     allocated_slots.append(altslot[0])
#                                     allocated_slots.append(altslot[1])
#                                     altslot.pop(0)
#                                     altslot.pop(0)
#                                     an_allocate_lab_rooms[room] = allocated_slots
#                                     is_allocated = True
#                                     i[j-1] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     i[j] = f"{course['course_code']} ({course['teacher_id']} {room})"
#                                     courselist.add(i[j-1])
#                                     courselist.add(i[j])
#                                     break
#
#                     for i in range(len(FNLAB_ANLEC_copy)):
#                         day = days[i]
#                         values = tuple(FNLAB_ANLEC_copy[i][1:5])
#                         for j in range(1, 5):
#                             if not values[j - 1].startswith(('A', 'B', 'C', 'D', 'E', 'F')):
#                                 column = f"slot_{j} = '{values[j - 1]}'"
#                                 update_query = f"UPDATE timetable SET {column} WHERE semester='{semester}' AND batch='{batch}' AND day='{day}'"
#                                 cursor.execute(update_query)
#                     for i in range(len(FNLAB_ANLEC_copy)):
#                         FNLAB_ANLEC_copy[i].insert(0, days[i])
#                     print(tabulate(FNLAB_ANLEC_copy, headers=[f'{batch}/{room}/{session}'] + headers))
#                     FNLAB_ANLEC_copy = copy.deepcopy(FNLAB_ANLEC)
#         alternativeslots(alternative_slots)
#
# db_connection.commit()
# db_connection.close()
#
# teachers_timetable = {}
#
# for semester, batches in timetable.items():
#     for batch, rooms in batches.items():
#         for room, sessions in rooms.items():
#             for session, courses in sessions.items():
#                 for course in courses:
#                     if 'teacher_id' in course:
#                         teacher_id = course['teacher_id']
#                         slot = course['slot']
#                         if teacher_id not in teachers_timetable:
#                             teachers_timetable[teacher_id] = []
#
#                         teachers_timetable[teacher_id].append({
#                             'semester': semester,
#                             'batch': batch,
#                             'course': course['course_code'],
#                             'slot' : slot,
#                             'session': session,
#                             'room': room
#                         })
#
# print(teachers_timetable)