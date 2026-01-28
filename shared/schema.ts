import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  quantity: integer("quantity").notNull().default(0),
  price: integer("price").notNull(), // Store in cents to avoid floating point errors
  category: text("category").notNull(),
  status: text("status").notNull().default('in_stock'), // in_stock, low_stock, out_of_stock
  description: text("description"),
  imageUrl: text("image_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  lastUpdated: true 
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// API Types
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;

export type ProductResponse = Product;
export type ProductsListResponse = Product[];
