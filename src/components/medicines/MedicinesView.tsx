import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Power,
  Pill,
  AlertTriangle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';
import { Button } from '../common/Button';
import { MedicineModal } from './MedicineModal';
import { MedicineDetailModal } from './MedicineDetailModal';

interface MedicinesViewProps {
  onOpenAddMedicine: () => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  onOpenAddMedicine,
  isAddModalOpen,
  onCloseAddModal,
}) => {
  const {
    medicines,
    categories,
    toggleMedicineActive,
    formatCurrency,
    currentRole,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, inStock, lowStock, expired, nearExpiry, inactive
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);
  const [medicineToView, setMedicineToView] = useState<Medicine | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'expiry' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const today = new Date();

  // Filter & Search Logic (FR-06)
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        // Search across name, generic name, category, manufacturer, batch
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          med.name.toLowerCase().includes(q) ||
          (med.genericName && med.genericName.toLowerCase().includes(q)) ||
          med.categoryName.toLowerCase().includes(q) ||
          (med.manufacturer && med.manufacturer.toLowerCase().includes(q)) ||
          med.batchNumber.toLowerCase().includes(q) ||
          med.id.toLowerCase().includes(q);

        // Category filter
        const matchesCategory =
          selectedCategory === 'all' || med.categoryId === selectedCategory;

        // Stock & Expiration filter
        const expDate = new Date(med.expirationDate);
        const isExpired = expDate < today;
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isNearExpiry = diffDays >= 0 && diffDays <= 60;
        const isLow = med.quantity <= med.minStockLevel && med.quantity > 0;
        const isOutOfStock = med.quantity === 0;

        let matchesStatus = true;
        if (selectedStatus === 'inStock') matchesStatus = med.quantity > med.minStockLevel && !isExpired;
        else if (selectedStatus === 'lowStock') matchesStatus = isLow;
        else if (selectedStatus === 'outOfStock') matchesStatus = isOutOfStock;
        else if (selectedStatus === 'expired') matchesStatus = isExpired;
        else if (selectedStatus === 'nearExpiry') matchesStatus = isNearExpiry;
        else if (selectedStatus === 'inactive') matchesStatus = !med.isActive;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;
        if (sortBy === 'stock') {
          valA = a.quantity;
          valB = b.quantity;
        } else if (sortBy === 'price') {
          valA = a.sellingPrice;
          valB = b.sellingPrice;
        } else if (sortBy === 'expiry') {
          valA = new Date(a.expirationDate).getTime();
          valB = new Date(b.expirationDate).getTime();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [medicines, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const toggleSort = (field: 'name' | 'stock' | 'expiry' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('medicines.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('medicines.subtitle')}
          </p>
        </div>

        {currentRole !== 'Cashier' && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenAddMedicine}
          >
            {t('medicines.addMedicine')}
          </Button>
        )}
      </div>

      {/* Filter and Search Bar (FR-06) */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
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

          {/* Category Filter */}
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="all">{t('medicines.allStockStatuses')}</option>
              <option value="inStock">{t('statusLabels.inStock')}</option>
              <option value="lowStock">{t('statusLabels.lowStock')}</option>
              <option value="outOfStock">{t('statusLabels.outOfStock')}</option>
              <option value="expired">{t('statusLabels.expired')}</option>
              <option value="nearExpiry">{t('statusLabels.nearExpiry')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <span>
            {filteredMedicines.length} {t('common.items')} found
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t('common.clear')} {t('common.filter')}
            </button>
          )}
        </div>
      </div>

      {/* Medicines Data Table (FR-04, FR-05, FR-06, FR-07) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-3 text-start">{t('medicines.tableHeaders.id')}</th>
                <th
                  className="py-3 px-3 text-start cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>{t('medicines.tableHeaders.name')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-start">{t('medicines.tableHeaders.category')}</th>
                <th className="py-3 px-3 text-start">{t('medicines.tableHeaders.batch')}</th>
                <th
                  className="py-3 px-3 text-center cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100"
                  onClick={() => toggleSort('stock')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{t('medicines.tableHeaders.stock')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-end cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100"
                  onClick={() => toggleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{t('medicines.tableHeaders.pricing')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-start cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100"
                  onClick={() => toggleSort('expiry')}
                >
                  <div className="flex items-center gap-1">
                    <span>{t('medicines.tableHeaders.expiry')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">{t('medicines.tableHeaders.status')}</th>
                <th className="py-3 px-3 text-center">{t('medicines.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const expDate = new Date(med.expirationDate);
                  const isExpired = expDate < today;
                  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isNearExpiry = diffDays >= 0 && diffDays <= 60;
                  const isLow = med.quantity <= med.minStockLevel && med.quantity > 0;
                  const isOut = med.quantity === 0;

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                        !med.isActive ? 'opacity-60 bg-neutral-50/50 dark:bg-neutral-900/30' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {med.id}
                      </td>

                      {/* Name & Generic */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {med.name}
                        </div>
                        {med.genericName && (
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                            {med.genericName}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                        {med.categoryName}
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-400">
                        {med.batchNumber}
                      </td>

                      {/* Stock Quantity & Unit */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              isOut
                                ? 'text-rose-600 dark:text-rose-400'
                                : isLow
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {med.quantity}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {med.unit}
                          </span>
                        </div>
                      </td>

                      {/* Buy / Sell Price */}
                      <td className="py-3 px-3 text-end tabular-nums">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(med.sellingPrice)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Buy: {formatCurrency(med.purchasePrice)}
                        </div>
                      </td>

                      {/* Expiration Date */}
                      <td className="py-3 px-3">
                        <div
                          className={`flex items-center gap-1 font-mono tabular-nums ${
                            isExpired
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : isNearExpiry
                              ? 'text-amber-600 dark:text-amber-400 font-semibold'
                              : 'text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {isExpired && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                          {isNearExpiry && !isExpired && <Clock className="w-3.5 h-3.5 shrink-0" />}
                          <span>{med.expirationDate}</span>
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-semibold ${
                            med.isActive
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-neutral-400 dark:text-neutral-500'
                          }`}
                        >
                          {med.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setMedicineToView(med)}
                            className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title={t('common.viewDetails')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {currentRole !== 'Cashier' && (
                            <>
                              <button
                                onClick={() => setMedicineToEdit(med)}
                                className="p-1 rounded-md text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                title={t('common.edit')}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleMedicineActive(med.id)}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  med.isActive
                                    ? 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                                title={med.isActive ? t('common.deactivate') : t('common.activate')}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </>
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

      {/* Add / Edit Medicine Modal */}
      <MedicineModal
        isOpen={isAddModalOpen || Boolean(medicineToEdit)}
        onClose={() => {
          onCloseAddModal();
          setMedicineToEdit(null);
        }}
        medicineToEdit={medicineToEdit}
      />

      {/* Inspect Medicine Detail Modal */}
      <MedicineDetailModal
        isOpen={Boolean(medicineToView)}
        onClose={() => setMedicineToView(null)}
        medicine={medicineToView}
        onEdit={(med) => setMedicineToEdit(med)}
      />
    </div>
  );
};
