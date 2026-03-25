import React, { createContext, useContext } from "react";
import { useCredits } from "@/hooks/use-credits";

interface CreditsCtx {
  credits: number;
  adRewardsToday: number;
  shareRewardsToday: number;
  adRewardLimitReached: boolean;
  shareRewardLimitReached: boolean;
  spendCredit: () => void;
  addCredit: () => void;
  addCreditFromAd: () => void;
  addCreditFromShare: () => void;
}

const CreditsContext = createContext<CreditsCtx | null>(null);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const value = useCredits();
  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useSharedCredits(): CreditsCtx {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useSharedCredits must be used inside CreditsProvider");
  return ctx;
}
