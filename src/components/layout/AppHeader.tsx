import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-card px-3 sm:px-6 rtl:flex-row-reverse">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex flex-1 items-center gap-4">
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        
        <LanguageSwitcher />
      </div>
    </header>
  );
}
