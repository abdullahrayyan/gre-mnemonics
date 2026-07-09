'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';

export function useAdminOverview() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['admin', 'overview'],
    retry: false,
    queryFn: async () => api.admin.overview((await getToken()) ?? ''),
  });
}

export function useModerationMnemonics() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['admin', 'mnemonics'],
    retry: false,
    queryFn: async () => api.admin.mnemonics((await getToken()) ?? ''),
  });
}

export function useReports() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['admin', 'reports'],
    retry: false,
    queryFn: async () => api.admin.reports((await getToken()) ?? ''),
  });
}

export function useModerate() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.admin.moderate(id, status, (await getToken()) ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'mnemonics'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      void queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useResolveReport() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.admin.resolveReport(id, status, (await getToken()) ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
  });
}

export function useGenerateWord() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (word: string) => api.admin.generateWord(word, (await getToken()) ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      void queryClient.invalidateQueries({ queryKey: ['all-words'] });
    },
  });
}
