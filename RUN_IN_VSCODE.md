# 🚀 SentryGate — Run in VS Code (Frontend & Backend Separately)

This guide shows you how to open, install, and run this project in **VS Code** with clean separation between `frontend` and `backend`.

---

## 📁 1. Project Folder Structure

When you download the project, you have two clean modules:

```
├── server/                     <-- BACKEND FOLDER (Express + MongoDB)
│   ├── index.ts               # Standalone backend server entry point (port 5000)
│   ├── app.ts                 # Express app, CORS, and JSON parser
│   ├── config.ts              # MongoDB Atlas connection string & environment variables
│   ├── db.ts                  # Mongoose connection with TLS/SSL options & error trapping
│   ├── models.ts              # Schemas (User, AccessRequest, PrivilegedAccount, AuditLog)
│   ├── routes.ts              # REST API endpoints (/api/users, /api/access-requests, etc.)
│   ├── seed.ts                # Auto-seeds Indian personas on first MongoDB connection
│   ├── initialData.ts         # Initial seed dataset
│   ├── memoryStore.ts         # Resilient in-memory fallback
│   ├── types.ts               # Self-contained backend data types
│   ├── package.json           # Backend dependencies (express, mongoose, cors, dotenv, tsx)
│   └── .env.example           # Backend environment variables
│
├── src/                        <-- FRONTEND SOURCE (React 19 + Tailwind CSS)
│   ├── components/            # Sidebar, Topbar, Navigation
│   ├── pages/                 # All 10 views (Dashboard, Users, AccessRequests, PAM, etc.)
│   ├── context/               # AppContext (state management, auto-expiry timer)
│   ├── services/              # apiClient.ts (Axios calls to /api/*)
│   ├── utils/                 # SHA-256 Crypto chain & Risk Scoring engine
│   ├── types/                 # Frontend interfaces
│   ├── App.tsx                # App shell & routing
│   ├── main.tsx               # React root entry
│   └── index.css              # Tailwind CSS styles
│
├── index.html                  # Frontend HTML entry point
├── vite.config.ts              # Frontend Vite config (with automatic /api proxy to port 5000)
├── package.json                # Frontend dependencies (React, Vite, Lucide, Recharts, Axios)
├── tsconfig.json               # TypeScript configuration
└── server.ts                   # Unified full-stack runner (used by Google AI Studio)
```

---

## 💻 2. Running in VS Code (Step-by-Step)

### Option A: Running Separately in 2 VS Code Terminals (Standard MERN Workflow)

#### **Terminal 1: Start Backend (Port 5000)**
1. Open a terminal in VS Code:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. You will see:
   ```
   [Backend] Connecting to MongoDB Atlas...
   [MongoDB] Successfully connected to MongoDB Atlas (cloud_identity_governance)!
   [Backend API] SentryGate server listening on http://localhost:5000
   ```

#### **Terminal 2: Start Frontend (Port 3000)**
1. Open a second terminal in VS Code:
   ```bash
   npm install
   npm run build # (or npx vite)
   npx vite
   ```
2. Open your browser at **`http://localhost:3000`**.
   - Any API request to `/api/*` is automatically forwarded by Vite to your backend on port `5000`!

---

### Option B: Running Unified with a Single Command
From the root folder:
```bash
npm install
npm run dev
```
This runs Express + MongoDB and Vite together on **`http://localhost:3000`**.

---

## 🛠️ Requirements
- **Node.js**: v18 or later (v20+ recommended)
- **VS Code**: Recommended with TypeScript & Tailwind CSS extensions
- **MongoDB Atlas**: Already configured in `server/config.ts` (with IP whitelist set in Atlas)
