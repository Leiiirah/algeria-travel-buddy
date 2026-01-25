import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Compact empty state for tables
interface TableEmptyStateProps {
  message?: string;
  colSpan?: number;
}

export function TableEmptyState({
  message = 'Aucune donnée disponible',
  colSpan = 5,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Inbox className="h-8 w-8 mb-2 opacity-50" />
          <span className="text-sm">{message}</span>
        </div>
      </td>
    </tr>
  );
}
