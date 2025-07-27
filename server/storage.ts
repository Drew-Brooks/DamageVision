import { claims, damagePhotos, costBreakdowns, type Claim, type InsertClaim, type DamagePhoto, type InsertDamagePhoto, type CostBreakdown, type InsertCostBreakdown } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Claims
  getClaim(id: number): Promise<Claim | undefined>;
  getAllClaims(): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: number, updates: Partial<Claim>): Promise<Claim | undefined>;
  
  // Damage Photos
  getDamagePhotos(claimId: number): Promise<DamagePhoto[]>;
  createDamagePhoto(photo: InsertDamagePhoto): Promise<DamagePhoto>;
  deleteDamagePhoto(id: number): Promise<boolean>;
  
  // Cost Breakdowns
  getCostBreakdown(claimId: number): Promise<CostBreakdown | undefined>;
  createCostBreakdown(breakdown: InsertCostBreakdown): Promise<CostBreakdown>;
  updateCostBreakdown(claimId: number, updates: Partial<CostBreakdown>): Promise<CostBreakdown | undefined>;
}

export class MemStorage implements IStorage {
  private claims: Map<number, Claim>;
  private damagePhotos: Map<number, DamagePhoto>;
  private costBreakdowns: Map<number, CostBreakdown>;
  private currentClaimId: number;
  private currentPhotoId: number;
  private currentBreakdownId: number;

  constructor() {
    this.claims = new Map();
    this.damagePhotos = new Map();
    this.costBreakdowns = new Map();
    this.currentClaimId = 1;
    this.currentPhotoId = 1;
    this.currentBreakdownId = 1;
  }

  private generateClaimNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const sequence = String(this.currentClaimId).padStart(3, '0');
    return `CLM-${year}-${month}${day}-${sequence}`;
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async getAllClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values()).sort((a, b) => 
      new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.currentClaimId++;
    const claimNumber = this.generateClaimNumber();
    const submissionDate = new Date();
    
    const claim: Claim = {
      ...insertClaim,
      id,
      claimNumber,
      submissionDate,
      status: insertClaim.status || "submitted",
      priority: insertClaim.priority || "normal",
      totalEstimate: null,
      estimationConfidence: null,
      adjusterNotes: null,
    };
    
    this.claims.set(id, claim);
    return claim;
  }

  async updateClaim(id: number, updates: Partial<Claim>): Promise<Claim | undefined> {
    const existingClaim = this.claims.get(id);
    if (!existingClaim) return undefined;
    
    const updatedClaim = { ...existingClaim, ...updates };
    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }

  async getDamagePhotos(claimId: number): Promise<DamagePhoto[]> {
    return Array.from(this.damagePhotos.values()).filter(photo => photo.claimId === claimId);
  }

  async createDamagePhoto(insertPhoto: InsertDamagePhoto): Promise<DamagePhoto> {
    const id = this.currentPhotoId++;
    const uploadedAt = new Date();
    
    const photo: DamagePhoto = {
      ...insertPhoto,
      id,
      uploadedAt,
      damageType: insertPhoto.damageType || null,
      severity: insertPhoto.severity || null,
      aiAnalysis: insertPhoto.aiAnalysis || null,
    };
    
    this.damagePhotos.set(id, photo);
    return photo;
  }

  async deleteDamagePhoto(id: number): Promise<boolean> {
    return this.damagePhotos.delete(id);
  }

  async getCostBreakdown(claimId: number): Promise<CostBreakdown | undefined> {
    return Array.from(this.costBreakdowns.values()).find(breakdown => breakdown.claimId === claimId);
  }

  async createCostBreakdown(insertBreakdown: InsertCostBreakdown): Promise<CostBreakdown> {
    const id = this.currentBreakdownId++;
    
    const breakdown: CostBreakdown = {
      ...insertBreakdown,
      id,
      bodyworkCost: insertBreakdown.bodyworkCost || null,
      paintCost: insertBreakdown.paintCost || null,
      partsCost: insertBreakdown.partsCost || null,
      laborCost: insertBreakdown.laborCost || null,
      totalCost: insertBreakdown.totalCost || null,
      confidenceLevel: insertBreakdown.confidenceLevel || null,
    };
    
    this.costBreakdowns.set(id, breakdown);
    return breakdown;
  }

  async updateCostBreakdown(claimId: number, updates: Partial<CostBreakdown>): Promise<CostBreakdown | undefined> {
    const existingBreakdown = Array.from(this.costBreakdowns.values()).find(b => b.claimId === claimId);
    if (!existingBreakdown) return undefined;
    
    const updatedBreakdown = { ...existingBreakdown, ...updates };
    this.costBreakdowns.set(existingBreakdown.id, updatedBreakdown);
    return updatedBreakdown;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getClaim(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim || undefined;
  }

  async getAllClaims(): Promise<Claim[]> {
    return await db.select().from(claims).orderBy(desc(claims.submissionDate));
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const claimNumber = this.generateClaimNumber();
    
    const [claim] = await db
      .insert(claims)
      .values({
        ...insertClaim,
        claimNumber,
        status: insertClaim.status || "submitted",
        priority: insertClaim.priority || "normal",
      })
      .returning();
    
    return claim;
  }

  async updateClaim(id: number, updates: Partial<Claim>): Promise<Claim | undefined> {
    const [updatedClaim] = await db
      .update(claims)
      .set(updates)
      .where(eq(claims.id, id))
      .returning();
    
    return updatedClaim || undefined;
  }

  async getDamagePhotos(claimId: number): Promise<DamagePhoto[]> {
    return await db.select().from(damagePhotos).where(eq(damagePhotos.claimId, claimId));
  }

  async createDamagePhoto(insertPhoto: InsertDamagePhoto): Promise<DamagePhoto> {
    const [photo] = await db
      .insert(damagePhotos)
      .values({
        ...insertPhoto,
        damageType: insertPhoto.damageType || null,
        severity: insertPhoto.severity || null,
        aiAnalysis: insertPhoto.aiAnalysis || null,
      })
      .returning();
    
    return photo;
  }

  async deleteDamagePhoto(id: number): Promise<boolean> {
    const result = await db.delete(damagePhotos).where(eq(damagePhotos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCostBreakdown(claimId: number): Promise<CostBreakdown | undefined> {
    const [breakdown] = await db.select().from(costBreakdowns).where(eq(costBreakdowns.claimId, claimId));
    return breakdown || undefined;
  }

  async createCostBreakdown(insertBreakdown: InsertCostBreakdown): Promise<CostBreakdown> {
    const [breakdown] = await db
      .insert(costBreakdowns)
      .values({
        ...insertBreakdown,
        bodyworkCost: insertBreakdown.bodyworkCost || null,
        paintCost: insertBreakdown.paintCost || null,
        partsCost: insertBreakdown.partsCost || null,
        laborCost: insertBreakdown.laborCost || null,
        totalCost: insertBreakdown.totalCost || null,
        confidenceLevel: insertBreakdown.confidenceLevel || null,
      })
      .returning();
    
    return breakdown;
  }

  async updateCostBreakdown(claimId: number, updates: Partial<CostBreakdown>): Promise<CostBreakdown | undefined> {
    const [updatedBreakdown] = await db
      .update(costBreakdowns)
      .set(updates)
      .where(eq(costBreakdowns.claimId, claimId))
      .returning();
    
    return updatedBreakdown || undefined;
  }

  private generateClaimNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `CLM-${year}-${month}${day}-${sequence}`;
  }
}

export const storage = new DatabaseStorage();
