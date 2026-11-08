import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  medicineToEdit,
}) => {
  const { categories, addMedicine, updateMedicine, t } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    categoryId: '',
    manufacturer: '',
    batchNumber: '',
    expirationDate: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minStockLevel: 25,
    unit: 'Box',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (medicineToEdit) {
      setFormData({
        name: medicineToEdit.name,
        genericName: medicineToEdit.genericName,
        categoryId: medicineToEdit.categoryId,
        manufacturer: medicineToEdit.manufacturer,
        batchNumber: medicineToEdit.batchNumber,
        expirationDate: medicineToEdit.expirationDate,
        purchasePrice: medicineToEdit.purchasePrice,
        sellingPrice: medicineToEdit.sellingPrice,
        quantity: medicineToEdit.quantity,
        minStockLevel: medicineToEdit.minStockLevel,
        unit: medicineToEdit.unit || 'Box',
        description: medicineToEdit.description || '',
        isActive: medicineToEdit.isActive,
      });
    } else {
      setFormData({
        name: '',
        genericName: '',
        categoryId: categories[0]?.id || '',
        manufacturer: '',
        batchNumber: `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        purchasePrice: 50,
        sellingPrice: 80,
        quantity: 50,
        minStockLevel: 20,
        unit: 'Box',
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [medicineToEdit, isOpen, categories]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = t('validation.missingMedicineName');
    if (!formData.categoryId) err.categoryId = t('validation.requiredField');
    if (!formData.batchNumber.trim()) err.batchNumber = t('validation.requiredField');
    if (!formData.expirationDate) err.expirationDate = t('validation.requiredField');
    if (formData.purchasePrice < 0) err.purchasePrice = t('validation.nonNegative');
    if (formData.sellingPrice < 0) err.sellingPrice = t('validation.nonNegative');
    if (formData.quantity < 0) err.quantity = t('validation.nonNegative');
    if (formData.minStockLevel < 0) err.minStockLevel = t('validation.nonNegative');

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedCat = categories.find((c) => c.id === formData.categoryId);
    const categoryName = matchedCat ? matchedCat.name : 'General';

    if (medicineToEdit) {
      updateMedicine(medicineToEdit.id, {
        ...formData,
        categoryName,
      });
    } else {
      addMedicine({
        ...formData,
        categoryName,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicineToEdit ? t('medicines.editMedicine') : t('medicines.addMedicine')}
      subtitle="Complete pharmaceutical catalog record compliant with SRS FR-04"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Row 1: Name and Generic Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t('medicines.name')}
            placeholder="e.g. Amoxicillin 500mg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label={t('medicines.genericName')}
            placeholder="e.g. Amoxicillin Trihydrate"
            value={formData.genericName}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
          />
        </div>

        {/* Row 2: Category and Manufacturer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label={t('medicines.category')}
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.categoryId}
          />
          <Input
            label={t('medicines.manufacturer')}
            placeholder="e.g. GlaxoSmithKline"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />
        </div>

        {/* Row 3: Batch Number, Expiration Date, Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={t('medicines.batchNumber')}
            placeholder="e.g. BTH-8821"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            error={errors.batchNumber}
            required
          />
          <Input
            label={t('medicines.expiryDate')}
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            error={errors.expirationDate}
            required
          />
          <Input
            label={t('medicines.unit')}
            placeholder="Box / Strip / Bottle"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </div>

        {/* Row 4: Pricing and Stock Levels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label={t('medicines.purchasePrice')}
            type="number"
            min="0"
            step="any"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
            error={errors.purchasePrice}
            required
          />
          <Input
            label={t('medicines.sellingPrice')}
            type="number"
            min="0"
            step="any"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            error={errors.sellingPrice}
            required
          />
          <Input
            label={t('medicines.stockQuantity')}
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
            error={errors.quantity}
            required
          />
          <Input
            label={t('medicines.minStockLevel')}
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value, 10) || 0 })}
            error={errors.minStockLevel}
            required
          />
        </div>

        {/* Row 5: Description & Dosage */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t('medicines.description')}
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Clinical indications, dosage guidelines, storage requirements..."
          />
        </div>

        {/* Actions */}
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
