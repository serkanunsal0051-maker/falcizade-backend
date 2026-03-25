import { jsonb, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const imageFortunes = pgTable(
  "image_fortunes",
  {
    id: serial("id").primaryKey(),
    imageHash: text("image_hash").notNull(),
    fortuneType: text("fortune_type").notNull(),
    fortuneText: jsonb("fortune_text").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("image_fortunes_hash_type_uniq").on(t.imageHash, t.fortuneType),
  ],
);

export type ImageFortune = typeof imageFortunes.$inferSelect;
export type InsertImageFortune = typeof imageFortunes.$inferInsert;
