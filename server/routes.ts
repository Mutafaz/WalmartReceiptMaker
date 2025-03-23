import type { Express } from "express";
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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('Fetched HTML:', html.substring(0, 500)); // Log first 500 chars for debugging
    
    // Extract product name from URL
    const nameMatch = url.match(/\/p\/([^/]+)\/\d+$/);
    if (!nameMatch) {
      throw new Error("Could not extract product name from URL");
    }
    const name = nameMatch[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Try to find price in various formats
    const pricePatterns = [
      /"price":\s*"?\$?([0-9]+\.[0-9]{2})"?/,  // JSON price format
      /data-price="([0-9]+\.[0-9]{2})"/,       // Data-price attribute
      /current-price[^>]*>([0-9]+\.[0-9]{2})</, // Current price class
      /product-price[^>]*>([0-9]+\.[0-9]{2})</, // Product price class
      /item-price[^>]*>([0-9]+\.[0-9]{2})</,    // Item price class
      /<span[^>]*class="[^"]*price[^"]*"[^>]*>([0-9]+\.[0-9]{2})</,  // Price in span
      /<div[^>]*class="[^"]*price[^"]*"[^>]*>([0-9]+\.[0-9]{2})</,   // Price in div
      /<p[^>]*class="[^"]*price[^"]*"[^>]*>([0-9]+\.[0-9]{2})</,     // Price in p
      /<span[^>]*>([0-9]+\.[0-9]{2})<\/span>/,  // Price in any span
      /<div[^>]*>([0-9]+\.[0-9]{2})<\/div>/,    // Price in any div
      /<p[^>]*>([0-9]+\.[0-9]{2})<\/p>/         // Price in any p
    ];

    let price = "0.00";
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        price = match[1];
        console.log('Found price with pattern:', pattern); // Log which pattern matched
        break;
      }
    }

    // If no price found in initial patterns, try meta tags and script tags
    if (price === "0.00") {
      const metaPriceMatch = html.match(/<meta[^>]*property="product:price:amount"[^>]*content="([0-9]+\.[0-9]{2})"/);
      if (metaPriceMatch) {
        price = metaPriceMatch[1];
        console.log('Found price in meta tag');
      } else {
        const scriptPriceMatch = html.match(/price["']:\s*["']\$?([0-9]+\.[0-9]{2})["']/);
        if (scriptPriceMatch) {
          price = scriptPriceMatch[1];
          console.log('Found price in script tag');
        }
      }
    }

    console.log('Final product info:', { name, price }); // Log final product info

    return {
      name,
      price
    };
  } catch (error) {
    console.error("Error parsing AisleGopher product page:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

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

  // Fetch product info from AisleGopher
  app.post("/api/fetch-product", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string' || !url.includes('aislegopher.com')) {
        return res.status(400).json({ 
          message: "Invalid URL. Please provide a valid AisleGopher product URL." 
        });
      }

      console.log('Fetching product from URL:', url); // Log the URL being fetched
      const productInfo = await parseAisleGopherProductPage(url);
      res.json(productInfo);
    } catch (error) {
      console.error("Error fetching product info:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch product information. Please try again or add the item manually." 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
