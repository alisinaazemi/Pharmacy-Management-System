import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Supplier } from '../../types';
import { useApp } from '../../context/AppContext';
import { Phone, Mail, MapPin, FileText } from 'lucide-react';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit?: (s: Supplier) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onEdit,
}) => {
  const { purchases, formatCurrency, formatDate, getPaymentStatusLabel, t } = useApp();

  if (!supplier) return null;

  const supplierPurchases = purchases.filter((p) => p.supplierId === supplier.id);
  const totalVolume = supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier.companyName}
      subtitle={`${t('suppliers.supplierId')}: ${supplier.id} · ${supplier.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-mono tabular-nums">{supplier.phone}</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="truncate">{supplier.email || '-'}</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="truncate">{supplier.address || '-'}</span>
          </div>
        </div>

        {supplier.description && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
            <span className="font-semibold block text-[11px] text-neutral-400 mb-1">
              {t('suppliers.description')}
            </span>
            <p>{supplier.description}</p>
          </div>
        )}

        {/* Purchase History with this supplier (FR-23) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {t('suppliers.purchaseHistory')} ({supplierPurchases.length})
              </span>
            </h4>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {t('common.total')}: {formatCurrency(totalVolume)}
            </span>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-start">{t('purchases.tableHeaders.id')}</th>
                  <th className="py-2.5 px-3 text-start">{t('common.date')}</th>
                  <th className="py-2.5 px-3 text-start">{t('purchases.invoiceNumber')}</th>
                  <th className="py-2.5 px-3 text-center">{t('common.items')}</th>
                  <th className="py-2.5 px-3 text-end">{t('common.total')}</th>
                  <th className="py-2.5 px-3 text-center">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {supplierPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400">
                      {t('suppliers.noPurchaseHistory')}
                    </td>
                  </tr>
                ) : (
                  supplierPurchases.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {p.id}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 font-mono tabular-nums">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-500">
                        {p.invoiceNumber || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                        {p.items.length}
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(supplier);
              }}
            >
              {t('common.edit')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
