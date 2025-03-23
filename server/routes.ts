import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for receipts
  
  // Get all receipts
  app.get("/api/receipts", async (req, res) => {
    try {
      const receipts = await storage.getAllReceipts();
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  // Get a receipt by ID
  app.get("/api/receipts/:id", async (req, res) => {
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
  app.post("/api/receipts", async (req, res) => {
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
  app.post("/api/receipts/:receiptId/items", async (req, res) => {
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
  app.post("/api/generate-pdf", (req, res) => {
    // In a production environment, this would use a PDF generation library
    // and return a PDF buffer or URL, but we're handling this client-side
    // with html2canvas and jsPDF for this implementation
    res.json({ message: "PDF generation handled client-side" });
  });

  // Function to fetch product information from Walmart URL
  async function fetchWalmartProductInfo(url: string) {
    try {
      // Fetch the HTML content from the Walmart product page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product page: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract product name and price using regex patterns
      // This is a simplified approach and might need adjustments based on Walmart's HTML structure
      const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const priceMatch = html.match(/\$([0-9]+\.[0-9]{2})/);
      
      const name = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : null;
      const price = priceMatch ? priceMatch[1] : null;
      
      return {
        name: name || 'Product Name Not Found',
        price: price || '0.00'
      };
    } catch (error) {
      console.error('Error fetching Walmart product:', error);
      return {
        name: 'Error Fetching Product',
        price: '0.00'
      };
    }
  }

  // Route to fetch product info from Walmart URL
  app.post("/api/fetch-walmart-product", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || !url.includes('walmart.com')) {
        return res.status(400).json({ error: 'Invalid Walmart URL' });
      }
      
      const productInfo = await fetchWalmartProductInfo(url);
      res.json(productInfo);
    } catch (error) {
      console.error('Error in fetch-walmart-product route:', error);
      res.status(500).json({ error: 'Failed to fetch product information' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
