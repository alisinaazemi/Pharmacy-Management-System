import React, { useState, useMemo, useEffect } from 'react';
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

  const selectableMedicines = useMemo(() => {
    return medicines.filter((m) => m.isActive || m.id === preselectedMedicineId);
  }, [medicines, preselectedMedicineId]);

  const [medicineId, setMedicineId] = useState(
    preselectedMedicineId || (selectableMedicines[0]?.id ?? '')
  );
  const [adjustmentType, setAdjustmentType] = useState<InventoryChangeType>('Stock Adjustment');
  const [quantityDelta, setQuantityDelta] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (preselectedMedicineId) {
      setMedicineId(preselectedMedicineId);
    } else if (selectableMedicines[0]) {
      setMedicineId(selectableMedicines[0].id);
    }
    setAdjustmentType('Stock Adjustment');
    setQuantityDelta('');
    setReason('');
    setError('');
  }, [isOpen, preselectedMedicineId, selectableMedicines]);

  const selectedMed = medicines.find((m) => m.id === medicineId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!medicineId) {
      setError(t('validation.requiredField'));
      return;
    }

    const parsedDelta = parseInt(quantityDelta, 10);
    if (Number.isNaN(parsedDelta) || parsedDelta === 0) {
      setError(t('inventory.zeroDeltaError'));
      return;
    }

    if (selectedMed && selectedMed.quantity + parsedDelta < 0) {
      setError(t('inventory.belowZeroError', { qty: selectedMed.quantity }));
      return;
    }

    if (!reason.trim()) {
      setError(t('inventory.reasonRequiredError'));
      return;
    }

    adjustStock(medicineId, parsedDelta, adjustmentType, reason.trim());
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
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
        <Select
          label={t('inventory.selectMedicine')}
          value={medicineId}
          onChange={(e) => setMedicineId(e.target.value)}
          options={selectableMedicines.map((m) => ({
            value: m.id,
            label: t('inventory.currentStockOption', {
              name: m.name,
              qty: m.quantity,
              unit: m.unit,
            }),
          }))}
        />

        {selectedMed && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-800 flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              {t('medicines.stockQuantity')}:
            </span>
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
          placeholder={t('inventory.quantityDeltaPlaceholder')}
          value={quantityDelta}
          onChange={(e) => setQuantityDelta(e.target.value)}
          helperText={t('inventory.quantityDeltaHelper')}
        />

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t('inventory.reason')} *
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('inventory.reasonPlaceholder')}
            required
          />
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg flex justify-between text-neutral-500 dark:text-neutral-400">
          <span>{t('inventory.userResponsible')}:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {currentUser.name}
          </span>
        </div>

        {error && (
          <p className="text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
        )}

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
