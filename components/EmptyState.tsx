import { Button } from './ui/Button';
import { EmptyState as UiEmptyState } from './ui/EmptyState';

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <UiEmptyState
      title={title}
      message={message}
      action={
        actionLabel && onAction ? (
          <Button title={actionLabel} onPress={onAction} />
        ) : undefined
      }
    />
  );
}
