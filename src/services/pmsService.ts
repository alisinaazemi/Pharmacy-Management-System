/**
 * Frontend Integration & Persistence Service Layer
 *
 * Isolates storage and future REST API integration from React UI and Context state.
 * Currently operates in 'local' persistence mode (localStorage + seeded academic data)
 * until the planned Django REST Framework + MySQL backend (Project Charter §6) is connected.
 */

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
import {
  Category,
  InventoryTransaction,
  Language,
  Medicine,
  Purchase,
  Role,
  Sale,
  Supplier,
  SystemSettings,
  Theme,
  User,
} from '../types';

export type DataMode = 'local' | 'api';

export interface PmsConfig {
  dataMode: DataMode;
  apiBaseUrl: string;
}

export const pmsConfig: PmsConfig = {
  dataMode: (import.meta.env.VITE_DATA_MODE as DataMode) === 'api' ? 'api' : 'local',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
};

export const STORAGE_KEYS = {
  language: 'pms_language',
  theme: 'pms_theme',
  sessionUserId: 'pms_session_user_id',
  isLoggedIn: 'pms_is_logged_in',
  activeRole: 'pms_active_role',
  medicines: 'pms_medicines',
  categories: 'pms_categories',
  suppliers: 'pms_suppliers',
  sales: 'pms_sales',
  purchases: 'pms_purchases',
  inventoryTx: 'pms_inventory_tx',
  users: 'pms_users',
  userCredentials: 'pms_user_credentials',
  settings: 'pms_settings',
} as const;

export interface PmsSnapshot {
  medicines: Medicine[];
  categories: Category[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  inventoryTransactions: InventoryTransaction[];
  users: User[];
  settings: SystemSettings;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export const pmsService = {
  getConfig(): PmsConfig {
    return pmsConfig;
  },

  loadInitialState(): PmsSnapshot {
    return {
      medicines: readJson<Medicine[]>(STORAGE_KEYS.medicines, initialMedicines),
      categories: readJson<Category[]>(STORAGE_KEYS.categories, initialCategories),
      suppliers: readJson<Supplier[]>(STORAGE_KEYS.suppliers, initialSuppliers),
      sales: readJson<Sale[]>(STORAGE_KEYS.sales, initialSales),
      purchases: readJson<Purchase[]>(STORAGE_KEYS.purchases, initialPurchases),
      inventoryTransactions: readJson<InventoryTransaction[]>(
        STORAGE_KEYS.inventoryTx,
        initialInventoryTransactions
      ),
      users: readJson<User[]>(STORAGE_KEYS.users, initialUsers),
      settings: readJson<SystemSettings>(STORAGE_KEYS.settings, initialSettings),
    };
  },

  saveMedicines(data: Medicine[]): void {
    writeJson(STORAGE_KEYS.medicines, data);
  },

  saveCategories(data: Category[]): void {
    writeJson(STORAGE_KEYS.categories, data);
  },

  saveSuppliers(data: Supplier[]): void {
    writeJson(STORAGE_KEYS.suppliers, data);
  },

  saveSales(data: Sale[]): void {
    writeJson(STORAGE_KEYS.sales, data);
  },

  savePurchases(data: Purchase[]): void {
    writeJson(STORAGE_KEYS.purchases, data);
  },

  saveInventoryTransactions(data: InventoryTransaction[]): void {
    writeJson(STORAGE_KEYS.inventoryTx, data);
  },

  saveUsers(data: User[]): void {
    writeJson(STORAGE_KEYS.users, data);
  },

  saveSettings(data: SystemSettings): void {
    writeJson(STORAGE_KEYS.settings, data);
  },

  getLanguage(): Language {
    const saved = localStorage.getItem(STORAGE_KEYS.language);
    return saved === 'fa' || saved === 'en' ? saved : 'en';
  },

  saveLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.language, lang);
  },

  getTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  },

  saveTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  },

  getSession(): { isLoggedIn: boolean; userId: string | null; role: Role | null } {
    const loggedInRaw = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
    const userId = localStorage.getItem(STORAGE_KEYS.sessionUserId);
    const roleRaw = localStorage.getItem(STORAGE_KEYS.activeRole);
    const role: Role | null =
      roleRaw === 'Admin' || roleRaw === 'Manager' || roleRaw === 'Cashier' ? roleRaw : null;

    // Default to authenticated evaluator preview session on first load unless explicitly logged out
    const isLoggedIn = loggedInRaw === null ? true : loggedInRaw === 'true';
    return { isLoggedIn, userId, role };
  },

  saveSession(isLoggedIn: boolean, userId: string | null, role?: Role): void {
    localStorage.setItem(STORAGE_KEYS.isLoggedIn, String(isLoggedIn));
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.sessionUserId, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.sessionUserId);
    }
    if (role) {
      localStorage.setItem(STORAGE_KEYS.activeRole, role);
    }
  },

  getCredentials(): Record<string, string> {
    const defaults: Record<string, string> = {};
    for (const u of initialUsers) {
      defaults[u.username.toLowerCase()] = 'password123';
    }
    return {
      ...defaults,
      ...readJson<Record<string, string>>(STORAGE_KEYS.userCredentials, {}),
    };
  },

  setUserPassword(username: string, password: string): void {
    const creds = readJson<Record<string, string>>(STORAGE_KEYS.userCredentials, {});
    creds[username.toLowerCase()] = password;
    writeJson(STORAGE_KEYS.userCredentials, creds);
  },

  resetAllData(): PmsSnapshot {
    const keysToRemove = [
      STORAGE_KEYS.medicines,
      STORAGE_KEYS.categories,
      STORAGE_KEYS.suppliers,
      STORAGE_KEYS.sales,
      STORAGE_KEYS.purchases,
      STORAGE_KEYS.inventoryTx,
      STORAGE_KEYS.users,
      STORAGE_KEYS.userCredentials,
      STORAGE_KEYS.settings,
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    return {
      medicines: initialMedicines,
      categories: initialCategories,
      suppliers: initialSuppliers,
      sales: initialSales,
      purchases: initialPurchases,
      inventoryTransactions: initialInventoryTransactions,
      users: initialUsers,
      settings: initialSettings,
    };
  },
};
