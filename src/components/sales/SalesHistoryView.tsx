import React, { useState, useMemo } from 'react';
import { Search, Receipt } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { Button } from '../common/Button';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { ReceiptModal } from './ReceiptModal';

const PAGE_SIZE = 10;

export const SalesHistoryView: React.FC = () => {
  const { sales, formatCurrency, formatDate, getPaymentMethodLabel, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cashierFilter, setCashierFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  const cashiers = useMemo(() => {
    return Array.from(new Set(sales.map((s) => s.cashierName)));
  }, [sales]);

  const filteredSales = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sales.filter((sale) => {
      const matchesSearch =
        !q ||
        sale.id.toLowerCase().includes(q) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
        sale.items.some((i) => i.medicineName.toLowerCase().includes(q));

      const matchesCashier =
        cashierFilter === 'all' || sale.cashierName === cashierFilter;

      const saleDate = sale.dateTime.slice(0, 10);
      const matchesFrom = !fromDate || saleDate >= fromDate;
      const matchesTo = !toDate || saleDate <= toDate;

      return matchesSearch && matchesCashier && matchesFrom && matchesTo;
    });
  }, [sales, searchQuery, cashierFilter, fromDate, toDate]);

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSales.slice(start, start + PAGE_SIZE);
  }, [filteredSales, page]);

  const totalFilteredRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const hasFilters = Boolean(searchQuery || cashierFilter !== 'all' || fromDate || toDate);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCashierFilter('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

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
          <span className="text-xs text-neutral-400 block">
            {t('salesHistory.totalFilteredVolume')}
          </span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalFilteredRevenue)}
          </span>
        </div>
      </div>

      {/* Filter Bar (FR-17) */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div className="sm:col-span-2 relative">
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t('common.search')}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('salesHistory.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t('salesHistory.filterCashier')}
          </label>
          <select
            value={cashierFilter}
            onChange={(e) => {
              setCashierFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">{t('salesHistory.allCashiers')}</option>
            {cashiers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t('salesHistory.filterDateFrom')}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t('salesHistory.filterDateTo')}
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex justify-end">
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters}>
              {t('common.clearFilters')}
            </Button>
          )}
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
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title={t('common.noResults')}
                      actionLabel={hasFilters ? t('common.clearFilters') : undefined}
                      onAction={clearAllFilters}
                    />
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {sale.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono tabular-nums whitespace-nowrap">
                      {formatDate(sale.dateTime, true)}
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
                        {getPaymentMethodLabel(sale.paymentMethod)}
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
        <Pagination
          currentPage={page}
          totalItems={filteredSales.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
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
