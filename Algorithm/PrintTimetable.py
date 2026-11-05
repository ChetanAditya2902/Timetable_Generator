# from Data import df_timetable
# from tabulate import tabulate
#
# headers = ["8.20-9.10", "9.10-10.00", "10.00-10.50", "11.00-11.50", "11.50-12.40", "12.40-1.30", "1.30-2.20",
#            "2.30-3.20", "3.20-4.10", "4.10-5.00"]
#
# print(df_timetable)
#
# days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
#
# for entries in df_timetable:
#     tt1 = []
#     semester = entries['semester']
#     batch = entries['batch']
#     print("Timetable for " + semester + " " + batch)
#     sorted_days = sorted(entries['data'], key=lambda x: days_order.index(x[0]))
#     for entry in sorted_days:
#         row = []
#         for s in entry:
#             row.append(s)
#         tt1.append(row)
#     print(tabulate(tt1, headers=[f'{semester}/{batch}'] + headers))


# PrintTimetable.py

from Data import df_timetable
from openpyxl import Workbook
from openpyxl.styles import Border, Font, Side
import re
from html import escape


headers = ["8.20-9.10", "9.10-10.00", "10.00-10.50", "11.00-11.50", "11.50-12.40", "12.40-1.30", "1.30-2.20",
               "2.30-3.20", "3.20-4.10", "4.10-5.00"]

days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]


def generate_timetable_html():
    timetable_html = ''
    i = 1  # Counter for applying different borders

    values_to_clear = ['FL12', 'N5', 'EL14', 'B12', 'B11', 'M4', 'E14', 'N4', 'CL11', 'DL11', 'A12', 'F11', 'M3', 'F13', 'D14', 'DL13', 'N3', 'BL12', 'A11', 'E11', 'C14', 'AL14', 'D13', 'EL11', 'DL14', 'M1', 'AL13', 'D12', 'BL11', 'AL12', 'E13', 'M2', 'FL11', 'A14', 'CL12', 'B14', 'B13', 'C11', 'E12', 'EL13', 'F12', 'C13', 'N1', 'AL11', 'BL14', 'D11', 'EL12','BL13','DL12']

    for entries in df_timetable:
        semester = entries['semester']
        batch = entries['batch']
        safe_semester = escape(str(semester))
        safe_batch = escape(str(batch))
        timetable_html += '<div style="text-align: center; margin: 20px auto;">'  # Center the entire box
        timetable_html += '<div style="display: inline-block;">'  # Center the timetable
        timetable_html += '<table style="border-collapse: collapse; text-align: center; font-size: 14px; width: 100%;">'
        timetable_html += f"<tr><th style='border: 1px solid black; text-align: left; font-weight: bold;'>{safe_semester} {safe_batch}</th>" + \
                          ''.join([f"<th style='border: 1px solid black; width: 10%;'>{header}</th>" for header in headers]) + \
                          "</tr>"
        sorted_days = sorted(entries['data'], key=lambda x: days_order.index(x[0]))
        for day_info in sorted_days:
            day, *slots = day_info
            safe_day = escape(str(day))
            row = ""
            for slot in slots:
                if slot in values_to_clear:
                    row += "<td style='border: 1px solid black; width: 10%;'></td>"  # Empty cell
                else:
                    row += f"<td style='border: 1px solid black; width: 10%;'>{escape(str(slot))}</td>"
            # Making days bold
            timetable_html += f"<tr><td style='border: 1px solid black; text-align: left; font-weight: bold;'>{safe_day}</td>{row}</tr>"
        timetable_html += '</table></div></div>'
        i += 1

    return timetable_html


def generate_excel():
    if not df_timetable:
        return

    workbook = Workbook()
    workbook.remove(workbook.active)
    border_side = Side(style="thin")
    cell_border = Border(
        left=border_side,
        right=border_side,
        top=border_side,
        bottom=border_side,
    )
    existing_sheet_names = set()

    for entries in df_timetable:
        semester = str(entries["semester"])
        batch = str(entries["batch"])
        title = f"Timetable for {semester} {batch}"
        sheet_name = re.sub(r"[\[\]:*?/\\]", "_", title)[:31].strip("'") or "Timetable"
        base_name = sheet_name
        suffix_number = 2
        while sheet_name.casefold() in existing_sheet_names:
            suffix = f" {suffix_number}"
            sheet_name = f"{base_name[:31 - len(suffix)]}{suffix}"
            suffix_number += 1
        existing_sheet_names.add(sheet_name.casefold())

        worksheet = workbook.create_sheet(title=sheet_name)
        worksheet.append([f"{semester} {batch}", *headers])
        sorted_days = sorted(entries["data"], key=lambda row: days_order.index(row[0]))
        for day_info in sorted_days:
            worksheet.append(list(day_info))

        for row in worksheet.iter_rows():
            for cell in row:
                cell.border = cell_border
                cell.font = Font(size=14)

        worksheet.freeze_panes = "B2"
        worksheet.column_dimensions["A"].width = 20
        for column in range(2, len(headers) + 2):
            worksheet.column_dimensions[worksheet.cell(row=1, column=column).column_letter].width = 14

    workbook.save("timetables.xlsx")


if __name__ == "__main__":
    timetable_html = generate_timetable_html()
    print(timetable_html)
    generate_excel()
