/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationToastContainer } from './components/common/NotificationToast';
import { DashboardView } from './components/dashboard/DashboardView';
import { MedicinesView } from './components/medicines/MedicinesView';
import { CategoriesView } from './components/categories/CategoriesView';
import { InventoryView } from './components/inventory/InventoryView';
import { PosView } from './components/sales/PosView';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { TraceabilityView } from './components/traceability/TraceabilityView';
import { LoginView } from './components/auth/LoginView';
import { ShieldAlert } from 'lucide-react';
import { Button } from './components/common/Button';

const MainLayout: React.FC = () => {
  const {
    activeView,
    setActiveView,
    hasPermission,
    currentRole,
    getRoleLabel,
    isLoggedIn,
    t,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global modal triggers accessible from anywhere
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const isAllowed = hasPermission(activeView);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto overflow-x-hidden">
          {!isAllowed ? (
            /* Role Permission Restricted Guard (FR-03) */
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {t('roles.restrictedAccess')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {t('roles.restrictedMessage')} ({getRoleLabel(currentRole)})
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveView('dashboard')}
                >
                  {t('returnToDashboard')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && (
                <DashboardView
                  onOpenAddMedicine={() => setIsAddMedicineOpen(true)}
                  onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
                  onOpenStockAdjustment={() => setIsStockAdjustmentOpen(true)}
                />
              )}
              {activeView === 'pos' && <PosView />}
              {activeView === 'sales-history' && <SalesHistoryView />}
              {activeView === 'medicines' && (
                <MedicinesView
                  isAddModalOpen={isAddMedicineOpen}
                  onOpenAddMedicine={() => setIsAddMedicineOpen(true)}
                  onCloseAddModal={() => setIsAddMedicineOpen(false)}
                />
              )}
              {activeView === 'categories' && <CategoriesView />}
              {activeView === 'inventory' && (
                <InventoryView
                  isAdjustmentModalOpen={isStockAdjustmentOpen}
                  onOpenStockAdjustment={() => setIsStockAdjustmentOpen(true)}
                  onCloseAdjustmentModal={() => setIsStockAdjustmentOpen(false)}
                  onOpenNewPurchase={() => {
                    setActiveView('purchases');
                    setIsNewPurchaseOpen(true);
                  }}
                />
              )}
              {activeView === 'purchases' && (
                <PurchasesView
                  isNewPurchaseOpen={isNewPurchaseOpen}
                  onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
                  onCloseNewPurchase={() => setIsNewPurchaseOpen(false)}
                />
              )}
              {activeView === 'suppliers' && <SuppliersView />}
              {activeView === 'reports' && <ReportsView />}
              {activeView === 'users' && <UsersView />}
              {activeView === 'settings' && <SettingsView />}
              {activeView === 'traceability' && <TraceabilityView />}
            </>
          )}
        </main>
      </div>

      {/* Global Notifications Container */}
      <NotificationToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
