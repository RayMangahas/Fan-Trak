import { z } from "zod";

// ── Waitlist ──────────────────────────────────────────────────────────────────
export const insertWaitlistSchema = z.object({
  name: z.string().min(1),
  stageName: z.string().optional().nullable(),
  email: z.string().email(),
  creatorType: z.string().optional().nullable(),
  hasManager: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyEmail: z.string().optional().nullable(),
  primaryPlatform: z.string().optional().nullable(),
  source: z.string().optional().nullable().default("landing_page"),
  additionalInfo: z.string().optional().nullable(),
});
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;

// ── Floor Research ────────────────────────────────────────────────────────────
export const insertResearchSchema = z.object({
  fullName: z.string().optional().nullable(),
  stageName: z.string().optional().nullable(),
  researchEmail: z.string().optional().nullable(),
  creatorType: z.string().optional().nullable(),
  hasManager: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyEmail: z.string().optional().nullable(),
  platforms: z.string().optional().nullable(),
  hoursPerDay: z.string().optional().nullable(),
  biggestPain: z.string().optional().nullable(),
  chargeback: z.string().optional().nullable(),
  attribution: z.string().optional().nullable(),
  consolidationValue: z.number().optional().nullable(),
  openResponse: z.string().optional().nullable(),
});
export type InsertResearch = z.infer<typeof insertResearchSchema>;
