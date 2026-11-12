import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Medicine, Sale, SaleItem } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';
import { ReceiptModal } from './ReceiptModal';

export const PosView: React.FC = () => {
  const {
    medicines,
    processSale,
    formatCurrency,
    getCategoryName,
    settings,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const today = new Date();

  const searchableMedicines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const active = medicines.filter((m) => m.isActive);
    if (!q) return active.slice(0, 12);
    return active
      .filter((m) => {
        const catLabel = getCategoryName(m.categoryId, m.categoryName).toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          (m.genericName && m.genericName.toLowerCase().includes(q)) ||
          m.batchNumber.toLowerCase().includes(q) ||
          catLabel.includes(q)
        );
      })
      .slice(0, 12);
  }, [medicines, searchQuery, getCategoryName]);

  const addToCart = (med: Medicine) => {
    setErrorMsg('');
    if (med.expirationDate && new Date(med.expirationDate) < today) {
      setErrorMsg(t('pos.expiredSaleBlocked', { name: med.name }));
      return;
    }
    if (med.quantity <= 0) {
      setErrorMsg(`${t('validation.insufficientStock', { qty: 0 })} (${med.name})`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.medicineId === med.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > med.quantity) {
        setErrorMsg(`${t('validation.insufficientStock', { qty: med.quantity })} (${med.name})`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: currentQty + 1,
        totalPrice: (currentQty + 1) * med.sellingPrice,
      };
      setCart(updated);
    } else {
      const newItem: SaleItem = {
        medicineId: med.id,
        medicineName: med.name,
        genericName: med.genericName,
        batchNumber: med.batchNumber,
        quantity: 1,
        unitPrice: med.sellingPrice,
        totalPrice: med.sellingPrice,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (medicineId: string, newQty: number) => {
    setErrorMsg('');
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;

    if (newQty <= 0) {
      removeFromCart(medicineId);
      return;
    }

    if (newQty > med.quantity) {
      setErrorMsg(`${t('validation.insufficientStock', { qty: med.quantity })} (${med.name})`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
          : item
      )
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setErrorMsg('');
    setDiscount(0);
    setNotes('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round((subtotal * settings.taxRatePercent) / 100);
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg(t('pos.emptyCartError'));
      return;
    }

    const res = processSale({
      items: cart,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      discount,
      paymentMethod,
      notes: notes.trim(),
    });

    if (res.success && res.sale) {
      setCompletedSale(res.sale);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setNotes('');
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {t('pos.title')}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {t('pos.subtitle')}
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Quick Add Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t('pos.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>{t('pos.quickCatalogTitle', { count: searchableMedicines.length })}</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {t('common.clear')}
                </button>
              )}
            </div>
          </div>

          {searchableMedicines.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <EmptyState
                title={t('common.noResults')}
                actionLabel={searchQuery ? t('common.clearFilters') : undefined}
                onAction={() => setSearchQuery('')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pe-1">
              {searchableMedicines.map((med) => {
                const isOut = med.quantity <= 0;
                const isExpired = Boolean(med.expirationDate && new Date(med.expirationDate) < today);
                const isBlocked = isOut || isExpired;
                const isLow = !isExpired && med.quantity <= med.minStockLevel && med.quantity > 0;
                const inCart = cart.find((i) => i.medicineId === med.id);

                return (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => addToCart(med)}
                    className={`text-start p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isBlocked
                        ? 'opacity-50 bg-neutral-100 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 cursor-not-allowed'
                        : inCart
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/60 shadow-xs cursor-pointer hover:border-emerald-500'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                          {med.name}
                        </h4>
                        <span className="text-[10px] font-mono font-semibold text-neutral-400 shrink-0">
                          {med.batchNumber}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {med.genericName || getCategoryName(med.categoryId, med.categoryName)}
                      </p>
                    </div>

                    <div className="w-full mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(med.sellingPrice)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono tabular-nums font-semibold ${
                            isExpired || isOut
                              ? 'text-rose-600 dark:text-rose-400'
                              : isLow
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {isExpired
                            ? t('statusLabels.expired')
                            : isOut
                            ? t('statusLabels.outOfStock')
                            : `${med.quantity} ${med.unit}`}
                        </span>

                        {!isBlocked && (
                          <span className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            <Plus className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Cart */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCheckout}
            className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-sm"
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {t('pos.cartTitle')}
                </h3>
                <span className="text-xs text-neutral-400 tabular-nums font-mono">
                  ({cart.length} {t('common.items')})
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="text-xs text-neutral-400 hover:text-rose-600 cursor-pointer"
                >
                  {t('pos.clearCart')}
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-400">
                  {t('pos.emptyCart')}
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.medicineId} className="pt-2 flex items-center justify-between text-xs gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.medicineName}
                      </p>
                      <div className="text-[11px] text-neutral-400 tabular-nums">
                        {formatCurrency(item.unitPrice)} / {t('common.each')}
                      </div>
                    </div>

                    {/* Qty Stepper */}
                    <div className="flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-end min-w-[70px]">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.medicineId)}
                      className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details & Notes */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t('pos.customerName')}
                  placeholder={t('common.optional')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label={t('pos.customerPhone')}
                  placeholder={t('common.optional')}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <Input
                label={t('pos.notesLabel')}
                placeholder={t('pos.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('pos.paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      paymentMethod === 'Cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>{t('pos.cash')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      paymentMethod === 'Card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{t('pos.card')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      paymentMethod === 'Online'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t('pos.online')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex justify-between">
                <span>{t('pos.subtotal')}:</span>
                <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span>{t('pos.discountAmount')}:</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-end text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono tabular-nums"
                  />
                </div>
              </div>

              {settings.taxRatePercent > 0 && (
                <div className="flex justify-between">
                  <span>
                    {t('pos.taxAmount')} ({settings.taxRatePercent}%):
                  </span>
                  <span className="tabular-nums">+{formatCurrency(tax)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-neutral-50 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <span>{t('pos.grandTotal')}:</span>
                <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={cart.length === 0}
              icon={<Printer className="w-4 h-4" />}
            >
              {t('pos.completeSale')}
            </Button>
          </form>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={clearCart}
        title={t('pos.clearCartConfirmTitle')}
        message={t('pos.clearCartConfirmMessage')}
        confirmLabel={t('pos.clearCart')}
        variant="danger"
      />

      {/* Generated Receipt Modal (FR-16) */}
      <ReceiptModal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
      />
    </div>
  );
};
