import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surveyResponses = sqliteTable("survey_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  creatorType: text("creator_type").notNull(),
  currentPlatforms: text("current_platforms").notNull(), // JSON array
  // Feature ratings (1-5)
  ratingPayouts: integer("rating_payouts"),
  ratingAnalytics: integer("rating_analytics"),
  ratingFanManagement: integer("rating_fan_management"),
  ratingScheduling: integer("rating_scheduling"),
  ratingMessaging: integer("rating_messaging"),
  ratingPaymentProcessing: integer("rating_payment_processing"),
  ratingOnboarding: integer("rating_onboarding"),
  ratingMobileApp: integer("rating_mobile_app"),
  // Comments
  commentPayouts: text("comment_payouts"),
  commentAnalytics: text("comment_analytics"),
  commentFanManagement: text("comment_fan_management"),
  commentScheduling: text("comment_scheduling"),
  commentMessaging: text("comment_messaging"),
  commentPaymentProcessing: text("comment_payment_processing"),
  commentOnboarding: text("comment_onboarding"),
  commentMobileApp: text("comment_mobile_app"),
  // Overall
  overallScore: integer("overall_score"),
  biggestPainPoint: text("biggest_pain_point"),
  mostWantedFeature: text("most_wanted_feature"),
  additionalComments: text("additional_comments"),
  wouldJoinBeta: integer("would_join_beta"), // 0 or 1
  email: text("email"),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({ id: true });
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
