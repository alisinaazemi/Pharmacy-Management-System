import { ActiveView } from '../types';

export const VIEW_PATHS: Record<ActiveView, string> = {
  dashboard: '/dashboard',
  pos: '/pos',
  'sales-history': '/sales-history',
  medicines: '/medicines',
  categories: '/categories',
  inventory: '/inventory',
  purchases: '/purchases',
  suppliers: '/suppliers',
  reports: '/reports',
  users: '/users',
  settings: '/settings',
  traceability: '/traceability',
};

export const LOGIN_PATH = '/login';

export function viewToPath(view: ActiveView): string {
  return VIEW_PATHS[view] || '/dashboard';
}

export function pathToView(pathname: string): { isLogin: boolean; view: ActiveView } {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === LOGIN_PATH) {
    return { isLogin: true, view: 'dashboard' };
  }
  if (normalized === '/' || normalized === '') {
    return { isLogin: false, view: 'dashboard' };
  }
  const entry = (Object.entries(VIEW_PATHS) as [ActiveView, string][]).find(
    ([, path]) => path === normalized
  );
  return {
    isLogin: false,
    view: entry ? entry[0] : 'dashboard',
  };
}
