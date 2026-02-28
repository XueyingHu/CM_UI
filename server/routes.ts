import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertDocumentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Sessions
  app.post("/api/sessions", async (req, res) => {
    const parsed = insertSessionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const session = await storage.createSession(parsed.data);
    res.json(session);
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    const session = await storage.updateSession(req.params.id, req.body);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  });

  // Documents
  app.post("/api/sessions/:sessionId/documents", async (req, res) => {
    const data = { ...req.body, sessionId: req.params.sessionId };
    const doc = await storage.addDocument(data);
    res.json(doc);
  });

  app.get("/api/sessions/:sessionId/documents", async (req, res) => {
    const docs = await storage.getDocuments(req.params.sessionId);
    res.json(docs);
  });

  app.delete("/api/documents/:id", async (req, res) => {
    await storage.removeDocument(req.params.id);
    res.json({ success: true });
  });

  // Extraction Results
  app.post("/api/sessions/:sessionId/extractions", async (req, res) => {
    const items = req.body.map((item: any) => ({ ...item, sessionId: req.params.sessionId }));
    const results = await storage.addExtractionResults(items);
    res.json(results);
  });

  app.get("/api/sessions/:sessionId/extractions", async (req, res) => {
    const results = await storage.getExtractionResults(req.params.sessionId);
    res.json(results);
  });

  // Insights
  app.post("/api/sessions/:sessionId/insights", async (req, res) => {
    const items = req.body.map((item: any) => ({ ...item, sessionId: req.params.sessionId }));
    const results = await storage.addInsights(items);
    res.json(results);
  });

  app.get("/api/sessions/:sessionId/insights", async (req, res) => {
    const results = await storage.getInsights(req.params.sessionId);
    res.json(results);
  });

  // Review Items
  app.post("/api/sessions/:sessionId/review-items", async (req, res) => {
    const items = req.body.map((item: any) => ({ ...item, sessionId: req.params.sessionId }));
    const results = await storage.addReviewItems(items);
    res.json(results);
  });

  app.get("/api/sessions/:sessionId/review-items", async (req, res) => {
    const tab = (req.query.tab as string) || "events";
    const phase = (req.query.phase as string) || "review";
    const results = await storage.getReviewItems(req.params.sessionId, tab, phase);
    res.json(results);
  });

  app.patch("/api/review-items/:id", async (req, res) => {
    const { action } = req.body;
    if (!action || !["accepted", "deleted"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    const result = await storage.updateReviewItemAction(req.params.id, action);
    if (!result) return res.status(404).json({ error: "Item not found" });
    res.json(result);
  });

  // Seed review items for a session (called when entering review phase)
  app.post("/api/sessions/:sessionId/seed-review-items", async (req, res) => {
    const sessionId = req.params.sessionId;

    const reviewData = [
      { tab: "events", phase: "review", eventId: "EVENT 104382", title: "Settlement delay spikes linked to downstream queue saturation", rating: "Major", status: "Open", opened: "07/12/2024", owner: "C. Patel" },
      { tab: "events", phase: "review", eventId: "EVENT 109771", title: "Vendor patch backlog impacting trade capture validation", rating: "Open", status: "Open", opened: "05/15/2024", owner: "J. Morrison" },
      { tab: "events", phase: "review", eventId: "EVENT 113205", title: "Reconciliation breaks after reference data change deployment", rating: "Closed", status: "Closed", opened: "03/24/2024", owner: "T. Hamilton" },
      { tab: "issues", phase: "review", eventId: "ISSUE 402911", title: "Missing authorization in manual override process", rating: "High", status: "Open", opened: "08/01/2024", owner: "A. Smith" },
      { tab: "issues", phase: "review", eventId: "ISSUE 405822", title: "Incomplete training records for new AML tool", rating: "Medium", status: "Open", opened: "06/22/2024", owner: "M. Lee" },
      { tab: "changes", phase: "review", eventId: "CHG 89012", title: "Core banking platform v2.4 upgrade", rating: "Critical", status: "Scheduled", opened: "09/15/2024", owner: "IT Ops" },
      { tab: "changes", phase: "review", eventId: "CHG 89105", title: "Firewall ruleset update for APAC region", rating: "Low", status: "Completed", opened: "09/01/2024", owner: "Sec Team" },
      { tab: "events", phase: "expand", eventId: "EVENT 117502", title: "System failure causing delayed payment processing", rating: "Major", status: "Open", opened: "08/10/2024", owner: "S. Brown" },
      { tab: "events", phase: "expand", eventId: "EVENT 118643", title: "Recurring ACH fraud incidents detected", rating: "Critical", status: "Open", opened: "07/25/2024", owner: "D. Turner" },
      { tab: "events", phase: "expand", eventId: "EVENT 119205", title: "Third-party outage impacting payment reconciliations", rating: "Major", status: "Open", opened: "08/02/2024", owner: "D. Harris" },
      { tab: "issues", phase: "expand", eventId: "ISSUE 410293", title: "Data privacy compliance gap in new customer onboarding", rating: "High", status: "Open", opened: "08/15/2024", owner: "L. Chen" },
      { tab: "issues", phase: "expand", eventId: "ISSUE 412558", title: "Missing sign-off on Q2 financial reconciliation", rating: "Medium", status: "Open", opened: "07/10/2024", owner: "B. White" },
      { tab: "changes", phase: "expand", eventId: "CHG 90221", title: "Migration to new cloud infrastructure provider", rating: "High", status: "Planning", opened: "09/20/2024", owner: "Cloud Team" },
    ];

    const items = reviewData.map(item => ({ ...item, sessionId, action: null }));
    const results = await storage.addReviewItems(items);
    res.json(results);
  });

  return httpServer;
}
