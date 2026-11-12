import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Supplier } from '../../types';
import { useApp } from '../../context/AppContext';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
}) => {
  const { addSupplier, updateSupplier, t } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name,
        companyName: supplierToEdit.companyName,
        phone: supplierToEdit.phone,
        email: supplierToEdit.email,
        address: supplierToEdit.address,
        description: supplierToEdit.description,
        isActive: supplierToEdit.isActive,
      });
    } else {
      setFormData({
        name: '',
        companyName: '',
        phone: '+93 ',
        email: '',
        address: '',
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [supplierToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!formData.companyName.trim()) err.companyName = t('validation.requiredField');
    if (!formData.name.trim()) err.name = t('validation.requiredField');

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      err.phone = t('validation.requiredField');
    } else if (phoneDigits.length < 7) {
      err.phone = t('validation.invalidPhone');
    }

    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      err.email = t('validation.invalidEmail');
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      companyName: formData.companyName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
    };

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, payload);
    } else {
      addSupplier(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}
      subtitle={t('suppliers.modalSubtitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`${t('suppliers.companyName')} *`}
            placeholder={t('suppliers.companyPlaceholder')}
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            error={errors.companyName}
            required
          />
          <Input
            label={`${t('suppliers.name')} *`}
            placeholder={t('suppliers.namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`${t('suppliers.phone')} *`}
            placeholder="+93 70 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            required
          />
          <Input
            label={t('suppliers.email')}
            type="email"
            placeholder="orders@supplier.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
        </div>

        <Input
          label={t('suppliers.address')}
          placeholder={t('suppliers.addressPlaceholder')}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t('suppliers.description')}
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('suppliers.descriptionPlaceholder')}
          />
        </div>

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
