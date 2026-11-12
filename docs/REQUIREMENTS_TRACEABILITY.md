# Requirements Traceability Matrix (SRS v1.0 & Project Charter)

## Missing Input Document Notice

- **Present Primary Sources:**
  - `/public/assets/aistudio/PMS_SRS_Professional_3da7d1f0.pdf`
  - `/public/assets/aistudio/PMS_Project_Charter_Professional__1__783ad636.pdf`
- **Missing Referenced Document:**
  - `PMS_Software_Design_Document.docx` was not supplied in `/public/assets/aistudio/` or attached in the workspace. All requirements below trace directly to the SRS and Project Charter.

---

## Status Classification Key

- **`COMPLETED AND VERIFIED`**: Implemented in the frontend and verified via TypeScript (`tsc --noEmit`), Vite build (`vite build`), static/i18n/route parity verification, and live HTTP route inspection. *(Note: Interactive multi-browser click-through testing was not possible inside this container because no Chromium/Playwright binary is installed.)*
- **`IMPLEMENTED BUT NOT FULLY VERIFIED`**: Implemented in code; full interactive end-to-end browser session testing pending client QA.
- **`BLOCKED BY BACKEND OR EXTERNAL DEPENDENCY`**: Frontend UI & integration boundary complete; true server persistence, password hashing, and multi-terminal sync require the planned Django REST + MySQL backend.

---

## Functional Requirements (`FR-01` – `FR-30`)

| Code | Requirement | Frontend Module / File | Overall Delivery Status | Backend Dependency |
| :--- | :--- | :--- | :--- | :--- |
| `FR-01` | User Login & Authentication | `LoginView.tsx`, `AppContext.tsx` | **BLOCKED BY BACKEND OR EXTERNAL DEPENDENCY** (Frontend UI & local password check complete) | Django JWT / Session Auth |
| `FR-02` | User Account Management | `UsersView.tsx`, `AppContext.tsx` | **BLOCKED BY BACKEND OR EXTERNAL DEPENDENCY** (Frontend CRUD, validation & ConfirmModal complete) | Django User API + MySQL |
| `FR-03` | Role-Based Access Control (RBAC) | `AppContext.tsx`, `Sidebar.tsx`, `Navbar.tsx`, `App.tsx` | **COMPLETED AND VERIFIED** (Client guard; server enforcement pending Django) | Django Permission Classes |
| `FR-04` | Add Medicine to Catalog | `MedicineModal.tsx`, `MedicinesView.tsx` | **COMPLETED AND VERIFIED** (Local persistence) | Django Medicine API |
| `FR-05` | Update Existing Medicine | `MedicineModal.tsx`, `MedicinesView.tsx` | **COMPLETED AND VERIFIED** (Local persistence) | Django Medicine API |
| `FR-06` | Search & Filter Medicines | `MedicinesView.tsx` | **COMPLETED AND VERIFIED** | Django Query Filter |
| `FR-07` | Soft Deactivate / Reactivate Medicine | `MedicinesView.tsx`, `ConfirmModal.tsx` | **COMPLETED AND VERIFIED** (Local persistence) | Django Medicine API |
| `FR-08` | Category Management | `CategoriesView.tsx` | **COMPLETED AND VERIFIED** (Local persistence) | Django Category API |
| `FR-09` | View Real-Time Stock Quantities | `InventoryView.tsx` | **COMPLETED AND VERIFIED** | Django Inventory API |
| `FR-10` | Automatic Stock Deduction & Restock | `AppContext.tsx` (`processSale`, `recordPurchase`) | **COMPLETED AND VERIFIED** (Local state atomic updates) | MySQL DB Transactions |
| `FR-11` | Low Stock Safety Alerts | `InventoryView.tsx`, `DashboardView.tsx` | **COMPLETED AND VERIFIED** | Server Aggregation |
| `FR-12` | Expiration Date Monitoring | `InventoryView.tsx`, `DashboardView.tsx` | **COMPLETED AND VERIFIED** | Server Scheduled Alerts |
| `FR-13` | Inventory Audit & History Log | `InventoryView.tsx`, `MedicineDetailModal.tsx` | **COMPLETED AND VERIFIED** | MySQL Audit Log Table |
| `FR-14` | Create Sale / Counter Transaction | `PosView.tsx` | **COMPLETED AND VERIFIED** (Local persistence) | Django Sales API |
| `FR-15` | Strict Stock & Expiry Validation | `PosView.tsx`, `AppContext.tsx` | **COMPLETED AND VERIFIED** | Server Stock Lock |
| `FR-16` | Sales Receipt / Invoice Generation | `ReceiptModal.tsx` | **COMPLETED AND VERIFIED** (Print layout via CSS) | Optional Server PDF |
| `FR-17` | Sales Transaction History Archive | `SalesHistoryView.tsx` | **COMPLETED AND VERIFIED** | Django Sales History API |
| `FR-18` | Record Medicine Purchases | `NewPurchaseModal.tsx`, `PurchasesView.tsx` | **COMPLETED AND VERIFIED** (Local persistence) | Django Purchase API |
| `FR-19` | Automatic Inventory Update on Purchase | `AppContext.tsx` (`recordPurchase`) | **COMPLETED AND VERIFIED** | MySQL DB Transactions |
| `FR-20` | Purchase History Log | `PurchasesView.tsx` | **COMPLETED AND VERIFIED** | Django Purchase API |
| `FR-21` | Add Supplier Profile | `SupplierModal.tsx`, `SuppliersView.tsx` | **COMPLETED AND VERIFIED** | Django Supplier API |
| `FR-22` | Update & Deactivate Supplier | `SupplierModal.tsx`, `SuppliersView.tsx` | **COMPLETED AND VERIFIED** | Django Supplier API |
| `FR-23` | Supplier Purchase History & Volume | `SupplierDetailModal.tsx` | **COMPLETED AND VERIFIED** | Django Supplier API |
| `FR-24` | Executive Dashboard & Overview | `DashboardView.tsx`, `Charts.tsx` | **COMPLETED AND VERIFIED** | Django Dashboard Metrics |
| `FR-25` | Sales Financial Reporting | `ReportsView.tsx` | **COMPLETED AND VERIFIED** (Date range filters & CSV export) | Server Report Queries |
| `FR-26` | Purchase Expenditure Reporting | `ReportsView.tsx` | **COMPLETED AND VERIFIED** (Date range filters & CSV export) | Server Report Queries |
| `FR-27` | Inventory Valuation Report | `ReportsView.tsx` | **COMPLETED AND VERIFIED** | Server Report Queries |
| `FR-28` | Expiration Audit Report | `ReportsView.tsx` | **COMPLETED AND VERIFIED** | Server Report Queries |
| `FR-29` | Low Stock Restock Advisory Report | `ReportsView.tsx` | **COMPLETED AND VERIFIED** | Server Report Queries |
| `FR-30` | Universal Search & Filtering | `Navbar.tsx`, all table views | **COMPLETED AND VERIFIED** | Server Query Indexing |

