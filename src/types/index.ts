/**
 * Core Data Models & TypeScript Types for Pharmacy Management System (PMS)
 * Grounded in PMS SRS v1.0 and Project Charter
 */

export type Role = 'Admin' | 'Manager' | 'Cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Medicine {
  id: string; // e.g., "MED-001"
  name: string; // e.g., "Amoxicillin 500mg"
  genericName: string; // e.g., "Amoxicillin Trihydrate"
  categoryId: string; // References Category.id
  categoryName: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: string; // ISO date string "YYYY-MM-DD"
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  description: string;
  unit: string; // e.g., "Strip", "Bottle", "Box", "Ampoule"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameFa: string;
  description: string;
  descriptionFa?: string;
  isActive: boolean;
  medicineCount?: number;
}

export interface Supplier {
  id: string; // e.g., "SUP-001"
  name: string; // Contact person
  companyName: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  isActive: boolean;
  totalPurchasesCount?: number;
  totalSpent?: number;
  createdAt: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  genericName?: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string; // e.g., "INV-2026-0042"
  dateTime: string;
  cashierId: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  notes?: string;
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  unitPurchasePrice: number;
  totalCost: number;
}

export interface Purchase {
  id: string; // e.g., "PUR-2026-0019"
  supplierId: string;
  supplierName: string;
  companyName: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  invoiceNumber?: string;
  notes?: string;
  receivedBy: string;
}

export type InventoryChangeType = 'Sale' | 'Purchase' | 'Stock Adjustment' | 'Expired Write-off' | 'Damaged Write-off';

export interface InventoryTransaction {
  id: string;
  dateTime: string;
  medicineId: string;
  medicineName: string;
  quantityChanged: number; // positive for addition, negative for reduction
  previousQuantity: number;
  newQuantity: number;
  changeType: InventoryChangeType;
  relatedTransactionId?: string; // Reference to Sale.id or Purchase.id
  userResponsible: string;
  reason?: string;
}

export interface SystemSettings {
  pharmacyName: string;
  pharmacyNameFa: string;
  licenseNumber: string;
  phone: string;
  email: string;
  address: string;
  addressFa: string;
  currency: 'AFN' | 'USD';
  defaultMinStockLevel: number;
  taxRatePercent: number;
  invoiceFooterNote: string;
  invoiceFooterNoteFa: string;
}

export type ActiveView =
  | 'dashboard'
  | 'medicines'
  | 'categories'
  | 'inventory'
  | 'pos'
  | 'sales-history'
  | 'purchases'
  | 'suppliers'
  | 'reports'
  | 'users'
  | 'settings'
  | 'traceability';

export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark' | 'system';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
