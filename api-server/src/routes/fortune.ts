import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { openai } from "../lib/integrations-openai";
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
    console.log("=== /api/fal REQUEST RECEIVED ===");
    console.log("REQUEST BODY:", {
      userId: req.body.userId,
      name: req.body.name,
      gender: req.body.gender,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      fileMimeType: req.file?.mimetype,
    });

    try {
      // Validation
      if (!req.file) {
        console.error("❌ No image file provided");
        return res.status(400).json({ 
          error: "Lütfen bir kahve fincanı fotoğrafı yükleyin.",
          success: false
        });
      }

      // Extract parameters
      const userId = typeof req.body.userId === "string" ? req.body.userId.trim() : "anonymous";
      const name   = typeof req.body.name   === "string" ? req.body.name.trim()   : undefined;
      const gender = typeof req.body.gender === "string" ? req.body.gender.trim() : undefined;

      console.log("Parsed parameters:", { userId, name, gender });

      // Prepare image data
      const imageBuffer = req.file.buffer;
      const imageHash = hashImageBuffer(imageBuffer);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = req.file.mimetype;
      const systemPrompt = buildSystemPrompt(name, gender);

      console.log("Image hash:", imageHash);

      // Check cache
      console.log("Checking cache for image hash:", imageHash);
      try {
        const cached = await getCachedFortune(imageHash, "coffee");
        if (cached) {
          console.log("✅ Found cached fortune, returning...");
          return res.json({
            success: true,
            source: "cache",
            ...cached
          });
        }
        console.log("No cached fortune found, generating with AI...");
      } catch (cacheError) {
        console.warn("Cache check failed:", cacheError);
        // Continue with AI generation
      }

      // Generate fortune using hybrid system
      console.log("Starting hybridFortune...");
      const { data, source } = await hybridFortune(userId, "coffee", async () => {
        console.log("🔄 Generating fortune with AI...");
        
        // Verify API key
        const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("OpenAI API key missing (set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY)");
        }
        console.log("✅ OpenAI API key found");

        console.log("Sending request to OpenAI...");
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

        console.log("✅ OpenAI response received");
        console.log("OpenAI response:", {
          finishReason: response.choices[0]?.finish_reason,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("OpenAI returned empty content");
        }

        console.log("Raw content length:", content.length);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        
        console.log("Attempting to parse JSON...");
        const parsed = JSON.parse(jsonString) as {
          title: string;
          sections: { ask: string; para: string; yol: string; saglik: string; genel: string };
        };

        console.log("✅ JSON parsed successfully");
        console.log("Parsed fortune:", {
          title: parsed.title,
          sectionsCount: Object.keys(parsed.sections || {}).length,
        });

        return {
          title: parsed.title || "Kahvenizin Sırrı",
          sections: parsed.sections,
        };
      });

      console.log("Fortune generated, source:", source);

      // Store in cache if from AI
      if (source === "ai") {
        try {
          console.log("Storing fortune in cache...");
          await storeCachedFortune(imageHash, "coffee", data);
          console.log("✅ Fortune cached successfully");
        } catch (storeError) {
          console.warn("Failed to store fortune in cache:", storeError);
          // Don't fail the response, caching is optional
        }
      }

      console.log("✅ /api/fal SUCCESS - Returning fortune");
      return res.json({
        success: true,
        source,
        ...data
      });

    } catch (error: any) {
      console.error("❌ /api/fal FAILED");
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      if (error?.response) {
        console.error("OpenAI response status:", error.response.status);
        console.error("OpenAI response data:", error.response.data);
      }

      const errorMessage = error?.message || "Yıldızlar şu an bulutlu. Lütfen tekrar deneyin.";
      const errorCode = error?.__typename === "APIError" ? (error as any).status : 500;

      return res.status(errorCode || 500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? {
          type: error?.constructor?.name,
          stack: error?.stack,
        } : undefined
      });
    }
  }
);

export default router;