---

## Non-Functional Requirements (`NFR-01` – `NFR-08`)

| Code | Requirement | Implementation & Verification Notes | Status |
| :--- | :--- | :--- | :--- |
| `NFR-01` | Usability & Intuitive UI | Consistent Tailwind v4 design system, responsive sidebar/drawer, tabular numerals, clear validation & empty states. | **COMPLETED AND VERIFIED** |
| `NFR-02` | Bilingual & RTL/LTR Support | Symmetric 605-key `en`/`fa` localization, dynamic `dir="rtl|ltr"`, Persian Jalali dates, persisted in `localStorage`. | **COMPLETED AND VERIFIED** |
| `NFR-03` | Performance & Fast Response | Client-side React memoization (`useMemo`), paginated tables, fast Vite bundle build. | **COMPLETED AND VERIFIED** |
| `NFR-04` | Reliability & Error Handling | Form validation across all modals, non-blocking `ConfirmModal` dialogs, zero `window.alert`/`window.confirm`. | **COMPLETED AND VERIFIED** |
| `NFR-05` | Security & Password Protection | Frontend credential verification & RBAC guards implemented; real bcrypt/PBKDF2 hashing & HTTPS tokens require Django backend. | **BLOCKED BY BACKEND OR EXTERNAL DEPENDENCY** |
| `NFR-06` | Maintainability & Clean Code | Modular folder layout, strict TypeScript (`tsc --noEmit` 0 errors), separated `pmsService.ts` layer. | **COMPLETED AND VERIFIED** |
| `NFR-07` | Cross-Viewport Responsiveness | Mobile drawer navigation, responsive grids, horizontal scroll wrappers (`overflow-x-auto`) on all tables. | **IMPLEMENTED BUT NOT FULLY VERIFIED** (CSS inspected; headless mobile viewport testing not run) |
| `NFR-08` | Data Backup & Recovery | Settings JSON snapshot export (`Download JSON Backup`) & demo reset; server-side MySQL automated backup requires backend. | **BLOCKED BY BACKEND OR EXTERNAL DEPENDENCY** (Client JSON backup verified in code) |
