'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';

export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: () => api.billing.plans() });
}

export function useSubscription() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => api.billing.subscription((await getToken()) ?? ''),
  });
}

/** Start checkout: redirect to Stripe when a URL is returned, else upgrade in place. */
export function useCheckout() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: string) => api.billing.checkout(plan, (await getToken()) ?? ''),
    onSuccess: (result) => {
      if (result.data.url) {
        window.location.href = result.data.url;
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
