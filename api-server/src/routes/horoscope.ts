import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { hybridFortune } from "../lib/fortune-hybrid";

const router: IRouter = Router();

const VALID_SIGNS = new Set([
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık",
]);

router.post("/horoscope", async (req: Request, res: Response) => {
  try {
    const sign = typeof req.body.sign === "string" ? req.body.sign.trim() : "";
    const userId = typeof req.body.userId === "string" ? req.body.userId.trim() : "anonymous";

    if (!sign || !VALID_SIGNS.has(sign)) {
      res.status(400).json({ error: "Geçerli bir burç seçin." });
      return;
    }

    const { data } = await hybridFortune(userId, "horoscope", async () => {
      const userPrompt =
        `Write today's horoscope in Turkish for the zodiac sign: ${sign}.\n\n` +
        `Include sections: love, money, energy, advice.\n` +
        `Keep it mystical and engaging but concise.\n\n` +
        `Reply ONLY in this exact JSON format, nothing else:\n` +
        `{\n` +
        `  "love": "...",\n` +
        `  "money": "...",\n` +
        `  "energy": "...",\n` +
        `  "advice": "..."\n` +
        `}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 250,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) throw new Error("empty_response");

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const sections = JSON.parse(jsonMatch ? jsonMatch[0] : content) as {
        love: string; money: string; energy: string; advice: string;
      };

      return { sign, sections };
    }, sign);

    res.json(data);
  } catch (error) {
    console.error("Horoscope error:", error);
    res.status(500).json({ error: "Yıldızlar şu an konuşmuyor. Lütfen tekrar deneyin." });
  }
});

export default router;
