# OPD + Patient Backend

Express + Prisma (PostgreSQL) API built specifically to match the
extracted **OPD** and **Patient** frontend module — every route, field
name, and response shape mirrors what that frontend code already
expects (traced directly from its `apiClient` calls and RTK Query
endpoint definitions), so you shouldn't need to touch the frontend.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance, set JWT_SECRET

npx prisma migrate dev --name init   # creates tables
npm run seed                          # creates a super-admin + doctor + sample data
npm run dev                           # starts on http://localhost:5000
```

Then point the frontend's `.env` at it:
```
VITE_API_BASE_URL=http://localhost:5000
```
(`/api` is appended automatically by the frontend's `getApiBaseUrl()`.)

## Test login

The seed script creates:
- `admin@clinic.test` / `Admin@123` — role `SUPER_ADMIN` (bypasses all permission checks on the frontend)
- `doctor@clinic.test` / `Doctor@123` — role `DOCTOR`

`POST /api/auth/login` returns `{ result: { user, token, role, permissions } }` —
this matches the shape `authSlice.setCredentials` expects. Since the
extracted frontend module didn't include login pages, either wire up
your own login screen against this endpoint, or for local testing just
call it once (curl/Postman) and manually seed `localStorage`:

```js
localStorage.setItem('hms_token', '<token from login response>');
localStorage.setItem('hms_role', 'SUPER_ADMIN');
localStorage.setItem('hms_user', JSON.stringify({ name: 'Super Admin' }));
```//then refresh the app.

## Routes implemented

All routes require `Authorization: Bearer <token>` except `/api/auth/*`.

| Resource | Routes | Matches frontend file |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | `authSlice.js` |
| Patients | `GET/POST /api/patient`, `GET/PUT/DELETE /api/patient/:id` | `store/api/patientApi/patient.js` |
| OPD Appointments | `GET/POST /api/opd-appointments`, `GET/PUT/DELETE /api/opd-appointments/:id` | `OPDPage.jsx`, `hooks/useOpdAppointmentFormData.js` |
| OPD Charge Categories | `GET/POST /api/opd-charge-categories`, `PUT/DELETE /api/opd-charge-categories/:id` | `store/api/opdApi.js`, `OpdCategory.jsx` |
| OPD Consultation Charges | `GET/POST /api/opd-consultation-charges`, `PUT/DELETE /api/opd-consultation-charges/:id` | `store/api/opdApi.js` |
| Users / Doctors | `GET/POST /api/user`, `GET/PUT/DELETE /api/user/:id` (filter with `?role_id=2`, `?department_id=`) | `store/api/doctorApi/doctor.js`, `opddoctorApi.js` |
| Departments | `GET/POST /api/department`, `GET/PUT/PATCH/DELETE /api/department/:id` | `store/api/departmentApi/department.js` |
| Designations | `GET/POST /api/designation`, `PUT/DELETE /api/designation/:id` | `store/api/opddoctorApi/opddoctorApi.js` (`OpdDoctors.jsx`) |
| Prescriptions | `GET/POST /api/prescription`, `GET/PUT/DELETE /api/prescription/:id` | `OPDPage.jsx` (Rx view/edit) |
| Pathology Master | `GET/POST /api/pathology-master`, `PUT/DELETE /api/pathology-master/:id` | `OPDPage.jsx` (test name lookup) |
| Hospitals | `GET/POST /api/hospital`, `GET/PUT/PATCH/DELETE /api/hospital/:id` | `store/api/hospitalApi/hospital.js` (`PatientForm.jsx`'s hospital dropdown — required field) |
| Permissions | `GET /api/permission/me/effective` | `usePermission.js` (only queried for non-super-admin roles) |

## Response shape

Two shapes are used, matching exactly what each frontend consumer expects:

**Paginated list** (patients, OPD appointments, categories, charges, prescriptions, pathology, hospitals):
```json
{ "result": { "data": [...], "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 } } }
```

**Flat paginated list** (only `/api/user`, because `doctorApi.js`'s `transformResponse` reads `response.result` directly):
```json
{ "result": { "data": [...], "total": 42, "page": 1, "limit": 10, "totalPages": 5 } }
```

**Single object / list without pagination** (department, designation, mutations):
```json
{ "result": {...} }          // single object
{ "result": { "data": [...] } }   // department list — either an array or {data:[]} is accepted by the frontend
```

## OPD number / token generation

`OPDAdd.jsx` sends a client-placeholder `caseId` on create, but the
backend is the source of truth: `POST /api/opd-appointments` generates
both `opdNo` (`TKN-DDMMYYYY-NNNNN`) and `caseId` (`OPD-DDMMYYYY-NNNNN`)
server-side, using a daily sequence count — this is exactly the format
the frontend's own client-side fallback formatter
(`displayToken`/`displayOpdNumber` in `OPDPage.jsx`) expects, so
numbers render correctly everywhere (list, print, invoice) without
relying on that fallback.

## Notes / things you'll likely want to extend

- **Permissions**: `usePermission()` on the frontend short-circuits to
  "allow everything" for `SUPER_ADMIN`, so `/api/permission/me/effective`
  just returns `[]` and is never actually called for that role. If you
  add more roles, you'll want a real `Permission` / `RolePermission`
  model and to fill this endpoint in.
- **Patient create requires a hospital**: `PatientForm.jsx` has a
  required "Hospital" dropdown (`hospitalId`), backed by
  `/api/hospital` — the seed script creates one hospital so patient
  creation works out of the box.
- **Soft delete**: OPD appointments and patients are hard-deleted here
  (`prisma.delete`). If you'd rather keep history, swap those for a
  `status: 'inactive'` update — `OPDPage.jsx` already filters out
  records with `status === 'inactive'` client-side.
- **File uploads** (patient photo): `PatientForm.jsx` currently just
  stores a preview URL client-side; `Patient.photo` is a plain string
  column here (URL or base64) — wire up real file storage (S3, disk,
  etc.) if you need persistent photo uploads.
