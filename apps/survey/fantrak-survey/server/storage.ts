import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { surveyResponses, type InsertSurveyResponse, type SurveyResponse } from "@shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite, { schema });

// Auto-migrate
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_type TEXT NOT NULL,
    current_platforms TEXT NOT NULL,
    rating_payouts INTEGER,
    rating_analytics INTEGER,
    rating_fan_management INTEGER,
    rating_scheduling INTEGER,
    rating_messaging INTEGER,
    rating_payment_processing INTEGER,
    rating_onboarding INTEGER,
    rating_mobile_app INTEGER,
    comment_payouts TEXT,
    comment_analytics TEXT,
    comment_fan_management TEXT,
    comment_scheduling TEXT,
    comment_messaging TEXT,
    comment_payment_processing TEXT,
    comment_onboarding TEXT,
    comment_mobile_app TEXT,
    overall_score INTEGER,
    biggest_pain_point TEXT,
    most_wanted_feature TEXT,
    additional_comments TEXT,
    would_join_beta INTEGER,
    email TEXT
  )
`);

export interface IStorage {
  submitResponse(data: InsertSurveyResponse): SurveyResponse;
  getAllResponses(): SurveyResponse[];
  getStats(): {
    total: number;
    avgRatings: Record<string, number>;
    wouldJoinBetaCount: number;
    creatorTypeBreakdown: Record<string, number>;
  };
}

export class Storage implements IStorage {
  submitResponse(data: InsertSurveyResponse): SurveyResponse {
    return db.insert(surveyResponses).values(data).returning().get();
  }

  getAllResponses(): SurveyResponse[] {
    return db.select().from(surveyResponses).all();
  }

  getStats() {
    const all = db.select().from(surveyResponses).all();
    const total = all.length;

    const ratingFields = [
      "ratingPayouts", "ratingAnalytics", "ratingFanManagement",
      "ratingScheduling", "ratingMessaging", "ratingPaymentProcessing",
      "ratingOnboarding", "ratingMobileApp"
    ] as const;

    const avgRatings: Record<string, number> = {};
    for (const field of ratingFields) {
      const vals = all.map(r => r[field]).filter((v): v is number => v !== null && v !== undefined);
      avgRatings[field] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
    }

    const wouldJoinBetaCount = all.filter(r => r.wouldJoinBeta === 1).length;

    const creatorTypeBreakdown: Record<string, number> = {};
    for (const r of all) {
      creatorTypeBreakdown[r.creatorType] = (creatorTypeBreakdown[r.creatorType] || 0) + 1;
    }

    return { total, avgRatings, wouldJoinBetaCount, creatorTypeBreakdown };
  }
}

export const storage = new Storage();
