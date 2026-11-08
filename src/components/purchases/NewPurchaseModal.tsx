import React, { useState } from 'react';
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

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      medicineId: medicines[0]?.id || '',
      medicineName: medicines[0]?.name || '',
      batchNumber: `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 50,
      unitPurchasePrice: medicines[0]?.purchasePrice || 50,
      totalCost: (medicines[0]?.purchasePrice || 50) * 50,
    },
  ]);

  const [error, setError] = useState('');

  const handleMedicineChange = (index: number, newMedId: string) => {
    const med = medicines.find((m) => m.id === newMedId);
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

  const handleItemFieldChange = (index: number, field: keyof PurchaseItem, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    if (field === 'quantity' || field === 'unitPurchasePrice') {
      updated[index].totalCost = updated[index].quantity * updated[index].unitPurchasePrice;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    const defaultMed = medicines[0];
    setItems([
      ...items,
      {
        medicineId: defaultMed?.id || '',
        medicineName: defaultMed?.name || '',
        batchNumber: `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) {
      setError('Please select a valid supplier.');
      return;
    }

    if (items.length === 0 || items.some((i) => i.quantity <= 0)) {
      setError('All items must have a quantity greater than 0.');
      return;
    }

    recordPurchase({
      supplierId: sup.id,
      supplierName: sup.name,
      companyName: sup.companyName,
      date: purchaseDate,
      invoiceNumber,
      paymentStatus,
      receivedBy: currentUser.name,
      notes,
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
      subtitle="Stock is automatically updated in inventory upon saving (FR-19)"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Header fields */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Select
              label={t('purchases.supplier')}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              options={suppliers.map((s) => ({
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
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="py-2 px-3 min-w-[200px]">
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleMedicineChange(idx, e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                      >
                        {medicines.map((m) => (
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
                        className="w-full text-xs p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 min-w-[130px]">
                      <input
                        type="date"
                        value={item.expirationDate}
                        onChange={(e) => handleItemFieldChange(idx, 'expirationDate', e.target.value)}
                        className="w-full text-xs p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 min-w-[90px]">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemFieldChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full text-center text-xs p-1.5 font-mono font-bold rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
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
                        className="w-full text-end text-xs p-1.5 font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
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

        {/* Payment and Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <Select
              label={t('purchases.paymentStatus')}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
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

        {error && <p className="text-rose-600 font-semibold">{error}</p>}

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
