import React, { useState, useMemo } from 'react';
import { Search, Receipt, Calendar, UserCheck, ArrowUpDown, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { Button } from '../common/Button';
import { ReceiptModal } from './ReceiptModal';

export const SalesHistoryView: React.FC = () => {
  const { sales, formatCurrency, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cashierFilter, setCashierFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  // Extract unique cashiers
  const cashiers = useMemo(() => {
    return Array.from(new Set(sales.map((s) => s.cashierName)));
  }, [sales]);

  // Filter Sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sale.id.toLowerCase().includes(q) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
        sale.items.some((i) => i.medicineName.toLowerCase().includes(q));

      const matchesCashier =
        cashierFilter === 'all' || sale.cashierName === cashierFilter;

      return matchesSearch && matchesCashier;
    });
  }, [sales, searchQuery, cashierFilter]);

  const totalFilteredRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('salesHistory.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('salesHistory.subtitle')}
          </p>
        </div>

        <div className="text-end">
          <span className="text-xs text-neutral-400 block">Total Filtered Volume</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalFilteredRevenue)}
          </span>
        </div>
      </div>

      {/* Filter Bar (FR-17) */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by receipt # (e.g. INV-2026), medicine name, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">All Cashiers</option>
            {cashiers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-3 text-start">{t('salesHistory.tableHeaders.receiptId')}</th>
                <th className="py-3 px-3 text-start">{t('salesHistory.tableHeaders.dateTime')}</th>
                <th className="py-3 px-3 text-start">{t('salesHistory.tableHeaders.customer')}</th>
                <th className="py-3 px-3 text-start">{t('salesHistory.tableHeaders.cashier')}</th>
                <th className="py-3 px-3 text-center">{t('salesHistory.tableHeaders.itemsCount')}</th>
                <th className="py-3 px-3 text-center">{t('salesHistory.tableHeaders.payment')}</th>
                <th className="py-3 px-3 text-end">{t('salesHistory.tableHeaders.total')}</th>
                <th className="py-3 px-3 text-center">{t('salesHistory.tableHeaders.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {sale.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono tabular-nums">
                      {sale.dateTime}
                    </td>
                    <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                      {sale.customerName}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                      {sale.cashierName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums">
                      {sale.items.length}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-end font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        sale={selectedReceipt}
      />
    </div>
  );
};
