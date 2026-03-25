const STORAGE_KEY = "falcizade_premium";

export function usePremium() {
  const isPremium =
    typeof window !== "undefined" &&
    localStorage.getItem(STORAGE_KEY) === "true";

  return { isPremium };
}
