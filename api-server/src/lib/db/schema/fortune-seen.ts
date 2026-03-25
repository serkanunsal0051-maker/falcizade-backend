import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { fortunePool } from "./fortune-pool";

export const fortuneUserSeen = pgTable(
  "fortune_user_seen",
  {
    userId: text("user_id").notNull(),
    fortunePoolId: integer("fortune_pool_id")
      .notNull()
      .references(() => fortunePool.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.fortunePoolId] }),
  ],
);
