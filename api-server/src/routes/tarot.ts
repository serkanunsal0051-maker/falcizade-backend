import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "../lib/integrations-openai";
import { hybridFortune } from "../lib/fortune-hybrid";

const router: IRouter = Router();

const TAROT_DECK = [
  "Deli (The Fool)",
  "Büyücü (The Magician)",
  "Yüksek Rahibe (The High Priestess)",
  "İmparatoriçe (The Empress)",
  "İmparator (The Emperor)",
  "Dini Önder (The Hierophant)",
  "Aşıklar (The Lovers)",
  "Savaş Arabası (The Chariot)",
  "Güç (Strength)",
  "Münzevi (The Hermit)",
  "Kader Çarkı (Wheel of Fortune)",
  "Adalet (Justice)",
  "Asılan Adam (The Hanged Man)",
  "Ölüm (Death)",
  "Denge (Temperance)",
  "Şeytan (The Devil)",
  "Kule (The Tower)",
  "Yıldız (The Star)",
  "Ay (The Moon)",
  "Güneş (The Sun)",
  "Yargı (Judgement)",
  "Dünya (The World)",
];

function pickThreeCards(): [string, string, string] {
  const deck = [...TAROT_DECK];
  const picked: string[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * deck.length);
    picked.push(deck[idx]);
    deck.splice(idx, 1);
  }
  return picked as [string, string, string];
}

router.post("/tarot", async (req: Request, res: Response) => {
  try {
    const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "anonymous";

    const { data } = await hybridFortune(userId, "tarot", async () => {
      const [card1, card2, card3] = pickThreeCards();

      const userPrompt =
        `You are a mystical tarot reader. Interpret the following tarot cards in Turkish.\n\n` +
        `Past card: ${card1}\n` +
        `Present card: ${card2}\n` +
        `Future card: ${card3}\n\n` +
        `Write a mystical but concise interpretation in Turkish.\n` +
        `Include insights about love, money and personal destiny.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 350,
        messages: [{ role: "user", content: userPrompt }],
      });

      const interpretation =
        response.choices[0]?.message?.content?.trim() ||
        "Kartlar şu an sessiz. Lütfen tekrar deneyin.";

      return {
        cards: [
          { name: card1, position: "past",    positionLabel: "Geçmiş"  },
          { name: card2, position: "present", positionLabel: "Şimdi"   },
          { name: card3, position: "future",  positionLabel: "Gelecek" },
        ],
        interpretation,
      };
    });

    res.json(data);
  } catch (error) {
    console.error("Tarot reading error:", error);
    res.status(500).json({ error: "Kartlar şu an konuşmuyor. Lütfen tekrar deneyin." });
  }
});

export default router;
