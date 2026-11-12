import React, { useState } from 'react';
import { Pill, Lock, User as UserIcon, AlertCircle, ArrowRight, Sun, Moon, Laptop } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const LoginView: React.FC = () => {
  const { login, language, setLanguage, theme, setTheme, getRoleLabel, t } = useApp();

  const [username, setUsername] = useState('bahram.admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t('validation.requiredField'));
      return;
    }

    const result = login(username.trim(), password);
    if (!result.success) {
      setError(result.error || t('validation.invalidLogin'));
    }
  };

  const quickFill = (userUsername: string) => {
    setUsername(userUsername);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top end language & theme quick switcher */}
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
          className="p-2 rounded-lg bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title={
            theme === 'light'
              ? t('header.themeLight')
              : theme === 'dark'
              ? t('header.themeDark')
              : t('header.themeSystem')
          }
          aria-label={t('header.themeSystem')}
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-blue-400" />
          ) : (
            <Laptop className="w-4 h-4 text-neutral-500 dark:text-neutral-300" />
          )}
        </button>

        <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setLanguage('fa')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
              language === 'fa'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {t('header.languagePersian')}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
              language === 'en'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {t('header.languageEnglish')}
          </button>
        </div>
      </div>

      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Pill className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('appName')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('appSubtitle')}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <Input
            label={t('users.username')}
            placeholder={t('auth.usernamePlaceholder')}
            icon={<UserIcon className="w-4 h-4" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label={t('users.password')}
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2">
            <span>{t('header.login')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 ms-1" />
          </Button>
        </form>

        {/* Quick Demo Logins for Evaluator */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 text-center">
            {t('auth.quickTestAccounts')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('bahram.admin')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-start text-[11px] transition-colors cursor-pointer"
            >
              <span className="font-bold block text-neutral-800 dark:text-neutral-200 truncate">
                Bahram
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">
                {getRoleLabel('Admin')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('yousaf.manager')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-start text-[11px] transition-colors cursor-pointer"
            >
              <span className="font-bold block text-neutral-800 dark:text-neutral-200 truncate">
                Said Yousaf
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">
                {getRoleLabel('Manager')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('ali.cashier')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-start text-[11px] transition-colors cursor-pointer"
            >
              <span className="font-bold block text-neutral-800 dark:text-neutral-200 truncate">
                Ali Seena
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">
                {getRoleLabel('Cashier')}
              </span>
            </button>
          </div>
          <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500">
            {t('auth.demoPasswordNote')}
          </p>
        </div>
      </div>
    </div>
  );
};
