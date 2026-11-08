import React, { useState } from 'react';
import { Settings, Save, Download, RotateCcw, ShieldCheck, Database, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
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
      users: users.map((u) => ({ ...u, passwordHash: 'protected' })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `pms-backup-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('success', t('settings.backupSuccess'), 'Snapshot JSON created and downloaded.');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all mock data to the initial project charter state?')) {
      resetAllData();
    }
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

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Pharmacy Profile Card */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>{t('settings.pharmacyDetails')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('settings.pharmacyNameEn')}
              value={formData.pharmacyName}
              onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
              required
            />
            <Input
              label={t('settings.pharmacyNameFa')}
              value={formData.pharmacyNameFa}
              onChange={(e) => setFormData({ ...formData, pharmacyNameFa: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={t('settings.licenseNumber')}
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              required
            />
            <Input
              label={t('settings.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label={t('settings.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
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
                  defaultMinStockLevel: parseInt(e.target.value, 10) || 10,
                })
              }
            />
            <Input
              label={t('settings.taxRate')}
              type="number"
              min="0"
              max="100"
              value={formData.taxRatePercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taxRatePercent: parseFloat(e.target.value) || 0,
                })
              }
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
              onClick={handleResetData}
            >
              Reset Seed Data to Demo
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
