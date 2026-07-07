'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

/** The authenticated learner's dashboard aggregates. */
export function useDashboard() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['dashboard'],
    enabled: isSignedIn ?? false,
    queryFn: async () => {
      const token = await getToken();
      return api.stats.dashboard(token ?? '');
    },
  });
}

/** Set the daily word goal (updates the profile) and refresh the dashboard. */
export function useUpdateGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dailyWordGoal: number) => {
      const token = await getToken();
      return api.me.updateProfile({ dailyWordGoal }, token ?? '');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
