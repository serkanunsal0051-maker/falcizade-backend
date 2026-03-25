import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const fortunePool = pgTable("fortune_pool", {
  id: serial("id").primaryKey(),
  fortuneType: text("fortune_type").notNull(),
  subtype: text("subtype"),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type FortunePoolEntry = typeof fortunePool.$inferSelect;
export type InsertFortunePoolEntry = typeof fortunePool.$inferInsert;
