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
