import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";

// Add interface for AisleGopher API response
interface AisleGopherProduct {
  name: string;
  price: number;
}

// Add interface for PriceTracker API response
interface PriceTrackerProduct {
  name: string;
  price: number;
}

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
      
      // Use AisleGopher's API to fetch product info
      const apiUrl = `https://aislegopher.com/api/products/${productId}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product from API: ${response.status}`);
      }
      
      const productData = (await response.json()) as AisleGopherProduct;
      
      if (!productData || typeof productData.name !== 'string' || typeof productData.price !== 'number') {
        throw new Error('Invalid product data received from API');
      }
      
      return {
        name: productData.name,
        price: productData.price.toString()
      };
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
    console.log('Parsing AisleGopher product page');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AisleGopher product page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract product name - typically in the title or h1
    let name = null;
    
    // Try to extract the product name from the title tag first
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      name = titleMatch[1]
        .replace(/ - AisleGopher.*$/, '')      // Remove trailing AisleGopher.com
        .replace(/ \| Walmart Price Tracker.*$/, '')  // Remove "| Walmart Price Tracker | aislegopher.com"
        .replace(/&#39;/g, "'")           // Replace HTML entities
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .trim();
    }
    
    // If title extraction fails, try to extract from h1 or other key elements
    if (!name) {
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        name = h1Match[1]
          .replace(/<[^>]+>/g, '')       // Remove any HTML tags
          .replace(/ \| Walmart Price Tracker.*$/, '')  // Remove "| Walmart Price Tracker | aislegopher.com"
          .replace(/&#39;/g, "'")        // Replace HTML entities
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .trim();
      }
    }
    
    // Extract price - look for common price formats
    let price = null;
    const pricePatterns = [
      /\$([0-9]+\.[0-9]{2})/,                 // Standard price format like $12.99
      /"price":\s*"?\$?([0-9]+\.[0-9]{2})"?/, // JSON price format
      /data-price="([0-9]+\.[0-9]{2})"/,      // data-price attribute
      /price">\$([0-9]+\.[0-9]{2})</          // Price in specific element
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = match[1];
        break;
      }
    }
    
    // For demonstration, if we can parse the URL, we can infer the product name from it
    if (!name) {
      const urlNameMatch = url.match(/\/p\/(.*?)\/\d+/);
      if (urlNameMatch && urlNameMatch[1]) {
        name = urlNameMatch[1]
          .replace(/-/g, ' ')     // Replace hyphens with spaces
          .split(' ')             // Split into words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
          .join(' ');             // Join back with spaces
      }
    }
    
    // Clean up any "..." at the end of the product name and optimize long product descriptions
    if (name) {
      name = name
        .replace(/\.{3,}$/, '')  // Remove ellipses at the end
        .replace(/, for All Skin Types/, '')  // Remove "for All Skin Types"
        .replace(/for All Skin Types/, '')    // Remove without comma
        .replace(/, for All/, '')  // Remove "for All" with comma
        .replace(/for All/, '')  // Remove "for All" without comma
        .replace(/, for Men/, '')  // Remove "for Men"
        .replace(/, for Women/, '')  // Remove "for Women"
        .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with a single space
        .trim();
      
      // Extract key size, count, and packaging information
      const sizeCountMatch = name.match(/([\d\.]+)\s*(?:oz|ounce|fl oz|fluid ounce|lb|pound|g|gram|ml|count|ct|pk|pack)/i);
      const countMatch = name.match(/[,\s](\d+)[\s-](?:count|ct|pk|pack|bar|bars|bottle|bottles|capsule|capsules|tablet|tablets)/i);
      
      // For bar soaps and similar products with scent information
      // Format like: "Coast Refreshing Deodorant Bar Soap Classic Scent, 3.2 oz, 8 Bars"
      const soapMatch = name.match(/^(.*?)\s*(?:,\s*|\s+)((?:Classic|Original|Fresh|Spring|Clean|Mountain|Ocean|[A-Za-z]+)\s+Scent)(.*)$/i);
      if (soapMatch) {
        // Extract size and count if present
        let suffix = soapMatch[3];
        if (sizeCountMatch || countMatch) {
          const size = sizeCountMatch ? sizeCountMatch[0] : '';
          const count = countMatch ? countMatch[0] : '';
          
          // Create a clean version with just product, scent, size and count
          name = `${soapMatch[1]} ${soapMatch[2].trim()}`;
          
          // Add size and count if available
          if (size) {
            name += `, ${size.trim()}`;
          }
          if (count) {
            name += `, ${count.trim().replace(/^[,\s]+/, '')}`;
          }
        } else {
          name = `${soapMatch[1]} ${soapMatch[2].trim()}${suffix}`;
        }
      }
      
      // Final cleanup
      name = name
        .replace(/\s+,/g, ',') // Remove spaces before commas
        .replace(/,+/g, ',')   // Remove duplicate commas
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
        .trim();
    }
    
    console.log(`Extracted from AisleGopher - Product: ${name || 'Not found'}, Price: ${price || 'Not found'}`);
    
    return {
      name: name || 'Product Name Not Found',
      price: price || '0.00'
    };
  }

  // Function to fetch product information from Walmart URL using pricetracker.wtf
  async function fetchWalmartProductInfo(url: string): Promise<{name: string, price: string}> {
    try {
      console.log(`Processing URL: ${url}`);
      
      // Check if it's a pricetracker.wtf URL
      if (url.includes('pricetracker.wtf')) {
        const productIdMatch = url.match(/\/product\/([^\/]+)/);
        if (!productIdMatch || !productIdMatch[1]) {
          throw new Error('Could not extract product ID from pricetracker.wtf URL');
        }
        
        const productId = productIdMatch[1];
        console.log(`Extracted product ID: ${productId}`);
        
        // Fetch the product page from pricetracker.wtf
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product page: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Extract product name from the page title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        if (!titleMatch || !titleMatch[1]) {
          throw new Error('Could not find product name in page');
        }
        
        const name = titleMatch[1]
          .replace(/ - Price Tracker.*$/, '')  // Remove trailing text
          .replace(/&#39;/g, "'")              // Replace HTML entities
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .trim();
        
        // Extract price from the page
        const priceMatch = html.match(/"price":\s*"?\$?([0-9]+\.[0-9]{2})"?/);
        if (!priceMatch || !priceMatch[1]) {
          throw new Error('Could not find product price in page');
        }
        
        return {
          name,
          price: priceMatch[1]
        };
      }
      
      // If it's a Walmart URL, extract the product ID and use pricetracker.wtf
      const productIdMatch = url.match(/\/ip\/([^\/]+)/);
      if (!productIdMatch || !productIdMatch[1]) {
        throw new Error('Could not extract product ID from Walmart URL');
      }
      
      const productId = productIdMatch[1];
      console.log(`Extracted product ID: ${productId}`);
      
      // Construct the pricetracker.wtf URL
      const pricetrackerUrl = `https://pricetracker.wtf/product/${productId}`;
      console.log(`Fetching from pricetracker.wtf: ${pricetrackerUrl}`);
      
      const response = await fetch(pricetrackerUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product page: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract product name from the page title
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (!titleMatch || !titleMatch[1]) {
        throw new Error('Could not find product name in page');
      }
      
      const name = titleMatch[1]
        .replace(/ - Price Tracker.*$/, '')  // Remove trailing text
        .replace(/&#39;/g, "'")              // Replace HTML entities
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .trim();
      
      // Extract price from the page
      const priceMatch = html.match(/"price":\s*"?\$?([0-9]+\.[0-9]{2})"?/);
      if (!priceMatch || !priceMatch[1]) {
        throw new Error('Could not find product price in page');
      }
      
      return {
        name,
        price: priceMatch[1]
      };
    } catch (error) {
      console.error('Error fetching product:', error);
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
      
      // Check if it's a Walmart URL
      if (url.includes('walmart.com')) {
        productInfo = await fetchWalmartProductInfo(url);
      } else {
        return res.status(400).json({ 
          error: 'Unsupported URL',
          message: 'Please provide a valid Walmart product URL (e.g., https://www.walmart.com/ip/...)' 
        });
      }
      
      // Check if the product information was successfully retrieved
      if (!productInfo.name || !productInfo.price) {
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
