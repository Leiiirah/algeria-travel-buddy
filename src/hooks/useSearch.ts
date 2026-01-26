import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Hook to search with React Query

export const useSearch = (query: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['global-search', query],
        queryFn: () => api.search(query),
        enabled: enabled && query.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
