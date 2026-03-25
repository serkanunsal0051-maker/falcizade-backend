import { db } from "@workspace/db";
import { fortunePool, fortuneUserRequests, fortuneUserSeen } from "@workspace/db";
import { and, eq, isNull, sql } from "drizzle-orm";

export type FortuneType = "coffee" | "tarot" | "palm" | "horoscope";

async function incrementAndGetCount(
  userId: string,
  fortuneType: FortuneType,
): Promise<number> {
  const result = await db
    .insert(fortuneUserRequests)
    .values({ userId, fortuneType, requestCount: 1 })
    .onConflictDoUpdate({
      target: [fortuneUserRequests.userId, fortuneUserRequests.fortuneType],
      set: { requestCount: sql`${fortuneUserRequests.requestCount} + 1` },
    })
    .returning({ requestCount: fortuneUserRequests.requestCount });
  return result[0].requestCount;
}

function shouldServeStored(count: number): boolean {
  return count % 3 === 0;
}

async function getUnseenPoolFortune(
  userId: string,
  fortuneType: FortuneType,
  subtype?: string,
): Promise<Record<string, unknown> | null> {
  const rows = await db
    .select({ content: fortunePool.content, id: fortunePool.id })
    .from(fortunePool)
    .leftJoin(
      fortuneUserSeen,
      and(
        eq(fortuneUserSeen.fortunePoolId, fortunePool.id),
        eq(fortuneUserSeen.userId, userId),
      ),
    )
    .where(
      and(
        eq(fortunePool.fortuneType, fortuneType),
        subtype != null
          ? eq(fortunePool.subtype, subtype)
          : isNull(fortunePool.subtype),
        isNull(fortuneUserSeen.userId),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (rows.length === 0) return null;

  await db
    .insert(fortuneUserSeen)
    .values({ userId, fortunePoolId: rows[0].id })
    .onConflictDoNothing();

  return rows[0].content;
}

async function saveToPool(
  fortuneType: FortuneType,
  content: Record<string, unknown>,
  subtype?: string,
): Promise<void> {
  await db
    .insert(fortunePool)
    .values({ fortuneType, content, subtype: subtype ?? null });
}

export interface HybridResult {
  data: Record<string, unknown>;
  source: "ai" | "stored";
}

export async function hybridFortune(
  userId: string,
  fortuneType: FortuneType,
  generateWithAI: () => Promise<Record<string, unknown>>,
  subtype?: string,
): Promise<HybridResult> {
  const count = await incrementAndGetCount(userId, fortuneType);

  if (shouldServeStored(count)) {
    const stored = await getUnseenPoolFortune(userId, fortuneType, subtype);
    if (stored) {
      return { data: stored, source: "stored" };
    }
  }

  const data = await generateWithAI();
  await saveToPool(fortuneType, data, subtype);
  return { data, source: "ai" };
}
