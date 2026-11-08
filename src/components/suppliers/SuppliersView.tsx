import React, { useState, useMemo } from 'react';
import { Building2, Plus, Search, Eye, Edit2, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { Button } from '../common/Button';
import { SupplierModal } from './SupplierModal';
import { SupplierDetailModal } from './SupplierDetailModal';

export const SuppliersView: React.FC = () => {
  const { suppliers, purchases, formatCurrency, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToView, setSupplierToView] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.companyName.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    });
  }, [suppliers, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('suppliers.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('suppliers.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSupplierToEdit(null);
            setIsAddModalOpen(true);
          }}
        >
          {t('suppliers.addSupplier')}
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search suppliers by company, representative, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-3 text-start">{t('suppliers.tableHeaders.id')}</th>
                <th className="py-3 px-3 text-start">{t('suppliers.tableHeaders.company')}</th>
                <th className="py-3 px-3 text-start">{t('suppliers.tableHeaders.contact')}</th>
                <th className="py-3 px-3 text-start">{t('suppliers.tableHeaders.phone')}</th>
                <th className="py-3 px-3 text-center">{t('suppliers.tableHeaders.orders')}</th>
                <th className="py-3 px-3 text-end">{t('suppliers.tableHeaders.totalSpent')}</th>
                <th className="py-3 px-3 text-center">{t('suppliers.tableHeaders.status')}</th>
                <th className="py-3 px-3 text-center">{t('suppliers.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const supPurchases = purchases.filter((p) => p.supplierId === supplier.id);
                  const orderCount = supPurchases.length;
                  const totalSpent = supPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

                  return (
                    <tr key={supplier.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {supplier.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        {supplier.companyName}
                      </td>
                      <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                        {supplier.name}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                        {supplier.phone}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        {orderCount}
                      </td>
                      <td className="py-3 px-3 text-end font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(totalSpent)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {t('common.active')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSupplierToView(supplier)}
                            className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            title={t('common.viewDetails')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSupplierToEdit(supplier)}
                            className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                            title={t('common.edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Modal */}
      <SupplierModal
        isOpen={isAddModalOpen || Boolean(supplierToEdit)}
        onClose={() => {
          setIsAddModalOpen(false);
          setSupplierToEdit(null);
        }}
        supplierToEdit={supplierToEdit}
      />

      {/* Detail & History Modal (FR-23) */}
      <SupplierDetailModal
        isOpen={Boolean(supplierToView)}
        onClose={() => setSupplierToView(null)}
        supplier={supplierToView}
        onEdit={(sup) => setSupplierToEdit(sup)}
      />
    </div>
  );
};
