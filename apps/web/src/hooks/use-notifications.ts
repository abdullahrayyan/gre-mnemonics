'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';

export function useNotifications() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['notifications'],
    enabled: isSignedIn ?? false,
    queryFn: async () => api.notifications.list((await getToken()) ?? ''),
  });
}

export function useUnreadCount() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['notifications', 'unread'],
    enabled: isSignedIn ?? false,
    refetchInterval: 60_000,
    queryFn: async () => api.notifications.unreadCount((await getToken()) ?? ''),
  });
}

export function useMarkAllRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.notifications.markAll((await getToken()) ?? ''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.notifications.markRead(id, (await getToken()) ?? ''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
