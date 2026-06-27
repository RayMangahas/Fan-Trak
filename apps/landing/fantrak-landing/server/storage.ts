import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS waitlist_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    creator_type TEXT,
    primary_platform TEXT,
    source TEXT DEFAULT 'landing_page'
  );
  CREATE TABLE IF NOT EXISTS research_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platforms TEXT,
    hours_per_day TEXT,
    biggest_pain TEXT,
    chargeback TEXT,
    attribution TEXT,
    consolidation_value INTEGER,
    open_response TEXT
  );
`);

export class Storage {
  addWaitlist(data: schema.InsertWaitlist): schema.WaitlistSubmission {
    return db.insert(schema.waitlistSubmissions).values(data).returning().get()!;
  }

  addResearch(data: schema.InsertResearch): schema.ResearchResponse {
    return db.insert(schema.researchResponses).values(data).returning().get()!;
  }

  getWaitlistCount(): number {
    const result = sqlite.prepare("SELECT COUNT(*) as count FROM waitlist_submissions").get() as { count: number };
    return result.count;
  }
}

export const storage = new Storage();
