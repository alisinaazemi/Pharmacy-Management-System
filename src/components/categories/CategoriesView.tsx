import React, { useState } from 'react';
import { Plus, Edit2, Power, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';

export const CategoriesView: React.FC = () => {
  const {
    categories,
    medicines,
    addCategory,
    updateCategory,
    toggleCategoryActive,
    language,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameFa: '',
    description: '',
    descriptionFa: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      nameFa: '',
      description: '',
      descriptionFa: '',
      isActive: true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      nameFa: cat.nameFa || '',
      description: cat.description || '',
      descriptionFa: cat.descriptionFa || '',
      isActive: cat.isActive,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = t('validation.requiredField');
    if (!formData.nameFa.trim()) err.nameFa = t('validation.requiredField');

    const duplicate = categories.some(
      (c) =>
        c.id !== editingCategory?.id &&
        (c.name.toLowerCase() === formData.name.trim().toLowerCase() ||
          c.nameFa.trim() === formData.nameFa.trim())
    );
    if (duplicate) {
      err.name = t('validation.duplicateCategory');
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        ...formData,
        name: formData.name.trim(),
        nameFa: formData.nameFa.trim(),
      });
    } else {
      addCategory({
        ...formData,
        name: formData.name.trim(),
        nameFa: formData.nameFa.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.nameFa && c.nameFa.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q) ||
      (c.descriptionFa && c.descriptionFa.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive) ||
      (statusFilter === 'inactive' && !c.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('categories.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('categories.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          {t('categories.addCategory')}
        </Button>
      </div>

      {/* Search & Status Filter */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('categories.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">{t('common.allStatuses')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>
      </div>

      {/* Categories Cards */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <EmptyState title={t('common.noResults')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const medCount = medicines.filter((m) => m.categoryId === cat.id && m.isActive).length;

            return (
              <div
                key={cat.id}
                className={`p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors ${
                  !cat.isActive ? 'opacity-65' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {language === 'fa' ? cat.nameFa || cat.name : cat.name}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate">
                        {language === 'fa' ? cat.name : cat.nameFa}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-md text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                        title={t('common.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToToggle(cat)}
                        className={`p-1.5 rounded-md cursor-pointer ${
                          cat.isActive
                            ? 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={cat.isActive ? t('common.deactivate') : t('common.activate')}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                    {language === 'fa' ? cat.descriptionFa || cat.description : cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      cat.isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {cat.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                  <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                    {medCount} {t('common.items')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
        subtitle={t('categories.modalSubtitle')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label={t('categories.nameEn')}
            placeholder={t('categories.nameEnPlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label={t('categories.nameFa')}
            placeholder={t('categories.nameFaPlaceholder')}
            value={formData.nameFa}
            onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
            error={errors.nameFa}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('categories.description')} ({t('header.languageEnglish')})
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('categories.descriptionEnPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('categories.description')} ({t('header.languagePersian')})
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.descriptionFa}
              onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
              placeholder={t('categories.descriptionFaPlaceholder')}
            />
          </div>

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

      {/* Deactivate / Reactivate Category Modal */}
      <ConfirmModal
        isOpen={Boolean(categoryToToggle)}
        onClose={() => setCategoryToToggle(null)}
        onConfirm={() => {
          if (categoryToToggle) toggleCategoryActive(categoryToToggle.id);
        }}
        title={
          categoryToToggle?.isActive
            ? t('categories.deactivateConfirmTitle')
            : t('categories.activateConfirmTitle')
        }
        message={
          categoryToToggle
            ? categoryToToggle.isActive
              ? t('categories.deactivateConfirm', {
                  name:
                    language === 'fa'
                      ? categoryToToggle.nameFa || categoryToToggle.name
                      : categoryToToggle.name,
                })
              : t('categories.activateConfirm', {
                  name:
                    language === 'fa'
                      ? categoryToToggle.nameFa || categoryToToggle.name
                      : categoryToToggle.name,
                })
            : ''
        }
        confirmLabel={categoryToToggle?.isActive ? t('common.deactivate') : t('common.activate')}
        variant={categoryToToggle?.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
};
