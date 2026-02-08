import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useDirection from '@/hooks/useDirection';

interface Ancestor {
  id: string;
  name: string;
}

interface DocumentBreadcrumbsProps {
  ancestors: Ancestor[];
  currentFolderName?: string;
  onNavigate: (folderId: string | null) => void;
}

export function DocumentBreadcrumbs({ ancestors, currentFolderName, onNavigate }: DocumentBreadcrumbsProps) {
  const { t } = useTranslation('documents');
  const direction = useDirection();
  const SeparatorIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Root */}
        <BreadcrumbItem>
          {currentFolderName ? (
            <BreadcrumbLink
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => onNavigate(null)}
            >
              <Home className="h-4 w-4" />
              <span>{t('breadcrumbs.root')}</span>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>{t('breadcrumbs.root')}</span>
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Ancestor folders */}
        {ancestors.map((ancestor) => (
          <span key={ancestor.id} className="contents">
            <BreadcrumbSeparator>
              <SeparatorIcon className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer"
                onClick={() => onNavigate(ancestor.id)}
              >
                {ancestor.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </span>
        ))}

        {/* Current folder */}
        {currentFolderName && (
          <>
            <BreadcrumbSeparator>
              <SeparatorIcon className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{currentFolderName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
