# IERS: Institutional Enterprise Resource System
### *The Future of Academic Excellence and Research Governance*

[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Express](https://img.shields.io/badge/API-Express.js-000000?logo=express)](https://expressjs.com/)

---

## 🏛️ Executive Summary
**IERS (Institutional Enterprise Resource System)** is a comprehensive, industrial-grade SaaS platform designed to modernize the end-to-end academic and research lifecycle of higher education institutions. From admission processing to research supervisor allocation, IERS provides a centralized, secure, and highly efficient digital ecosystem for students, faculty, and administrators.

Built with an **entrepreneurial vision**, IERS empowers universities to transition from legacy paper-based workflows to a streamlined "Architecture of Truth," ensuring data integrity, regulatory compliance, and a superior user experience.

---

## 🚀 Key Perspectives

### 🏢 Industrial Perspective
- **Scalability**: Decoupled Frontend (Vite/React) and Backend (Express) architecture designed for elastic scaling.
- **Security**: Robust RBAC (Role-Based Access Control) integrated with Supabase Auth and Row Level Security (RLS).
- **Auditability**: Complete system-wide audit logging for every critical action.
- **Modern Stack**: Leverages the latest industry standards: React 19, TypeScript, and Shadcn UI.

### 🎓 University & Educational Perspective
- **PET (PhD Entrance Test) Module**: Automated management of the research entrance examination lifecycle.
- **DRC (Departmental Research Committee)**: Digital oversight of research proposals, interviews, and scholar tracking.
- **Unified Portal**: A seamless experience for Internal (Staff/Students) and External candidates.
- **Compliance**: Adheres to institutional governance norms for PhD admissions and faculty acceptance.

### 💡 Entrepreneurial Perspective
- **SaaS Ready**: Multi-institute support architecture (Phase-based implementation).
- **Rapid Deployment**: Pre-configured for cloud environments (Netlify for Frontend, Render for Backend).
- **API-First Design**: Facilitates easy integration with legacy university systems or mobile app extensions.

---

## 🛠️ Core Modules (Implemented)

### 1. Unified Admission Portal
- **Smart Entry UX**: Dynamic selection between Internal (Institutional) and External candidates.
- **Premium UI**: State-of-the-art landing page and login EXPERIENCE designed to maximize institutional branding.

### 2. PhD Admission Management
- **Digital Scrutiny**: Automated and manual verification of research applications.
- **Interview Scheduling**: Coordinated platform for DRC members and applicants.
- **Guide Allocation**: Formalized workflow for supervisor-student matching and certificate generation.

### 3. Researcher Dashboard
- Real-time application tracking.
- Secure document vault for academic credentials.
- Digital confirmation of faculty acceptance.

---

## 💻 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js (RESTful API).
- **Database/Auth**: Supabase (PostgreSQL), Supabase Auth.
- **Infrastructure**: Vite (Build Tool), Git (Version Control).

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or PNPM
- Supabase Project Credentials

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Install dependencies (Root, Frontend, and Backend):
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Environment Configuration:
   Create `.env` files in `frontend/` and `backend/` using the provided `.env.example` templates.

4. Run Development Servers:
   - Root: `npm run dev` (if workspace script exists)
   - Individual: `npm run dev` inside `frontend/` and `backend/` folders.

---

## 🗺️ Roadmap
- [x] Phase 1-5: Core Admission & PET Logic
- [x] Phase 6-10: DRC Dashboard & Researcher Workflow
- [ ] Phase 11: Multi-Institute Tenant Isolation
- [ ] Phase 12: Mobile Companion App for Faculty
- [ ] Phase 13: AI-Powered Research Proposal Analysis

---

## 📝 License
Copyright © 2026. This project is licensed under the **ISC License**. Designed and developed for institutional excellence.

---
*Built with ❤️ for the next generation of researchers.*
