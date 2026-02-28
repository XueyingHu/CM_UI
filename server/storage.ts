import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  sessions, documents, extractionResults, insights, reviewItems,
  type InsertSession, type Session,
  type InsertDocument, type Document,
  type InsertExtractionResult, type ExtractionResult,
  type InsertInsight, type Insight,
  type InsertReviewItem, type ReviewItem,
} from "@shared/schema";

export interface IStorage {
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, data: Partial<InsertSession>): Promise<Session | undefined>;

  addDocument(doc: InsertDocument): Promise<Document>;
  getDocuments(sessionId: string): Promise<Document[]>;
  removeDocument(id: string): Promise<void>;

  addExtractionResults(results: InsertExtractionResult[]): Promise<ExtractionResult[]>;
  getExtractionResults(sessionId: string): Promise<ExtractionResult[]>;

  addInsights(ins: InsertInsight[]): Promise<Insight[]>;
  getInsights(sessionId: string): Promise<Insight[]>;

  addReviewItems(items: InsertReviewItem[]): Promise<ReviewItem[]>;
  getReviewItems(sessionId: string, tab: string, phase: string): Promise<ReviewItem[]>;
  updateReviewItemAction(id: string, action: string): Promise<ReviewItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createSession(session: InsertSession): Promise<Session> {
    const [result] = await db.insert(sessions).values(session).returning();
    return result;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [result] = await db.select().from(sessions).where(eq(sessions.id, id));
    return result;
  }

  async updateSession(id: string, data: Partial<InsertSession>): Promise<Session | undefined> {
    const [result] = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning();
    return result;
  }

  async addDocument(doc: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(doc).returning();
    return result;
  }

  async getDocuments(sessionId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.sessionId, sessionId));
  }

  async removeDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async addExtractionResults(results: InsertExtractionResult[]): Promise<ExtractionResult[]> {
    if (results.length === 0) return [];
    return db.insert(extractionResults).values(results).returning();
  }

  async getExtractionResults(sessionId: string): Promise<ExtractionResult[]> {
    return db.select().from(extractionResults).where(eq(extractionResults.sessionId, sessionId));
  }

  async addInsights(ins: InsertInsight[]): Promise<Insight[]> {
    if (ins.length === 0) return [];
    return db.insert(insights).values(ins).returning();
  }

  async getInsights(sessionId: string): Promise<Insight[]> {
    return db.select().from(insights).where(eq(insights.sessionId, sessionId));
  }

  async addReviewItems(items: InsertReviewItem[]): Promise<ReviewItem[]> {
    if (items.length === 0) return [];
    return db.insert(reviewItems).values(items).returning();
  }

  async getReviewItems(sessionId: string, tab: string, phase: string): Promise<ReviewItem[]> {
    return db.select().from(reviewItems).where(
      and(eq(reviewItems.sessionId, sessionId), eq(reviewItems.tab, tab), eq(reviewItems.phase, phase))
    );
  }

  async updateReviewItemAction(id: string, action: string): Promise<ReviewItem | undefined> {
    const [result] = await db.update(reviewItems).set({ action }).where(eq(reviewItems.id, id)).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
