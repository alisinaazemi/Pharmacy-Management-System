# Client Handover Guide — Pharmacy Management System (PMS) Frontend

## 1. Delivery Summary

This handover package delivers the **complete, bilingual (English / فارسی), light & dark theme-ready PMS frontend application** built against:
- **PMS Software Requirements Specification (SRS v1.0)** (`FR-01`–`FR-30`, `NFR-01`–`NFR-08`)
- **PMS Project Charter** (Enterprise Synthesis Team)

> **Important Documentation Disclosure:** The referenced file `PMS_Software_Design_Document.docx` was not present in the repository or asset folder at handover time. All UI workflows, validations, and data structures conform strictly to the provided SRS PDF and Project Charter PDF.

---

## 2. Quick Start for Client Evaluation

1. Run `npm install` followed by `npm run dev`.
2. Open `http://localhost:3000`.
3. Sign in with any of the seeded roles (default password: **`password123`**):
   - **Administrator:** username `bahram`
   - **Pharmacist / Manager:** username `yousaf`
   - **Sales / Cashier:** username `ali`
4. Test **Language Switching** (`English` ↔ `فارسی` RTL) and **Theme Switching** (`Light` / `Dark` / `System`) from the Login screen or Top Header.
5. Test **RBAC Enforcement** by signing in or using the header Role Simulator (`Admin`, `Manager`, `Cashier`) and observing restricted menus and guarded URLs (`/users`, `/settings`, `/inventory`, `/purchases`, `/suppliers`, `/categories`).

---

## 3. Recommended Manual QA Acceptance Walkthrough

- **POS & Inventory Loop (`FR-10`, `FR-14`–`FR-16`):** Add a non-expired in-stock medicine in `/pos`, attempt exceeding stock (blocked), complete checkout, inspect printed receipt modal, verify deducted stock in `/inventory` and audit entry under **Inventory → Inventory Change History**. Attempt clicking an expired medicine in `/pos` (blocked with localized message).
- **Purchases & Suppliers Loop (`FR-18`–`FR-23`):** Create a supplier in `/suppliers`, record a purchase in `/purchases` with batch, expiry, and notes, and confirm warehouse stock and supplier spend update automatically.
- **Reports & Exports (`FR-25`–`FR-29`):** Switch across Sales, Purchases, Inventory Valuation, Expiration Audit, and Restock tabs in `/reports`; test Date Range filters (`All Time`, `Today`, `Last 7 Days`, `This Month`, `Custom Range`) and click **Export CSV**.
- **User & Settings Safety (`FR-02`, `NFR-08`):** Verify self-deactivation is blocked with a toast warning (no browser alert), download a JSON snapshot backup in `/settings`, and test **Reset Demo Data** confirmation modal.

---

## 4. Backend Integration Roadmap (Django REST + MySQL)

To transition from local browser persistence (`VITE_DATA_MODE="local"`) to production server persistence (`VITE_DATA_MODE="api"`):

1. Deploy the planned **Django + Django REST Framework + MySQL** backend exposing `/api/v1/*` endpoints for Authentication (JWT/Session), Users, Categories, Medicines, Inventory Transactions, Sales, Purchases, Suppliers, Reports, and Settings.
2. Update `.env` (`VITE_DATA_MODE="api"`, `VITE_API_BASE_URL="https://your-api-host/api/v1"`).
3. Implement HTTP `fetch`/client adapters inside `src/services/pmsService.ts` and update `AppContext.tsx` initialization/mutations to await async API responses instead of synchronous `localStorage` calls.
4. Enforce server-side RBAC permission checks, atomic database stock transactions (`SELECT ... FOR UPDATE`), and secure server-side password hashing (`NFR-05`).
