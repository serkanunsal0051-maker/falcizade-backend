import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { openai } from "@workspace/integrations-openai-ai-server";
import { hybridFortune } from "../lib/fortune-hybrid";
import { hashImageBuffer, getCachedFortune, storeCachedFortune } from "../lib/image-cache";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const SYSTEM_PROMPT = `Sen deneyimli bir el falı ustasısın. Mistikal ve derin bir Türkçeyle el çizgilerini yorumlarsın.

GÖREVIN:
Yüklenen el fotoğrafını analiz et ve yaşam çizgisi, kalp çizgisi, kafa çizgisi ve kader çizgisini oku.
Kişinin karakterini, kaderini, aşk hayatını ve gelecek olasılıklarını mistik bir dille anlat.

BAŞLIKLAR VE SIRASI:
- Genel: Genel karakter, enerji ve kader okuması
- Aşk: Kalp çizgisinden okunan duygusal hayat ve ilişkiler
- Kariyer: Kafa ve kader çizgisinden okunan iş hayatı ve başarı
- Gelecek: Yaşam çizgisinden okunan ilerleyen dönem ve olasılıklar

KURALLAR:
- Her başlık altında tam 2-3 kısa cümle yaz.
- Doğal, akıcı ve mistik bir Türkçeyle yaz — gerçek bir el falcısı gibi.
- Madde işareti, alt başlık veya etiket koyma.
- Her bölüm kendi içinde tamamlanmış ve anlamlı olsun.

YALNIZCA şu JSON formatında yanıt ver, başka hiçbir şey ekleme:
{
  "title": "Kısa ve mistik bir başlık (en fazla 5 kelime)",
  "sections": {
    "genel": "2-3 cümle.",
    "ask": "2-3 cümle.",
    "kariyer": "2-3 cümle.",
    "gelecek": "2-3 cümle."
  }
}`;

router.post(
  "/palm",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Lütfen bir el fotoğrafı yükleyin." });
        return;
      }

      const userId = typeof req.body.userId === "string" ? req.body.userId.trim() : "anonymous";
      const imageBuffer = req.file.buffer;
      const imageHash = hashImageBuffer(imageBuffer);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = req.file.mimetype;

      const cached = await getCachedFortune(imageHash, "palm");
      if (cached) {
        res.json(cached);
        return;
      }

      const { data, source } = await hybridFortune(userId, "palm", async () => {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 350,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                    detail: "high",
                  },
                },
                {
                  type: "text",
                  text: "Bu benim elim. El çizgilerimi oku, ne görüyorsun?",
                },
              ],
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("empty_response");

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content) as {
          title: string;
          sections: { genel: string; ask: string; kariyer: string; gelecek: string };
        };

        return {
          title: parsed.title || "Elin Sırları",
          sections: parsed.sections,
        };
      });

      if (source === "ai") {
        await storeCachedFortune(imageHash, "palm", data);
      }

      res.json(data);
    } catch (error) {
      console.error("Palm reading error:", error);
      res.status(500).json({ error: "Çizgiler şu an konuşmuyor. Lütfen tekrar deneyin." });
    }
  }
);

export default router;
