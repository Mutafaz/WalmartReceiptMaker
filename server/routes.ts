import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

interface ProductInfo {
  name: string;
  price: string;
}

async function parseProductFromUrl(url: string): Promise<ProductInfo> {
  try {
    // Extract product name from URL
    const nameMatch = url.match(/\/p\/([^/]+)\/\d+$/);
    if (!nameMatch) {
      throw new Error("Could not extract product name from URL");
    }
    const name = nameMatch[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Use a default price that can be modified later
    const price = "0.00";

    return { name, price };
  } catch (error) {
    console.error("Error parsing product from URL:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // API Routes for receipts
  
  // Get all receipts
  app.get("/api/receipts", async (req: Request, res: Response) => {
    try {
      const receipts = await storage.getAllReceipts();
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  // Get a receipt by ID
  app.get("/api/receipts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const receipt = await storage.getReceiptById(id);
      
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.json(receipt);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  // Create a new receipt
  app.post("/api/receipts", async (req: Request, res: Response) => {
    try {
      // Validate receipt data
      const receiptData = insertReceiptSchema.parse(req.body);
      
      // Create receipt
      const receipt = await storage.createReceipt(receiptData);
      
      res.status(201).json(receipt);
    } catch (error) {
      console.error("Error creating receipt:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create receipt" });
    }
  });

  // Create receipt items for a receipt
  app.post("/api/receipts/:receiptId/items", async (req: Request, res: Response) => {
    try {
      const receiptId = parseInt(req.params.receiptId);
      
      // Check if receipt exists
      const receipt = await storage.getReceiptById(receiptId);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      // Validate and create items
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const createdItems = [];
      
      for (const item of items) {
        const itemData = insertReceiptItemSchema.parse({
          ...item,
          receiptId
        });
        
        const createdItem = await storage.createReceiptItem(itemData);
        createdItems.push(createdItem);
      }
      
      res.status(201).json(createdItems);
    } catch (error) {
      console.error("Error creating receipt items:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create receipt items" });
    }
  });

  // Generate PDF route
  app.post("/api/generate-pdf", (req: Request, res: Response) => {
    // In a production environment, this would use a PDF generation library
    // and return a PDF buffer or URL, but we're handling this client-side
    // with html2canvas and jsPDF for this implementation
    res.json({ message: "PDF generation handled client-side" });
  });

  // Parse product from URL
  app.post("/api/fetch-product", async (req: Request, res: Response) => {
    try {
      let { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ 
          message: "Please provide a product URL" 
        });
      }

      // Remove @ symbol if present at the start of the URL
      url = url.replace(/^@/, '');

      try {
        const productInfo = await parseProductFromUrl(url);
        console.log('Successfully parsed product:', productInfo);
        res.json(productInfo);
      } catch (parseError) {
        console.error('Error parsing product URL:', parseError);
        return res.status(400).json({
          message: "Could not extract product information from the URL. Please enter the item details manually."
        });
      }
    } catch (error) {
      console.error("Unexpected error in fetch-product endpoint:", error);
      res.status(500).json({ 
        message: "An unexpected error occurred. Please try again later." 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

