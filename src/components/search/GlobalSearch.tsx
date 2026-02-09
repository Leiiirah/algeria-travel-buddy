import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator,
    FileText,
    Truck,
    Users,
    LayoutDashboard,
    Search,
    Loader2,
    File,
    CreditCard,
    ArrowRightLeft
} from 'lucide-react';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigate = useNavigate();

    // Debounce query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const { data: results, isLoading } = useSearch(debouncedQuery, open);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Rechercher...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[95vw] sm:max-w-[650px]">
                    <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <CommandInput
                            placeholder="Rechercher partout (commandes, factures, employés...)"
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Recherche en cours...
                                    </div>
                                ) : (
                                    'Aucun résultat trouvé.'
                                )}
                            </CommandEmpty>

                            {!isLoading && results && results.length > 0 && (
                                <>
                                    {results.some(r => r.type === 'command') && (
                                        <CommandGroup heading="Commandes">
                                            {results.filter(r => r.type === 'command').map((result) => (
                                                <CommandItem
                                                    key={result.id}
                                                    value={result.id}
                                                    onSelect={() => runCommand(() => navigate(result.url))}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    <span>{result.label}</span>
                                                    <span className="ml-2 text-muted-foreground text-xs">{result.sublabel}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}

                                    {results.some(r => r.type === 'supplier') && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Fournisseurs">
                                                {results.filter(r => r.type === 'supplier').map((result) => (
                                                    <CommandItem
                                                        key={result.id}
                                                        value={result.id}
                                                        onSelect={() => runCommand(() => navigate(result.url))}
                                                    >
                                                        <Truck className="mr-2 h-4 w-4" />
                                                        <span>{result.label}</span>
                                                        <span className="ml-2 text-muted-foreground text-xs">{result.sublabel}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {results.some(r => r.type === 'employee') && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Employés">
                                                {results.filter(r => r.type === 'employee').map((result) => (
                                                    <CommandItem
                                                        key={result.id}
                                                        value={result.id}
                                                        onSelect={() => runCommand(() => navigate(result.url))}
                                                    >
                                                        <Users className="mr-2 h-4 w-4" />
                                                        <span>{result.label}</span>
                                                        <span className="ml-2 text-muted-foreground text-xs">{result.sublabel}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {results.some(r => r.type === 'document') && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Documents">
                                                {results.filter(r => r.type === 'document').map((result) => (
                                                    <CommandItem
                                                        key={result.id}
                                                        value={result.id}
                                                        onSelect={() => runCommand(() => navigate(result.url))}
                                                    >
                                                        <File className="mr-2 h-4 w-4" />
                                                        <span>{result.label}</span>
                                                        <span className="ml-2 text-muted-foreground text-xs">{result.sublabel}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {results.some(r => r.type === 'transaction') && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Situation Fournisseurs">
                                                {results.filter(r => r.type === 'transaction').map((result) => (
                                                    <CommandItem
                                                        key={result.id}
                                                        value={result.id}
                                                        onSelect={() => runCommand(() => navigate(result.url))}
                                                    >
                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                        <span>{result.label}</span>
                                                        <span className="ml-2 text-muted-foreground text-xs">{result.sublabel}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {results.some(r => r.type === 'payment') && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Comptabilité">
                                                {results.filter(r => r.type === 'payment').map((result) => (
                                                    <CommandItem
                                                        key={result.id}
                                                        value={result.id}
                                                        onSelect={() => runCommand(() => navigate(result.url))}
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>{result.label}</span>
                                                        <span className="ml-2 text-muted-foreground text-xs">{result.sublabel}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}
                                </>
                            )}

                            <CommandSeparator />

                            <CommandGroup heading="Navigation Rapide">
                                <CommandItem value="dashboard" onSelect={() => runCommand(() => navigate('/dashboard'))}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Tableau de bord</span>
                                </CommandItem>
                                <CommandItem value="commands" onSelect={() => runCommand(() => navigate('/commandes'))}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Commandes</span>
                                </CommandItem>
                                <CommandItem value="accounting" onSelect={() => runCommand(() => navigate('/comptabilite'))}>
                                    <Calculator className="mr-2 h-4 w-4" />
                                    <span>Comptabilité</span>
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
