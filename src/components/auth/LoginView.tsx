import React, { useState } from 'react';
import { Pill, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const LoginView: React.FC = () => {
  const { login, users, language, setLanguage, theme, setTheme, t } = useApp();

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

    const success = login(username.trim());
    if (!success) {
      setError(t('validation.invalidLogin'));
    }
  };

  const quickFill = (userUsername: string) => {
    setUsername(userUsername);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top right language & theme quick switcher */}
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setLanguage('fa')}
            className={`px-2 py-1 rounded font-medium cursor-pointer ${
              language === 'fa'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            فارسی
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded font-medium cursor-pointer ${
              language === 'en'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Pill className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
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
            placeholder="Username or email address"
            icon={<UserIcon className="w-4 h-4" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label={t('users.password')}
            type="password"
            placeholder="••••••••"
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
          <p className="text-[11px] font-semibold text-neutral-400 text-center uppercase tracking-wider">
            Quick Academic Test Accounts (FR-01)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('bahram.admin')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-start text-[11px] transition-colors cursor-pointer"
            >
              <span className="font-bold block text-neutral-800 dark:text-neutral-200">Bahram</span>
              <span className="text-neutral-400 text-[10px]">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('yousaf.manager')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-start text-[11px] transition-colors cursor-pointer"
            >
              <span className="font-bold block text-neutral-800 dark:text-neutral-200">Said Yousaf</span>
              <span className="text-neutral-400 text-[10px]">Manager</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('ali.cashier')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-start text-[11px] transition-colors cursor-pointer"
            >
              <span className="font-bold block text-neutral-800 dark:text-neutral-200">Ali Seena</span>
              <span className="text-neutral-400 text-[10px]">Cashier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
