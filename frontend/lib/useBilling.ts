import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

export interface BillingStatus {
  plan: 'free' | 'premium';
  status: string;
  current_period_end: string | null;
  interviews_used: number;
  interviews_limit: number | null;
}

export function useBilling() {
  const { getToken } = useAuth();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBilling = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.getBillingStatus(token);
      setBilling(data);
    } catch (err) {
      console.error('Failed to fetch billing status:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const isPremium = billing?.plan === 'premium' && billing?.status === 'active';
  const interviewsRemaining = billing?.interviews_limit != null
    ? Math.max(0, billing.interviews_limit - billing.interviews_used)
    : null;

  const upgrade = async (priceId: 'monthly' | 'annual' = 'monthly') => {
    const token = await getToken();
    if (!token) return;
    const { url } = await api.createCheckoutSession(priceId, token);
    window.location.href = url;
  };

  const manageSubscription = async () => {
    const token = await getToken();
    if (!token) return;
    const { url } = await api.createPortalSession(token);
    window.location.href = url;
  };

  return { billing, loading, isPremium, interviewsRemaining, upgrade, manageSubscription, refetch: fetchBilling };
}
