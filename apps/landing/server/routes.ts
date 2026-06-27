import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { appendWaitlist, appendResearch } from "./sheets";
import { insertWaitlistSchema, insertResearchSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Waitlist ──────────────────────────────────────────────────────────────
  app.post("/api/waitlist", async (req, res) => {
    const parsed = insertWaitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    }
    try {
      const row = await storage.addWaitlist(parsed.data);
      const count = await storage.getWaitlistCount();
      // Fire-and-forget Sheets write
      appendWaitlist(parsed.data).catch(e => console.error("[waitlist sheets]", e));
      res.json({ success: true, id: row.id, count });
    } catch (err: any) {
      console.error("[waitlist]", err);
      res.status(500).json({ error: "Submission failed. Please try again." });
    }
  });

  // ── Floor Research ────────────────────────────────────────────────────────
  app.post("/api/research", async (req, res) => {
    const parsed = insertResearchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    }
    try {
      const row = await storage.addResearch(parsed.data);
      // Fire-and-forget Sheets write
      appendResearch(parsed.data).catch(e => console.error("[research sheets]", e));
      res.json({ success: true, id: row.id });
    } catch (err: any) {
      console.error("[research]", err);
      res.status(500).json({ error: "Submission failed. Please try again." });
    }
  });

  // ── Count ─────────────────────────────────────────────────────────────────
  app.get("/api/waitlist/count", async (_req, res) => {
    try {
      const count = await storage.getWaitlistCount();
      res.json({ count });
    } catch {
      res.json({ count: 0 });
    }
  });

  return httpServer;
}
