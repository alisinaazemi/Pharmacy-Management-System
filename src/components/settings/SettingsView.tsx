import React, { useState, useEffect } from 'react';
import { Settings, Save, Download, RotateCcw, Database, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { ConfirmModal } from '../common/ConfirmModal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllData,
    medicines,
    categories,
    suppliers,
    sales,
    purchases,
    inventoryTransactions,
    users,
    addToast,
    t,
  } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
    setErrors({});
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    if (!formData.pharmacyName.trim()) err.pharmacyName = t('validation.requiredField');
    if (!formData.pharmacyNameFa.trim()) err.pharmacyNameFa = t('validation.requiredField');
    if (!formData.licenseNumber.trim()) err.licenseNumber = t('validation.requiredField');

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      err.phone = t('validation.requiredField');
    } else if (phoneDigits.length < 7) {
      err.phone = t('validation.invalidPhone');
    }

    if (!formData.email.trim()) {
      err.email = t('validation.requiredField');
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      err.email = t('validation.invalidEmail');
    }

    if (formData.defaultMinStockLevel < 1) {
      err.defaultMinStockLevel = t('validation.positiveNumber');
    }

    if (formData.taxRatePercent < 0 || formData.taxRatePercent > 100) {
      err.taxRatePercent = t('validation.taxRange');
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setErrors({});
    updateSettings({
      ...formData,
      pharmacyName: formData.pharmacyName.trim(),
      pharmacyNameFa: formData.pharmacyNameFa.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      addressFa: formData.addressFa.trim(),
    });
  };

  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      pharmacy: formData,
      medicines,
      categories,
      suppliers,
      sales,
      purchases,
      inventoryTransactions,
      users: users.map((u) => ({ ...u })),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `pms-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    addToast('success', t('settings.backupSuccess'), t('settings.backupSuccessDetail'));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs" noValidate>
        {/* Pharmacy Profile Card */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>{t('settings.pharmacyDetails')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={`${t('settings.pharmacyNameEn')} *`}
              value={formData.pharmacyName}
              onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
              error={errors.pharmacyName}
              required
            />
            <Input
              label={`${t('settings.pharmacyNameFa')} *`}
              value={formData.pharmacyNameFa}
              onChange={(e) => setFormData({ ...formData, pharmacyNameFa: e.target.value })}
              error={errors.pharmacyNameFa}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={`${t('settings.licenseNumber')} *`}
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              error={errors.licenseNumber}
              required
            />
            <Input
              label={`${t('settings.phone')} *`}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
            />
            <Input
              label={`${t('settings.email')} *`}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('settings.addressEn')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              label={t('settings.addressFa')}
              value={formData.addressFa}
              onChange={(e) => setFormData({ ...formData, addressFa: e.target.value })}
            />
          </div>
        </div>

        {/* Operational & Financial Defaults */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>{t('settings.operationalDefaults')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label={t('settings.currency')}
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value as 'AFN' | 'USD' })
              }
              options={[
                { value: 'AFN', label: t('settings.currencyAfnDesc') },
                { value: 'USD', label: t('settings.currencyUsdDesc') },
              ]}
            />
            <Input
              label={t('settings.defaultMinStock')}
              type="number"
              min="1"
              value={formData.defaultMinStockLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultMinStockLevel: parseInt(e.target.value, 10) || 0,
                })
              }
              error={errors.defaultMinStockLevel}
            />
            <Input
              label={t('settings.taxRate')}
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={formData.taxRatePercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taxRatePercent: parseFloat(e.target.value) || 0,
                })
              }
              error={errors.taxRatePercent}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('settings.invoiceFooterEn')}
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                value={formData.invoiceFooterNote}
                onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('settings.invoiceFooterFa')}
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                value={formData.invoiceFooterNoteFa}
                onChange={(e) => setFormData({ ...formData, invoiceFooterNoteFa: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
              {t('settings.saveSettings')}
            </Button>
          </div>
        </div>

        {/* Database Backup & Recovery (NFR-08) */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>{t('settings.backupSection')}</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
            {t('settings.backupDesc')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadBackup}
            >
              {t('settings.downloadBackup')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              {t('settings.resetDemoData')}
            </Button>
          </div>
        </div>
      </form>

      {/* Reset Demo Data Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllData}
        title={t('settings.resetConfirmTitle')}
        message={t('settings.resetConfirmMessage')}
        confirmLabel={t('settings.resetDemoData')}
        variant="danger"
      />
    </div>
  );
};
