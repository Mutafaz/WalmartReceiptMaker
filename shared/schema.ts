import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for auth purposes
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Receipt schema for storing receipt data
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  storeNumber: text("store_number").notNull(),
  storeAddress: text("store_address").notNull(),
  storeCity: text("store_city").notNull(),
  storeStateZip: text("store_state_zip").notNull(),
  storePhone: text("store_phone").notNull(),
  receiptDate: text("receipt_date").notNull(),
  cashier: text("cashier").notNull(),
  register: text("register").notNull(),
  taxRate: text("tax_rate").notNull(),
  paymentMethod: text("payment_method").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
});

// Receipt items schema for storing items on a receipt
export const receiptItems = pgTable("receipt_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").references(() => receipts.id).notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  quantity: text("quantity").notNull(),
});

export const insertReceiptItemSchema = createInsertSchema(receiptItems).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;

export type InsertReceiptItem = z.infer<typeof insertReceiptItemSchema>;
export type ReceiptItem = typeof receiptItems.$inferSelect;
