# Timetable Generator

A full-stack timetable application with a static browser UI, an Express/PostgreSQL API, and a Python scheduling algorithm.

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer
- PostgreSQL

## Configure PostgreSQL

Create a database named `Timetable`, then initialize its tables and reference data from the repository root:

```powershell
createdb -U postgres Timetable
psql -U postgres -d Timetable -f .\Database_Schema\database_schema_new.txt
```

If PostgreSQL is installed without the `createdb` and `psql` commands on `PATH`, run the equivalent commands from the PostgreSQL SQL Shell (psql).

## Configure and start the application

From the repository root, copy the example environment file and set the PostgreSQL password:

```powershell
Copy-Item .\Backend\.env.example .\Backend\.env
notepad .\Backend\.env
```

Install Node and Python dependencies, then run the backend from its directory:

```powershell
Set-Location .\Backend
npm install
Set-Location ..
python -m pip install -r .\Algorithm\requirements.txt
Set-Location .\Backend
npm start
```

Open [http://localhost:3005](http://localhost:3005). The Express server serves both the UI and API, so a separate frontend server is not required.

Check database connectivity at [http://localhost:3005/api/health](http://localhost:3005/api/health).

## CSV imports

CSV uploads merge into existing data: records with matching course codes, teacher IDs, room numbers, or semester/batch keys are updated; new records are inserted. Course-teacher and semester-course relationships are added only if not already present. A failed upload is rolled back as a whole.

Course CSVs can use either `Category,Course_Code,Course_Name,Elective_Name,L,T,P` or the database-style hour headers `Lecture_Hours,Tutorial_Hours,Practical_Hours`. Elective names are stored in the separate `Course_Elective` table.

## Generate a timetable

Select **Generate Timetable** on the Timetable page. The backend runs the existing allocation pipeline (`Sendata.py` → `TimeTableGenerator.py`), then renders the generated database rows with `PrintTimetable.py`. The Python processes receive the same `DB_*` values as the backend.

Run the backend tests with:

```powershell
Set-Location .\Backend
npm test
```
