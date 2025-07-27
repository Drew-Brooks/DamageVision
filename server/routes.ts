import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertClaimSchema, insertDamagePhotoSchema, insertCostBreakdownSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.'));
    }
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Mock AI analysis function
function generateAIAnalysis(filename: string, severity: string) {
  const analyses = {
    severe: {
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      damages: [
        'Bumper: High confidence severe damage',
        'Paint: Significant scratching detected',
        'Structure: Minor to moderate deformation identified'
      ],
      repairTypes: ['replacement', 'bodywork', 'paint']
    },
    moderate: {
      confidence: Math.floor(Math.random() * 20) + 70, // 70-90%
      damages: [
        'Side Panel: Moderate confidence damage',
        'Paint: Surface scratches detected',
        'Door: No structural damage'
      ],
      repairTypes: ['bodywork', 'paint']
    },
    minor: {
      confidence: Math.floor(Math.random() * 25) + 60, // 60-85%
      damages: [
        'Paint: Minor scratches detected',
        'Trim: Cosmetic damage only',
        'Structure: No damage detected'
      ],
      repairTypes: ['paint', 'touch-up']
    }
  };

  return analyses[severity as keyof typeof analyses] || analyses.moderate;
}

// Generate cost estimate based on damage analysis
function generateCostEstimate(photos: any[]) {
  let bodyworkCost = 0;
  let paintCost = 0;
  let partsCost = 0;
  let laborCost = 200; // Base labor cost

  photos.forEach(photo => {
    const analysis = photo.aiAnalysis;
    if (analysis.repairTypes.includes('replacement')) {
      partsCost += Math.floor(Math.random() * 800) + 400; // $400-1200
      laborCost += Math.floor(Math.random() * 300) + 200; // Additional labor
    }
    if (analysis.repairTypes.includes('bodywork')) {
      bodyworkCost += Math.floor(Math.random() * 600) + 400; // $400-1000
      laborCost += Math.floor(Math.random() * 200) + 100;
    }
    if (analysis.repairTypes.includes('paint')) {
      paintCost += Math.floor(Math.random() * 400) + 300; // $300-700
    }
  });

  const totalCost = bodyworkCost + paintCost + partsCost + laborCost;
  const confidenceLevel = Math.floor(Math.random() * 20) + 80; // 80-100%

  return {
    bodyworkCost: bodyworkCost.toString(),
    paintCost: paintCost.toString(),
    partsCost: partsCost.toString(),
    laborCost: laborCost.toString(),
    totalCost: totalCost.toString(),
    confidenceLevel
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all claims
  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  // Get specific claim
  app.get("/api/claims/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const claim = await storage.getClaim(id);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      res.json(claim);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claim" });
    }
  });

  // Create new claim
  app.post("/api/claims", async (req, res) => {
    try {
      const claimData = insertClaimSchema.parse(req.body);
      const claim = await storage.createClaim(claimData);
      res.status(201).json(claim);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create claim" });
      }
    }
  });

  // Update claim
  app.patch("/api/claims/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const claim = await storage.updateClaim(id, updates);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      res.json(claim);
    } catch (error) {
      res.status(500).json({ message: "Failed to update claim" });
    }
  });

  // Get damage photos for a claim
  app.get("/api/claims/:id/photos", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const photos = await storage.getDamagePhotos(claimId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Upload damage photos
  app.post("/api/claims/:id/photos", upload.array('photos', 10), async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const files = req.files as any[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedPhotos = [];

      for (const file of files) {
        // Process image with Sharp
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
        const filepath = path.join(uploadsDir, filename);
        
        await sharp(file.buffer)
          .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(filepath);

        // Determine damage severity (mock logic based on filename/random)
        const severities = ['severe', 'moderate', 'minor'];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        
        // Generate AI analysis
        const aiAnalysis = generateAIAnalysis(filename, severity);

        const photoData = {
          claimId,
          filename,
          originalName: file.originalname,
          mimeType: 'image/jpeg',
          size: file.size,
          damageType: severity === 'severe' ? 'structural' : severity === 'moderate' ? 'bodywork' : 'cosmetic',
          severity,
          aiAnalysis
        };

        const photo = await storage.createDamagePhoto(photoData);
        uploadedPhotos.push(photo);
      }

      // Generate cost estimate based on uploaded photos
      const costEstimate = generateCostEstimate(uploadedPhotos);
      await storage.createCostBreakdown({
        claimId,
        ...costEstimate
      });

      // Update claim with total estimate
      await storage.updateClaim(claimId, {
        totalEstimate: costEstimate.totalCost,
        estimationConfidence: costEstimate.confidenceLevel
      });

      res.status(201).json(uploadedPhotos);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });

  // Delete damage photo
  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDamagePhoto(id);
      if (!success) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Get cost breakdown for a claim
  app.get("/api/claims/:id/cost-breakdown", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const breakdown = await storage.getCostBreakdown(claimId);
      if (!breakdown) {
        return res.status(404).json({ message: "Cost breakdown not found" });
      }
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost breakdown" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(filepath);
  });

  const httpServer = createServer(app);
  return httpServer;
}
