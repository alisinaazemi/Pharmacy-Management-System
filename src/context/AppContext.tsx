import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations } from '../locales/translations';
import { LOGIN_PATH, pathToView, viewToPath } from '../routes/routes';
import { pmsService } from '../services/pmsService';
import {
  ActiveView,
  Category,
  InventoryChangeType,
  InventoryTransaction,
  Language,
  Medicine,
  Purchase,
  Role,
  Sale,
  SaleItem,
  Supplier,
  SystemSettings,
  Theme,
  ToastNotification,
  User,
} from '../types';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AppContextType {
  // Localization & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string, includeTime?: boolean) => string;
  getRoleLabel: (role: Role) => string;
  getCategoryName: (categoryId: string, fallback?: string) => string;
  getPaymentMethodLabel: (method: 'Cash' | 'Card' | 'Online') => string;
  getPaymentStatusLabel: (status: 'Paid' | 'Pending' | 'Partial') => string;
  getChangeTypeLabel: (type: InventoryChangeType) => string;

  // View Navigation & RBAC
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentUser: User;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  switchRole: (role: Role) => void;
  hasPermission: (view: ActiveView) => boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;

  // Data Entities
  medicines: Medicine[];
  categories: Category[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  inventoryTransactions: InventoryTransaction[];
  users: User[];
  settings: SystemSettings;

  // Entity Actions
  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  toggleMedicineActive: (id: string) => void;

  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  toggleCategoryActive: (id: string) => void;

  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  toggleSupplierActive: (id: string) => void;

  processSale: (data: {
    items: SaleItem[];
    customerName?: string;
    customerPhone?: string;
    discount: number;
    paymentMethod: 'Cash' | 'Card' | 'Online';
    notes?: string;
  }) => { success: boolean; sale?: Sale; error?: string };

  recordPurchase: (data: Omit<Purchase, 'id'>) => void;
  adjustStock: (medicineId: string, delta: number, type: InventoryChangeType, reason: string) => void;

  addUser: (data: Omit<User, 'id' | 'createdAt'> & { password?: string }) => void;
  updateUser: (id: string, data: Partial<User> & { password?: string }) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;

  // Derived Alerts
  lowStockMedicines: Medicine[];
  expiredMedicines: Medicine[];
  nearExpiryMedicines: Medicine[];

  // Toasts
  notifications: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSnapshot = pmsService.loadInitialState();
  const initialSession = pmsService.getSession();
  const initialRoute = pathToView(window.location.pathname);

  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => pmsService.getLanguage());

  // 2. Theme state (defaults to 'system')
  const [theme, setThemeState] = useState<Theme>(() => pmsService.getTheme());
  const [isDark, setIsDark] = useState<boolean>(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    pmsService.saveLanguage(lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    pmsService.saveTheme(newTheme);
  };

  useEffect(() => {
    const applyTheme = () => {
      const dark =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : theme === 'dark';
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Translation resolver helper
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      let current: unknown = translations[language];
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          let fallback: unknown = translations.en;
          for (const fbKey of keys) {
            if (fallback && typeof fallback === 'object' && fbKey in fallback) {
              fallback = (fallback as Record<string, unknown>)[fbKey];
            } else {
              return path;
            }
          }
          current = fallback;
          break;
        }
      }
      if (typeof current !== 'string') return path;
      if (params) {
        let result = current;
        for (const [key, val] of Object.entries(params)) {
          result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
        }
        return result;
      }
      return current;
    },
    [language]
  );

  // 3. Data & Auth State
  const [users, setUsers] = useState<User[]>(initialSnapshot.users);
  const [medicines, setMedicines] = useState<Medicine[]>(initialSnapshot.medicines);
  const [categories, setCategories] = useState<Category[]>(initialSnapshot.categories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSnapshot.suppliers);
  const [sales, setSales] = useState<Sale[]>(initialSnapshot.sales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialSnapshot.purchases);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(
    initialSnapshot.inventoryTransactions
  );
  const [settings, setSettings] = useState<SystemSettings>(initialSnapshot.settings);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (initialRoute.isLogin) return false;
    return initialSession.isLoggedIn;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const matched = initialSession.userId
      ? initialSnapshot.users.find((u) => u.id === initialSession.userId && u.isActive)
      : null;
    return matched || initialSnapshot.users[0];
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return initialSession.role || currentUser.role;
  });

  const [activeView, setActiveViewState] = useState<ActiveView>(() => initialRoute.view);

  // Sync URL with view & auth state
  const setActiveView = useCallback((view: ActiveView) => {
    setActiveViewState(view);
    const targetPath = viewToPath(view);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      if (window.location.pathname !== LOGIN_PATH) {
        window.history.replaceState({ isLogin: true }, '', LOGIN_PATH);
      }
    } else if (window.location.pathname === '/' || window.location.pathname === LOGIN_PATH) {
      window.history.replaceState({ view: activeView }, '', viewToPath(activeView));
    }
  }, [isLoggedIn, activeView]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = pathToView(window.location.pathname);
      if (parsed.isLogin) {
        setIsLoggedIn(false);
      } else {
        setActiveViewState(parsed.view);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Persist domain entities via pmsService
  useEffect(() => {
    pmsService.saveMedicines(medicines);
  }, [medicines]);

  useEffect(() => {
    pmsService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    pmsService.saveSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    pmsService.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    pmsService.savePurchases(purchases);
  }, [purchases]);

  useEffect(() => {
    pmsService.saveInventoryTransactions(inventoryTransactions);
  }, [inventoryTransactions]);

  useEffect(() => {
    pmsService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    pmsService.saveSettings(settings);
  }, [settings]);

  // Notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastNotification['type'], title: string, message: string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      setNotifications((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  // Localization helper functions
  const getRoleLabel = useCallback(
    (role: Role): string => {
      if (role === 'Admin') return t('roles.adminBadge');
      if (role === 'Manager') return t('roles.managerBadge');
      return t('roles.cashierBadge');
    },
    [t]
  );

  const getCategoryName = useCallback(
    (categoryId: string, fallback?: string): string => {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return fallback || '-';
      return language === 'fa' ? cat.nameFa || cat.name : cat.name;
    },
    [categories, language]
  );

  const getPaymentMethodLabel = useCallback(
    (method: 'Cash' | 'Card' | 'Online'): string => {
      if (method === 'Cash') return t('pos.cash');
      if (method === 'Card') return t('pos.card');
      return t('pos.online');
    },
    [t]
  );

  const getPaymentStatusLabel = useCallback(
    (status: 'Paid' | 'Pending' | 'Partial'): string => {
      if (status === 'Paid') return t('statusLabels.paid');
      if (status === 'Pending') return t('statusLabels.pending');
      return t('statusLabels.partial');
    },
    [t]
  );

  const getChangeTypeLabel = useCallback(
    (type: InventoryChangeType): string => {
      switch (type) {
        case 'Sale':
          return t('inventory.types.sale');
        case 'Purchase':
          return t('inventory.types.purchase');
        case 'Expired Write-off':
          return t('inventory.types.expired');
        case 'Damaged Write-off':
          return t('inventory.types.damaged');
        default:
          return t('inventory.types.adjustment');
      }
    },
    [t]
  );

  // Role & Auth Helpers
  const switchRole = (newRole: Role) => {
    setCurrentRole(newRole);
    const matchedUser = users.find((u) => u.role === newRole && u.isActive) || {
      ...currentUser,
      role: newRole,
    };
    setCurrentUser(matchedUser);
    pmsService.saveSession(true, matchedUser.id, newRole);

    if (
      newRole === 'Cashier' &&
      ['users', 'settings', 'inventory', 'purchases', 'suppliers', 'categories'].includes(activeView)
    ) {
      setActiveView('pos');
    } else if (newRole === 'Manager' && ['users', 'settings'].includes(activeView)) {
      setActiveView('dashboard');
    }
    addToast('info', t('roles.switchRolePrompt'), `${t('roles.currentRole')}: ${getRoleLabel(newRole)}`);
  };

  const hasPermission = (view: ActiveView): boolean => {
    if (currentRole === 'Admin') return true;
    if (currentRole === 'Manager') {
      return view !== 'users' && view !== 'settings';
    }
    if (currentRole === 'Cashier') {
      return ['dashboard', 'pos', 'sales-history', 'medicines', 'traceability'].includes(view);
    }
    return false;
  };

  const login = (username: string, password: string): LoginResult => {
    const query = username.trim().toLowerCase();
    const user = users.find(
      (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );
    if (!user) {
      return { success: false, error: t('validation.invalidLogin') };
    }
    if (!user.isActive) {
      return { success: false, error: t('auth.accountInactive') };
    }
    const creds = pmsService.getCredentials();
    const expected = creds[user.username.toLowerCase()] || 'password123';
    if (password !== expected) {
      return { success: false, error: t('validation.invalidLogin') };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedUser = { ...user, lastLogin: nowStr };
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setCurrentRole(user.role);
    setIsLoggedIn(true);
    pmsService.saveSession(true, user.id, user.role);
    setActiveView(user.role === 'Cashier' ? 'pos' : 'dashboard');
    addToast('success', t('header.login'), `${user.name} (${getRoleLabel(user.role)})`);
    return { success: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
    pmsService.saveSession(false, null);
    window.history.pushState({ isLogin: true }, '', LOGIN_PATH);
  };

  // Currency & Date formatting helpers
  const formatCurrency = useCallback(
    (amount: number): string => {
      const locale = language === 'fa' ? 'fa-AF' : 'en-US';
      if (settings.currency === 'AFN') {
        const formatted = Math.round(amount).toLocaleString(locale);
        return language === 'fa' ? `${formatted} افغانی` : `${formatted} AFN`;
      }
      return `$${amount.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [language, settings.currency]
  );

  const formatDate = useCallback(
    (dateStr: string, includeTime = false): string => {
      if (!dateStr) return t('common.never');
      const normalized = dateStr.includes(' ') && !dateStr.includes('T')
        ? dateStr.replace(' ', 'T')
        : dateStr;
      const parsed = new Date(normalized);
      if (Number.isNaN(parsed.getTime())) return dateStr;

      try {
        if (language === 'fa') {
          const opts: Intl.DateTimeFormatOptions = includeTime
            ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: '2-digit', day: '2-digit' };
          return new Intl.DateTimeFormat('fa-IR-u-ca-persian', opts).format(parsed);
        }
        return dateStr;
      } catch {
        return dateStr;
      }
    },
    [language, t]
  );

  // Medicine Actions
  const addMedicine = (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const customId = data.id?.trim().toUpperCase();
    const newId =
      customId ||
      `MED-${String(
        medicines.reduce((max, m) => {
          const num = parseInt(m.id.replace(/\D/g, ''), 10);
          return Number.isNaN(num) ? max : Math.max(max, num);
        }, medicines.length) + 1
      ).padStart(3, '0')}`;

    const now = new Date().toISOString().split('T')[0];
    const { id: _ignored, ...rest } = data;
    const newMed: Medicine = {
      ...rest,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setMedicines((prev) => [newMed, ...prev]);

    if (data.quantity > 0) {
      const tx: InventoryTransaction = {
        id: `TX-${Date.now().toString().slice(-5)}`,
        dateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
        medicineId: newId,
        medicineName: data.name,
        quantityChanged: data.quantity,
        previousQuantity: 0,
        newQuantity: data.quantity,
        changeType: 'Stock Adjustment',
        userResponsible: currentUser.name,
        reason: t('medicines.initialStockReason'),
      };
      setInventoryTransactions((prev) => [tx, ...prev]);
    }
    addToast('success', t('medicines.createdSuccess'), `${data.name} (${newId})`);
  };

  const updateMedicine = (id: string, data: Partial<Medicine>) => {
    const now = new Date().toISOString().split('T')[0];
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: now } : m))
    );
    addToast('success', t('medicines.saveSuccess'), id);
  };

  const toggleMedicineActive = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextState = !m.isActive;
          addToast(
            'info',
            nextState ? t('medicines.activateSuccess') : t('medicines.deactivateSuccess'),
            m.name
          );
          return { ...m, isActive: nextState };
        }
        return m;
      })
    );
  };

  // Category Actions
  const addCategory = (data: Omit<Category, 'id'>) => {
    const newId = `CAT-${String(categories.length + 1).padStart(2, '0')}`;
    setCategories((prev) => [...prev, { ...data, id: newId }]);
    addToast('success', t('categories.saveSuccess'), language === 'fa' ? data.nameFa : data.name);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    addToast('success', t('categories.saveSuccess'), id);
  };

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isActive;
          addToast(
            'info',
            nextState ? t('categories.activateSuccess') : t('categories.deactivateSuccess'),
            language === 'fa' ? c.nameFa || c.name : c.name
          );
          return { ...c, isActive: nextState };
        }
        return c;
      })
    );
  };

  // Supplier Actions
  const addSupplier = (data: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newId = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSup: Supplier = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      totalPurchasesCount: 0,
      totalSpent: 0,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    addToast('success', t('suppliers.saveSuccess'), data.companyName);
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    addToast('success', t('suppliers.saveSuccess'), id);
  };

  const toggleSupplierActive = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.isActive;
          addToast(
            'info',
            nextState ? t('suppliers.activateSuccess') : t('suppliers.deactivateSuccess'),
            s.companyName
          );
          return { ...s, isActive: nextState };
        }
        return s;
      })
    );
  };

  // Sales Action (FR-14, FR-15, FR-16, FR-10)
  const processSale = (data: {
    items: SaleItem[];
    customerName?: string;
    customerPhone?: string;
    discount: number;
    paymentMethod: 'Cash' | 'Card' | 'Online';
    notes?: string;
  }) => {
    const nowDate = new Date();
    for (const item of data.items) {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) {
        return { success: false, error: t('validation.requiredField') };
      }
      if (med.expirationDate && new Date(med.expirationDate) < nowDate) {
        return {
          success: false,
          error: t('pos.expiredSaleBlocked', { name: med.name }),
        };
      }
      if (med.quantity < item.quantity) {
        return {
          success: false,
          error: `${t('validation.insufficientStock', { qty: med.quantity })} (${med.name})`,
        };
      }
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = Math.round((subtotal * settings.taxRatePercent) / 100);
    const grandTotal = Math.max(0, subtotal - data.discount + tax);
    const saleId = `INV-2026-${String(sales.length + 102).padStart(4, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newSale: Sale = {
      id: saleId,
      dateTime: nowStr,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerName: data.customerName || t('pos.walkInCustomer'),
      customerPhone: data.customerPhone,
      items: data.items,
      subtotal,
      discount: data.discount,
      tax,
      grandTotal,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    };

    const newTransactions: InventoryTransaction[] = [];
    setMedicines((prev) =>
      prev.map((med) => {
        const soldItem = data.items.find((i) => i.medicineId === med.id);
        if (soldItem) {
          const newQty = med.quantity - soldItem.quantity;
          newTransactions.push({
            id: `TX-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`,
            dateTime: nowStr,
            medicineId: med.id,
            medicineName: med.name,
            quantityChanged: -soldItem.quantity,
            previousQuantity: med.quantity,
            newQuantity: newQty,
            changeType: 'Sale',
            relatedTransactionId: saleId,
            userResponsible: currentUser.name,
            reason: t('inventory.saleReasonPrefix', { id: saleId }),
          });
          return { ...med, quantity: newQty };
        }
        return med;
      })
    );

    setSales((prev) => [newSale, ...prev]);
    setInventoryTransactions((prev) => [...newTransactions, ...prev]);
    addToast('success', t('pos.saleSuccess'), `${saleId} · ${formatCurrency(grandTotal)}`);

    return { success: true, sale: newSale };
  };

  // Purchase Action (FR-18, FR-19, FR-13)
  const recordPurchase = (data: Omit<Purchase, 'id'>) => {
    const purchaseId = `PUR-2026-${String(purchases.length + 36).padStart(4, '0')}`;
    const newPurchase: Purchase = {
      ...data,
      id: purchaseId,
    };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newTransactions: InventoryTransaction[] = [];

    setMedicines((prev) =>
      prev.map((med) => {
        const item = data.items.find((i) => i.medicineId === med.id);
        if (item) {
          const newQty = med.quantity + item.quantity;
          newTransactions.push({
            id: `TX-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`,
            dateTime: nowStr,
            medicineId: med.id,
            medicineName: med.name,
            quantityChanged: item.quantity,
            previousQuantity: med.quantity,
            newQuantity: newQty,
            changeType: 'Purchase',
            relatedTransactionId: purchaseId,
            userResponsible: currentUser.name,
            reason: t('inventory.purchaseReasonPrefix', { id: purchaseId }),
          });
          return {
            ...med,
            quantity: newQty,
            batchNumber: item.batchNumber || med.batchNumber,
            expirationDate: item.expirationDate || med.expirationDate,
            purchasePrice: item.unitPurchasePrice || med.purchasePrice,
          };
        }
        return med;
      })
    );

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === data.supplierId) {
          return {
            ...s,
            totalPurchasesCount: (s.totalPurchasesCount || 0) + 1,
            totalSpent: (s.totalSpent || 0) + data.totalAmount,
          };
        }
        return s;
      })
    );

    setPurchases((prev) => [newPurchase, ...prev]);
    setInventoryTransactions((prev) => [...newTransactions, ...prev]);
    addToast('success', t('purchases.saveSuccess'), purchaseId);
  };

  // Stock Adjustment Action (FR-13)
  const adjustStock = (medicineId: string, delta: number, type: InventoryChangeType, reason: string) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;

    const newQty = Math.max(0, med.quantity + delta);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, quantity: newQty } : m))
    );

    const tx: InventoryTransaction = {
      id: `TX-${Date.now().toString().slice(-5)}`,
      dateTime: nowStr,
      medicineId: med.id,
      medicineName: med.name,
      quantityChanged: delta,
      previousQuantity: med.quantity,
      newQuantity: newQty,
      changeType: type,
      userResponsible: currentUser.name,
      reason,
    };

    setInventoryTransactions((prev) => [tx, ...prev]);
    addToast('success', t('inventory.adjustmentSuccess'), `${med.name}: ${med.quantity} → ${newQty}`);
  };

  // User Actions (FR-02)
  const addUser = (data: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    const { password, ...userFields } = data;
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser: User = {
      ...userFields,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: undefined,
    };
    if (password) {
      pmsService.setUserPassword(data.username, password);
    }
    setUsers((prev) => [...prev, newUser]);
    addToast('success', t('users.saveSuccess'), data.name);
  };

  const updateUser = (id: string, data: Partial<User> & { password?: string }) => {
    const { password, ...userFields } = data;
    const target = users.find((u) => u.id === id);
    if (password && (data.username || target?.username)) {
      pmsService.setUserPassword(data.username || target!.username, password);
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userFields } : u)));
    addToast('success', t('users.saveSuccess'), data.name || id);
  };

  // Settings Actions
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', t('settings.saveSuccess'), '');
  };

  const resetAllData = () => {
    const fresh = pmsService.resetAllData();
    setMedicines(fresh.medicines);
    setCategories(fresh.categories);
    setSuppliers(fresh.suppliers);
    setSales(fresh.sales);
    setPurchases(fresh.purchases);
    setInventoryTransactions(fresh.inventoryTransactions);
    setUsers(fresh.users);
    setSettings(fresh.settings);
    setCurrentUser(fresh.users[0]);
    setCurrentRole(fresh.users[0].role);
    pmsService.saveSession(true, fresh.users[0].id, fresh.users[0].role);
    addToast('info', t('settings.resetSuccessTitle'), t('settings.resetSuccessMessage'));
  };

  // Derived Alerts (FR-11, FR-12)
  const today = new Date();
  const lowStockMedicines = medicines.filter((m) => m.isActive && m.quantity <= m.minStockLevel);
  const expiredMedicines = medicines.filter((m) => {
    if (!m.isActive || !m.expirationDate) return false;
    return new Date(m.expirationDate) < today;
  });
  const nearExpiryMedicines = medicines.filter((m) => {
    if (!m.isActive || !m.expirationDate) return false;
    const exp = new Date(m.expirationDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  });

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        isDark,
        t,
        formatCurrency,
        formatDate,
        getRoleLabel,
        getCategoryName,
        getPaymentMethodLabel,
        getPaymentStatusLabel,
        getChangeTypeLabel,
        activeView,
        setActiveView,
        currentUser,
        currentRole,
        setCurrentRole,
        switchRole,
        hasPermission,
        isLoggedIn,
        login,
        logout,
        medicines,
        categories,
        suppliers,
        sales,
        purchases,
        inventoryTransactions,
        users,
        settings,
        addMedicine,
        updateMedicine,
        toggleMedicineActive,
        addCategory,
        updateCategory,
        toggleCategoryActive,
        addSupplier,
        updateSupplier,
        toggleSupplierActive,
        processSale,
        recordPurchase,
        adjustStock,
        addUser,
        updateUser,
        updateSettings,
        resetAllData,
        lowStockMedicines,
        expiredMedicines,
        nearExpiryMedicines,
        notifications,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
