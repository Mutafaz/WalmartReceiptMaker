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
      console.log(`Attempting to fetch Walmart product from URL: ${url}`);
      
      // Fetch the HTML content from the Walmart product page
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
        throw new Error(`Failed to fetch product page: ${response.status}`);
      }
      
      const html = await response.text();
      console.log(`Received HTML response of length: ${html.length}`);
      
      // First, check if there's JSON-LD data in the page (more reliable) 
      let productData = null;
      let jsonLdData = '';
      
      // Find all script tags
      const scriptRegex = /<script[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/g;
      let match;
      while ((match = scriptRegex.exec(html)) !== null) {
        jsonLdData = match[1].trim();
        if (jsonLdData) break;
      }
      
      if (jsonLdData) {
        try {
          const jsonData = JSON.parse(jsonLdData);
          console.log('Found JSON-LD data in the page');
          
          // Check if it's a product
          if (jsonData['@type'] === 'Product' || 
              (Array.isArray(jsonData) && jsonData.some(item => item['@type'] === 'Product'))) {
            
            const product = Array.isArray(jsonData) 
              ? jsonData.find(item => item['@type'] === 'Product')
              : jsonData;
            
            if (product && product.name && product.offers && product.offers.price) {
              return {
                name: product.name,
                price: product.offers.price.toString()
              };
            }
          }
        } catch (jsonError) {
          console.error('Error parsing JSON-LD data:', jsonError);
        }
      }
      
      // Fallback to more robust regex patterns if JSON-LD approach fails
      console.log('Falling back to regex pattern matching');
      
      // Try to find product name with multiple patterns
      let name = null;
      const namePatterns = [
        /<h1[^>]*>(.*?)<\/h1>/i,
        /<span[^>]*data-testid="product-title"[^>]*>(.*?)<\/span>/i,
        /<div[^>]*class="[^"]*prod-ProductTitle[^"]*"[^>]*>(.*?)<\/div>/i
      ];
      
      for (const pattern of namePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          name = match[1].replace(/<[^>]*>/g, '').trim();
          if (name) break;
        }
      }
      
      // Try to find price with multiple patterns
      let price = null;
      const pricePatterns = [
        /\$([0-9]+\.[0-9]{2})/,
        /<span[^>]*data-testid="price-value"[^>]*>\$([0-9]+\.[0-9]{2})<\/span>/i,
        /<span[^>]*class="[^"]*price-characteristic[^"]*"[^>]*>([0-9]+)<\/span>\s*<span[^>]*class="[^"]*price-mantissa[^"]*"[^>]*>([0-9]{2})<\/span>/i
      ];
      
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          if (match.length === 2) {
            price = match[1];
          } else if (match.length === 3) {
            // Handle the case where price is split into dollars and cents
            price = `${match[1]}.${match[2]}`;
          }
          if (price) break;
        }
      }
      
      console.log(`Extracted product name: ${name || 'Not found'}, price: ${price || 'Not found'}`);
      
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
      
      console.log(`Received request to fetch product info for URL: ${url}`);
      
      if (!url || !url.includes('walmart.com')) {
        return res.status(400).json({ 
          error: 'Invalid Walmart URL',
          message: 'Please provide a valid Walmart product URL (e.g., https://www.walmart.com/ip/...)' 
        });
      }
      
      const productInfo = await fetchWalmartProductInfo(url);
      
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
      console.error('Error in fetch-walmart-product route:', error);
      res.status(500).json({ 
        error: 'Server Error',
        message: 'Failed to fetch product information due to a server error.'
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
