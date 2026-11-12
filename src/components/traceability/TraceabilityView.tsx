import React from 'react';
import { Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { ActiveView } from '../../types';

interface LocalizedRequirement {
  code: string;
  targetView: ActiveView;
  en: {
    name: string;
    module: string;
    roles: string;
    mechanism: string;
  };
  fa: {
    name: string;
    module: string;
    roles: string;
    mechanism: string;
  };
}

const REQUIREMENTS: LocalizedRequirement[] = [
  {
    code: 'FR-01',
    targetView: 'dashboard',
    en: {
      name: 'User Login & Authentication',
      module: 'Auth & Security',
      roles: 'All Users',
      mechanism: 'Credential verification form, active account guard, session persistence & logout confirmation',
    },
    fa: {
      name: 'ورود کاربر و احراز هویت',
      module: 'احراز هویت و امنیت',
      roles: 'همه کاربران',
      mechanism: 'فرم بررسی نام کاربری و رمز عبور، کنترل فعال‌بودن حساب، ماندگاری نشست و تأیید خروج',
    },
  },
  {
    code: 'FR-02',
    targetView: 'users',
    en: {
      name: 'User Account Management',
      module: 'User Management',
      roles: 'Admin',
      mechanism: 'Create staff accounts, role assignment, credential updates, and account activation/deactivation',
    },
    fa: {
      name: 'مدیریت حساب‌های کاربری',
      module: 'مدیریت کاربران',
      roles: 'مدیر عمومی',
      mechanism: 'ایجاد حساب کارمندان، تعیین نقش، ویرایش رمز عبور و فعال/غیرفعال‌سازی حساب',
    },
  },
  {
    code: 'FR-03',
    targetView: 'users',
    en: {
      name: 'Role-Based Access Control (RBAC)',
      module: 'Security Matrix',
      roles: 'Admin / Manager / Cashier',
      mechanism: 'Role switcher, dynamic sidebar filtering, route-level permission guard, and UI action guards',
    },
    fa: {
      name: 'کنترل دسترسی مبتنی بر نقش (RBAC)',
      module: 'ماتریس امنیت',
      roles: 'مدیر / فارمسست / تحویل‌دار',
      mechanism: 'تغییر نقش آزمایشی، فیلتر منوی جانبی، محافظ مسیرها و محدودسازی عملیات حساس',
    },
  },
  {
    code: 'FR-04',
    targetView: 'medicines',
    en: {
      name: 'Add Medicine to Catalog',
      module: 'Medicine Management',
      roles: 'Admin / Manager',
      mechanism: 'Modal form with optional ID, generic name, batch, expiry date, pricing, and initial stock log',
    },
    fa: {
      name: 'افزودن دوای جدید به کاتالوگ',
      module: 'مدیریت دواها',
      roles: 'مدیر / فارمسست',
      mechanism: 'فرم ثبت با کد دلخواه، نام جنریک، بچ، تاریخ انقضا، قیمت خرید/فروش و ثبت موجودی اولیه',
    },
  },
  {
    code: 'FR-05',
    targetView: 'medicines',
    en: {
      name: 'Update Existing Medicine',
      module: 'Medicine Management',
      roles: 'Admin / Manager',
      mechanism: 'Pre-populated edit modal with validation and real-time profit margin calculation',
    },
    fa: {
      name: 'ویرایش مشخصات دوا',
      module: 'مدیریت دواها',
      roles: 'مدیر / فارمسست',
      mechanism: 'مودال ویرایش با اعتبارسنجی فیلدها و محاسبه لحظه‌ای حاشیه مفاد',
    },
  },
  {
    code: 'FR-06',
    targetView: 'medicines',
    en: {
      name: 'Search & Filter Medicines',
      module: 'Medicine Management',
      roles: 'All Users',
      mechanism: 'Multi-criteria search by ID, brand, generic, batch, manufacturer plus category & stock filters',
    },
    fa: {
      name: 'جستجو و فیلتر دواها',
      module: 'مدیریت دواها',
      roles: 'همه کاربران',
      mechanism: 'جستجو با کد، نام تجاری، جنریک، بچ و سازنده همراه با فیلتر دسته‌بندی و وضعیت موجودی',
    },
  },
  {
    code: 'FR-07',
    targetView: 'medicines',
    en: {
      name: 'Soft Deactivate / Reactivate Medicine',
      module: 'Medicine Management',
      roles: 'Admin / Manager',
      mechanism: 'Preserves historical sales/purchases while hiding deactivated medicines from POS checkout',
    },
    fa: {
      name: 'غیرفعال‌سازی نرم دوا',
      module: 'مدیریت دواها',
      roles: 'مدیر / فارمسست',
      mechanism: 'حفظ تاریخچه فروشات و خریداری‌ها ضمن مخفی‌سازی دوا از صندوق فروش',
    },
  },
  {
    code: 'FR-08',
    targetView: 'categories',
    en: {
      name: 'Category Management',
      module: 'Category Management',
      roles: 'Admin / Manager',
      mechanism: 'Bilingual EN/FA categories with duplicate validation, status filtering, and soft deactivation',
    },
    fa: {
      name: 'مدیریت دسته‌بندی‌های دارویی',
      module: 'مدیریت دسته‌بندی‌ها',
      roles: 'مدیر / فارمسست',
      mechanism: 'تعریف دسته‌بندی دوزبانه با بررسی تکراری نبودن، فیلتر وضعیت و غیرفعال‌سازی امن',
    },
  },
  {
    code: 'FR-09',
    targetView: 'inventory',
    en: {
      name: 'View Real-Time Stock Quantities',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      mechanism: 'Paginated warehouse ledger displaying current stock, minimum threshold, and cost valuation',
    },
    fa: {
      name: 'مشاهده لحظه‌ای موجودی گودام',
      module: 'مدیریت موجودی',
      roles: 'مدیر / فارمسست',
      mechanism: 'جدول صفحه‌بندی‌شده گودام با نمایش موجودی فعلی، حداقل مجاز و ارزش مالی',
    },
  },
  {
    code: 'FR-10',
    targetView: 'inventory',
    en: {
      name: 'Automatic Stock Deduction & Restock',
      module: 'Inventory Management',
      roles: 'System Automated',
      mechanism: 'Instant inventory increment upon inward purchase and decrement upon POS checkout',
    },
    fa: {
      name: 'کسر و افزایش خودکار موجودی',
      module: 'مدیریت موجودی',
      roles: 'خودکار سیستم',
      mechanism: 'افزایش آنی موجودی هنگام ثبت خریداری و کسر خودکار هنگام تکمیل فروش در صندوق',
    },
  },
  {
    code: 'FR-11',
    targetView: 'inventory',
    en: {
      name: 'Low Stock Safety Alerts',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      mechanism: 'Flags medicines where quantity <= minStockLevel with suggested reorder calculation & quick purchase',
    },
    fa: {
      name: 'هشدارهای کسری موجودی',
      module: 'مدیریت موجودی',
      roles: 'مدیر / فارمسست',
      mechanism: 'شناسایی اقلام در آستانه کمبود همراه با پیشنهاد تعداد سفارش و دسترسی سریع به خرید',
    },
  },
  {
    code: 'FR-12',
    targetView: 'inventory',
    en: {
      name: 'Expiration Date Monitoring',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      mechanism: 'Segregates expired batches and items expiring within 60 days with one-click write-off modal',
    },
    fa: {
      name: 'پایش تاریخ‌های انقضا',
      module: 'مدیریت موجودی',
      roles: 'مدیر / فارمسست',
      mechanism: 'تفکیک بچ‌های منقضی‌شده و نزدیک به انقضا (۶۰ روز) با دکمه اسقاط و کسر موجودی',
    },
  },
  {
    code: 'FR-13',
    targetView: 'inventory',
    en: {
      name: 'Inventory Audit & History Log',
      module: 'Inventory Management',
      roles: 'Admin / Manager',
      mechanism: 'Filterable chronological audit trail of sales, purchases, manual counts, and write-offs',
    },
    fa: {
      name: 'گزارش ممیزی و تاریخچه موجودی',
      module: 'مدیریت موجودی',
      roles: 'مدیر / فارمسست',
      mechanism: 'ثبت زمان‌بندی‌شده کلیه تغییرات ناشی از فروش، خرید، تعدیل دستی و اسقاط با فیلتر نوع رویداد',
    },
  },
  {
    code: 'FR-14',
    targetView: 'pos',
    en: {
      name: 'Create Sale / Counter Transaction',
      module: 'Sales & POS',
      roles: 'All Users',
      mechanism: 'Counter register with search, cart quantity steppers, discount, tax calculation, and payment method',
    },
    fa: {
      name: 'ثبت فروش در صندوق (POS)',
      module: 'فروش و صندوق',
      roles: 'همه کاربران',
      mechanism: 'صندوق فروش سریع با جستجو، تغییر تعداد، محاسبه تخفیف و مالیات و انتخاب روش تادیه',
    },
  },
  {
    code: 'FR-15',
    targetView: 'pos',
    en: {
      name: 'Strict Stock & Expiry Validation',
      module: 'Sales & POS',
      roles: 'All Users',
      mechanism: 'Blocks dispensing expired batches or quantities exceeding available stock with clear warnings',
    },
    fa: {
      name: 'اعتبارسنجی سخت‌گیرانه موجودی و انقضا',
      module: 'فروش و صندوق',
      roles: 'همه کاربران',
      mechanism: 'جلوگیری از فروش دواهای تاریخ‌گذشته یا مقادیر بیش از موجودی گودام با پیام خطای روشن',
    },
  },
  {
    code: 'FR-16',
    targetView: 'sales-history',
    en: {
      name: 'Sales Receipt / Invoice Generation',
      module: 'Sales & POS',
      roles: 'All Users',
      mechanism: 'Printable bilingual thermal receipt modal with license header, batches, tax, and totals',
    },
    fa: {
      name: 'صدور و چاپ بل رسمی فروش',
      module: 'فروش و صندوق',
      roles: 'همه کاربران',
      mechanism: 'پیش‌نمایش و چاپ بل فروش شامل جواز دواخانه، شماره بچ، تخفیف، مالیات و مبلغ کل',
    },
  },
  {
    code: 'FR-17',
    targetView: 'sales-history',
    en: {
      name: 'Sales Transaction History Archive',
      module: 'Sales & POS',
      roles: 'All Users',
      mechanism: 'Paginated sales archive with receipt #, customer, medicine, cashier, and From/To date filters',
    },
    fa: {
      name: 'آرشیف تاریخچه فروشات',
      module: 'فروش و صندوق',
      roles: 'همه کاربران',
      mechanism: 'جستجو بر اساس شماره بل، مشتری، دوا، فروشنده و بازه تاریخ همراه با صفحه‌بندی',
    },
  },
  {
    code: 'FR-18',
    targetView: 'purchases',
    en: {
      name: 'Record Medicine Purchases',
      module: 'Purchase Management',
      roles: 'Admin / Manager',
      mechanism: 'Multi-line purchase order modal with active supplier selection, batch, expiry, cost, and notes',
    },
    fa: {
      name: 'ثبت فاکتور خریداری ادویه',
      module: 'مدیریت خریداری‌ها',
      roles: 'مدیر / فارمسست',
      mechanism: 'ثبت چندسطری خریداری با انتخاب تأمین‌کننده فعال، شماره بچ، انقضا، قیمت خرید و یادداشت',
    },
  },
  {
    code: 'FR-19',
    targetView: 'purchases',
    en: {
      name: 'Automatic Inventory Update on Purchase',
      module: 'Purchase Management',
      roles: 'System Automated',
      mechanism: 'Inward goods immediately increment medicine quantity and update batch, expiry, and supplier totals',
    },
    fa: {
      name: 'به‌روزرسانی خودکار موجودی در خریداری',
      module: 'مدیریت خریداری‌ها',
      roles: 'خودکار سیستم',
      mechanism: 'افزایش آنی موجودی گودام، به‌روزرسانی بچ و انقضا و محاسبه حجم معاملات تأمین‌کننده',
    },
  },
  {
    code: 'FR-20',
    targetView: 'purchases',
    en: {
      name: 'Purchase History Log',
      module: 'Purchase Management',
      roles: 'Admin / Manager',
      mechanism: 'Searchable & paginated purchase log with supplier/payment status filters and detail drilldown modal',
    },
    fa: {
      name: 'تاریخچه و آرشیف خریداری‌ها',
      module: 'مدیریت خریداری‌ها',
      roles: 'مدیر / فارمسست',
      mechanism: 'جستجو و فیلتر بر اساس تأمین‌کننده و وضعیت پرداخت با مودال مشاهده اقلام فاکتور',
    },
  },
  {
    code: 'FR-21',
    targetView: 'suppliers',
    en: {
      name: 'Add Supplier Profile',
      module: 'Supplier Management',
      roles: 'Admin / Manager',
      mechanism: 'Validated distributor creation form checking required company, contact, phone, and email format',
    },
    fa: {
      name: 'ثبت پروفایل تأمین‌کننده',
      module: 'مدیریت تأمین‌کنندگان',
      roles: 'مدیر / فارمسست',
      mechanism: 'فرم ثبت شرکت توریدکننده با اعتبارسنجی نام شرکت، شخص رابط، تیلفون و فرمت ایمیل',
    },
  },
  {
    code: 'FR-22',
    targetView: 'suppliers',
    en: {
      name: 'Update & Toggle Supplier Status',
      module: 'Supplier Management',
      roles: 'Admin / Manager',
      mechanism: 'Editable vendor profile plus soft deactivation/reactivation with confirmation dialog',
    },
    fa: {
      name: 'ویرایش و تغییر وضعیت تأمین‌کننده',
      module: 'مدیریت تأمین‌کنندگان',
      roles: 'مدیر / فارمسست',
      mechanism: 'ویرایش معلومات تأمین‌کننده همراه با قابلیت فعال و غیرفعال‌سازی با دیالوگ تأیید',
    },
  },
  {
    code: 'FR-23',
    targetView: 'suppliers',
    en: {
      name: 'Supplier Purchase History & Volume',
      module: 'Supplier Management',
      roles: 'Admin / Manager',
      mechanism: 'Detail modal listing all purchase orders and cumulative spend volume per supplier',
    },
    fa: {
      name: 'تاریخچه خرید و حجم معاملات تأمین‌کننده',
      module: 'مدیریت تأمین‌کنندگان',
      roles: 'مدیر / فارمسست',
      mechanism: 'نمایش فهرست کامل سفارش‌های خرید و مجموع گردش مالی هر شرکت تأمین‌کننده',
    },
  },
  {
    code: 'FR-24',
    targetView: 'dashboard',
    en: {
      name: 'Executive Dashboard & Overview',
      module: 'Dashboard',
      roles: 'All Users',
      mechanism: 'Live KPI summary cards, dynamic 7-day sales vs purchases chart, alerts feed, and recent sales',
    },
    fa: {
      name: 'داشبورد مدیریتی و نمای کلی',
      module: 'داشبورد',
      roles: 'همه کاربران',
      mechanism: 'کارت‌های شاخص کلیدی زنده، نمودار پویای ۷ روزه فروش و خرید، هشدارها و فروشات اخیر',
    },
  },
  {
    code: 'FR-25',
    targetView: 'reports',
    en: {
      name: 'Sales Financial Reporting',
      module: 'Reporting',
      roles: 'Admin / Manager',
      mechanism: 'Date-range filtered revenue, estimated gross profit, top medicines, print view, and CSV export',
    },
    fa: {
      name: 'گزارش‌گیری مالی فروشات',
      module: 'گزارشات و احصائیه',
      roles: 'مدیر / فارمسست',
      mechanism: 'فیلتر بازه زمانی، عاید ناخالص، تخمین مفاد، دواهای پرفروش، چاپ و خروجی CSV',
    },
  },
  {
    code: 'FR-26',
    targetView: 'reports',
    en: {
      name: 'Purchase Expenditure Reporting',
      module: 'Reporting',
      roles: 'Admin / Manager',
      mechanism: 'Date-range filtered supplier outlay summary, invoice table, and CSV export',
    },
    fa: {
      name: 'گزارش مصارف خریداری',
      module: 'گزارشات و احصائیه',
      roles: 'مدیر / فارمسست',
      mechanism: 'خلاصه مصارف خریداری با فیلتر تاریخ، جدول فاکتورها و خروجی CSV',
    },
  },
  {
    code: 'FR-27',
    targetView: 'reports',
    en: {
      name: 'Inventory Valuation Report',
      module: 'Reporting',
      roles: 'Admin / Manager',
      mechanism: 'Cost vs retail inventory valuation, potential gross margin, and category breakdown',
    },
    fa: {
      name: 'گزارش ارزش‌گذاری موجودی گودام',
      module: 'گزارشات و احصائیه',
      roles: 'مدیر / فارمسست',
      mechanism: 'مقایسه ارزش خرید و ارزش فروش موجودی، مفاد بالقوه و تفکیک به دسته‌بندی',
    },
  },
  {
    code: 'FR-28',
    targetView: 'reports',
    en: {
      name: 'Expiration Audit Report',
      module: 'Reporting',
      roles: 'Admin / Manager',
      mechanism: 'Lists expired and 60-day near-expiry batches with financial exposure and CSV export',
    },
    fa: {
      name: 'گزارش ممیزی تاریخ‌های انقضا',
      module: 'گزارشات و احصائیه',
      roles: 'مدیر / فارمسست',
      mechanism: 'فهرست بچ‌های منقضی و نزدیک به انقضا طی ۶۰ روز همراه با زیان مالی و خروجی CSV',
    },
  },
  {
    code: 'FR-29',
    targetView: 'reports',
    en: {
      name: 'Low Stock Restock Advisory Report',
      module: 'Reporting',
      roles: 'Admin / Manager',
      mechanism: 'Calculated suggested reorder quantities (3x threshold) with estimated replenishment outlay',
    },
    fa: {
      name: 'گزارش پیشنهادی سفارش مجدد',
      module: 'گزارشات و احصائیه',
      roles: 'مدیر / فارمسست',
      mechanism: 'محاسبه مقدار پیشنهادی سفارش مجدد (۳ برابر حداقل مجاز) و هزینه تخمینی تأمین',
    },
  },
  {
    code: 'FR-30',
    targetView: 'medicines',
    en: {
      name: 'Universal Search & Filtering',
      module: 'System Wide',
      roles: 'All Users',
      mechanism: 'Header quick search plus multi-parameter search/filter/pagination across all data modules',
    },
    fa: {
      name: 'جستجو و فیلتر سراسری',
      module: 'سراسر سیستم',
      roles: 'همه کاربران',
      mechanism: 'جستجوی سریع در نوار بالا به همراه جستجو، فیلتر و صفحه‌بندی در تمام جدول‌ها',
    },
  },
];

export const TraceabilityView: React.FC = () => {
  const { setActiveView, language, t } = useApp();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {t('traceability.title')}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {t('traceability.subtitle')}
        </p>
      </div>

      {/* Project Charter Info Card */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('traceability.charterInfo')}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {t('traceability.srsBaseline')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-neutral-400 block text-[11px]">{t('traceability.lead')}</span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {t('traceability.leadName')}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">
              {t('traceability.methodologyLabel')}
            </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {t('traceability.methodologyValue')}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">
              {t('traceability.frontendLeadLabel')}
            </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {t('traceability.frontendLeadValue')}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">
              {t('traceability.systemStatusLabel')}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {t('traceability.systemStatusValue')}
            </span>
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
            {t('traceability.team')}:
          </span>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('traceability.members')}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label={t('traceability.stats.frLabel')}
          value={t('traceability.stats.frTotal')}
          subtext={t('traceability.stats.frSub')}
        />
        <StatCard
          label={t('traceability.stats.nfrLabel')}
          value={t('traceability.stats.nfrTotal')}
          subtext={t('traceability.stats.nfrSub')}
        />
        <StatCard
          label={t('traceability.stats.modulesLabel')}
          value={t('traceability.stats.modulesTotal')}
          subtext={t('traceability.stats.modulesSub')}
        />
        <StatCard
          label={t('traceability.stats.bilingualLabel')}
          value={t('traceability.stats.bilingualValue')}
          subtext={t('traceability.stats.bilingualSub')}
        />
      </div>

      {/* Requirements Traceability Matrix Table */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('traceability.matrixTitle')}
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            {t('traceability.matrixCount', { count: REQUIREMENTS.length })}
          </span>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.code')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.name')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.module')}</th>
                <th className="py-2.5 px-3 text-start">{t('traceability.tableHeaders.role')}</th>
                <th className="py-2.5 px-3 text-center">
                  {t('traceability.tableHeaders.status')}
                </th>
                <th className="py-2.5 px-3 text-start">
                  {t('traceability.tableHeaders.verification')}
                </th>
                <th className="py-2.5 px-3 text-center">
                  {t('traceability.tableHeaders.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {REQUIREMENTS.map((req) => {
                const localized = language === 'fa' ? req.fa : req.en;
                return (
                  <tr
                    key={req.code}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {req.code}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      {localized.name}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300">
                      {localized.module}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                      {localized.roles}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('traceability.statusImplemented')}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {localized.mechanism}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveView(req.targetView)}
                        className="p-1 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                        title={t('traceability.jumpToModule')}
                      >
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
