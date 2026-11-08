import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { InventoryChangeType } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMedicineId?: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  preselectedMedicineId,
}) => {
  const { medicines, adjustStock, currentUser, t } = useApp();

  const [medicineId, setMedicineId] = useState(preselectedMedicineId || (medicines[0]?.id ?? ''));
  const [adjustmentType, setAdjustmentType] = useState<InventoryChangeType>('Stock Adjustment');
  const [quantityDelta, setQuantityDelta] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (preselectedMedicineId) {
      setMedicineId(preselectedMedicineId);
    } else if (medicines[0]) {
      setMedicineId(medicines[0].id);
    }
    setQuantityDelta(0);
    setReason('');
    setError('');
  }, [isOpen, preselectedMedicineId, medicines]);

  const selectedMed = medicines.find((m) => m.id === medicineId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineId) {
      setError(t('validation.requiredField'));
      return;
    }
    if (quantityDelta === 0) {
      setError('Adjustment quantity cannot be 0.');
      return;
    }
    if (selectedMed && selectedMed.quantity + quantityDelta < 0) {
      setError(`Cannot reduce below 0. Current stock is ${selectedMed.quantity}.`);
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason or audit note.');
      return;
    }

    adjustStock(medicineId, quantityDelta, adjustmentType, reason);
    onClose();
  };

  const typeOptions: { value: InventoryChangeType; label: string }[] = [
    { value: 'Stock Adjustment', label: t('inventory.types.adjustment') },
    { value: 'Expired Write-off', label: t('inventory.types.expired') },
    { value: 'Damaged Write-off', label: t('inventory.types.damaged') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('inventory.adjustModalTitle')}
      subtitle={t('inventory.adjustModalSubtitle')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Select
          label={t('inventory.selectMedicine')}
          value={medicineId}
          onChange={(e) => setMedicineId(e.target.value)}
          options={medicines.map((m) => ({
            value: m.id,
            label: `${m.name} (Current Stock: ${m.quantity} ${m.unit})`,
          }))}
        />

        {selectedMed && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-800 flex justify-between">
            <span className="text-neutral-500">{t('medicines.stockQuantity')}:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {selectedMed.quantity} {selectedMed.unit}
            </span>
          </div>
        )}

        <Select
          label={t('inventory.adjustmentType')}
          value={adjustmentType}
          onChange={(e) => setAdjustmentType(e.target.value as InventoryChangeType)}
          options={typeOptions}
        />

        <Input
          label={t('inventory.quantityDelta')}
          type="number"
          step="1"
          placeholder="e.g. +10 for inward correction, -5 for damage"
          value={quantityDelta || ''}
          onChange={(e) => setQuantityDelta(parseInt(e.target.value, 10) || 0)}
          helperText="Use positive numbers to add stock, negative numbers to write off stock."
        />

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t('inventory.reason')}
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Audit log reason (e.g. Periodic physical count discrepancy, cracked vial)..."
            required
          />
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg flex justify-between text-neutral-500">
          <span>{t('inventory.userResponsible')}:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentUser.name}</span>
        </div>

        {error && <p className="text-rose-600 dark:text-rose-400 font-semibold">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {t('common.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
