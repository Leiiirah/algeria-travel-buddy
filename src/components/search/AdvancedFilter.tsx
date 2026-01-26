import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'date-range';
    options?: FilterOption[]; // For select type
}

interface AdvancedFilterProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filters: Record<string, any>;
    onFilterChange: (newFilters: Record<string, any>) => void;
    filterConfig: FilterConfig[];
    placeholder?: string;
    className?: string;
}

export function AdvancedFilter({
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    filterConfig,
    placeholder = 'Rechercher...',
    className,
}: AdvancedFilterProps) {
    const [open, setOpen] = useState(false);

    // Count active filters (excluding search)
    const activeFiltersCount = Object.keys(filters).filter(key => {
        const value = filters[key];
        return value !== undefined && value !== '' && value !== 'all';
    }).length;

    const handleReset = () => {
        const resetFilters: Record<string, any> = {};
        // Reset all defined keys to undefined or specific defaults if needed
        // For now, we'll just clear them
        onFilterChange({});
    };

    const getFilterLabel = (key: string, value: string) => {
        const config = filterConfig.find(c => c.key === key);
        if (!config || !config.options) return value;
        const option = config.options.find(o => o.value === value);
        return option ? option.label : value;
    };

    return (
        <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full hover:bg-transparent"
                        onClick={() => onSearchChange('')}
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 relative">
                        <Filter className="h-4 w-4" />
                        Filtres
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium leading-none">Filtres avancés</h4>
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                onClick={handleReset}
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {filterConfig.map((config) => (
                            <div key={config.key} className="space-y-2">
                                <Label className="text-xs text-muted-foreground">{config.label}</Label>

                                {config.type === 'select' && config.options && (
                                    <Select
                                        value={filters[config.key] || 'all'}
                                        onValueChange={(value) => onFilterChange({ ...filters, [config.key]: value === 'all' ? undefined : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Tous les ${config.label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            {config.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {config.type === 'date-range' && (
                                    <div className="space-y-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !filters[config.key] && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {filters[config.key] ? (
                                                        format(new Date(filters[config.key]), "P", { locale: fr })
                                                    ) : (
                                                        <span>Choisir une date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters[config.key] ? new Date(filters[config.key]) : undefined}
                                                    onSelect={(date) => onFilterChange({ ...filters, [config.key]: date ? date.toISOString() : undefined })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <Button className="w-full" onClick={() => setOpen(false)}>
                        Voir les résultats
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
