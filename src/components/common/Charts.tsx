import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

interface DataPoint {
  dateKey: string;
  label: string;
  sales: number;
  purchases: number;
}

export const SalesVsPurchasesChart: React.FC = () => {
  const { sales, purchases, language, formatCurrency, t } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Build 7-day rolling series anchored to the most recent recorded transaction date (or today)
  const data: DataPoint[] = useMemo(() => {
    const allDates = [
      ...sales.map((s) => s.dateTime.slice(0, 10)),
      ...purchases.map((p) => p.date.slice(0, 10)),
    ]
      .filter(Boolean)
      .sort();

    const anchorStr = allDates[allDates.length - 1] || new Date().toISOString().slice(0, 10);
    const anchorDate = new Date(anchorStr + 'T00:00:00');
    const points: DataPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);

      const daySales = sales
        .filter((s) => s.dateTime.startsWith(dateKey))
        .reduce((sum, s) => sum + s.grandTotal, 0);

      const dayPurchases = purchases
        .filter((p) => p.date.startsWith(dateKey))
        .reduce((sum, p) => sum + p.totalAmount, 0);

      const label = new Intl.DateTimeFormat(
        language === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US',
        { weekday: 'short' }
      ).format(d);

      points.push({
        dateKey,
        label,
        sales: daySales,
        purchases: dayPurchases,
      });
    }
    return points;
  }, [sales, purchases, language]);

  const rawMax = Math.max(...data.map((d) => Math.max(d.sales, d.purchases)), 1000);
  const maxVal = rawMax * 1.15;
  const chartHeight = 165;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
            {data[hoveredIndex].label}:{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {formatCurrency(data[hoveredIndex].sales)}
            </span>{' '}
            /{' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {formatCurrency(data[hoveredIndex].purchases)}
            </span>
          </div>
        )}
      </div>

      <div className="relative h-48 w-full flex items-end gap-2 pt-6 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        {data.map((item, idx) => {
          const salesHeight = item.sales > 0 ? Math.max(4, (item.sales / maxVal) * chartHeight) : 0;
          const purchaseHeight =
            item.purchases > 0 ? Math.max(4, (item.purchases / maxVal) * chartHeight) : 0;
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.dateKey}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                <div
                  style={{ height: `${salesHeight}px` }}
                  className={`w-1/2 max-w-[20px] rounded-t-xs transition-all duration-200 ${
                    isHovered
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : 'bg-emerald-600/80 dark:bg-emerald-500/80 group-hover:bg-emerald-600'
                  }`}
                />
                <div
                  style={{ height: `${purchaseHeight}px` }}
                  className={`w-1/2 max-w-[20px] rounded-t-xs transition-all duration-200 ${
                    isHovered
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : 'bg-blue-600/70 dark:bg-blue-500/70 group-hover:bg-blue-600'
                  }`}
                />
              </div>

              <span
                className={`mt-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  isHovered
                    ? 'text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
