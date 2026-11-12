# PMS Frontend Architecture Documentation

## 1. Architectural Overview

The Pharmacy Management System (PMS) frontend is structured as a modular Single-Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. All presentation components are decoupled from storage details through a dedicated service boundary (`src/services/pmsService.ts`) and centralized application state (`src/context/AppContext.tsx`).

```text
UI Components (src/components/**)
        │  consume hooks & localized helpers
        ▼
Application Context (src/context/AppContext.tsx)
        │  manages domain state, RBAC guards, routing sync
        ▼
Integration Service Layer (src/services/pmsService.ts)
        ├── Local Mode (active): localStorage + mockData.ts seeds
        └── API Mode (planned): Django REST Framework (/api/v1) + MySQL
```

---

## 2. Separated Integration Layer (`src/services/pmsService.ts`)

Per the Project Charter (§6) and client handover requirements, frontend components never access `localStorage` directly:

- `pmsService.loadInitialState()` hydrates `medicines`, `categories`, `suppliers`, `sales`, `purchases`, `inventoryTransactions`, `users`, and `settings`.
- `pmsService.save*(data)` persists domain mutations.
- `pmsService.getCredentials()` / `pmsService.setUserPassword()` manage local credential state until replaced by Django auth endpoints.
- `pmsService.getSession()` / `pmsService.saveSession()` preserve active authentication state across page reloads.
- `pmsService.getLanguage()` / `pmsService.getTheme()` store UI preferences (`'system'` theme fallback when unsaved).
- `pmsService.resetAllData()` restores clean initial academic seed datasets.

---

## 3. URL Routing (`src/routes/routes.ts`)

`AppContext` synchronizes `activeView` and `isLoggedIn` with `window.history.pushState` / `replaceState` and subscribes to `popstate` events for browser Back/Forward navigation:

- Unauthenticated state normalizes to `/login`.
- Authenticated state maps each `ActiveView` to a clean path (`/dashboard`, `/pos`, `/sales-history`, `/medicines`, `/categories`, `/inventory`, `/purchases`, `/suppliers`, `/reports`, `/users`, `/settings`, `/traceability`).
- Role-based view permissions are enforced by `hasPermission(view)` in `AppContext` and rendered cleanly in `src/App.tsx` with a localized restriction panel if a restricted URL is requested.

---

## 4. Bilingual Localization & RTL/LTR Engine (`src/locales/translations.ts`)

- Two complete symmetric translation trees (`en` and `fa`), each with **605 leaf strings** and matched `{param}` interpolation placeholders.
- `AppContext` dynamically updates `<html lang="en|fa" dir="ltr|rtl">`.
- Logical CSS utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`) and `rtl:rotate-180` directional icons guarantee balanced layout mirroring.
- `formatDate(dateStr, includeTime)` formats dates using `Intl.DateTimeFormat('fa-IR-u-ca-persian')` when Persian is selected.
- Helper getters (`getRoleLabel`, `getCategoryName`, `getPaymentMethodLabel`, `getPaymentStatusLabel`, `getChangeTypeLabel`) ensure raw internal enum strings never leak into Persian UI.

---

## 5. Theme System (`src/index.css` & `AppContext`)

- Uses Tailwind CSS v4 `@custom-variant dark (&:where(.dark, .dark *));`.
- Supports `'light'`, `'dark'`, and `'system'` modes; initial state defaults to `'system'` and listens to `prefers-color-scheme` changes live.

---

## 6. Reusable Common UI Components (`src/components/common/`)

| Component | Responsibility |
| :--- | :--- |
| `Button.tsx` | Primary, secondary, outline, ghost, and danger action buttons |
| `Input.tsx` | `Input` & `Select` controls with inline validation error & helper text |
| `Modal.tsx` | Accessible dialog wrapper with Escape-key dismissal |
| `ConfirmModal.tsx` | Non-blocking confirmation modal replacing all native `alert`/`confirm` calls |
| `Pagination.tsx` | Bilingual RTL-aware page controls with item range summary |
| `EmptyState.tsx` | Clean zero-result / empty-list UI with optional reset CTA |
| `StatCard.tsx` | Tabular-numeric KPI metric card |
| `Charts.tsx` | Live 7-day rolling Sales vs. Purchases bar visualization computed from state |
| `ToastContainer.tsx` | Auto-dismissing success/warning/error/info notifications |

---

## 7. Print Stylesheets (`src/index.css`)

Custom `@media print` rules isolate `.print-receipt-container` and report tables while hiding `.no-print` chrome (navigation bars, buttons, filters) for clean thermal receipt printing (`FR-16`) and management report printing (`FR-25`–`FR-29`).
