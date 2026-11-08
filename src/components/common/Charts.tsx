import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface DataPoint {
  day: string;
  dayFa: string;
  sales: number;
  purchases: number;
}

export const SalesVsPurchasesChart: React.FC = () => {
  const { language, formatCurrency, t } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 7-day data model
  const data: DataPoint[] = [
    { day: 'Sat', dayFa: 'شنبه', sales: 4200, purchases: 10000 },
    { day: 'Sun', dayFa: 'یکشنبه', sales: 5800, purchases: 0 },
    { day: 'Mon', dayFa: 'دوشنبه', sales: 6400, purchases: 5500 },
    { day: 'Tue', dayFa: 'سه‌شنبه', sales: 4900, purchases: 0 },
    { day: 'Wed', dayFa: 'چهارشنبه', sales: 7100, purchases: 11500 },
    { day: 'Thu', dayFa: 'پنج‌شنبه', sales: 8300, purchases: 0 },
    { day: 'Fri', dayFa: 'جمعه', sales: 6900, purchases: 2000 },
  ];

  const maxVal = Math.max(...data.map((d) => Math.max(d.sales, d.purchases))) * 1.15;
  const chartHeight = 180;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.salesAmount')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-600 dark:bg-blue-500" />
            <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.purchasesAmount')}</span>
          </div>
        </div>
        {hoveredIndex !== null && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            {language === 'fa' ? data[hoveredIndex].dayFa : data[hoveredIndex].day}:{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {formatCurrency(data[hoveredIndex].sales)}
            </span>{' '}
            / {' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {formatCurrency(data[hoveredIndex].purchases)}
            </span>
          </div>
        )}
      </div>

      <div className="relative h-48 w-full flex items-end gap-2 pt-6 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        {data.map((item, idx) => {
          const salesHeight = (item.sales / maxVal) * chartHeight;
          const purchaseHeight = (item.purchases / maxVal) * chartHeight;
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                {/* Sales Bar */}
                <div
                  style={{ height: `${salesHeight}px` }}
                  className={`w-1/2 max-w-[20px] rounded-t-xs transition-all duration-200 ${
                    isHovered
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : 'bg-emerald-600/80 dark:bg-emerald-500/80 group-hover:bg-emerald-600'
                  }`}
                />
                {/* Purchase Bar */}
                <div
                  style={{ height: `${purchaseHeight}px` }}
                  className={`w-1/2 max-w-[20px] rounded-t-xs transition-all duration-200 ${
                    isHovered
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : 'bg-blue-600/70 dark:bg-blue-500/70 group-hover:bg-blue-600'
                  }`}
                />
              </div>

              {/* Day label */}
              <span
                className={`mt-2 text-xs font-medium transition-colors ${
                  isHovered
                    ? 'text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {language === 'fa' ? item.dayFa : item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
