import { integer, pgTable, serial, text, unique } from "drizzle-orm/pg-core";

export const fortuneUserRequests = pgTable(
  "fortune_user_requests",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    fortuneType: text("fortune_type").notNull(),
    requestCount: integer("request_count").notNull().default(0),
  },
  (t) => [
    unique("fortune_user_requests_uniq").on(t.userId, t.fortuneType),
  ],
);

export type FortuneUserRequest = typeof fortuneUserRequests.$inferSelect;
