from Data import Send_BatchCourseClassroom, conn, dfelectivecourses
from RoomAllocation import room_batch
from SlotAllocation import Branch_course_teacher_slot
from TeacherAllocation import Allocated_Batch_Course_Teacher

with conn:
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM BatchCourseClassroom")

filled_slots = {}

for batch, courses in Allocated_Batch_Course_Teacher.items():
    filled_slots[batch] = {}
    for course_info in courses:
        for course, teachers in course_info.items():
            for electivecourse in dfelectivecourses:
                if course in electivecourse['course_code']:
                    course = electivecourse['elective_name']
                    break
            if batch[:-1] in Branch_course_teacher_slot:
                if course in Branch_course_teacher_slot[batch[:-1]]:
                    if teachers in Branch_course_teacher_slot[batch[:-1]][course]:
                        slot = Branch_course_teacher_slot[batch[:-1]][course][teachers]
                        if course not in filled_slots[batch]:
                            filled_slots[batch][course] = {}
                        filled_slots[batch][course][teachers] = slot
print(filled_slots)

for batch1, room in room_batch.items():
    for batch2, courseteachers in filled_slots.items():
        if batch1 == batch2:
            for course, teachers in courseteachers.items():
                for teacher, slot in teachers.items():
                    Send_BatchCourseClassroom(batch1, room['room'], room['session'], course, teacher, slot)