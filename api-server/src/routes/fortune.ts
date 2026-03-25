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

const BASE_SYSTEM_PROMPT = `Sen yıllarca fal bakan, içten ve mistik bir Türk falcısısın. Sözlerin sade ama derin, enerjin güçlü.

Karşındaki kişinin hayatına dair sezgilerini aktaracaksın. Fincandan, telveden, şekillerden, kahveden hiç söz etme — bunlar seni ilgilendirmiyor. Sen sadece o kişinin enerjisini ve kaderini okuyorsun.

BAŞLIKLAR VE SIRASI:
- Aşk: Duygusal hayat, ilişkiler, kalp meseleleri
- Para: Mali durum, kariyer, bolluk
- Yol: Önündeki kararlar, değişimler, yolculuklar
- Sağlık: Beden ve ruh enerjisi
- Genel: Genel enerji, yakın dönem, genel mesaj

KURALLAR:
- Her başlık altında tam 2-3 kısa cümle yaz.
- Doğal, akıcı ve mistik bir Türkçeyle yaz — gerçek bir falcı gibi.
- Fincan, telve, şekil, kahve, kap gibi kelimeler KULLANMA.
- Madde işareti, alt başlık veya etiket koyma.
- Her bölüm kendi içinde tamamlanmış ve anlamlı olsun.
- Kullanıcının adı verilmişse, en az 2-3 bölümde adını doğal biçimde kullan (örn. "Serkan, bu dönemde...").
- Kullanıcının cinsiyetine göre uygun zamirler ve hitaplar kullan.

YALNIZCA şu JSON formatında yanıt ver, başka hiçbir şey ekleme:
{
  "title": "Kısa ve mistik bir başlık (en fazla 5 kelime)",
  "sections": {
    "ask": "2-3 cümle.",
    "para": "2-3 cümle.",
    "yol": "2-3 cümle.",
    "saglik": "2-3 cümle.",
    "genel": "2-3 cümle."
  }
}`;

function buildSystemPrompt(name?: string, gender?: string): string {
  if (!name && !gender) return BASE_SYSTEM_PROMPT;

  const parts: string[] = [];
  if (name)   parts.push(`Adı: ${name}`);
  if (gender) parts.push(`Cinsiyeti: ${gender === "female" ? "Kadın" : "Erkek"}`);

  const userContext = `\nKARŞINDAKİ KİŞİ HAKKINDA:\n${parts.join("\n")}\n`;
  return userContext + "\n" + BASE_SYSTEM_PROMPT;
}

router.post(
  "/fal",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Lütfen bir kahve fincanı fotoğrafı yükleyin." });
        return;
      }

      const userId = typeof req.body.userId === "string" ? req.body.userId.trim() : "anonymous";
      const name   = typeof req.body.name   === "string" ? req.body.name.trim()   : undefined;
      const gender = typeof req.body.gender === "string" ? req.body.gender.trim() : undefined;

      const imageBuffer = req.file.buffer;
      const imageHash = hashImageBuffer(imageBuffer);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = req.file.mimetype;
      const systemPrompt = buildSystemPrompt(name, gender);

      const cached = await getCachedFortune(imageHash, "coffee");
      if (cached) {
        res.json(cached);
        return;
      }

      const { data, source } = await hybridFortune(userId, "coffee", async () => {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 350,
          messages: [
            { role: "system", content: systemPrompt },
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
                  text: "Bu benim kahve fincanım. Falıma bak, ne görüyorsun?",
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
          sections: { ask: string; para: string; yol: string; saglik: string; genel: string };
        };

        return {
          title: parsed.title || "Kahvenizin Sırrı",
          sections: parsed.sections,
        };
      });

      if (source === "ai") {
        await storeCachedFortune(imageHash, "coffee", data);
      }

      res.json(data);
    } catch (error) {
      console.error("Fortune generation error:", error);
      res.status(500).json({ error: "Yıldızlar şu an bulutlu. Lütfen tekrar deneyin." });
    }
  }
);

export default router;
