'use client';

import type { WordSearchParams } from '@mnemonic/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

/** Debounce a rapidly-changing value (e.g. a search box). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/** Run a word search (public endpoint) when `enabled`. */
export function useSearch(params: WordSearchParams, enabled: boolean) {
  return useQuery({
    queryKey: ['search', params],
    enabled,
    queryFn: () => api.words.list(params),
  });
}
