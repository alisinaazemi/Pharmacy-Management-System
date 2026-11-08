import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialCategories,
  initialInventoryTransactions,
  initialMedicines,
  initialPurchases,
  initialSales,
  initialSettings,
  initialSuppliers,
  initialUsers,
} from '../data/mockData';
import { translations } from '../locales/translations';
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

interface AppContextType {
  // Localization & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;

  // View Navigation & RBAC
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentUser: User;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  switchRole: (role: Role) => void;
  hasPermission: (view: ActiveView) => boolean;
  isLoggedIn: boolean;
  login: (username: string) => boolean;
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
  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  toggleMedicineActive: (id: string) => void;
  
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  
  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  
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
  
  addUser: (data: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
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
  // 1. Language state (Persist in localStorage)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pms_language');
    return (saved === 'fa' || saved === 'en') ? saved : 'en';
  });

  // 2. Theme state (Persist in localStorage)
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('pms_theme');
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? (saved as Theme) : 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Sync language with document direction & lang attribute
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pms_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

  // Sync theme with document classList
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('pms_theme', newTheme);
  };

  useEffect(() => {
    const applyTheme = () => {
      let dark = false;
      if (theme === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        dark = theme === 'dark';
      }
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
  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation is missing
        let fallback: any = translations.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
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
  };

  // 3. Navigation & RBAC
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pms_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  const [currentUser, setCurrentUser] = useState<User>(users[0]); // Bahram Jafaree by default
  const [currentRole, setCurrentRole] = useState<Role>(users[0].role);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Switch role simulator (lets user test views as Admin, Manager, or Cashier)
  const switchRole = (newRole: Role) => {
    setCurrentRole(newRole);
    // Switch to a matched user profile or update current user role
    const matchedUser = users.find((u) => u.role === newRole && u.isActive) || {
      ...currentUser,
      role: newRole,
    };
    setCurrentUser(matchedUser);

    // If on a restricted page, route back to an accessible view
    if (newRole === 'Cashier' && ['users', 'settings', 'inventory', 'purchases', 'suppliers', 'categories'].includes(activeView)) {
      setActiveView('pos');
    } else if (newRole === 'Manager' && ['users', 'settings'].includes(activeView)) {
      setActiveView('dashboard');
    }
    addToast('info', t('roles.switchRolePrompt'), `${t('roles.currentRole')}: ${newRole}`);
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

  const login = (username: string) => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
    if (user && user.isActive) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      setIsLoggedIn(true);
      addToast('success', t('header.login'), `${user.name} (${user.role})`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // 4. Data states with localStorage persistence
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('pms_medicines');
    return saved ? JSON.parse(saved) : initialMedicines;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('pms_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('pms_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('pms_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('pms_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('pms_inventory_tx');
    return saved ? JSON.parse(saved) : initialInventoryTransactions;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pms_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pms_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('pms_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pms_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('pms_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('pms_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('pms_inventory_tx', JSON.stringify(inventoryTransactions));
  }, [inventoryTransactions]);

  useEffect(() => {
    localStorage.setItem('pms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pms_settings', JSON.stringify(settings));
  }, [settings]);

  // Notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Currency & Date formatting helpers
  const formatCurrency = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString();
    if (settings.currency === 'AFN') {
      return language === 'fa' ? `${formatted} افغانی` : `${formatted} AFN`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return dateStr;
  };

  // Medicine Actions
  const addMedicine = (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `MED-${String(medicines.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const newMed: Medicine = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setMedicines((prev) => [newMed, ...prev]);

    // Record initial inventory transaction if quantity > 0
    if (data.quantity > 0) {
      const tx: InventoryTransaction = {
        id: `TX-${Date.now().toString().slice(-4)}`,
        dateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
        medicineId: newId,
        medicineName: data.name,
        quantityChanged: data.quantity,
        previousQuantity: 0,
        newQuantity: data.quantity,
        changeType: 'Stock Adjustment',
        userResponsible: currentUser.name,
        reason: 'Initial catalog stock registration',
      };
      setInventoryTransactions((prev) => [tx, ...prev]);
    }
    addToast('success', t('medicines.createdSuccess'), data.name);
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
    addToast('success', t('categories.saveSuccess'), data.name);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    addToast('success', t('categories.saveSuccess'), id);
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
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    addToast('success', t('suppliers.saveSuccess'), id);
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
    // 1. Stock Validation (FR-15): verify every item has sufficient available quantity
    for (const item of data.items) {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) {
        return { success: false, error: `Medicine ${item.medicineName} not found in catalog.` };
      }
      if (med.quantity < item.quantity) {
        return {
          success: false,
          error: `${t('validation.insufficientStock', { qty: med.quantity })} (${med.name})`,
        };
      }
    }

    // 2. Compute Totals
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
      customerName: data.customerName || (language === 'fa' ? 'مشتری آزاد' : 'Walk-in Customer'),
      customerPhone: data.customerPhone,
      items: data.items,
      subtotal,
      discount: data.discount,
      tax,
      grandTotal,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    };

    // 3. Deduct Stock in Real-time (FR-10) and Generate Inventory History Records (FR-13)
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
            reason: `Sold on Receipt #${saleId}`,
          });
          return { ...med, quantity: newQty };
        }
        return med;
      })
    );

    setSales((prev) => [newSale, ...prev]);
    setInventoryTransactions((prev) => [...newTransactions, ...prev]);
    addToast('success', t('pos.saleSuccess'), `${saleId} - ${formatCurrency(grandTotal)}`);

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

    // Increase stock automatically (FR-19)
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
            reason: `Received on PO #${purchaseId}`,
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

    // Update supplier stats
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
  const addUser = (data: Omit<User, 'id' | 'createdAt'>) => {
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser: User = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
    };
    setUsers((prev) => [...prev, newUser]);
    addToast('success', t('users.saveSuccess'), data.name);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    addToast('success', t('users.saveSuccess'), id);
  };

  // Settings Actions
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', t('settings.saveSuccess'), '');
  };

  const resetAllData = () => {
    setMedicines(initialMedicines);
    setCategories(initialCategories);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setInventoryTransactions(initialInventoryTransactions);
    setUsers(initialUsers);
    setSettings(initialSettings);
    localStorage.clear();
    addToast('info', 'Reset to demo', 'All initial demo datasets re-loaded.');
  };

  // Derived Alerts (FR-11, FR-12)
  const today = new Date();
  const lowStockMedicines = medicines.filter((m) => m.isActive && m.quantity <= m.minStockLevel);
  const expiredMedicines = medicines.filter((m) => {
    if (!m.expirationDate) return false;
    const exp = new Date(m.expirationDate);
    return exp < today;
  });
  const nearExpiryMedicines = medicines.filter((m) => {
    if (!m.expirationDate) return false;
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
        addSupplier,
        updateSupplier,
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
