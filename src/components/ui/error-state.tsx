import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-6">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Inline error for smaller sections
interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function InlineError({
  message = 'Erreur de chargement',
  onRetry,
}: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <span className="text-sm text-destructive">{message}</span>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="ml-auto h-7 text-destructive hover:text-destructive"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
