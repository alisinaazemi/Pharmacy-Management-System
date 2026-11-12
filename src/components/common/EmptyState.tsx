import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="py-10 px-4 text-center space-y-2.5">
      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{title}</p>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="pt-1">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
