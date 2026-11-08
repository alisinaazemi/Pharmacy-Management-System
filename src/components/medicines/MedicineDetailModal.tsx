import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { Pill, AlertTriangle, Clock, CheckCircle2, History } from 'lucide-react';

interface MedicineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onEdit?: (med: Medicine) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onEdit,
}) => {
  const { formatCurrency, inventoryTransactions, currentRole, t } = useApp();

  if (!medicine) return null;

  const today = new Date();
  const expDate = new Date(medicine.expirationDate);
  const isExpired = expDate < today;
  const isLowStock = medicine.quantity <= medicine.minStockLevel;
  const marginPercent =
    medicine.purchasePrice > 0
      ? Math.round(((medicine.sellingPrice - medicine.purchasePrice) / medicine.purchasePrice) * 100)
      : 0;

  // Associated transactions for this medicine
  const relatedTxs = inventoryTransactions.filter((tx) => tx.medicineId === medicine.id).slice(0, 5);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicine.name}
      subtitle={`${t('medicines.id')}: ${medicine.id} · Batch: ${medicine.batchNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Status Banners */}
        {isExpired && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{t('statusLabels.expired')}! {medicine.expirationDate}</span>
          </div>
        )}

        {isLowStock && !isExpired && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              {t('statusLabels.lowStock')}! ({medicine.quantity} {t('common.units')} remaining, threshold is {medicine.minStockLevel})
            </span>
          </div>
        )}

        {/* Primary Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-neutral-400 block">{t('medicines.genericName')}</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{medicine.genericName || '-'}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">{t('medicines.category')}</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{medicine.categoryName}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">{t('medicines.manufacturer')}</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{medicine.manufacturer || '-'}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">{t('medicines.batchNumber')}</span>
            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{medicine.batchNumber}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">{t('medicines.expiryDate')}</span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">{medicine.expirationDate}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">{t('medicines.unit')}</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{medicine.unit}</span>
          </div>
        </div>

        {/* Financial & Inventory Valuation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <span className="text-neutral-400 block text-[11px]">{t('medicines.purchasePrice')}</span>
            <span className="text-sm font-bold tabular-nums text-neutral-800 dark:text-neutral-200">{formatCurrency(medicine.purchasePrice)}</span>
          </div>
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <span className="text-neutral-400 block text-[11px]">{t('medicines.sellingPrice')}</span>
            <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(medicine.sellingPrice)}</span>
          </div>
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <span className="text-neutral-400 block text-[11px]">{t('medicines.profitMargin')}</span>
            <span className="text-sm font-bold tabular-nums text-neutral-800 dark:text-neutral-200">+{marginPercent}%</span>
          </div>
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <span className="text-neutral-400 block text-[11px]">{t('medicines.stockQuantity')}</span>
            <span className="text-sm font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{medicine.quantity} {t('common.units')}</span>
          </div>
        </div>

        {/* Description */}
        {medicine.description && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-400 block text-[11px] mb-1">{t('medicines.description')}</span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{medicine.description}</p>
          </div>
        )}

        {/* Movement History */}
        <div>
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>Recent Stock Activity (FR-13)</span>
          </h4>
          {relatedTxs.length === 0 ? (
            <p className="text-neutral-400 text-xs py-2">No transaction history recorded yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              {relatedTxs.map((tx) => (
                <div key={tx.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{tx.changeType}</span>
                    <span className="text-neutral-400 ms-2 text-[11px] tabular-nums">{tx.dateTime}</span>
                    <p className="text-[11px] text-neutral-500">{tx.reason || tx.userResponsible}</p>
                  </div>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      tx.quantityChanged > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.quantityChanged > 0 ? `+${tx.quantityChanged}` : tx.quantityChanged}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
          {currentRole !== 'Cashier' && onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(medicine);
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
