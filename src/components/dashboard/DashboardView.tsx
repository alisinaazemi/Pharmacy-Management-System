import React, { useState } from 'react';
import {
  Pill,
  Boxes,
  AlertTriangle,
  Clock,
  CircleDollarSign,
  TrendingUp,
  Building2,
  Tags,
  Receipt,
  Plus,
  ShoppingCart,
  Truck,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { SalesVsPurchasesChart } from '../common/Charts';
import { ReceiptModal } from '../sales/ReceiptModal';
import { Sale } from '../../types';

interface DashboardViewProps {
  onOpenAddMedicine: () => void;
  onOpenNewPurchase: () => void;
  onOpenStockAdjustment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddMedicine,
  onOpenNewPurchase,
  onOpenStockAdjustment,
}) => {
  const {
    medicines,
    categories,
    suppliers,
    sales,
    purchases,
    lowStockMedicines,
    expiredMedicines,
    nearExpiryMedicines,
    formatCurrency,
    formatDate,
    setActiveView,
    currentRole,
    t,
  } = useApp();

  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  const totalStockUnits = medicines.reduce((sum, m) => sum + (m.isActive ? m.quantity : 0), 0);
  const totalInventoryCost = medicines.reduce(
    (sum, m) => sum + (m.isActive ? m.quantity * m.purchasePrice : 0),
    0
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter((s) => s.dateTime.startsWith(todayStr));
  const todaySales = todaySalesList.reduce((sum, s) => sum + s.grandTotal, 0);
  const monthlySales = sales.reduce((sum, s) => sum + s.grandTotal, 0);

  const recentSales = sales.slice(0, 5);

  const urgentAlerts = [
    ...expiredMedicines.map((m) => ({
      ...m,
      alertType: 'expired' as const,
      message: t('statusLabels.expired'),
    })),
    ...nearExpiryMedicines.map((m) => ({
      ...m,
      alertType: 'nearExpiry' as const,
      message: t('statusLabels.nearExpiry'),
    })),
    ...lowStockMedicines.map((m) => ({
      ...m,
      alertType: 'lowStock' as const,
      message: `${m.quantity} / ${m.minStockLevel} ${t('common.units')}`,
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => setActiveView('pos')}
          >
            {t('header.quickSale')}
          </Button>

          {currentRole !== 'Cashier' && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={onOpenAddMedicine}
              >
                {t('header.addMedicine')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Truck className="w-4 h-4" />}
                onClick={onOpenNewPurchase}
              >
                {t('header.newPurchase')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={onOpenStockAdjustment}
              >
                {t('header.adjustStock')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.totalMedicines')}
          value={medicines.filter((m) => m.isActive).length}
          subtext={t('dashboard.categoriesCountLabel', { count: categories.filter((c) => c.isActive).length })}
          icon={<Pill className="w-5 h-5" />}
          onClick={() => setActiveView('medicines')}
        />

        <StatCard
          label={t('dashboard.totalStockUnits')}
          value={totalStockUnits.toLocaleString()}
          subtext={`${t('dashboard.inventoryValue')}: ${formatCurrency(totalInventoryCost)}`}
          icon={<Boxes className="w-5 h-5" />}
          onClick={() => (currentRole !== 'Cashier' ? setActiveView('inventory') : setActiveView('medicines'))}
        />

        <StatCard
          label={t('dashboard.todaySales')}
          value={formatCurrency(todaySales)}
          subtext={t('dashboard.ordersCount', { count: todaySalesList.length })}
          icon={<CircleDollarSign className="w-5 h-5" />}
          trend={{ value: t('dashboard.ordersCount', { count: sales.length }), isPositive: true }}
          onClick={() => setActiveView('sales-history')}
        />

        <StatCard
          label={t('dashboard.monthlySales')}
          value={formatCurrency(monthlySales)}
          subtext={t('dashboard.purchasesCount', { count: purchases.length })}
          icon={<TrendingUp className="w-5 h-5" />}
          onClick={() => (currentRole !== 'Cashier' ? setActiveView('reports') : setActiveView('sales-history'))}
        />

        <StatCard
          label={t('dashboard.lowStockAlerts')}
          value={lowStockMedicines.length}
          subtext={
            lowStockMedicines.length > 0
              ? t('dashboard.requiresRestocking')
              : t('dashboard.optimalLevels')
          }
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={{
            value:
              lowStockMedicines.length > 0
                ? t('dashboard.criticalCountLabel', { count: lowStockMedicines.length })
                : t('dashboard.noneLabel'),
            isWarning: lowStockMedicines.length > 0,
            isPositive: lowStockMedicines.length === 0,
          }}
          onClick={() => currentRole !== 'Cashier' && setActiveView('inventory')}
        />

        <StatCard
          label={t('dashboard.expiredMedicines')}
          value={expiredMedicines.length + nearExpiryMedicines.length}
          subtext={`${t('dashboard.expiredShort', { count: expiredMedicines.length })} · ${t('dashboard.nearExpiryShort', { count: nearExpiryMedicines.length })}`}
          icon={<Clock className="w-5 h-5" />}
          trend={{
            value:
              expiredMedicines.length > 0
                ? t('dashboard.expiredShort', { count: expiredMedicines.length })
                : t('dashboard.clearStatus'),
            isWarning: expiredMedicines.length > 0,
            isPositive: expiredMedicines.length === 0,
          }}
          onClick={() => currentRole !== 'Cashier' && setActiveView('inventory')}
        />

        <StatCard
          label={t('dashboard.activeSuppliers')}
          value={suppliers.filter((s) => s.isActive).length}
          subtext={t('dashboard.purchasesCount', { count: purchases.length })}
          icon={<Building2 className="w-5 h-5" />}
          onClick={() => currentRole !== 'Cashier' && setActiveView('suppliers')}
        />

        <StatCard
          label={t('nav.categories')}
          value={categories.filter((c) => c.isActive).length}
          subtext={t('dashboard.therapeuticCategories')}
          icon={<Tags className="w-5 h-5" />}
          onClick={() => currentRole !== 'Cashier' && setActiveView('categories')}
        />
      </div>

      {/* Main Dashboard Split: Sales Chart + Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Purchases Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {t('dashboard.salesVsPurchasesTrend')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('dashboard.salesVsPurchasesSubtitle')}
              </p>
            </div>
          </div>
          <SalesVsPurchasesChart />
        </div>

        {/* Stock & Expiration Urgent Alerts Widget (1 Col) */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t('dashboard.urgentAlertsTitle')}</span>
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums font-mono">
                {urgentAlerts.length}
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 mt-2">
              {urgentAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  {t('dashboard.noAlerts')}
                </div>
              ) : (
                urgentAlerts.map((med, idx) => (
                  <div key={`${med.id}-${med.alertType}-${idx}`} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pe-2">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {med.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span>
                          {t('dashboard.batchPrefix')}: {med.batchNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {t('dashboard.expPrefix')}: {formatDate(med.expirationDate)}
                        </span>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span
                        className={`text-[11px] font-bold tabular-nums ${
                          med.alertType === 'expired'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {med.message}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              type="button"
              onClick={() => setActiveView(currentRole === 'Cashier' ? 'medicines' : 'inventory')}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>{t('dashboard.viewAllMedicines')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sales Transactions (FR-17, FR-24) */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('dashboard.recentSalesTitle')}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('dashboard.recentSalesSubtitle')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('sales-history')}
          >
            {t('dashboard.viewAllSales')}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-3 text-start">{t('dashboard.transactionId')}</th>
                <th className="py-2.5 px-3 text-start">{t('common.dateTime')}</th>
                <th className="py-2.5 px-3 text-start">{t('dashboard.customer')}</th>
                <th className="py-2.5 px-3 text-start">{t('dashboard.cashier')}</th>
                <th className="py-2.5 px-3 text-center">{t('common.items')}</th>
                <th className="py-2.5 px-3 text-end">{t('dashboard.grandTotal')}</th>
                <th className="py-2.5 px-3 text-center">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                    {sale.id}
                  </td>
                  <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400 tabular-nums">
                    {formatDate(sale.dateTime, true)}
                  </td>
                  <td className="py-3 px-3 text-neutral-800 dark:text-neutral-200">
                    {sale.customerName}
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                    {sale.cashierName}
                  </td>
                  <td className="py-3 px-3 text-center tabular-nums">
                    {sale.items.length}
                  </td>
                  <td className="py-3 px-3 text-end font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(sale.grandTotal)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Receipt className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedReceipt(sale)}
                    >
                      {t('common.viewInvoice')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        sale={selectedReceipt}
      />
    </div>
  );
};
