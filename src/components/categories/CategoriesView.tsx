import React, { useState } from 'react';
import { Tags, Plus, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

export const CategoriesView: React.FC = () => {
  const { categories, medicines, addCategory, updateCategory, language, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.nameFa && c.nameFa.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
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

      {/* Search Input */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3 top-2.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories (e.g. Antibiotics, انتی‌بیوتیک)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Categories Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const medCount = medicines.filter((m) => m.categoryId === cat.id && m.isActive).length;

          return (
            <div
              key={cat.id}
              className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {language === 'fa' ? cat.nameFa || cat.name : cat.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {language === 'fa' ? cat.name : cat.nameFa}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    title={t('common.edit')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                  {language === 'fa'
                    ? cat.descriptionFa || cat.description
                    : cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('categories.medicineCount')}:
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {medCount} {t('common.items')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
        subtitle="Manage classification compliant with SRS FR-08"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label={t('categories.nameEn')}
            placeholder="e.g. Antibiotics"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label={t('categories.nameFa')}
            placeholder="مثال: انتی‌بیوتیک‌ها"
            value={formData.nameFa}
            onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
            error={errors.nameFa}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('categories.description')} (English)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Clinical category details..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('categories.description')} (فارسی)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.descriptionFa}
              onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
              placeholder="شرح کارکرد درمانی دسته دوا..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
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
