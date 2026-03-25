import { useMutation } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/lib/user-id";

export interface HoroscopeSections {
  love: string;
  money: string;
  energy: string;
  advice: string;
}

export interface HoroscopeResponse {
  sign: string;
  sections: HoroscopeSections;
}

export function useHoroscope() {
  return useMutation({
    mutationFn: async (sign: string): Promise<HoroscopeResponse> => {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sign, userId: getOrCreateUserId() }),
      });

      if (!res.ok) {
        let message = "Yıldızlar şu an konuşmuyor. Lütfen tekrar deneyin.";
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch { /* use default */ }
        throw new Error(message);
      }

      return res.json() as Promise<HoroscopeResponse>;
    },
  });
}
