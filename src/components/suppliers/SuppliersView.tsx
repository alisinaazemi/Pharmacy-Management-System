import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit2, ShieldBan, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { Button } from '../common/Button';
import { ConfirmModal } from '../common/ConfirmModal';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { SupplierModal } from './SupplierModal';
import { SupplierDetailModal } from './SupplierDetailModal';

const PAGE_SIZE = 10;

export const SuppliersView: React.FC = () => {
  const { suppliers, purchases, formatCurrency, toggleSupplierActive, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToView, setSupplierToView] = useState<Supplier | null>(null);
  const [supplierToToggle, setSupplierToToggle] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return suppliers.filter((s) => {
      const matchesSearch =
        !q ||
        s.companyName.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.isActive) ||
        (statusFilter === 'inactive' && !s.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  const paginatedSuppliers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSuppliers.slice(start, start + PAGE_SIZE);
  }, [filteredSuppliers, page]);

  const hasFilters = Boolean(searchQuery || statusFilter !== 'all');

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

      {/* Search & Status Filter */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('suppliers.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">{t('common.allStatuses')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>

        <div className="flex justify-end">
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPage(1);
              }}
            >
              {t('common.clearFilters')}
            </Button>
          )}
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
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title={t('common.noResults')}
                      actionLabel={hasFilters ? t('common.clearFilters') : undefined}
                      onAction={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setPage(1);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier) => {
                  const supPurchases = purchases.filter((p) => p.supplierId === supplier.id);
                  const orderCount = supPurchases.length;
                  const totalSpent = supPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

                  return (
                    <tr
                      key={supplier.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                        !supplier.isActive ? 'opacity-60' : ''
                      }`}
                    >
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
                        <span
                          className={`text-[11px] font-semibold ${
                            supplier.isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {supplier.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSupplierToView(supplier)}
                            className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            title={t('common.viewDetails')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSupplierToEdit(supplier)}
                            className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                            title={t('common.edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSupplierToToggle(supplier)}
                            className={`p-1 rounded-md cursor-pointer ${
                              supplier.isActive
                                ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={
                              supplier.isActive ? t('common.deactivate') : t('common.activate')
                            }
                          >
                            {supplier.isActive ? (
                              <ShieldBan className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
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
        <Pagination
          currentPage={page}
          totalItems={filteredSuppliers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
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

      {/* Deactivate / Reactivate Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(supplierToToggle)}
        onClose={() => setSupplierToToggle(null)}
        onConfirm={() => supplierToToggle && toggleSupplierActive(supplierToToggle.id)}
        title={
          supplierToToggle?.isActive
            ? t('suppliers.deactivateConfirmTitle')
            : t('suppliers.activateConfirmTitle')
        }
        message={
          supplierToToggle?.isActive
            ? t('suppliers.deactivateConfirm', { name: supplierToToggle.companyName })
            : t('suppliers.activateConfirm', { name: supplierToToggle?.companyName || '' })
        }
        variant={supplierToToggle?.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
};
