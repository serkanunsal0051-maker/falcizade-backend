import { useMutation } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/lib/user-id";

export interface TarotCard {
  name: string;
  position: "past" | "present" | "future";
  positionLabel: string;
}

export interface TarotResponse {
  cards: TarotCard[];
  interpretation: string;
}

export function useTarot() {
  return useMutation({
    mutationFn: async (): Promise<TarotResponse> => {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getOrCreateUserId() }),
      });

      if (!res.ok) {
        let message = "Kartlar şu an konuşmuyor. Lütfen tekrar deneyin.";
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch { /* use default */ }
        throw new Error(message);
      }

      return res.json() as Promise<TarotResponse>;
    },
  });
}
