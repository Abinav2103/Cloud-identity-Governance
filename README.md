# 🛡️ Cloud Identity & Governance Platform (SentryGate)

A modern, enterprise-grade Cloud Identity Governance (CIG) and Privileged Access Management (PAM) platform built with **React 19**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, and **MongoDB**.

---

## 🌟 Key Features

- **🔐 Centralized Identity & Access Management**: Manage enterprise users, status (Active/Suspended), and RBAC roles with least-privilege principles.
- **⚡ Just-In-Time (JIT) Privileged Access**: Temporary credential elevation with automatic session expiration, emergency break-glass procedures, and auto-credential rotation.
- **📋 Automated Access Reviews**: Workflow-driven access certification campaigns, compliance sign-offs, and automated revocation triggers.
- **🔍 Tamper-Resilient Audit Logs**: Comprehensive tracking of access grants, revocations, and configuration changes with AI-assisted anomaly detection.
- **🤖 AI Identity Intelligence**: Gemini-powered risk scoring and smart entitlement recommendations.
- **☁️ Multi-Cloud & Hybrid Storage**: Robust MongoDB Atlas database integration with automatic in-memory fallback.

---

## 🚀 One-Click Deployment to Vercel

1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository: `https://github.com/Abinav2103/Cloud-identity-Governance`.
4. Vercel automatically detects the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. **Environment Variables**: In your Vercel Project Settings > Environment Variables, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
   - `VITE_GOOGLE_CLIENT_ID`: (Optional) Your Google OAuth Client ID for Single Sign-On
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API Key for AI features
6. Click **Deploy**!

---

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- npm or bun

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and API keys

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Architecture

```
├── api/                  # Vercel Serverless Function entrypoint
├── server/               # Express backend API & MongoDB data layer
│   ├── app.ts            # Express application setup
│   ├── routes.ts         # REST API endpoints
│   ├── db.ts             # MongoDB connection & fallback handler
│   ├── models.ts         # Mongoose schemas
│   └── seed.ts           # Initial baseline data seeder
├── src/                  # React + Vite frontend application
│   ├── components/       # Reusable UI & Layout components
│   ├── pages/            # Dashboard, Access Requests, PAM, Audit, etc.
│   ├── context/          # Global application state
│   └── services/         # API client layer
├── vercel.json           # Vercel SPA routing and serverless rewrites
└── vite.config.ts        # Vite build & development proxy configuration
```

---

## 📄 License
MIT License. Built for secure enterprise cloud governance.

