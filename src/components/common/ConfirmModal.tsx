import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useApp } from '../../context/AppContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
}) => {
  const { t } = useApp();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              variant === 'danger' ? 'text-rose-500' : 'text-amber-500'
            }`}
          />
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel || t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
