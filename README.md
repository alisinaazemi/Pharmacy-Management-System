# Pharmacy Management System (PMS) — Frontend Application

A bilingual (**English / فارسی**), theme-aware (**Light / Dark / System**) frontend web application for the **Pharmacy Management System (PMS)** built with React, TypeScript, Vite, and Tailwind CSS, aligned with the official **PMS Software Requirements Specification (SRS v1.0)** and **PMS Project Charter** by the **Enterprise Synthesis Team**.

---

## A. Project Overview

PMS streamlines daily pharmacy operations across catalog administration, therapeutic categories, real-time inventory control, Point of Sale (POS) counter checkout, sales receipts, inward supplier purchases, distributor management, financial/compliance reporting, staff RBAC management, and system configuration.

---

## B. Source-of-Truth Documentation & Input Notice

| Document | Status in Workspace | Usage |
| :--- | :--- | :--- |
| `PMS_SRS_Professional_3da7d1f0.pdf` | Present (`/public/assets/aistudio/`) | Primary specification for Modules 1–10, `FR-01`–`FR-30`, `NFR-01`–`NFR-08`, validation (§21), error handling (§22), security (§23), and traceability (§28). |
| `PMS_Project_Charter_Professional__1__783ad636.pdf` | Present (`/public/assets/aistudio/`) | Source for project governance, Enterprise Synthesis Team roster, 4-month Agile/Incremental delivery plan, and target React + Django/MySQL architecture. |
| `PMS_Software_Design_Document.docx` | **Not Present in Workspace** | Referenced in project instructions, but the `.docx` file was not attached or stored in `/public/assets/aistudio/`. Frontend implementation strictly adheres to the SRS and Project Charter without inventing undocumented design artifacts. |

---

## C. Tech Stack

- **UI Library:** React 19 (`react`, `react-dom`)
- **Language:** TypeScript 7 (`tsc --noEmit`)
- **Build Tool & Dev Server:** Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@custom-variant dark`)
- **Icons:** `lucide-react`
- **Typography:** Plus Jakarta Sans (EN), Vazirmatn (FA/RTL), JetBrains Mono (IDs/batches/currencies)

---

## D. Project Directory Structure

```text
/
├── .env.example                    # Safe environment configuration template
├── .gitignore                      # Git exclusions (.env*, node_modules, dist)
├── index.html                      # HTML entry with Google Fonts & metadata
├── metadata.json                   # Applet metadata
├── package.json                    # Scripts and dependencies
├── README.md                       # Project documentation
├── docs/
│   ├── FRONTEND_ARCHITECTURE.md    # Technical architecture & service separation
│   ├── REQUIREMENTS_TRACEABILITY.md# FR-01..FR-30 & NFR-01..NFR-08 matrix
│   ├── TESTING_REPORT.md           # Factually executed verification checks
│   └── CLIENT_HANDOVER.md          # Client acceptance & backend handover guide
└── src/
    ├── App.tsx                     # Root router shell, auth gate & RBAC guard
    ├── index.css                   # Tailwind v4 setup, font vars & print rules
    ├── main.tsx                    # React mount entry
    ├── routes/routes.ts            # History API path <-> ActiveView mapping
    ├── services/pmsService.ts      # Separated persistence & API config layer
    ├── context/AppContext.tsx      # Application state, auth, RBAC & actions
    ├── types/index.ts              # Shared TypeScript interfaces
    ├── data/mockData.ts            # Initial academic seed records
    ├── locales/translations.ts     # Symmetric EN (LTR) & FA (RTL) dictionaries
    └── components/
        ├── auth/LoginView.tsx
        ├── categories/CategoriesView.tsx
        ├── common/{Button,Charts,ConfirmModal,EmptyState,Input,Modal,Pagination,StatCard,ToastContainer}.tsx
        ├── dashboard/DashboardView.tsx
        ├── inventory/{InventoryView,StockAdjustmentModal}.tsx
        ├── layout/{Navbar,Sidebar}.tsx
        ├── medicines/{MedicineDetailModal,MedicineModal,MedicinesView}.tsx
        ├── pos/... -> sales/{PosView,ReceiptModal,SalesHistoryView}.tsx
        ├── purchases/{NewPurchaseModal,PurchasesView}.tsx
        ├── reports/ReportsView.tsx
        ├── settings/SettingsView.tsx
        ├── suppliers/{SupplierDetailModal,SupplierModal,SuppliersView}.tsx
        ├── traceability/TraceabilityView.tsx
        └── users/UsersView.tsx
```

---

## E. Prerequisites

- **Node.js:** v20+ or v22+
- **npm:** v10+

---

## F. Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template (optional; defaults to local mode)
cp .env.example .env

# 3. Start Vite development server on port 3000
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## G. Available npm Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Runs the local development server on port 3000 |
| `npm run build` | `vite build` | Produces production static assets under `dist/` |
| `npm run preview` | `vite preview` | Serves the production `dist/` bundle locally |
| `npm run lint` | `tsc --noEmit` | Runs strict TypeScript type checking |
| `npm run clean` | `rm -rf dist server.js` | Removes build output artifacts |

---

## H. Environment Variables (`.env.example`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_DATA_MODE` | `"local"` | `"local"` uses browser `localStorage` via `src/services/pmsService.ts`; `"api"` is reserved for connecting the future Django REST backend. |
| `VITE_API_BASE_URL` | `"/api/v1"` | Base REST API path used when integrating the Django backend. |
| `GEMINI_API_KEY` | `"MY_GEMINI_API_KEY"` | Runtime environment placeholder (unused by PMS frontend features). |
| `APP_URL` | `"MY_APP_URL"` | Runtime hosting URL placeholder. |

