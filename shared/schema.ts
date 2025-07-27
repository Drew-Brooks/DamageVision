import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimNumber: text("claim_number").notNull().unique(),
  policyholderName: text("policyholder_name").notNull(),
  vehicleInfo: text("vehicle_info").notNull(),
  incidentDate: text("incident_date").notNull(),
  incidentLocation: text("incident_location").notNull(),
  incidentType: text("incident_type").notNull(),
  damageDescription: text("damage_description").notNull(),
  status: text("status").notNull().default("submitted"),
  priority: text("priority").notNull().default("normal"),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  adjusterNotes: text("adjuster_notes"),
  totalEstimate: decimal("total_estimate", { precision: 10, scale: 2 }),
  estimationConfidence: integer("estimation_confidence"),
});

export const damagePhotos = pgTable("damage_photos", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  damageType: text("damage_type"),
  severity: text("severity"),
  aiAnalysis: jsonb("ai_analysis"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const costBreakdowns = pgTable("cost_breakdowns", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  bodyworkCost: decimal("bodywork_cost", { precision: 10, scale: 2 }),
  paintCost: decimal("paint_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  confidenceLevel: integer("confidence_level"),
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  claimNumber: true,
  submissionDate: true,
});

export const insertDamagePhotoSchema = createInsertSchema(damagePhotos).omit({
  id: true,
  uploadedAt: true,
});

export const insertCostBreakdownSchema = createInsertSchema(costBreakdowns).omit({
  id: true,
});

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertDamagePhoto = z.infer<typeof insertDamagePhotoSchema>;
export type DamagePhoto = typeof damagePhotos.$inferSelect;
export type InsertCostBreakdown = z.infer<typeof insertCostBreakdownSchema>;
export type CostBreakdown = typeof costBreakdowns.$inferSelect;
