import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { appendWaitlist, appendResearch } from "./sheets";
import { insertWaitlistSchema, insertResearchSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Waitlist ──────────────────────────────────────────────────
  app.post("/api/waitlist", async (req, res) => {
    const parsed = insertWaitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    }
    try {
      // Save locally first (fast)
      const row = storage.addWaitlist(parsed.data);
      const count = storage.getWaitlistCount();

      // Then push to Sheets (async — don't block the response)
      appendWaitlist(parsed.data);

      res.json({ success: true, id: row.id, count });
    } catch (err: any) {
      console.error("[waitlist]", err);
      res.status(500).json({ error: "Submission failed. Please try again." });
    }
  });

  // ── Floor Research ────────────────────────────────────────────
  app.post("/api/research", async (req, res) => {
    const parsed = insertResearchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    }
    try {
      const row = storage.addResearch(parsed.data);
      appendResearch(parsed.data);
      res.json({ success: true, id: row.id });
    } catch (err: any) {
      console.error("[research]", err);
      res.status(500).json({ error: "Submission failed. Please try again." });
    }
  });

  // ── Count (for social proof display) ─────────────────────────
  app.get("/api/waitlist/count", (_req, res) => {
    try {
      res.json({ count: storage.getWaitlistCount() });
    } catch {
      res.json({ count: 0 });
    }
  });

  return httpServer;
}
