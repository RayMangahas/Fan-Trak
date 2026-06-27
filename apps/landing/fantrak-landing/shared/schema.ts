import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Waitlist submissions
export const waitlistSubmissions = sqliteTable("waitlist_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  creatorType: text("creator_type"),
  primaryPlatform: text("primary_platform"),
  source: text("source").default("landing_page"),
});

export const insertWaitlistSchema = createInsertSchema(waitlistSubmissions).omit({ id: true });
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistSubmission = typeof waitlistSubmissions.$inferSelect;

// Floor research responses
export const researchResponses = sqliteTable("research_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platforms: text("platforms"),
  hoursPerDay: text("hours_per_day"),
  biggestPain: text("biggest_pain"),
  chargeback: text("chargeback"),
  attribution: text("attribution"),
  consolidationValue: integer("consolidation_value"),
  openResponse: text("open_response"),
});

export const insertResearchSchema = createInsertSchema(researchResponses).omit({ id: true });
export type InsertResearch = z.infer<typeof insertResearchSchema>;
export type ResearchResponse = typeof researchResponses.$inferSelect;
