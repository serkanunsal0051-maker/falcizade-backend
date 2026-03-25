import crypto from "crypto";
import { db, imageFortunes } from "./db";
import { and, eq } from "drizzle-orm";

export type ImageFortuneType = "coffee" | "palm";

export function hashImageBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function getCachedFortune(
  imageHash: string,
  fortuneType: ImageFortuneType,
): Promise<Record<string, unknown> | null> {
  const rows = await db
    .select({ fortuneText: imageFortunes.fortuneText })
    .from(imageFortunes)
    .where(
      and(
        eq(imageFortunes.imageHash, imageHash),
        eq(imageFortunes.fortuneType, fortuneType),
      ),
    )
    .limit(1);

  return rows.length > 0 ? rows[0].fortuneText : null;
}

export async function storeCachedFortune(
  imageHash: string,
  fortuneType: ImageFortuneType,
  fortuneText: Record<string, unknown>,
): Promise<void> {
  await db
    .insert(imageFortunes)
    .values({ imageHash, fortuneType, fortuneText })
    .onConflictDoNothing();
}
