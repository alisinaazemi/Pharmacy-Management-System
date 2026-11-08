import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Boxes,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { StatCard } from '../common/StatCard';

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
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'inventory' | 'expirations' | 'lowStock'>('sales');
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'all'>('month');

  const today = new Date();

  // Financial aggregates
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalSalesCost = sales.reduce((sum, s) => {
    return (
      sum +
      s.items.reduce((itemSum, item) => {
        const med = medicines.find((m) => m.id === item.medicineId);
        return itemSum + (med ? med.purchasePrice * item.quantity : 0);
      }, 0)
    );
  }, 0);
  const estimatedGrossProfit = Math.max(0, totalSalesRevenue - totalSalesCost);

  const totalPurchaseSpend = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const inventoryCostValue = medicines.reduce(
    (sum, m) => sum + (m.isActive ? m.quantity * m.purchasePrice : 0),
    0
  );
  const inventoryRetailValue = medicines.reduce(
    (sum, m) => sum + (m.isActive ? m.quantity * m.sellingPrice : 0),
    0
  );

  // Top selling medicines
  const topMedicines = useMemo(() => {
    const medCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const sale of sales) {
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
  }, [sales]);

  // Export current report as CSV
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `pms-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'sales') {
      csvContent += 'Receipt ID,Date,Customer,Cashier,Items Count,Subtotal,Discount,Grand Total\n';
      sales.forEach((s) => {
        csvContent += `"${s.id}","${s.dateTime}","${s.customerName}","${s.cashierName}",${s.items.length},${s.subtotal},${s.discount},${s.grandTotal}\n`;
      });
    } else if (activeTab === 'purchases') {
      csvContent += 'Purchase ID,Date,Supplier,Invoice Number,Items Count,Total Amount,Status\n';
      purchases.forEach((p) => {
        csvContent += `"${p.id}","${p.date}","${p.companyName}","${p.invoiceNumber || ''}",${p.items.length},${p.totalAmount},"${p.paymentStatus}"\n`;
      });
    } else if (activeTab === 'inventory') {
      csvContent += 'Medicine ID,Name,Category,Batch,Quantity,Purchase Price,Selling Price,Inventory Cost,Retail Valuation\n';
      medicines.forEach((m) => {
        csvContent += `"${m.id}","${m.name}","${m.categoryName}","${m.batchNumber}",${m.quantity},${m.purchasePrice},${m.sellingPrice},${m.quantity * m.purchasePrice},${m.quantity * m.sellingPrice}\n`;
      });
    } else if (activeTab === 'expirations') {
      csvContent += 'Medicine ID,Name,Batch,Expiration Date,Quantity,Purchase Price,Estimated Loss\n';
      [...expiredMedicines, ...nearExpiryMedicines].forEach((m) => {
        csvContent += `"${m.id}","${m.name}","${m.batchNumber}","${m.expirationDate}",${m.quantity},${m.purchasePrice},${m.quantity * m.purchasePrice}\n`;
      });
    } else {
      csvContent += 'Medicine ID,Name,Category,Stock Quantity,Min Stock Level,Suggested Reorder\n';
      lowStockMedicines.forEach((m) => {
        csvContent += `"${m.id}","${m.name}","${m.categoryName}",${m.quantity},${m.minStockLevel},${m.minStockLevel * 3 - m.quantity}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

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

        <div className="flex items-center gap-2">
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

      {/* Tab 1: Sales Report (FR-25) */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('reports.totalRevenue')}
              value={formatCurrency(totalSalesRevenue)}
              subtext={`${sales.length} transactions processed`}
            />
            <StatCard
              label={t('reports.netProfit')}
              value={formatCurrency(estimatedGrossProfit)}
              subtext="Revenues minus buy cost"
              trend={{ value: `${Math.round((estimatedGrossProfit / (totalSalesRevenue || 1)) * 100)}% margin`, isPositive: true }}
            />
            <StatCard
              label={t('reports.averageTransaction')}
              value={formatCurrency(sales.length > 0 ? Math.round(totalSalesRevenue / sales.length) : 0)}
              subtext="Per receipt basket"
            />
            <StatCard
              label={t('reports.totalTransactions')}
              value={sales.length}
              subtext="100% receipt fidelity"
            />
          </div>

          {/* Top Selling Products */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('reports.topSellingMedicines')}
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {topMedicines.map((m, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{m.name}</span>
                    <span className="text-neutral-400 ms-2">({m.qty} {t('common.units')} sold)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(m.revenue)}
                  </span>
                </div>
              ))}
            </div>
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
              subtext="Inward inventory cost"
            />
            <StatCard
              label="Purchase Invoices"
              value={purchases.length}
              subtext={`${suppliers.length} active suppliers`}
            />
            <StatCard
              label="Average Inward Order"
              value={formatCurrency(purchases.length > 0 ? Math.round(totalPurchaseSpend / purchases.length) : 0)}
              subtext="Across certified distributors"
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-3 text-start">Purchase #</th>
                  <th className="py-3 px-3 text-start">{t('common.date')}</th>
                  <th className="py-3 px-3 text-start">{t('purchases.supplier')}</th>
                  <th className="py-3 px-3 text-center">{t('common.items')}</th>
                  <th className="py-3 px-3 text-end">{t('common.amount')}</th>
                  <th className="py-3 px-3 text-center">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono font-semibold">{p.id}</td>
                    <td className="py-2.5 px-3 text-neutral-500 font-mono tabular-nums">{p.date}</td>
                    <td className="py-2.5 px-3 font-semibold">{p.companyName}</td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums">{p.items.length}</td>
                    <td className="py-2.5 px-3 text-end font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[11px] font-semibold text-emerald-600">{p.paymentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              subtext="Warehouse cost valuation"
            />
            <StatCard
              label={t('reports.totalRetailValue')}
              value={formatCurrency(inventoryRetailValue)}
              subtext="Expected gross retail returns"
            />
            <StatCard
              label={t('reports.potentialGrossMargin')}
              value={formatCurrency(inventoryRetailValue - inventoryCostValue)}
              subtext={`${Math.round(((inventoryRetailValue - inventoryCostValue) / (inventoryCostValue || 1)) * 100)}% potential return`}
              trend={{ value: 'Profitable inventory', isPositive: true }}
            />
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Valuation by Category
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const catMeds = medicines.filter((m) => m.categoryId === cat.id && m.isActive);
                const cost = catMeds.reduce((sum, m) => sum + m.quantity * m.purchasePrice, 0);
                const retail = catMeds.reduce((sum, m) => sum + m.quantity * m.sellingPrice, 0);
                const percentOfTotal = inventoryCostValue > 0 ? Math.round((cost / inventoryCostValue) * 100) : 0;

                return (
                  <div key={cat.id} className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cat.name}</span>
                      <span className="text-neutral-400 ms-2 text-[11px]">({catMeds.length} items · {percentOfTotal}% of total)</span>
                    </div>
                    <div className="text-end">
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(cost)}
                      </span>
                      <span className="text-[10px] text-emerald-600 block">Retail: {formatCurrency(retail)}</span>
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
              label="Expired Batches"
              value={expiredMedicines.length}
              subtext={`Estimated cost loss: ${formatCurrency(
                expiredMedicines.reduce((sum, m) => sum + m.quantity * m.purchasePrice, 0)
              )}`}
              trend={{ value: `${expiredMedicines.length} items`, isWarning: true }}
            />
            <StatCard
              label="Expiring Within 60 Days"
              value={nearExpiryMedicines.length}
              subtext={`Total value at risk: ${formatCurrency(
                nearExpiryMedicines.reduce((sum, m) => sum + m.quantity * m.sellingPrice, 0)
              )}`}
              trend={{ value: `${nearExpiryMedicines.length} items`, isWarning: true }}
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                  <th className="py-3 px-3 text-start">Batch</th>
                  <th className="py-3 px-3 text-start">Expiry Date</th>
                  <th className="py-3 px-3 text-center">Remaining Quantity</th>
                  <th className="py-3 px-3 text-center">Shelf Status</th>
                  <th className="py-3 px-3 text-end">Financial Exposure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {[...expiredMedicines, ...nearExpiryMedicines].map((med) => {
                  const isExp = new Date(med.expirationDate) < today;
                  return (
                    <tr key={med.id}>
                      <td className="py-2.5 px-3 font-semibold">{med.name}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-500">{med.batchNumber}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">{med.expirationDate}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                        {med.quantity} {med.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold ${
                            isExp ? 'text-rose-600' : 'text-amber-600'
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Low Stock Restock Report (FR-29) */}
      {activeTab === 'lowStock' && (
        <div className="space-y-5">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold text-sm mb-1">Stock Replenishment Advisory (FR-29)</p>
            <p>
              Quantities calculated based on average monthly burn rate and manufacturer minimum order thresholds.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                  <th className="py-3 px-3 text-start">{t('medicines.category')}</th>
                  <th className="py-3 px-3 text-center">Current Quantity</th>
                  <th className="py-3 px-3 text-center">Min Safety Level</th>
                  <th className="py-3 px-3 text-center">Suggested Order Qty</th>
                  <th className="py-3 px-3 text-end">Est. Replenishment Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {lowStockMedicines.map((med) => {
                  const reorderQty = med.minStockLevel * 3 - med.quantity;
                  const estCost = reorderQty * med.purchasePrice;

                  return (
                    <tr key={med.id}>
                      <td className="py-2.5 px-3 font-semibold">{med.name}</td>
                      <td className="py-2.5 px-3 text-neutral-500">{med.categoryName}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600 tabular-nums">
                        {med.quantity} {med.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-500 tabular-nums">
                        {med.minStockLevel} {med.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 tabular-nums">
                        +{reorderQty} {med.unit}
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono font-bold tabular-nums">
                        {formatCurrency(estCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
