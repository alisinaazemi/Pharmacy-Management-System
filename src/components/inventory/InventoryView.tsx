import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Clock,
  History,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { Medicine } from '../../types';

interface InventoryViewProps {
  onOpenStockAdjustment: () => void;
  isAdjustmentModalOpen: boolean;
  onCloseAdjustmentModal: () => void;
  onOpenNewPurchase?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenStockAdjustment,
  isAdjustmentModalOpen,
  onCloseAdjustmentModal,
  onOpenNewPurchase,
}) => {
  const {
    medicines,
    categories,
    inventoryTransactions,
    lowStockMedicines,
    expiredMedicines,
    nearExpiryMedicines,
    formatCurrency,
    currentRole,
    setActiveView,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'lowStock' | 'expirations' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adjustTargetMedId, setAdjustTargetMedId] = useState<string | undefined>(undefined);

  const today = new Date();

  // Tab 1: Current Stock Filtered
  const filteredMedicines = medicines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.batchNumber.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'all' || m.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Tab 3: Expiration Grouping
  const expiringWithin30Days = medicines.filter((m) => {
    const exp = new Date(m.expirationDate);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  const expiringWithin90Days = medicines.filter((m) => {
    const exp = new Date(m.expirationDate);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 30 && diff <= 90;
  });

  const openQuickAdjust = (medId: string) => {
    setAdjustTargetMedId(medId);
    onOpenStockAdjustment();
  };

  return (
    <div className="space-y-5">
      {/* Header & Adjust Stock Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('inventory.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('inventory.subtitle')}
          </p>
        </div>

        {currentRole !== 'Cashier' && (
          <Button
            variant="primary"
            size="sm"
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => {
              setAdjustTargetMedId(undefined);
              onOpenStockAdjustment();
            }}
          >
            {t('inventory.adjustStockBtn')}
          </Button>
        )}
      </div>

      {/* Tabs Navigation (Zero-pill segmented style) */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{t('inventory.tabs.allStock')}</span>
          <span className="text-[11px] text-neutral-400 tabular-nums">({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lowStock')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'lowStock'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{t('inventory.tabs.lowStock')}</span>
          {lowStockMedicines.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] tabular-nums font-bold">
              {lowStockMedicines.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('expirations')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'expirations'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-500" />
          <span>{t('inventory.tabs.expirations')}</span>
          {expiredMedicines.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] tabular-nums font-bold">
              {expiredMedicines.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('inventory.tabs.auditHistory')}</span>
          <span className="text-[11px] text-neutral-400 tabular-nums">({inventoryTransactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Current Stock */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t('medicines.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value="all">{t('medicines.allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('medicines.id')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.batchNumber')}</th>
                    <th className="py-3 px-3 text-center">{t('medicines.stockQuantity')}</th>
                    <th className="py-3 px-3 text-center">{t('medicines.minStockLevel')}</th>
                    <th className="py-3 px-3 text-end">{t('reports.totalCostValue')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.expiryDate')}</th>
                    <th className="py-3 px-3 text-center">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredMedicines.map((med) => {
                    const isLow = med.quantity <= med.minStockLevel;
                    const isExp = new Date(med.expirationDate) < today;

                    return (
                      <tr key={med.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                          {med.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {med.name}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {med.categoryName} · {med.unit}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-400">
                          {med.batchNumber}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold tabular-nums text-sm ${
                              isLow
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {med.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-neutral-400">
                          {med.minStockLevel}
                        </td>
                        <td className="py-3 px-3 text-end font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                          {formatCurrency(med.quantity * med.purchasePrice)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">
                          <span className={isExp ? 'text-rose-600 font-bold' : 'text-neutral-600 dark:text-neutral-400'}>
                            {med.expirationDate}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {currentRole !== 'Cashier' && (
                            <button
                              onClick={() => openQuickAdjust(med.id)}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold cursor-pointer"
                            >
                              {t('header.adjustStock')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Low Stock Alerts (FR-11) */}
      {activeTab === 'lowStock' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <div className="font-semibold text-sm mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Critical Reorder Threshold Monitoring (FR-11)</span>
            </div>
            <p>
              The following pharmaceutical items are currently at or below their defined safety stock
              threshold. Restocking orders should be placed immediately with approved suppliers.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                  <th className="py-3 px-3 text-start">{t('medicines.category')}</th>
                  <th className="py-3 px-3 text-center">{t('medicines.stockQuantity')}</th>
                  <th className="py-3 px-3 text-center">{t('medicines.minStockLevel')}</th>
                  <th className="py-3 px-3 text-center">Suggested Reorder Qty</th>
                  <th className="py-3 px-3 text-center">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {lowStockMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      All inventory stock levels are currently above minimum safety thresholds.
                    </td>
                  </tr>
                ) : (
                  lowStockMedicines.map((med) => {
                    const suggestedOrder = med.minStockLevel * 3 - med.quantity;
                    return (
                      <tr key={med.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-neutral-900 dark:text-neutral-100">{med.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">ID: {med.id} · Batch: {med.batchNumber}</div>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">{med.categoryName}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm tabular-nums">
                            {med.quantity} {med.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-neutral-500">
                          {med.minStockLevel} {med.unit}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-600 tabular-nums">
                          +{suggestedOrder} {med.unit}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {currentRole !== 'Cashier' && onOpenNewPurchase && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setActiveView('purchases');
                                  onOpenNewPurchase();
                                }}
                              >
                                {t('header.newPurchase')}
                              </Button>
                            )}
                            {currentRole !== 'Cashier' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openQuickAdjust(med.id)}
                              >
                                {t('header.adjustStock')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expiration Monitoring (FR-12) */}
      {activeTab === 'expirations' && (
        <div className="space-y-6">
          {/* Section: Expired Medicines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Expired Batches Requiring Disposal ({expiredMedicines.length})</span>
              </h3>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.batchNumber')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.expiryDate')}</th>
                    <th className="py-3 px-3 text-center">{t('medicines.stockQuantity')}</th>
                    <th className="py-3 px-3 text-end">Estimated Value Loss</th>
                    <th className="py-3 px-3 text-center">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {expiredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        No expired batches currently in warehouse storage.
                      </td>
                    </tr>
                  ) : (
                    expiredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                          {med.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-300">
                          {med.batchNumber}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-600 tabular-nums">
                          {med.expirationDate}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums">
                          {med.quantity} {med.unit}
                        </td>
                        <td className="py-3 px-3 text-end font-semibold text-rose-600 tabular-nums">
                          {formatCurrency(med.quantity * med.purchasePrice)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {currentRole !== 'Cashier' && (
                            <button
                              onClick={() => openQuickAdjust(med.id)}
                              className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                            >
                              Write-Off Batch
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Expiring within 30 - 60 Days */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Approaching Expiration within 60 Days ({nearExpiryMedicines.length})</span>
            </h3>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('medicines.name')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.batchNumber')}</th>
                    <th className="py-3 px-3 text-start">{t('medicines.expiryDate')}</th>
                    <th className="py-3 px-3 text-center">{t('medicines.stockQuantity')}</th>
                    <th className="py-3 px-3 text-end">{t('reports.totalRetailValue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {nearExpiryMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400">
                        No medicines approaching expiration within the next 60 days.
                      </td>
                    </tr>
                  ) : (
                    nearExpiryMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                          {med.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-400">
                          {med.batchNumber}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-amber-600 tabular-nums">
                          {med.expirationDate}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums">
                          {med.quantity} {med.unit}
                        </td>
                        <td className="py-3 px-3 text-end font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                          {formatCurrency(med.quantity * med.sellingPrice)}
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

      {/* Tab 4: Inventory Change History / Audit Trail (FR-13) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                Official Inventory Audit Trail (FR-13)
              </p>
              <p className="text-neutral-500">
                Full chronological record of stock updates caused by sales, purchases, adjustments, and disposals.
              </p>
            </div>
            <span className="font-mono text-neutral-500 tabular-nums font-semibold">
              {inventoryTransactions.length} events logged
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-start">{t('inventory.tableHeaders.date')}</th>
                    <th className="py-3 px-3 text-start">{t('inventory.tableHeaders.medicine')}</th>
                    <th className="py-3 px-3 text-start">{t('inventory.tableHeaders.type')}</th>
                    <th className="py-3 px-3 text-center">{t('inventory.tableHeaders.quantityChange')}</th>
                    <th className="py-3 px-3 text-center">{t('inventory.tableHeaders.resultingStock')}</th>
                    <th className="py-3 px-3 text-start">{t('inventory.tableHeaders.transactionRef')}</th>
                    <th className="py-3 px-3 text-start">{t('inventory.tableHeaders.user')}</th>
                    <th className="py-3 px-3 text-start">{t('inventory.tableHeaders.reason')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {inventoryTransactions.map((tx) => {
                    const isAddition = tx.quantityChanged > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-3 text-neutral-500 font-mono tabular-nums whitespace-nowrap">
                          {tx.dateTime}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                          {tx.medicineName}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                            {tx.changeType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                          <span
                            className={
                              isAddition
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {isAddition ? `+${tx.quantityChanged}` : tx.quantityChanged}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-neutral-800 dark:text-neutral-200 tabular-nums">
                          {tx.newQuantity}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-500">
                          {tx.relatedTransactionId || '-'}
                        </td>
                        <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                          {tx.userResponsible}
                        </td>
                        <td className="py-3 px-3 text-neutral-500 italic max-w-xs truncate">
                          {tx.reason || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={onCloseAdjustmentModal}
        preselectedMedicineId={adjustTargetMedId}
      />
    </div>
  );
};
