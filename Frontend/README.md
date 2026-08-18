# OPD + Patient Module (extracted, restyled)

This is a standalone Vite + React project containing **only** the OPD
and Patient modules extracted from the original hospital management
codebase (super-admin role), with a fresh teal/violet visual theme
applied on top of the original logic.

## What's inside

```
src/
├── pages/super-admin/opd/          OPD list, add/edit/view form,
│                                    OPD category management, OPD doctors
├── pages/super-admin/patients/     Patient list, create, edit, view
│                                    (components, hooks, services, utils)
├── components/                     Shared UI atoms these pages depend on
│                                    (Button, Badge, Modal, DataTable,
│                                    PageHeader, StatCard, TableActions, ...)
├── hooks/                          useAuth, usePermission, useToast,
│                                    useModal, usePagination, useDebounce, ...
├── lib/                            Feature-level service hooks
│                                    (usePatient, useOpdCategory, useDoctor)
├── store/                          Redux Toolkit + RTK Query — trimmed to
│                                    only the endpoints OPD/Patients need
├── constants/, utils/, api/        Roles, routes, permission helpers,
│                                    axios client, token/localStorage helpers
└── styles/index.css                Global design tokens (restyled)
```

`store/index.js` is a **trimmed** version of the original store — it only
wires up `patientApi`, `opdApi`, `doctorApi`, `departmentApi`,
`opddoctorApi`, and `permissionApi`, instead of all ~20 hospital-wide
API modules the full project has.

## What changed (UI) vs. what didn't (logic)

- **Unchanged:** all business logic — data fetching, validation, form
  state, billing calculations, prescription/invoice print templates,
  permission checks, routing behavior. Nothing here was rewritten.
- **Changed (visual only):**
  - Color theme: blue/indigo → **teal/violet** (`tailwind.config.js`
    defines a new `primary` color scale; `blue-*` Tailwind classes
    across the OPD/Patient pages were swapped to `primary-*`, which is
    the safe way to reskin without touching component logic).
  - Fonts: Plus Jakarta Sans/Sora → Inter/Manrope.
  - Corners/shadows: very rounded (`rounded-2xl`) → sharper
    (`rounded-lg`), lighter shadows.
  - The printed OPD invoice/prescription HTML templates were recolored
    to match (`#1976d2` → `#0d9488`).
  - A simple top-nav shell (`src/App.jsx`) replaces the original
    sidebar layout, since the sidebar itself wasn't part of what you
    asked to extract.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and point VITE_API_BASE_URL at your backend
npm run dev
```

Open the app — it lands on `/super-admin/opd`. Use the top nav to
switch between **OPD**, **OPD Category**, **OPD Doctors**, and
**Patients**.

### Backend expectations

This module talks to a REST API at `VITE_API_BASE_URL` (default
`http://localhost:5000`, with `/api` auto-appended — see
`src/utils/apiBaseUrl.js`). It expects endpoints like:

- `/opd-appointments`, `/patient`, `/user`, `/department`,
  `/prescription`, `/pathology-master` (used directly via axios in
  `OPDPage.jsx` / `OPDAdd.jsx`)
- RTK Query endpoints injected in `src/store/api/*` for
  patients, doctors, departments, OPD categories/charges, and
  permissions.

If you don't have a backend wired up yet, the pages will still render
but data-dependent sections (tables, dropdowns) will be empty until
the API responds.

## Notes

- Auth: `useAuth()` / `usePermission()` read from the Redux `auth`
  slice, which is normally populated by a login flow. Since the login
  pages weren't part of this extraction, you may want to either wire
  up your existing auth pages, or seed `localStorage` (`hms_token`,
  `hms_role`, `hms_user`) manually for local testing.
- `xlsx`, `jspdf`, `jspdf-autotable` are included because the patient
  utils use them for export — this pulls in a somewhat large bundle;
  consider dynamic `import()` if bundle size matters for you (Vite
  already warned about this on build).
