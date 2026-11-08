import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isWarning?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors ${
        onClick ? 'cursor-pointer hover:border-emerald-500/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50' : ''
      }`}
    >
      <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">{icon}</span>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 tabular-nums">
          {value}
        </span>
      </div>

      {(subtext || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          {trend && (
            <span
              className={`font-semibold tabular-nums ${
                trend.isWarning
                  ? 'text-amber-600 dark:text-amber-400'
                  : trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {trend && subtext && <span aria-hidden="true">·</span>}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
