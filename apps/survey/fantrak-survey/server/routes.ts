import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSurveyResponseSchema } from "@shared/schema";
import { appendSurveyResponse } from "./sheets";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/survey", (req, res) => {
    try {
      const parsed = insertSurveyResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      }
      const result = storage.submitResponse(parsed.data);

      // Async — fire and forget; never block the response
      setImmediate(() => appendSurveyResponse(parsed.data));

      res.json({ success: true, id: result.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save response" });
    }
  });

  app.get("/api/survey/stats", (_req, res) => {
    try {
      const stats = storage.getStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
