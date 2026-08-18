# React + Node (Express + Prisma) Full Stack Starter

## Structure

```
project/
├── backend/                   # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema
│   │   └── migrations/
│   ├── src/
│   │   ├── config/            # db.js, env config
│   │   ├── controllers/       # request handlers
│   │   ├── routes/            # express routers
│   │   ├── services/          # business logic / prisma queries
│   │   ├── middlewares/       # auth, error handler, etc.
│   │   ├── utils/             # helper functions
│   │   ├── validators/        # request validation (express-validator)
│   │   ├── jobs/              # cron / background jobs
│   │   ├── app.js             # express app setup
│   │   └── server.js          # entry point
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/                  # React + Tailwind + Axios
│   ├── public/
│   ├── src/
│   │   ├── assets/            # images, icons, fonts
│   │   ├── components/
│   │   │   ├── common/        # buttons, inputs, reusable UI
│   │   │   └── layout/        # navbar, footer, sidebar
│   │   ├── pages/             # route-level pages
│   │   ├── features/          # feature-based modules (optional)
│   │   ├── hooks/             # custom hooks
│   │   ├── context/           # React context providers
│   │   ├── services/          # axios instance + API calls
│   │   ├── routes/            # react-router routes
│   │   ├── store/             # state management (redux/zustand) if needed
│   │   ├── styles/            # tailwind entry css
│   │   ├── utils/             # helpers, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Setup

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Notes
- Backend uses ES Modules (`type: module`), Express, Prisma ORM, JWT auth middleware, and a service/controller/route layered structure.
- Frontend uses Vite + React + Tailwind CSS, with a centralized Axios instance (`services/api.js`) that auto-attaches JWT tokens and handles response interceptors.
- `features/` folder in frontend is optional — use it if you prefer feature-based (domain-driven) organization instead of pure type-based folders (pages/components).
