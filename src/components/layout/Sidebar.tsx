import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Tags,
  Boxes,
  ShoppingCart,
  Receipt,
  Truck,
  Building2,
  BarChart3,
  Users,
  Settings,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    hasPermission,
    currentRole,
    lowStockMedicines,
    expiredMedicines,
    t,
  } = useApp();

  interface NavItem {
    id: ActiveView;
    labelKey: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      labelKey: 'nav.dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'pos',
      labelKey: 'nav.pos',
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      id: 'sales-history',
      labelKey: 'nav.salesHistory',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'medicines',
      labelKey: 'nav.medicines',
      icon: <Pill className="w-4 h-4" />,
    },
    {
      id: 'categories',
      labelKey: 'nav.categories',
      icon: <Tags className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      labelKey: 'nav.inventory',
      icon: <Boxes className="w-4 h-4" />,
      badgeCount: lowStockMedicines.length + expiredMedicines.length,
      badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      id: 'purchases',
      labelKey: 'nav.purchases',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'suppliers',
      labelKey: 'nav.suppliers',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'reports',
      labelKey: 'nav.reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'users',
      labelKey: 'nav.users',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'settings',
      labelKey: 'nav.settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'traceability',
      labelKey: 'nav.traceability',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden no-print"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 start-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900 border-e border-neutral-200 dark:border-neutral-800 transition-transform duration-200 ease-in-out lg:translate-x-0 no-print flex flex-col justify-between overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {t('appName')}
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const allowed = hasPermission(item.id);
              if (!allowed) return null;

              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{t(item.labelKey)}</span>
                  </div>

                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md tabular-nums ${item.badgeColor}`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom indicator for active role */}
        <div className="p-3 m-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[11px]">
            <span>{t('roles.currentRole')}</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{currentRole}</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {currentRole === 'Admin'
              ? t('roles.adminDesc')
              : currentRole === 'Manager'
              ? t('roles.managerDesc')
              : t('roles.cashierDesc')}
          </p>
        </div>
      </aside>
    </>
  );
};
