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
      // Fire-and-forget Sheets write
      appendSurveyResponse(parsed.data).catch(e => console.error("[survey sheets]", e));
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

  return httpServer;
}
