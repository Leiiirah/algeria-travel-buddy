import { ReactNode } from 'react';
import { ErrorState } from '@/components/ui/error-state';

interface DataStateProps<T> {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  data: T[] | T | undefined | null;
  loadingSkeleton: ReactNode;
  emptyState: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}

export function DataState<T>({
  isLoading,
  isError,
  error,
  data,
  loadingSkeleton,
  emptyState,
  onRetry,
  children,
}: DataStateProps<T>) {
  // Show loading skeleton
  if (isLoading) {
    return <>{loadingSkeleton}</>;
  }

  // Show error state
  if (isError) {
    return <ErrorState message={error?.message} onRetry={onRetry} />;
  }

  // Check if data is empty
  const isEmpty = Array.isArray(data) ? data.length === 0 : !data;

  // Show empty state
  if (isEmpty) {
    return <>{emptyState}</>;
  }

  // Render children with data
  return <>{children}</>;
}

// Simplified version for non-array data
interface SingleDataStateProps<T> {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  data: T | undefined | null;
  loadingSkeleton: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}

export function SingleDataState<T>({
  isLoading,
  isError,
  error,
  data,
  loadingSkeleton,
  onRetry,
  children,
}: SingleDataStateProps<T>) {
  if (isLoading) {
    return <>{loadingSkeleton}</>;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={onRetry} />;
  }

  if (!data) {
    return <ErrorState title="Données introuvables" onRetry={onRetry} />;
  }

  return <>{children}</>;
}
