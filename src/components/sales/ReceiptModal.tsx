import React from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const { settings, formatCurrency, language, t } = useApp();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('receipt.title')}
      subtitle={`${t('receipt.receiptNo')}: ${sale.id}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Printable thermal receipt layout */}
        <div className="print-receipt-container p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs space-y-3 font-mono">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-neutral-300 dark:border-neutral-700 space-y-1">
            <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
              {language === 'fa' ? settings.pharmacyNameFa : settings.pharmacyName}
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {t('receipt.license')}: {settings.licenseNumber}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {settings.phone} · {settings.email}
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {language === 'fa' ? settings.addressFa : settings.address}
            </p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-300 pb-2 border-b border-dashed border-neutral-300 dark:border-neutral-700">
            <div>
              <span className="text-neutral-400">{t('receipt.receiptNo')}: </span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{sale.id}</span>
            </div>
            <div className="text-end">
              <span className="text-neutral-400">{t('receipt.date')}: </span>
              <span className="tabular-nums">{sale.dateTime}</span>
            </div>
            <div>
              <span className="text-neutral-400">{t('receipt.cashier')}: </span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="text-end">
              <span className="text-neutral-400">{t('receipt.customer')}: </span>
              <span>{sale.customerName || '-'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1 pb-3 border-b border-dashed border-neutral-300 dark:border-neutral-700">
            <div className="flex justify-between text-[11px] font-bold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-1">
              <span className="flex-1">{t('receipt.item')}</span>
              <span className="w-12 text-center">{t('receipt.qty')}</span>
              <span className="w-16 text-end">{t('receipt.unitPrice')}</span>
              <span className="w-20 text-end">{t('receipt.total')}</span>
            </div>

            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px] py-1 text-neutral-800 dark:text-neutral-200">
                <div className="flex-1 pe-2 min-w-0">
                  <p className="font-medium truncate font-sans">{item.medicineName}</p>
                  <p className="text-[10px] text-neutral-400">Batch: {item.batchNumber}</p>
                </div>
                <span className="w-12 text-center tabular-nums">{item.quantity}</span>
                <span className="w-16 text-end tabular-nums">{item.unitPrice}</span>
                <span className="w-20 text-end font-semibold tabular-nums">{item.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-end text-[11px] text-neutral-600 dark:text-neutral-300 pt-1">
            <div className="flex justify-between">
              <span>{t('receipt.subtotal')}:</span>
              <span className="tabular-nums font-semibold">{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t('receipt.discount')}:</span>
                <span className="tabular-nums font-semibold">-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span>{t('receipt.tax')}:</span>
                <span className="tabular-nums font-semibold">+{formatCurrency(sale.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-50 pt-2 border-t border-neutral-300 dark:border-neutral-700">
              <span>{t('receipt.grandTotal')}:</span>
              <span className="tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
              <span>{t('receipt.paymentMethod')}:</span>
              <span>{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-neutral-300 dark:border-neutral-700 space-y-2">
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans">
              {language === 'fa' ? settings.invoiceFooterNoteFa : settings.invoiceFooterNote}
            </p>
            {/* Simulated Barcode */}
            <div className="flex justify-center items-center py-1 opacity-70">
              <div className="font-mono text-[9px] tracking-widest text-neutral-600 dark:text-neutral-400">
                * {sale.id} *
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 no-print">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            {t('receipt.printReceipt')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
