import { useMutation } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/lib/user-id";

export interface PalmSections {
  genel: string;
  ask: string;
  kariyer: string;
  gelecek: string;
}

export interface PalmResponse {
  title: string;
  sections: PalmSections;
}

export interface PalmRequest {
  image: File;
}

export function usePalm() {
  return useMutation({
    mutationFn: async ({ image }: PalmRequest): Promise<PalmResponse> => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("userId", getOrCreateUserId());

      const res = await fetch("/api/palm", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "El çizgileri şu an okunamıyor. Lütfen tekrar deneyin.";
        try {
          const errorData = await res.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {
          // use default message
        }
        throw new Error(errorMessage);
      }

      return res.json() as Promise<PalmResponse>;
    },
  });
}
