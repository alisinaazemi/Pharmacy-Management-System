import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { PurchaseItem } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface NewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, medicines, recordPurchase, currentUser, formatCurrency, t } = useApp();

  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.isActive), [suppliers]);
  const activeMedicines = useMemo(() => medicines.filter((m) => m.isActive), [medicines]);

  const buildDefaultItem = (): PurchaseItem => {
    const firstMed = activeMedicines[0];
    return {
      medicineId: firstMed?.id || '',
      medicineName: firstMed?.name || '',
      batchNumber: `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      quantity: 50,
      unitPurchasePrice: firstMed?.purchasePrice || 50,
      totalCost: (firstMed?.purchasePrice || 50) * 50,
    };
  };

  const [supplierId, setSupplierId] = useState(activeSuppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([buildDefaultItem()]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSupplierId(activeSuppliers[0]?.id || '');
    setInvoiceNumber(`INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus('Paid');
    setNotes('');
    setItems([buildDefaultItem()]);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleMedicineChange = (index: number, newMedId: string) => {
    const med = activeMedicines.find((m) => m.id === newMedId);
    if (!med) return;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      medicineId: med.id,
      medicineName: med.name,
      unitPurchasePrice: med.purchasePrice,
      totalCost: med.purchasePrice * updated[index].quantity,
    };
    setItems(updated);
  };

  const handleItemFieldChange = (
    index: number,
    field: keyof PurchaseItem,
    val: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPurchasePrice') {
      updated[index].totalCost = updated[index].quantity * updated[index].unitPurchasePrice;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    const defaultMed = activeMedicines[0];
    setItems([
      ...items,
      {
        medicineId: defaultMed?.id || '',
        medicineName: defaultMed?.name || '',
        batchNumber: `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        quantity: 20,
        unitPurchasePrice: defaultMed?.purchasePrice || 50,
        totalCost: (defaultMed?.purchasePrice || 50) * 20,
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sup = activeSuppliers.find((s) => s.id === supplierId);
    if (!sup) {
      setError(t('purchases.invalidSupplierError'));
      return;
    }

    if (!invoiceNumber.trim() || !purchaseDate) {
      setError(t('validation.requiredField'));
      return;
    }

    if (
      items.length === 0 ||
      items.some(
        (i) =>
          !i.medicineId ||
          !i.batchNumber.trim() ||
          !i.expirationDate ||
          i.quantity <= 0 ||
          i.unitPurchasePrice < 0
      )
    ) {
      setError(t('purchases.invalidQtyError'));
      return;
    }

    recordPurchase({
      supplierId: sup.id,
      supplierName: sup.name,
      companyName: sup.companyName,
      date: purchaseDate,
      invoiceNumber: invoiceNumber.trim(),
      paymentStatus,
      receivedBy: currentUser.name,
      notes: notes.trim() || undefined,
      items,
      totalAmount,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('purchases.newPurchaseModalTitle')}
      subtitle={t('purchases.newPurchaseModalSubtitle')}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
        {/* Header fields */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Select
              label={t('purchases.supplier')}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              options={activeSuppliers.map((s) => ({
                value: s.id,
                label: `${s.companyName} (${s.name})`,
              }))}
            />
          </div>

          <Input
            label={t('purchases.purchaseDate')}
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />

          <Input
            label={t('purchases.invoiceNumber')}
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <label className="font-semibold text-neutral-800 dark:text-neutral-200">
              {t('purchases.lineItems')}
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={addItemRow}
            >
              {t('purchases.addItem')}
            </Button>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-start">{t('medicines.name')}</th>
                  <th className="py-2.5 px-3 text-start">{t('medicines.batchNumber')}</th>
                  <th className="py-2.5 px-3 text-start">{t('medicines.expiryDate')}</th>
                  <th className="py-2.5 px-3 text-center">{t('common.quantity')}</th>
                  <th className="py-2.5 px-3 text-end">{t('medicines.purchasePrice')}</th>
                  <th className="py-2.5 px-3 text-end">{t('purchases.lineTotal')}</th>
                  <th className="py-2.5 px-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-2 px-3 min-w-[200px]">
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleMedicineChange(idx, e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                      >
                        {activeMedicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3 min-w-[110px]">
                      <input
                        type="text"
                        value={item.batchNumber}
                        onChange={(e) => handleItemFieldChange(idx, 'batchNumber', e.target.value)}
                        className="w-full text-xs p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 min-w-[130px]">
                      <input
                        type="date"
                        value={item.expirationDate}
                        onChange={(e) =>
                          handleItemFieldChange(idx, 'expirationDate', e.target.value)
                        }
                        className="w-full text-xs p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 min-w-[90px]">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemFieldChange(idx, 'quantity', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full text-center text-xs p-1.5 font-mono font-bold rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPurchasePrice}
                        onChange={(e) =>
                          handleItemFieldChange(
                            idx,
                            'unitPurchasePrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full text-end text-xs p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-end font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">
                      {formatCurrency(item.totalCost)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t('purchases.notes')}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('purchases.notesPlaceholder')}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Payment and Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <Select
              label={t('purchases.paymentStatus')}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending' | 'Partial')}
              options={[
                { value: 'Paid', label: t('statusLabels.paid') },
                { value: 'Pending', label: t('statusLabels.pending') },
                { value: 'Partial', label: t('statusLabels.partial') },
              ]}
            />
          </div>

          <div className="text-end flex flex-col justify-end">
            <span className="text-xs text-neutral-500">{t('purchases.totalAmount')}</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {error && <p className="text-rose-600 dark:text-rose-400 font-semibold">{error}</p>}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
