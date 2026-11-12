import React, { useMemo, useState } from 'react';
import { UserPlus, Edit2, Power, ShieldCheck, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role, User } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { Input, Select } from '../common/Input';

const PAGE_SIZE = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UsersView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    currentUser,
    getRoleLabel,
    formatDate,
    addToast,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Cashier' as Role,
    password: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '+93 ',
      role: 'Cashier',
      password: '',
      isActive: true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      isActive: user.isActive,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    if (!formData.name.trim()) err.name = t('validation.requiredField');
    if (!formData.username.trim()) err.username = t('validation.requiredField');

    if (!formData.email.trim()) {
      err.email = t('validation.requiredField');
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      err.email = t('validation.invalidEmail');
    }

    if (formData.phone.trim()) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 7) {
        err.phone = t('validation.invalidPhone');
      }
    }

    if (!editingUser && !formData.password.trim()) {
      err.password = t('validation.requiredField');
    } else if (formData.password.trim() && formData.password.trim().length < 6) {
      err.password = t('validation.passwordTooShort');
    }

    const normalizedUser = formData.username.trim().toLowerCase();
    const normalizedEmail = formData.email.trim().toLowerCase();
    const hasDuplicate = users.some(
      (u) =>
        u.id !== editingUser?.id &&
        (u.username.toLowerCase() === normalizedUser ||
          u.email.toLowerCase() === normalizedEmail)
    );
    if (hasDuplicate) {
      err.username = t('validation.duplicateUser');
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        isActive: formData.isActive,
        password: formData.password.trim() || undefined,
      });
    } else {
      addUser({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        isActive: formData.isActive,
        password: formData.password.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const requestToggleActive = (user: User) => {
    if (user.id === currentUser.id) {
      addToast('warning', t('roles.restrictedAccess'), t('users.cannotDeactivateSelf'));
      return;
    }
    setUserToToggle(user);
  };

  const hasFilters = Boolean(searchQuery || roleFilter !== 'all');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('users.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('users.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          {t('users.addUser')}
        </Button>
      </div>

      {/* RBAC Info Card */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs">
        <div className="font-semibold text-sm flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('roles.roleArchitectureTitle')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-neutral-600 dark:text-neutral-400">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
              {t('roles.admin')}
            </span>
            <p className="text-[11px] leading-relaxed">{t('roles.adminDesc')}</p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
              {t('roles.manager')}
            </span>
            <p className="text-[11px] leading-relaxed">{t('roles.managerDesc')}</p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">
              {t('roles.cashier')}
            </span>
            <p className="text-[11px] leading-relaxed">{t('roles.cashierDesc')}</p>
          </div>
        </div>
      </div>

      {/* Search & Role Filter */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'all' | Role);
              setPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">{t('users.allRoles')}</option>
            <option value="Admin">{t('roles.admin')}</option>
            <option value="Manager">{t('roles.manager')}</option>
            <option value="Cashier">{t('roles.cashier')}</option>
          </select>
        </div>

        <div className="flex justify-end">
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setPage(1);
              }}
            >
              {t('common.clearFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
              <tr>
                <th className="py-3 px-3 text-start">{t('users.tableHeaders.name')}</th>
                <th className="py-3 px-3 text-start">{t('users.tableHeaders.username')}</th>
                <th className="py-3 px-3 text-start">{t('users.tableHeaders.role')}</th>
                <th className="py-3 px-3 text-center">{t('users.tableHeaders.status')}</th>
                <th className="py-3 px-3 text-start">{t('users.tableHeaders.lastLogin')}</th>
                <th className="py-3 px-3 text-center">{t('users.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={t('common.noResults')}
                      actionLabel={hasFilters ? t('common.clearFilters') : undefined}
                      onAction={() => {
                        setSearchQuery('');
                        setRoleFilter('all');
                        setPage(1);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                      !user.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {user.phone || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      <div className="font-mono text-neutral-800 dark:text-neutral-200">
                        @{user.username}
                      </div>
                      <div className="text-[11px] text-neutral-400">{user.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[11px] font-semibold ${
                          user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'
                        }`}
                      >
                        {user.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-500 tabular-nums whitespace-nowrap">
                      {user.lastLogin && user.lastLogin !== 'Never'
                        ? formatDate(user.lastLogin, true)
                        : t('common.never')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestToggleActive(user)}
                          className={`p-1 rounded-md cursor-pointer ${
                            user.isActive
                              ? 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={user.isActive ? t('common.deactivate') : t('common.activate')}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalItems={filteredUsers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? t('users.editUser') : t('users.addUser')}
        subtitle={t('users.modalSubtitle')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          <Input
            label={`${t('users.name')} *`}
            placeholder={t('users.namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              label={`${t('users.username')} *`}
              placeholder={t('users.usernamePlaceholder')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
              required
            />
            <Select
              label={t('users.role')}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              options={[
                { value: 'Cashier', label: t('roles.cashier') },
                { value: 'Manager', label: t('roles.manager') },
                { value: 'Admin', label: t('roles.admin') },
              ]}
            />
          </div>

          <Input
            label={`${t('users.email')} *`}
            type="email"
            placeholder="ali.seena@pms.af"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />

          <Input
            label={t('users.phone')}
            placeholder="+93 78 833 4455"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
          />

          <Input
            label={editingUser ? t('users.password') : `${t('users.password')} *`}
            type="password"
            placeholder={editingUser ? t('users.passwordEditPlaceholder') : '••••••••'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            helperText={editingUser ? t('users.passwordHint') : undefined}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate / Activate User Confirmation */}
      <ConfirmModal
        isOpen={Boolean(userToToggle)}
        onClose={() => setUserToToggle(null)}
        onConfirm={() => {
          if (userToToggle) {
            updateUser(userToToggle.id, { isActive: !userToToggle.isActive });
          }
        }}
        title={
          userToToggle?.isActive
            ? t('users.deactivateConfirmTitle')
            : t('users.activateConfirmTitle')
        }
        message={
          userToToggle?.isActive
            ? t('users.deactivateConfirm', { name: userToToggle.name })
            : t('users.activateConfirm', { name: userToToggle?.name || '' })
        }
        variant={userToToggle?.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
};
