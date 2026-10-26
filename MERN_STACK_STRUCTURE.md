# SentryGate MERN Stack Architecture & Standalone Guide

This repository is organized as a full-stack **MERN (MongoDB, Express, React, Node.js)** application.

---

## 📁 Project Structure (MERN Stack)

```
MERN Stack/
├── backend/                  <-- Express & MongoDB Atlas Backend (or /server)
│   ├── app.ts                # Express app setup, middlewares, and CORS
│   ├── config.ts             # Environment configuration & MongoDB Atlas URI
│   ├── db.ts                 # Mongoose connection manager with TLS/SSL options & error trapping
│   ├── models.ts             # Mongoose Schemas (User, AccessRequest, PrivilegedAccount, AuditLog)
│   ├── routes.ts             # REST API routes (/api/users, /api/access-requests, /api/audit-logs)
│   ├── seed.ts               # Database collection seed initializer
│   ├── memoryStore.ts        # Resilient in-memory fallback store
│   └── package.json          # Backend-specific package.json for standalone deployment
│
├── frontend/                 <-- React 19 + Vite Frontend (or /src)
│   ├── src/
│   │   ├── components/       # Layout components (Sidebar, Topbar) & UI elements
│   │   ├── context/          # AppContext state layer communicating with apiClient
│   │   ├── pages/            # 10 pages (Dashboard, Users, AccessRequests, PAM, AuditLogs, etc.)
│   │   ├── services/         # apiClient.ts (Axios service calling /api/*)
│   │   ├── utils/            # Cryptographic SHA-256 hash chaining & Risk Scoring
│   │   ├── mock/             # Initial persona and seed data
│   │   ├── types/            # TypeScript data contracts & interfaces
│   │   ├── App.tsx           # Main application routing and shell
│   │   ├── main.tsx          # React DOM root entry point
│   │   └── index.css         # Tailwind CSS entry point
│   ├── index.html            # Single Page Application HTML entry point
│   ├── vite.config.ts        # Vite build & proxy configuration
│   └── package.json          # Frontend-specific package.json for standalone deployment
│
├── server.ts                 # Full-stack runner (serves Express API on :3000 + Vite SPA middleware)
└── package.json              # Unified dev & build runner
```

---

## 🚀 How to Run As Standalone `frontend` and `backend`

If you copy or clone this project to your local drive (like `D:\MERN Stack\` shown in your screenshot):

### Option A: Running as Separate Frontend & Backend Folders

1. **Backend (`/backend`)**:
   ```bash
   cd backend
   npm install
   # Run backend API server on port 5000 (or 3000)
   npm run dev
   ```

2. **Frontend (`/frontend`)**:
   ```bash
   cd frontend
   npm install
   # Run frontend Vite dev server (proxies /api to backend)
   npm run dev
   ```

### Option B: Unified Single-Port Execution (Google Cloud / AI Studio standard)
From the project root:
```bash
npm run dev
```
This runs Express + MongoDB backend with Vite SPA mounted together on `http://localhost:3000`.
