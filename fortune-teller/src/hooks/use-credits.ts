import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "falcizade_daily_credits";
const DAILY_ALLOWANCE = 1;
const MAX_AD_REWARDS_PER_DAY = 8;
const MAX_SHARE_REWARDS_PER_DAY = 2;

interface StoredCredits {
  credits: number;
  date: string; // "YYYY-MM-DD"
  adRewardsToday: number;
  shareRewardsToday: number;
}

function todayString(): string {
  return new Date().toLocaleDateString("sv-SE"); // always "YYYY-MM-DD"
}

function freshDay(): StoredCredits {
  return { credits: DAILY_ALLOWANCE, date: todayString(), adRewardsToday: 0, shareRewardsToday: 0 };
}

function readState(): StoredCredits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDay();

    const parsed = JSON.parse(raw) as Partial<StoredCredits>;

    // If the stored date is not today, reset all counters
    if (parsed.date !== todayString()) return freshDay();

    return {
      credits: typeof parsed.credits === "number" && parsed.credits >= 0 ? parsed.credits : 0,
      date: parsed.date,
      adRewardsToday: typeof parsed.adRewardsToday === "number" ? parsed.adRewardsToday : 0,
      shareRewardsToday: typeof parsed.shareRewardsToday === "number" ? parsed.shareRewardsToday : 0,
    };
  } catch {
    return freshDay();
  }
}

function writeState(state: StoredCredits): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useCredits() {
  const [state, setState] = useState<StoredCredits>(() => readState());

  // Persist on every change
  useEffect(() => {
    writeState(state);
  }, [state]);

  // Re-check daily reset if the app stays open across midnight
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const today = todayString();
        if (prev.date !== today) return freshDay();
        return prev;
      });
    }, 60_000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const spendCredit = useCallback(() => {
    setState((prev) => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
  }, []);

  /** Unchecked add — only use for premium bypass or internal logic. */
  const addCredit = useCallback(() => {
    setState((prev) => ({ ...prev, credits: prev.credits + 1 }));
  }, []);

  /**
   * Earn +1 credit from a rewarded ad.
   * Silently does nothing (and does NOT add a credit) if the daily limit is reached.
   */
  const addCreditFromAd = useCallback(() => {
    setState((prev) => {
      if (prev.adRewardsToday >= MAX_AD_REWARDS_PER_DAY) return prev;
      return { ...prev, credits: prev.credits + 1, adRewardsToday: prev.adRewardsToday + 1 };
    });
  }, []);

  /**
   * Earn +1 credit from a share action.
   * Silently does nothing (and does NOT add a credit) if the daily limit is reached.
   */
  const addCreditFromShare = useCallback(() => {
    setState((prev) => {
      if (prev.shareRewardsToday >= MAX_SHARE_REWARDS_PER_DAY) return prev;
      return { ...prev, credits: prev.credits + 1, shareRewardsToday: prev.shareRewardsToday + 1 };
    });
  }, []);

  return {
    credits: state.credits,
    adRewardsToday: state.adRewardsToday,
    shareRewardsToday: state.shareRewardsToday,
    adRewardLimitReached: state.adRewardsToday >= MAX_AD_REWARDS_PER_DAY,
    shareRewardLimitReached: state.shareRewardsToday >= MAX_SHARE_REWARDS_PER_DAY,
    spendCredit,
    addCredit,
    addCreditFromAd,
    addCreditFromShare,
  };
}
