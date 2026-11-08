import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  LogOut,
  UserCheck,
  Menu,
  X,
  PlusCircle,
  Pill,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    currentRole,
    switchRole,
    currentUser,
    logout,
    t,
    setActiveView,
    activeView,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { id: Role; labelKey: string }[] = [
    { id: 'Admin', labelKey: 'roles.admin' },
    { id: 'Manager', labelKey: 'roles.manager' },
    { id: 'Cashier', labelKey: 'roles.cashier' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors no-print">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        {/* Left Zone: Brand / Mobile Toggle / Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
                {language === 'fa' ? 'سیستم مدیریت دواخانه' : 'Pharmacy MS'}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap hidden sm:inline">
                {language === 'fa' ? 'تیم سنتز سازمانی' : 'Enterprise Synthesis Team'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Zone: Quick Action button (e.g. New POS Sale) */}
        <div className="hidden md:flex items-center gap-2">
          {activeView !== 'pos' && (
            <button
              onClick={() => setActiveView('pos')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('header.quickSale')}</span>
            </button>
          )}
        </div>

        {/* Right Zone: Controls (Language, Theme, Role Switcher, User) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-700 text-xs">
            <button
              onClick={() => setLanguage('fa')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'fa'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              فارسی
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              English
            </button>
          </div>

          {/* Theme Selector */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              title={t('header.themeSystem')}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Laptop className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {themeMenuOpen && (
              <div className="absolute end-0 mt-2 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-40 text-xs">
                <button
                  onClick={() => {
                    setTheme('light');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer ${
                    theme === 'light' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>{t('header.themeLight')}</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer ${
                    theme === 'dark' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>{t('header.themeDark')}</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer ${
                    theme === 'system' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>{t('header.themeSystem')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher Simulator (FR-03 Demonstration) */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Test RBAC Role Permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline text-neutral-500 dark:text-neutral-400">
                {t('roles.currentRole')}:
              </span>
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">
                {currentRole}
              </span>
            </button>

            {roleMenuOpen && (
              <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-2 z-40 text-xs space-y-1">
                <div className="px-2 py-1 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {t('roles.switchRolePrompt')}
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {t('roles.roleAccessInfo')}
                  </p>
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      switchRole(r.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-start px-2 py-2 rounded-md transition-colors cursor-pointer ${
                      currentRole === r.id
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t(r.labelKey)}</span>
                      {currentRole === r.id && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {currentUser.name.charAt(0)}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute end-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-2 z-40 text-xs">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 truncate">
                    {currentUser.email}
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {currentRole}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveView('traceability');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-start px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t('nav.traceability')}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-start px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('header.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
