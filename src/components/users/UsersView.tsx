import React, { useState } from 'react';
import { Users, UserPlus, Edit2, Power, Shield, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role, User } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, currentRole, currentUser, t } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
    if (!formData.email.trim()) err.email = t('validation.requiredField');
    if (!editingUser && !formData.password.trim()) err.password = t('validation.requiredField');

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      });
    } else {
      addUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
        lastLogin: 'Never',
      });
    }
    setIsModalOpen(false);
  };

  const toggleUserActive = (user: User) => {
    if (user.id === currentUser.id) {
      alert('You cannot deactivate your own logged-in account.');
      return;
    }
    updateUser(user.id, { isActive: !user.isActive });
  };

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
          <span>Role-Based Access Control Architecture (FR-03)</span>
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
              {users.map((user) => (
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
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[11px] font-semibold ${
                        user.isActive ? 'text-emerald-600' : 'text-neutral-400'
                      }`}
                    >
                      {user.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-500 tabular-nums">
                    {user.lastLogin || 'Never'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                        title={t('common.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleUserActive(user)}
                        className={`p-1 rounded-md cursor-pointer ${
                          user.isActive
                            ? 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={user.isActive ? t('common.deactivate') : t('common.activate')}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? t('users.editUser') : t('users.addUser')}
        subtitle="Configure system credentials and access permissions (FR-02)"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label={t('users.name')}
            placeholder="e.g. Ali Seena"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label={t('users.username')}
              placeholder="e.g. ali.cashier"
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
            label={t('users.email')}
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
          />

          <Input
            label={t('users.password')}
            type="password"
            placeholder={editingUser ? 'Leave blank to retain password' : '••••••••'}
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
    </div>
  );
};
