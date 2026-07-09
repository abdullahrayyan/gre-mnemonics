'use client';

import type { WordSearchParams } from '@mnemonic/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

/** Fetch the (public) words list with optional filters. */
export function useWords(params?: WordSearchParams) {
  return useQuery({
    queryKey: ['words', params ?? {}],
    queryFn: () => api.words.list(params),
  });
}

const PAGE_SIZE = 100; // API caps pageSize at 100, so page through to get them all.

/** Fetch the entire words library (all pages) for the browse carousel. */
export function useAllWords(params?: Omit<WordSearchParams, 'page' | 'pageSize'>) {
  return useQuery({
    queryKey: ['all-words', params ?? {}],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const first = await api.words.list({ ...params, page: 1, pageSize: PAGE_SIZE });
      const all = [...first.data];
      for (let page = 2; page <= first.pagination.totalPages; page += 1) {
        const next = await api.words.list({ ...params, page, pageSize: PAGE_SIZE });
        all.push(...next.data);
      }
      return all;
    },
  });
}
