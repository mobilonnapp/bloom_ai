import { useState, useEffect, useCallback } from 'react';
import { UserCredits } from '../types';
import { getCredits, setCredits, deductCredits, addCredits } from '../services/storage';

export function useCredits() {
  const [credits, setCreditsState] = useState<UserCredits>({ balance: 0, plan: 'free' });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getCredits();
    setCreditsState(data);
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
