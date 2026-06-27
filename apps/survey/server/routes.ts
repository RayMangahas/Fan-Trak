import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { appendSurveyResponse } from "./sheets";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/survey", async (req, res) => {
    const parsed = insertSurveyResponseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    }
    try {
      const result = await storage.submitResponse(parsed.data);
      // Await Sheets write and surface any error in the response
      try {
        await appendSurveyResponse(parsed.data);
        console.log("[survey sheets] ✓ row appended successfully");
      } catch (sheetsErr: any) {
        console.error("[survey sheets] ERROR:", sheetsErr?.message || sheetsErr);
      }
      res.json({ success: true, id: result.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save response" });
    }
  });

  app.get("/api/survey/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Sheets connectivity test endpoint
  app.get("/api/survey/test-sheets", async (_req, res) => {
    try {
      await appendSurveyResponse({
        fullName: "TEST Railway Sheets",
        personalEmail: "test@railway.test",
        email: "test@railway.test",
        creatorTypeSelf: "Full-Time Creator",
        hasManager: 0,
        wouldJoinBeta: 1,
      } as any);
      res.json({ success: true, message: "Row appended to Creator Survey sheet" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  return httpServer;
}