---

## I. Client Routing & Direct URLs

Navigation uses browser History API (`pushState` / `popstate`) so active views remain synchronized with clean URLs across refreshes:

- `/login` — Authentication screen
- `/dashboard` — Executive Pharmacy Dashboard (`FR-24`)
- `/pos` — Counter Point of Sale (`FR-14`–`FR-16`)
- `/sales-history` — Sales Archive & Receipt Reprinting (`FR-17`)
- `/medicines` — Medicine Catalog & Batch Control (`FR-04`–`FR-07`)
- `/categories` — Therapeutic Categories (`FR-08`)
- `/inventory` — Warehouse Stock, Low-Stock, Expirations & Audit Trail (`FR-09`–`FR-13`)
- `/purchases` — Supplier Inward Goods & Purchase Orders (`FR-18`–`FR-20`)
- `/suppliers` — Distributor Directory & Purchase Volume (`FR-21`–`FR-23`)
- `/reports` — Sales, Purchase, Valuation, Expiration & Restock Reports (`FR-25`–`FR-29`)
- `/users` — Staff Accounts & RBAC Matrix (`FR-02`–`FR-03`)
- `/settings` — Pharmacy Profile, Tax/Currency & JSON Backup/Reset (`NFR-08`)
- `/traceability` — SRS `FR-01`–`FR-30` Matrix & Project Charter View

---

## J. Bilingual Localization (English & Persian RTL)

- Toggle between **English** (`en`, `dir="ltr"`) and **فارسی** (`fa`, `dir="rtl"`) from the Login screen or Top Navbar.
- Translation coverage is **100% symmetric (605 keys in `en` and 605 keys in `fa`)**.
- Dates format in **Persian Jalali (`fa-IR-u-ca-persian`)** when Persian is active.
- Language preference persists in `localStorage` (`pms_language`).

---

## K. Dark Mode, Light Mode & System Theme

- Three-state theme support (`light`, `dark`, `system`) via Tailwind CSS v4 `@custom-variant dark`.
- Defaults to `'system'` (`prefers-color-scheme`) when no user preference has been saved (`pms_theme`).
- Theme toggle is accessible on both the Login screen and the Top Navbar.

---

## L. Role-Based Access Control (RBAC) & Demo Accounts

All seeded demo accounts use password **`password123`** (configurable when creating/editing accounts in User Management):

| Role | Username | Email | Allowed Views |
| :--- | :--- | :--- | :--- |
| **Admin** | `bahram` | `bahram.jafaree@pms.af` | All 12 modules including Users & Settings |
| **Manager** | `yousaf` | `yousaf.hashimi@pms.af` | All operational modules (excludes Users & Settings) |
| **Cashier** | `ali` | `ali.seena@pms.af` | Dashboard, POS, Sales History, Medicines (read-only), SRS Matrix |

*(Additional seeded accounts: `alireza` [Manager], `zaki` [Cashier].)*

---

## M. Persistence Model & Backend Separation

This deliverable is a **Frontend-Only Application**. There is currently **no live Django/MySQL server** in the repository.

- All persistence calls are isolated inside `src/services/pmsService.ts` using browser `localStorage` seeded from `src/data/mockData.ts`.
- An administrator can download a JSON backup or reset all local demo data in **Settings → System Backup & Data Recovery**.
- Replacing `pmsService.ts` with HTTP `fetch` calls targeting `VITE_API_BASE_URL` connects the frontend to the planned Django REST Framework + MySQL backend without rewriting UI components.

---

## N. Known Limitations & Pending Backend Dependencies

1. **Client-Side Persistence Only:** Data is stored per-browser in `localStorage` rather than a shared MySQL server; multi-terminal synchronization requires backend integration.
2. **Client-Side Auth Simulation:** Credential checking runs locally against `pmsService` rather than server-issued JWT/session cookies (`NFR-05` production hashing & token signing require Django backend).
3. **Missing Design Input:** `PMS_Software_Design_Document.docx` was not present in the workspace during finalization.
4. **Headless Browser Testing:** Automated `tsc --noEmit`, `vite build`, translation parity, route checks, and HTTP 200 verification ran in this environment; interactive Chromium click-through testing requires a browser environment (see `docs/TESTING_REPORT.md`).

---

## O. Project Team (Enterprise Synthesis Team)

- **Bahram Jafaree** — Project Lead / PM
- **Said Yousaf Hashimi** — Backend & System Architecture
- **Ali Seena** — Frontend & UI Lead
- **Alireza Alizada** — Database Design
- **Zaki Ahmadi** — QA & Testing
