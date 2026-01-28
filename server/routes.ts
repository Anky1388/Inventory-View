import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Products API
  app.get(api.products.list.path, async (req, res) => {
    const filters = {
      search: req.query.search as string | undefined,
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
    };
    const products = await storage.getProducts(filters);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      // Auto-calculate status based on quantity if needed, but schema defaults handled
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.products.getStats.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Seed data function
  async function seedDatabase() {
    const existing = await storage.getProducts();
    if (existing.length === 0) {
      const initialProducts = [
        {
          name: "Wireless Headphones",
          sku: "WH-001",
          quantity: 45,
          price: 12999, // $129.99
          category: "Electronics",
          status: "in_stock",
          description: "Premium noise-cancelling wireless headphones with 30h battery life.",
        },
        {
          name: "Ergonomic Office Chair",
          sku: "FUR-023",
          quantity: 8,
          price: 24900, // $249.00
          category: "Furniture",
          status: "low_stock",
          description: "Mesh back ergonomic chair with lumbar support.",
        },
        {
          name: "Mechanical Keyboard",
          sku: "TECH-105",
          quantity: 120,
          price: 8950, // $89.50
          category: "Electronics",
          status: "in_stock",
          description: "RGB mechanical keyboard with blue switches.",
        },
        {
          name: "USB-C Hub",
          sku: "ACC-004",
          quantity: 0,
          price: 4500, // $45.00
          category: "Accessories",
          status: "out_of_stock",
          description: "7-in-1 USB-C hub with HDMI and PD charging.",
        },
        {
          name: "Monitor Stand",
          sku: "ACC-012",
          quantity: 25,
          price: 3500, // $35.00
          category: "Accessories",
          status: "in_stock",
          description: "Adjustable aluminum monitor stand.",
        }
      ];

      for (const p of initialProducts) {
        await storage.createProduct(p);
      }
      console.log('Database seeded with initial products');
    }
  }

  // Run seed
  seedDatabase().catch(console.error);

  return httpServer;
}
