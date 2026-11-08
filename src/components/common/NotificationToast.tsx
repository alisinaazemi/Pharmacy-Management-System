import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationToastContainer: React.FC = () => {
  const { notifications, removeToast } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {notifications.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
        }[toast.type];

        const borderColors = {
          success: 'border-emerald-500/30 dark:border-emerald-500/20',
          error: 'border-rose-500/30 dark:border-rose-500/20',
          warning: 'border-amber-500/30 dark:border-amber-500/20',
          info: 'border-blue-500/30 dark:border-blue-500/20',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-neutral-900 border ${borderColors} rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-2`}
          >
            {icons}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {toast.title}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
