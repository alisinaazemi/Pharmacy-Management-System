import React from 'react';
import {
  FileCheck2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { StatCard } from '../common/StatCard';
import { ActiveView } from '../../types';

export const TraceabilityView: React.FC = () => {
  const { setActiveView, t } = useApp();

  const requirements = [
    {
      code: 'FR-01',
      name: 'User Login & Authentication',
      module: 'Auth & Security',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'dashboard' as ActiveView,
      mechanism: 'Interactive credentials validator, role recognition, session termination',
    },
    {
      code: 'FR-02',
      name: 'User Account Management',
      module: 'User Management',
      roles: 'Admin',
      status: 'Implemented',
      targetView: 'users' as ActiveView,
      mechanism: 'Create staff accounts, role assignment, status toggling, password management',
    },
    {
      code: 'FR-03',
      name: 'Role-Based Access Control (RBAC)',
      module: 'Security Matrix',
      roles: 'Admin / Manager / Cashier',
      status: 'Implemented',
      targetView: 'users' as ActiveView,
      mechanism: 'Top-bar role simulator, menu pruning, view protection, and action guards',
    },
    {
      code: 'FR-04',
      name: 'Add Medicine to Catalog',
      module: 'Medicine Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'medicines' as ActiveView,
      mechanism: 'Full modal with ID, batch, expiration, buy/sell prices, and dosage units',
    },
    {
      code: 'FR-05',
      name: 'Update Existing Medicine',
      module: 'Medicine Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'medicines' as ActiveView,
      mechanism: 'Pre-populated modal with validation, live price recalculation',
    },
    {
      code: 'FR-06',
      name: 'Search & Filter Medicines',
      module: 'Medicine Management',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'medicines' as ActiveView,
      mechanism: 'Multi-parameter search: name, generic name, category, batch, manufacturer',
    },
    {
      code: 'FR-07',
      name: 'Soft Deactivate / Delete Medicine',
      module: 'Medicine Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'medicines' as ActiveView,
      mechanism: 'Preserves sales & purchase history while deactivating from active counter POS',
    },
    {
      code: 'FR-08',
      name: 'Category Management',
      module: 'Category Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'categories' as ActiveView,
      mechanism: 'English & Persian category definitions with live associated medicine counter',
    },
    {
      code: 'FR-09',
      name: 'View Real-Time Stock Quantities',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'inventory' as ActiveView,
      mechanism: 'Live warehouse balance, valuation at purchase cost and retail price',
    },
    {
      code: 'FR-10',
      name: 'Automatic Stock Deduction & Restock',
      module: 'Inventory Management',
      roles: 'System Authoritative',
      status: 'Implemented',
      targetView: 'inventory' as ActiveView,
      mechanism: 'Instant inventory increment upon purchase and decrement upon POS sale checkout',
    },
    {
      code: 'FR-11',
      name: 'Low Stock Safety Alerts',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'inventory' as ActiveView,
      mechanism: 'Flagging items where quantity <= minStockLevel with suggested reorder calculation',
    },
    {
      code: 'FR-12',
      name: 'Expiration Date Monitoring',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'inventory' as ActiveView,
      mechanism: 'Identifies expired batches and near-expiry medications within 30/60 days',
    },
    {
      code: 'FR-13',
      name: 'Inventory Audit & History Log',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'inventory' as ActiveView,
      mechanism: 'Immutable audit trail of sales, purchases, manual reconciliation, and write-offs',
    },
    {
      code: 'FR-14',
      name: 'Create Sale / Counter Transaction',
      module: 'Sales & POS',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'pos' as ActiveView,
      mechanism: 'Counter register, barcode/search quick add, discount, and payment selection',
    },
    {
      code: 'FR-15',
      name: 'Strict Stock Availability Validation',
      module: 'Sales & POS',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'pos' as ActiveView,
      mechanism: 'Prevents checkout if cart exceeds inventory with descriptive stock warning',
    },
    {
      code: 'FR-16',
      name: 'Sales Receipt / Invoice Generation',
      module: 'Sales & POS',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'sales-history' as ActiveView,
      mechanism: 'Official printable thermal receipt with pharmacy license, cashier, and items',
    },
    {
      code: 'FR-17',
      name: 'Sales Transaction History Archive',
      module: 'Sales & POS',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'sales-history' as ActiveView,
      mechanism: 'Searchable sales log by receipt number, customer, cashier, and date range',
    },
    {
      code: 'FR-18',
      name: 'Record Medicine Purchases',
      module: 'Purchase Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'purchases' as ActiveView,
      mechanism: 'Multi-line inward receipt with supplier, supplier invoice number, batch, and expiry',
    },
    {
      code: 'FR-19',
      name: 'Automatic Inventory Update on Purchase',
      module: 'Purchase Management',
      roles: 'System Authoritative',
      status: 'Implemented',
      targetView: 'purchases' as ActiveView,
      mechanism: 'Inward goods increment warehouse quantity and update batch numbers immediately',
    },
    {
      code: 'FR-20',
      name: 'Purchase History Log',
      module: 'Purchase Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'purchases' as ActiveView,
      mechanism: 'Searchable purchase archives with line-item cost drilldown',
    },
    {
      code: 'FR-21',
      name: 'Add Supplier Profile',
      module: 'Supplier Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'suppliers' as ActiveView,
      mechanism: 'Company name, contact representative, telephone, address, terms',
    },
    {
      code: 'FR-22',
      name: 'Update Supplier Information',
      module: 'Supplier Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'suppliers' as ActiveView,
      mechanism: 'Editable supplier record with phone and email validation',
    },
    {
      code: 'FR-23',
      name: 'Supplier Purchase History & Volume',
      module: 'Supplier Management',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'suppliers' as ActiveView,
      mechanism: 'Click-to-view modal with all purchase orders placed with selected supplier',
    },
    {
      code: 'FR-24',
      name: 'Executive Dashboard & Overview',
      module: 'Dashboard',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'dashboard' as ActiveView,
      mechanism: '8 KPI cards, 7-day sales vs purchases chart, alerts widget, recent sales table',
    },
    {
      code: 'FR-25',
      name: 'Sales Financial Reporting',
      module: 'Reporting',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'reports' as ActiveView,
      mechanism: 'Gross revenues, estimated profit margin, transaction frequency, CSV export',
    },
    {
      code: 'FR-26',
      name: 'Purchase Expenditure Reporting',
      module: 'Reporting',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'reports' as ActiveView,
      mechanism: 'Total outlay, supplier breakdown, inward inventory volume, CSV export',
    },
    {
      code: 'FR-27',
      name: 'Inventory Valuation Report',
      module: 'Reporting',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'reports' as ActiveView,
      mechanism: 'Total buy cost vs retail sales valuation, potential profit, category breakdown',
    },
    {
      code: 'FR-28',
      name: 'Expiration Audit Report',
      module: 'Reporting',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'reports' as ActiveView,
      mechanism: 'Lists already expired items and near-expiry items within 60 days with financial loss',
    },
    {
      code: 'FR-29',
      name: 'Low Stock Restock Advisory Report',
      module: 'Reporting',
      roles: 'Admin / Manager',
      status: 'Implemented',
      targetView: 'reports' as ActiveView,
      mechanism: 'Items below threshold with suggested order quantity and estimated outlay',
    },
    {
      code: 'FR-30',
      name: 'Universal Search & Filtering',
      module: 'System Wide',
      roles: 'All Users',
      status: 'Implemented',
      targetView: 'medicines' as ActiveView,
      mechanism: 'Real-time text query and dropdown filters across medicines, sales, purchases, suppliers',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {t('traceability.title')}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {t('traceability.subtitle')}
        </p>
      </div>

      {/* Project Charter Info Card */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('traceability.charterInfo')}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            SRS v1.0 Baseline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-neutral-400 block text-[11px]">{t('traceability.lead')}</span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {t('traceability.leadName')}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Development Methodology</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Agile / Incremental (4 Months)
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Frontend UI Lead</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Ali Seena
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">System Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              100% Frontend Verified
            </span>
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
            {t('traceability.team')}:
          </span>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('traceability.members')}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Functional Reqs" value={t('traceability.stats.frTotal')} subtext="FR-01 to FR-30" />
        <StatCard label="Non-Functional" value={t('traceability.stats.nfrTotal')} subtext="NFR-01 to NFR-08" />
        <StatCard label="Core Modules" value={t('traceability.stats.modulesTotal')} subtext="All implemented" />
        <StatCard label="Bilingual Layout" value="EN & FA" subtext="Full RTL / LTR" />
      </div>

      {/* Requirements Traceability Matrix Table */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            SRS Section 28: Requirements Traceability Matrix
          </h3>
          <span className="text-xs text-neutral-400 font-mono">30 / 30 Verified</span>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.code')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.name')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.module')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.role')}</th>
                <th className="py-2.5 px-3 text-center">{t('traceability.tableHeaders.status')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.verification')}</th>
                <th className="py-2.5 px-3 text-center">Test View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {requirements.map((req) => (
                <tr key={req.code} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {req.code}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                    {req.name}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300">
                    {req.module}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                    {req.roles}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{req.status}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 text-[11px]">
                    {req.mechanism}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setActiveView(req.targetView)}
                      className="p-1 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                      title="Jump to module"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
