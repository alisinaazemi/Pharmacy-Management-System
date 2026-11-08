import React, { useState, useMemo } from 'react';
import { Truck, Plus, Search, Eye, Calendar, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Purchase } from '../../types';
import { Button } from '../common/Button';
import { NewPurchaseModal } from './NewPurchaseModal';
import { Modal } from '../common/Modal';

interface PurchasesViewProps {
  onOpenNewPurchase: () => void;
  isNewPurchaseOpen: boolean;
  onCloseNewPurchase: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  onOpenNewPurchase,
  isNewPurchaseOpen,
  onCloseNewPurchase,
}) => {
  const { purchases, suppliers, formatCurrency, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q));

      const matchesSupplier = supplierFilter === 'all' || p.supplierId === supplierFilter;

      return matchesSearch && matchesSupplier;
    });
  }, [purchases, searchQuery, supplierFilter]);

  const totalSpent = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('purchases.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('purchases.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenNewPurchase}
          >
            {t('purchases.newPurchaseBtn')}
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Purchase ID, Supplier Company, Invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Purchases Table (FR-20) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-3 text-start">{t('purchases.tableHeaders.id')}</th>
                <th className="py-3 px-3 text-start">{t('purchases.tableHeaders.date')}</th>
                <th className="py-3 px-3 text-start">{t('purchases.tableHeaders.supplier')}</th>
                <th className="py-3 px-3 text-center">{t('purchases.tableHeaders.items')}</th>
                <th className="py-3 px-3 text-end">{t('purchases.tableHeaders.total')}</th>
                <th className="py-3 px-3 text-center">{t('purchases.tableHeaders.payment')}</th>
                <th className="py-3 px-3 text-start">{t('purchases.tableHeaders.receivedBy')}</th>
                <th className="py-3 px-3 text-center">{t('purchases.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {purchase.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono tabular-nums">
                      {purchase.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {purchase.companyName}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        Inv: {purchase.invoiceNumber || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums">
                      {purchase.items.length} items
                    </td>
                    <td className="py-3 px-3 text-end font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {formatCurrency(purchase.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {purchase.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                      {purchase.receivedBy}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        {t('common.viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <NewPurchaseModal isOpen={isNewPurchaseOpen} onClose={onCloseNewPurchase} />

      {/* View Purchase Detail Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={Boolean(selectedPurchase)}
          onClose={() => setSelectedPurchase(null)}
          title={`Purchase Order ${selectedPurchase.id}`}
          subtitle={`${selectedPurchase.companyName} · Invoice: ${selectedPurchase.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg">
              <div>
                <span className="text-neutral-400 block text-[11px]">{t('purchases.purchaseDate')}</span>
                <span className="font-mono tabular-nums font-semibold">{selectedPurchase.date}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">{t('purchases.supplier')}</span>
                <span className="font-semibold">{selectedPurchase.supplierName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">{t('purchases.receivedBy')}</span>
                <span className="font-semibold">{selectedPurchase.receivedBy}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">{t('purchases.paymentStatus')}</span>
                <span className="font-semibold text-emerald-600">{selectedPurchase.paymentStatus}</span>
              </div>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{t('medicines.name')}</th>
                    <th className="py-2.5 px-3 text-start">Batch</th>
                    <th className="py-2.5 px-3 text-start">Expiry</th>
                    <th className="py-2.5 px-3 text-center">{t('common.quantity')}</th>
                    <th className="py-2.5 px-3 text-end">{t('medicines.purchasePrice')}</th>
                    <th className="py-2.5 px-3 text-end">{t('common.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {selectedPurchase.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.medicineName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-500">{item.batchNumber}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-500 tabular-nums">
                        {item.expirationDate}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-end font-mono tabular-nums">
                        {formatCurrency(item.unitPurchasePrice)}
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(item.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-neutral-500 italic">
                {selectedPurchase.notes ? `Note: ${selectedPurchase.notes}` : ''}
              </div>
              <div className="text-end">
                <span className="text-xs text-neutral-400 block">{t('purchases.totalAmount')}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {formatCurrency(selectedPurchase.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPurchase(null)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
