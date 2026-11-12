import React, { useState, useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';

type DateRangeMode = 'all' | 'today' | '7days' | 'month' | 'custom';

export const ReportsView: React.FC = () => {
  const {
    sales,
    purchases,
    medicines,
    categories,
    suppliers,
    lowStockMedicines,
    expiredMedicines,
    nearExpiryMedicines,
    formatCurrency,
    formatDate,
    getCategoryName,
    getPaymentStatusLabel,
    addToast,
    language,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'sales' | 'purchases' | 'inventory' | 'expirations' | 'lowStock'
  >('sales');
  const [dateRange, setDateRange] = useState<DateRangeMode>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];

  const isWithinDateRange = (isoDateTime: string): boolean => {
    const dateStr = isoDateTime.slice(0, 10);
    if (dateRange === 'all') return true;
    if (dateRange === 'today') return dateStr === todayIso;
    if (dateRange === '7days') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      const startIso = start.toISOString().split('T')[0];
      return dateStr >= startIso && dateStr <= todayIso;
    }
    if (dateRange === 'month') {
      const monthPrefix = todayIso.slice(0, 7);
      return dateStr.startsWith(monthPrefix);
    }
    // custom
    if (customFrom && dateStr < customFrom) return false;
    if (customTo && dateStr > customTo) return false;
    return true;
  };

  const filteredSales = useMemo(
    () => sales.filter((s) => isWithinDateRange(s.dateTime)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales, dateRange, customFrom, customTo]
  );

  const filteredPurchases = useMemo(
    () => purchases.filter((p) => isWithinDateRange(p.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [purchases, dateRange, customFrom, customTo]
  );

  // Financial aggregates
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalSalesCost = filteredSales.reduce((sum, s) => {
    return (
      sum +
      s.items.reduce((itemSum, item) => {
        const med = medicines.find((m) => m.id === item.medicineId);
        return itemSum + (med ? med.purchasePrice * item.quantity : 0);
      }, 0)
    );
  }, 0);
  const estimatedGrossProfit = Math.max(0, totalSalesRevenue - totalSalesCost);
  const profitMarginPct =
    totalSalesRevenue > 0 ? Math.round((estimatedGrossProfit / totalSalesRevenue) * 100) : 0;

  const totalPurchaseSpend = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const inventoryCostValue = medicines.reduce(
    (sum, m) => sum + (m.isActive ? m.quantity * m.purchasePrice : 0),
    0
  );
  const inventoryRetailValue = medicines.reduce(
    (sum, m) => sum + (m.isActive ? m.quantity * m.sellingPrice : 0),
    0
  );
  const inventoryPotentialPct =
    inventoryCostValue > 0
      ? Math.round(((inventoryRetailValue - inventoryCostValue) / inventoryCostValue) * 100)
      : 0;

  // Top selling medicines within selected date filter
  const topMedicines = useMemo(() => {
    const medCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const sale of filteredSales) {
      for (const item of sale.items) {
        if (!medCounts[item.medicineId]) {
          medCounts[item.medicineId] = {
            name: item.medicineName,
            qty: 0,
            revenue: 0,
          };
        }
        medCounts[item.medicineId].qty += item.quantity;
        medCounts[item.medicineId].revenue += item.totalPrice;
      }
    }
    return Object.values(medCounts).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredSales]);

  // Export current report as CSV
  const handleExportCsv = () => {
    const rows: string[] = [];
    const filename = `pms-report-${activeTab}-${todayIso}.csv`;
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

    if (activeTab === 'sales') {
      rows.push(
        [
          t('salesHistory.tableHeaders.receiptId'),
          t('salesHistory.tableHeaders.dateTime'),
          t('salesHistory.tableHeaders.customer'),
          t('salesHistory.tableHeaders.cashier'),
          t('salesHistory.tableHeaders.itemsCount'),
          t('common.subtotal'),
          t('common.discount'),
          t('salesHistory.tableHeaders.total'),
        ]
          .map(escape)
          .join(',')
      );
      filteredSales.forEach((s) => {
        rows.push(
          [
            escape(s.id),
            escape(s.dateTime),
            escape(s.customerName || ''),
            escape(s.cashierName),
            s.items.length,
            s.subtotal,
            s.discount,
            s.grandTotal,
          ].join(',')
        );
      });
    } else if (activeTab === 'purchases') {
      rows.push(
        [
          t('purchases.tableHeaders.id'),
          t('purchases.tableHeaders.date'),
          t('purchases.tableHeaders.supplier'),
          t('purchases.invoiceNumber'),
          t('common.items'),
          t('common.total'),
          t('common.status'),
        ]
          .map(escape)
          .join(',')
      );
      filteredPurchases.forEach((p) => {
        rows.push(
          [
            escape(p.id),
            escape(p.date),
            escape(p.companyName),
            escape(p.invoiceNumber || ''),
            p.items.length,
            p.totalAmount,
            escape(getPaymentStatusLabel(p.paymentStatus)),
          ].join(',')
        );
      });
    } else if (activeTab === 'inventory') {
      rows.push(
        [
          t('medicines.id'),
          t('medicines.name'),
          t('medicines.category'),
          t('medicines.batchNumber'),
          t('medicines.stockQuantity'),
          t('medicines.purchasePrice'),
          t('medicines.sellingPrice'),
          t('reports.totalCostValue'),
          t('reports.totalRetailValue'),
        ]
          .map(escape)
          .join(',')
      );
      medicines
        .filter((m) => m.isActive)
        .forEach((m) => {
          rows.push(
            [
              escape(m.id),
              escape(m.name),
              escape(getCategoryName(m.categoryId, m.categoryName)),
              escape(m.batchNumber),
              m.quantity,
              m.purchasePrice,
              m.sellingPrice,
              m.quantity * m.purchasePrice,
              m.quantity * m.sellingPrice,
            ].join(',')
          );
        });
    } else if (activeTab === 'expirations') {
      rows.push(
        [
          t('medicines.id'),
          t('medicines.name'),
          t('medicines.batchNumber'),
          t('medicines.expiryDate'),
          t('reports.remainingQuantity'),
          t('medicines.purchasePrice'),
          t('reports.financialExposure'),
        ]
          .map(escape)
          .join(',')
      );
      [...expiredMedicines, ...nearExpiryMedicines].forEach((m) => {
        rows.push(
          [
            escape(m.id),
            escape(m.name),
            escape(m.batchNumber),
            escape(m.expirationDate),
            m.quantity,
            m.purchasePrice,
            m.quantity * m.purchasePrice,
          ].join(',')
        );
      });
    } else {
      rows.push(
        [
          t('medicines.id'),
          t('medicines.name'),
          t('medicines.category'),
          t('reports.currentQuantity'),
          t('reports.minSafetyLevel'),
          t('reports.suggestedOrderQty'),
          t('reports.estReplenishmentCost'),
        ]
          .map(escape)
          .join(',')
      );
      lowStockMedicines.forEach((m) => {
        const reorderQty = Math.max(1, m.minStockLevel * 3 - m.quantity);
        rows.push(
          [
            escape(m.id),
            escape(m.name),
            escape(getCategoryName(m.categoryId, m.categoryName)),
            m.quantity,
            m.minStockLevel,
            reorderQty,
            reorderQty * m.purchasePrice,
          ].join(',')
        );
      });
    }

    const csvBlob = new Blob(['\uFEFF' + rows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addToast('success', t('reports.exportSuccess'), filename);
  };

  const handlePrint = () => {
    window.print();
  };

  const dateRangeOptions: { id: DateRangeMode; label: string }[] = [
    { id: 'all', label: t('reports.allTime') },
    { id: 'today', label: t('reports.today') },
    { id: '7days', label: t('reports.last7Days') },
    { id: 'month', label: t('reports.thisMonth') },
    { id: 'custom', label: t('reports.custom') },
  ];

  const showsDateFilter = activeTab === 'sales' || activeTab === 'purchases';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('reports.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('reports.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            {t('reports.exportReport')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            {t('reports.printReport')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs font-semibold overflow-x-auto no-print">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'sales'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {t('reports.tabs.sales')} (FR-25)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'purchases'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {t('reports.tabs.purchases')} (FR-26)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {t('reports.tabs.inventory')} (FR-27)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expirations')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'expirations'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {t('reports.tabs.expirations')} (FR-28)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lowStock')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'lowStock'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {t('reports.tabs.lowStock')} (FR-29)
        </button>
      </div>

      {/* Date Range Filter Bar (Sales & Purchases) */}
      {showsDateFilter && (
        <div className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400 me-2">
              {t('reports.dateRange')}:
            </span>
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  dateRange === opt.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-neutral-500">{t('reports.fromDate')}</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <label className="text-neutral-500">{t('reports.toDate')}</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Sales Report (FR-25) */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('reports.totalRevenue')}
              value={formatCurrency(totalSalesRevenue)}
              subtext={t('reports.transactionsProcessedSub', { count: filteredSales.length })}
            />
            <StatCard
              label={t('reports.netProfit')}
              value={formatCurrency(estimatedGrossProfit)}
              subtext={t('reports.revenueMinusCostSub')}
              trend={{
                value: t('reports.marginPct', { pct: profitMarginPct }),
                isPositive: true,
              }}
            />
            <StatCard
              label={t('reports.averageTransaction')}
              value={formatCurrency(
                filteredSales.length > 0
                  ? Math.round(totalSalesRevenue / filteredSales.length)
                  : 0
              )}
              subtext={t('reports.perReceiptSub')}
            />
            <StatCard
              label={t('reports.totalTransactions')}
              value={filteredSales.length}
              subtext={t('reports.receiptFidelitySub')}
            />
          </div>

          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('reports.topSellingMedicines')}
            </h3>

            {topMedicines.length === 0 ? (
              <EmptyState title={t('common.noData')} />
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {topMedicines.map((m, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {m.name}
                      </span>
                      <span className="text-neutral-400 ms-2">
                        ({t('reports.unitsSoldInline', { count: m.qty })})
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatCurrency(m.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Purchases Report (FR-26) */}
      {activeTab === 'purchases' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('reports.totalPurchaseSpend')}
              value={formatCurrency(totalPurchaseSpend)}
              subtext={t('reports.inwardCostSub')}
            />
            <StatCard
              label={t('reports.purchaseInvoices')}
              value={filteredPurchases.length}
              subtext={t('reports.activeSuppliersSub', {
                count: suppliers.filter((s) => s.isActive).length,
              })}
            />
            <StatCard
              label={t('reports.averageInwardOrder')}
              value={formatCurrency(
                filteredPurchases.length > 0
                  ? Math.round(totalPurchaseSpend / filteredPurchases.length)
                  : 0
              )}
              subtext={t('reports.certifiedDistributorsSub')}
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('purchases.tableHeaders.id')}</th>
                    <th className="py-3 px-3 text-start">{t('common.date')}</th>
                    <th className="py-3 px-3 text-start">{t('purchases.supplier')}</th>
                    <th className="py-3 px-3 text-center">{t('common.items')}</th>
                    <th className="py-3 px-3 text-end">{t('common.amount')}</th>
                    <th className="py-3 px-3 text-center">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState title={t('common.noResults')} />
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-mono font-semibold">{p.id}</td>
                        <td className="py-2.5 px-3 text-neutral-500 font-mono tabular-nums whitespace-nowrap">
                          {formatDate(p.date)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{p.companyName}</td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                          {p.items.length}
                        </td>
                        <td className="py-2.5 px-3 text-end font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">
                          {formatCurrency(p.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {getPaymentStatusLabel(p.paymentStatus)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory Valuation Report (FR-27) */}
      {activeTab === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('reports.totalCostValue')}
              value={formatCurrency(inventoryCostValue)}
              subtext={t('reports.warehouseCostSub')}
            />
            <StatCard
              label={t('reports.totalRetailValue')}
              value={formatCurrency(inventoryRetailValue)}
              subtext={t('reports.expectedRetailSub')}
            />
            <StatCard
              label={t('reports.potentialGrossMargin')}
              value={formatCurrency(inventoryRetailValue - inventoryCostValue)}
              subtext={t('reports.potentialReturnSub', { pct: inventoryPotentialPct })}
              trend={{ value: t('reports.profitableInventory'), isPositive: true }}
            />
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('reports.valuationByCategory')}
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const catMeds = medicines.filter((m) => m.categoryId === cat.id && m.isActive);
                const cost = catMeds.reduce((sum, m) => sum + m.quantity * m.purchasePrice, 0);
                const retail = catMeds.reduce((sum, m) => sum + m.quantity * m.sellingPrice, 0);
                const percentOfTotal =
                  inventoryCostValue > 0 ? Math.round((cost / inventoryCostValue) * 100) : 0;

                return (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {getCategoryName(cat.id, language === 'fa' ? cat.nameFa : cat.name)}
                      </span>
                      <span className="text-neutral-400 ms-2 text-[11px]">
                        ({t('reports.categoryShareMeta', { count: catMeds.length, pct: percentOfTotal })})
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(cost)}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                        {t('reports.retailLabel')}: {formatCurrency(retail)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expiration Audit Report (FR-28) */}
      {activeTab === 'expirations' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label={t('reports.expiredBatchesLabel')}
              value={expiredMedicines.length}
              subtext={t('reports.estimatedCostLoss', {
                amount: formatCurrency(
                  expiredMedicines.reduce((sum, m) => sum + m.quantity * m.purchasePrice, 0)
                ),
              })}
              trend={{
                value: t('reports.itemsCountBadge', { count: expiredMedicines.length }),
                isWarning: true,
              }}
            />
            <StatCard
              label={t('reports.expiringWithin60Label')}
              value={nearExpiryMedicines.length}
              subtext={t('reports.totalValueAtRisk', {
                amount: formatCurrency(
                  nearExpiryMedicines.reduce((sum, m) => sum + m.quantity * m.sellingPrice, 0)
                ),
              })}
              trend={{
                value: t('reports.itemsCountBadge', { count: nearExpiryMedicines.length }),
                isWarning: true,
              }}
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.batchNumber')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.expiryDate')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.remainingQuantity')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.shelfStatus')}</th>
                    <th className="py-3 px-3 text-end">{t('reports.financialExposure')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {[...expiredMedicines, ...nearExpiryMedicines].length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState title={t('inventory.noExpiredBatches')} />
                      </td>
                    </tr>
                  ) : (
                    [...expiredMedicines, ...nearExpiryMedicines].map((med) => {
                      const isExp = new Date(med.expirationDate) < today;
                      return (
                        <tr key={med.id}>
                          <td className="py-2.5 px-3 font-semibold">{med.name}</td>
                          <td className="py-2.5 px-3 font-mono text-neutral-500">
                            {med.batchNumber}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                            {formatDate(med.expirationDate)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                            {med.quantity} {med.unit}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[11px] font-bold ${
                                isExp
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {isExp ? t('statusLabels.expired') : t('statusLabels.nearExpiry')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-end font-mono font-semibold tabular-nums">
                            {formatCurrency(med.quantity * med.purchasePrice)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Low Stock Restock Report (FR-29) */}
      {activeTab === 'lowStock' && (
        <div className="space-y-5">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold text-sm mb-1">{t('reports.restockAdvisoryTitle')}</p>
            <p>{t('reports.restockAdvisoryDesc')}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.category')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.currentQuantity')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.minSafetyLevel')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.suggestedOrderQty')}</th>
                    <th className="py-3 px-3 text-end">{t('reports.estReplenishmentCost')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {lowStockMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState title={t('inventory.allAboveThreshold')} />
                      </td>
                    </tr>
                  ) : (
                    lowStockMedicines.map((med) => {
                      const reorderQty = Math.max(1, med.minStockLevel * 3 - med.quantity);
                      const estCost = reorderQty * med.purchasePrice;

                      return (
                        <tr key={med.id}>
                          <td className="py-2.5 px-3 font-semibold">{med.name}</td>
                          <td className="py-2.5 px-3 text-neutral-500">
                            {getCategoryName(med.categoryId, med.categoryName)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                            {med.quantity} {med.unit}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-neutral-500 tabular-nums">
                            {med.minStockLevel} {med.unit}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +{reorderQty} {med.unit}
                          </td>
                          <td className="py-2.5 px-3 text-end font-mono font-bold tabular-nums">
                            {formatCurrency(estCost)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
