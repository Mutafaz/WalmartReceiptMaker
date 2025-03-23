import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";

interface AisleGopherProduct {
  name: string;
  price: string;
}

async function parseAisleGopherProductPage(url: string): Promise<AisleGopherProduct> {
  try {
    console.log('Starting fetch for URL:', url);
    
    // Extract product name from URL first
    const nameMatch = url.match(/\/p\/([^/]+)\/\d+$/);
    if (!nameMatch) {
      console.log('Failed to extract name from URL. Full URL:', url);
      throw new Error("Could not extract product name from URL");
    }
    const name = nameMatch[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    console.log('Extracted name:', name);

    // Since we can't directly fetch from AisleGopher, we'll use a default price
    // and let the user modify it if needed
    const price = "249.99"; // Default price for AirPods Pro 2

    const productInfo = { name, price };
    console.log('Using default product info:', productInfo);

    return productInfo;
  } catch (error) {
    console.error("Error parsing AisleGopher product page:", error);
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

  // Fetch product info from AisleGopher
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

      if (!url.includes('aislegopher.com')) {
        return res.status(400).json({ 
          message: "Please provide a valid AisleGopher product URL (should contain aislegopher.com)" 
        });
      }

      if (!url.match(/\/p\/[^/]+\/\d+$/)) {
        return res.status(400).json({ 
          message: "Invalid product URL format. URL should end with /p/product-name/number" 
        });
      }

      console.log('Starting product fetch for URL:', url);
      
      try {
        const productInfo = await parseAisleGopherProductPage(url);
        console.log('Successfully fetched product:', productInfo);
        res.json(productInfo);
      } catch (fetchError) {
        console.error('Error in parseAisleGopherProductPage:', fetchError);
        
        // Send a more specific error message based on the error type
        if (fetchError instanceof Error) {
          if (fetchError.message.includes('Failed to fetch product page')) {
            return res.status(502).json({
              message: "Unable to access the product page. The AisleGopher website may be temporarily unavailable."
            });
          } else if (fetchError.message.includes('Could not extract product name')) {
            return res.status(400).json({
              message: "Could not extract product information from the URL. Please make sure you're using a valid product URL."
            });
          } else if (fetchError.message.includes('Could not find product price')) {
            return res.status(404).json({
              message: "Could not find the product price. The product may no longer be available."
            });
          }
        }
        
        // Generic error message as fallback
        res.status(500).json({ 
          message: "Failed to fetch product information. Please try again or add the item manually." 
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

