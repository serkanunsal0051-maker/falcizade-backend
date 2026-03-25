import { useMutation } from "@tanstack/react-query";
import type { Gender } from "@/hooks/use-profile";
import { getOrCreateUserId } from "@/lib/user-id";

export interface FortuneSections {
  genel: string;
  ask: string;
  para: string;
  yol: string;
  saglik: string;
}

export interface FortuneResponse {
  title: string;
  sections: FortuneSections;
}

export interface FortuneRequest {
  image: File;
  name?: string;
  gender?: Gender;
}

export function useFortune() {
  return useMutation({
    mutationFn: async ({ image, name, gender }: FortuneRequest) => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("userId", getOrCreateUserId());
      if (name)   formData.append("name",   name);
      if (gender) formData.append("gender", gender);

      const res = await fetch("/api/fal", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Fincanınızdaki sırlar şu an okunamıyor. Lütfen tekrar deneyin.";
        try {
          const errorData = await res.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {
          // use default message
        }
        throw new Error(errorMessage);
      }

      return res.json() as Promise<FortuneResponse>;
    },
  });
}
