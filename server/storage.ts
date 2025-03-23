import { insertUserSchema, insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";
import type { z } from "zod";

type User = z.infer<typeof insertUserSchema> & { id: number };
type Receipt = z.infer<typeof insertReceiptSchema> & { id: number };
type ReceiptItem = z.infer<typeof insertReceiptItemSchema> & { id: number };

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: z.infer<typeof insertUserSchema>): Promise<User>;
  
  // Receipt operations
  getAllReceipts(): Promise<Receipt[]>;
  getReceiptById(id: number): Promise<Receipt | undefined>;
  createReceipt(receipt: z.infer<typeof insertReceiptSchema>): Promise<Receipt>;
  
  // Receipt item operations
  getReceiptItems(receiptId: number): Promise<ReceiptItem[]>;
  createReceiptItem(item: z.infer<typeof insertReceiptItemSchema>): Promise<ReceiptItem>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private receipts: Map<number, Receipt>;
  private receiptItems: Map<number, ReceiptItem>;
  
  private userId: number;
  private receiptId: number;
  private itemId: number;

  constructor() {
    this.users = new Map();
    this.receipts = new Map();
    this.receiptItems = new Map();
    
    this.userId = 1;
    this.receiptId = 1;
    this.itemId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: z.infer<typeof insertUserSchema>): Promise<User> {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Receipt methods
  async getAllReceipts(): Promise<Receipt[]> {
    return Array.from(this.receipts.values());
  }
  
  async getReceiptById(id: number): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }
  
  async createReceipt(insertReceipt: z.infer<typeof insertReceiptSchema>): Promise<Receipt> {
    const id = this.receiptId++;
    const receipt = { ...insertReceipt, id };
    this.receipts.set(id, receipt);
    return receipt;
  }
  
  // Receipt item methods
  async getReceiptItems(receiptId: number): Promise<ReceiptItem[]> {
    return Array.from(this.receiptItems.values()).filter(
      (item) => item.receiptId === receiptId
    );
  }
  
  async createReceiptItem(insertItem: z.infer<typeof insertReceiptItemSchema>): Promise<ReceiptItem> {
    const id = this.itemId++;
    const item = { ...insertItem, id };
    this.receiptItems.set(id, item);
    return item;
  }
}

// Export instance for use in application
export const storage = new MemStorage();
