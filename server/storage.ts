import { db } from "./db";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { eq, desc, sum, count, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(filters?: { category?: string; status?: string; search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getStats(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    categoriesCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { category?: string; status?: string; search?: string }): Promise<Product[]> {
    let query = db.select().from(products);
    
    // Simple in-memory filtering for now as Drizzle query building with conditionals is verbose without helper
    // For a real app, I'd build the where clause dynamically
    const allProducts = await query.orderBy(desc(products.id));
    
    return allProducts.filter(p => {
      if (filters?.category && p.category !== filters.category) return false;
      if (filters?.status) {
        const stockStatus = p.quantity === 0 ? 'out_of_stock' : p.quantity < 10 ? 'low_stock' : 'in_stock';
        if (stockStatus !== filters.status) return false;
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return p.name.toLowerCase().includes(searchLower) || p.sku.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getStats() {
    // Using raw SQL or separate queries for aggregation
    const allProducts = await db.select().from(products);
    
    const totalProducts = allProducts.length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = allProducts.filter(p => p.quantity < 10).length;
    const categoriesCount = new Set(allProducts.map(p => p.category)).size;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      categoriesCount
    };
  }
}

export const storage = new DatabaseStorage();
