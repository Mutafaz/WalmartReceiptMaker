import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch, { RequestInit } from "node-fetch";
import cors from "cors";
import express from "express";

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: process.env.NODE_ENV === "production" 
      ? ["https://walmart-receipt-maker.vercel.app", "https://walmartreceiptmaker.com"]
      : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));

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

  // Function to fetch product information from AisleGopher URL
  async function fetchAisleGopherProductInfo(url: string): Promise<{name: string, price: string}> {
    try {
      console.log(`Attempting to fetch AisleGopher product from URL: ${url}`);
      
      // Extract the product ID from the URL - AisleGopher URLs are in format:
      // https://aislegopher.com/p/product-name/productId
      const productIdMatch = url.match(/\/p\/.*?\/(\d+)/);
      if (!productIdMatch) {
        console.error('Could not extract product ID from AisleGopher URL');
        return {
          name: 'Error Extracting Product ID',
          price: '0.00'
        };
      }
      
      const productId = productIdMatch[1];
      console.log(`Extracted product ID: ${productId}`);
      
      // Directly fetch the product page and parse it
      return await parseAisleGopherProductPage(url);
    } catch (error) {
      console.error('Error fetching AisleGopher product:', error);
      return {
        name: 'Error Fetching Product',
        price: '0.00'
      };
    }
  }
  
  // Helper function to parse AisleGopher product page
  async function parseAisleGopherProductPage(url: string): Promise<{name: string, price: string}> {
    console.log("Parsing AisleGopher product page:", url);
    try {
      const fetchOptions: RequestInit = {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "DNT": "1",
          "Origin": "https://aislegopher.com",
          "Referer": "https://aislegopher.com/"
        }
      };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        console.error(`Failed to fetch AisleGopher product page: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch AisleGopher product page: ${response.status}`);
      }

      const html = await response.text();
      console.log("Received HTML length:", html.length);
      
      // Extract product name - try multiple methods
      let name = null;
      
      // Method 1: Try to find JSON-LD data
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.name) {
            name = jsonLd.name;
          }
        } catch (e) {
          console.log('Failed to parse JSON-LD:', e);
        }
      }
      
      // Method 2: Try to extract from title tag
      if (!name) {
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          name = titleMatch[1]
            .replace(/ - AisleGopher.*$/, '')
            .replace(/ \| Walmart Price Tracker.*$/, '')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .trim();
        }
      }
      
      // Method 3: Try to find h1 tag
      if (!name) {
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (h1Match && h1Match[1]) {
          name = h1Match[1]
            .replace(/<[^>]+>/g, '')
            .replace(/ \| Walmart Price Tracker.*$/, '')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .trim();
        }
      }
      
      // Method 4: Try to find meta tags
      if (!name) {
        const metaMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
        if (metaMatch && metaMatch[1]) {
          name = metaMatch[1]
            .replace(/ - AisleGopher.*$/, '')
            .replace(/ \| Walmart Price Tracker.*$/, '')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .trim();
        }
      }
      
      // Extract price - try multiple methods
      let price = null;
      
      // Method 1: Try to find JSON-LD price
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.offers && jsonLd.offers.price) {
            price = jsonLd.offers.price;
          }
        } catch (e) {
          console.log('Failed to parse JSON-LD price:', e);
        }
      }
      
      // Method 2: Try to find price in meta tags
      if (!price) {
        const metaPriceMatch = html.match(/<meta[^>]*property="product:price:amount"[^>]*content="([^"]*)"[^>]*>/i);
        if (metaPriceMatch && metaPriceMatch[1]) {
          price = metaPriceMatch[1];
        }
      }
      
      // Method 3: Try to find price in data attributes
      if (!price) {
        const dataPriceMatch = html.match(/data-price="([0-9]+\.[0-9]{2})"/i);
        if (dataPriceMatch && dataPriceMatch[1]) {
          price = dataPriceMatch[1];
        }
      }
      
      // Method 4: Try to find price in text content
      if (!price) {
        const pricePatterns = [
          /\$([0-9]+\.[0-9]{2})/,
          /"price":\s*"?\$?([0-9]+\.[0-9]{2})"?/,
          /price">\$([0-9]+\.[0-9]{2})</,
          /"price":\s*"?([0-9]+\.[0-9]{2})"?/
        ];
        
        for (const pattern of pricePatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            price = match[1];
            break;
          }
        }
      }
      
      // For demonstration, if we can parse the URL, we can infer the product name from it
      if (!name) {
        const urlNameMatch = url.match(/\/p\/(.*?)\/\d+/);
        if (urlNameMatch && urlNameMatch[1]) {
          name = urlNameMatch[1]
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
      
      // Clean up any "..." at the end of the product name and optimize long product descriptions
      if (name) {
        name = name
          .replace(/\.{3,}$/, '')
          .replace(/, for All Skin Types/, '')
          .replace(/, for All/, '')
          .replace(/for All/, '')
          .replace(/, for Men/, '')
          .replace(/, for Women/, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      }
      
      console.log('Extracted product info:', { name, price });
      
      if (!name || !price) {
        throw new Error('Could not extract product information');
      }
      
      return {
        name: name || 'Product Name Not Found',
        price: price || '0.00'
      };
    } catch (error) {
      console.error("Error parsing AisleGopher product page:", error);
      throw error;
    }
  }

  // Route to fetch product info from product URL
  app.post("/api/fetch-product", async (req, res) => {
    try {
      const { url } = req.body;
      
      console.log(`Received request to fetch product info for URL: ${url}`);
      
      if (!url) {
        return res.status(400).json({ 
          error: 'Invalid URL',
          message: 'Please provide a valid product URL' 
        });
      }
      
      let productInfo;
      
      // Check if it's an AisleGopher URL
      if (url.includes('aislegopher.com')) {
        productInfo = await fetchAisleGopherProductInfo(url);
      } else {
        return res.status(400).json({ 
          error: 'Unsupported URL',
          message: 'Please provide a valid AisleGopher product URL (e.g., https://aislegopher.com/p/...)' 
        });
      }
      
      // Check if the product information was successfully retrieved
      if (productInfo.name === 'Product Name Not Found' || productInfo.price === '0.00') {
        console.log('Could not extract product information from URL');
        return res.status(422).json({
          error: 'Extraction Failed',
          message: 'Could not extract product information from the provided URL. The product page structure might have changed or the URL might not be for a valid product page.'
        });
      }
      
      console.log(`Successfully extracted product info: ${JSON.stringify(productInfo)}`);
      res.json(productInfo);
    } catch (error) {
      console.error('Error in fetch-product route:', error);
      res.status(500).json({ 
        error: 'Server Error',
        message: 'Failed to fetch product information due to a server error.'
      });
    }
  });
  
  // Maintain backward compatibility with the old endpoint
  app.post("/api/fetch-walmart-product", async (req, res) => {
    return res.status(400).json({ 
      error: 'Service Updated',
      message: 'This API endpoint has been updated. Please use /api/fetch-product instead.' 
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
