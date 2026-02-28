import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: text("domain"),
  currentStep: integer("current_step").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("Readable"),
  size: text("size").notNull(),
});

export const extractionResults = pgTable("extraction_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  meetingTitle: text("meeting_title").notNull(),
  label: text("label").notNull(),
  source: text("source").notNull(),
  found: boolean("found").notNull(),
});

export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  category: text("category").notNull(),
  content: text("content").notNull(),
});

export const reviewItems = pgTable("review_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  tab: text("tab").notNull(),
  phase: text("phase").notNull(),
  eventId: text("event_id").notNull(),
  title: text("title").notNull(),
  rating: text("rating").notNull(),
  status: text("status").notNull(),
  opened: text("opened").notNull(),
  owner: text("owner").notNull(),
  action: text("action"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true });
export const insertExtractionResultSchema = createInsertSchema(extractionResults).omit({ id: true });
export const insertInsightSchema = createInsertSchema(insights).omit({ id: true });
export const insertReviewItemSchema = createInsertSchema(reviewItems).omit({ id: true });

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertExtractionResult = z.infer<typeof insertExtractionResultSchema>;
export type ExtractionResult = typeof extractionResults.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertReviewItem = z.infer<typeof insertReviewItemSchema>;
export type ReviewItem = typeof reviewItems.$inferSelect;
