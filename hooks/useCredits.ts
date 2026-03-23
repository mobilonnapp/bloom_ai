import { useState, useEffect, useCallback } from 'react';
import { UserCredits } from '../types';
import { getCredits, setCredits, deductCredits, addCredits } from '../services/storage';
import { initRevenueCat, checkProStatus } from '../services/revenuecat';
import { SUBSCRIPTION_PLANS } from '../constants/templates';

const PRO_CREDITS = SUBSCRIPTION_PLANS[0]?.credits ?? 3000;

export function useCredits() {
  const [credits, setCreditsState] = useState<UserCredits>({ balance: 0, plan: 'free' });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getCredits();

    // Ensure RC is initialized before checking status
    await initRevenueCat();
    const isPro = await checkProStatus();

    if (isPro && data.plan !== 'pro') {
      // Active subscription but local state is free — restore pro
      const proCredits: UserCredits = { balance: PRO_CREDITS, plan: 'pro' };
      await setCredits(proCredits);
      setCreditsState(proCredits);
    } else if (!isPro && data.plan === 'pro') {
      // Subscription expired — downgrade to free
      const freeCredits: UserCredits = { balance: 0, plan: 'free' };
      await setCredits(freeCredits);
      setCreditsState(freeCredits);
    } else {
      setCreditsState(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const spend = useCallback(
    async (amount: number): Promise<boolean> => {
      const ok = await deductCredits(amount);
      if (ok) {
        setCreditsState((prev) => ({ ...prev, balance: prev.balance - amount }));
      }
      return ok;
    },
    []
  );

  const earn = useCallback(async (amount: number) => {
    await addCredits(amount);
    setCreditsState((prev) => ({ ...prev, balance: prev.balance + amount }));
  }, []);

  const upgrade = useCallback(async (creditsToAdd: number) => {
    const newCredits: UserCredits = { balance: creditsToAdd, plan: 'pro' };
    await setCredits(newCredits);
    setCreditsState(newCredits);
  }, []);

  return { credits, loading, refresh, spend, earn, upgrade };
}
