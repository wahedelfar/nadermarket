import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { seedDatabase } from "./seed";
import { z } from "zod";
import { getCategories, getCategoryById, getProducts, getProductById, getOrders, getOrderById, getOrderItems, getDb } from "./db";
import { categories, products, orders, orderItems, type InsertCategory, type InsertProduct, type InsertOrder, type InsertOrderItem } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  admin: router({
    seed: publicProcedure.mutation(async () => {
      try {
        await seedDatabase();
        return { success: true, message: "تم إضافة البيانات الافتراضية بنجاح" };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(() => getCategories()),
    getById: publicProcedure.input(z.number()).query(({ input }) => getCategoryById(input)),
    create: protectedProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.insert(categories).values(input as InsertCategory);
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        const result = await db.update(categories).set(data).where(eq(categories.id, id));
        return result;
      }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.delete(categories).where(eq(categories.id, input));
      return result;
    }),
  }),

  products: router({
    list: publicProcedure.input(z.number().optional()).query(({ input }) => getProducts(input)),
    getById: publicProcedure.input(z.number()).query(({ input }) => getProductById(input)),
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        image: z.string().optional(),
        stock: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.insert(products).values(input as InsertProduct);
        return result;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        image: z.string().optional(),
        stock: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        const result = await db.update(products).set(data).where(eq(products.id, id));
        return result;
      }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.delete(products).where(eq(products.id, input));
      return result;
    }),
  }),

  orders: router({
    list: protectedProcedure.query(() => getOrders()),
    getById: protectedProcedure.input(z.number()).query(({ input }) => getOrderById(input)),
    getItems: protectedProcedure.input(z.number()).query(({ input }) => getOrderItems(input)),
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        customerAddress: z.string(),
        totalAmount: z.string(),
        vodafoneWalletNumber: z.string().optional(),
        items: z.array(z.object({ productId: z.number(), quantity: z.number(), price: z.string() })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { items, ...orderData } = input;
        
        // تحويل totalAmount إلى رقم عشري
        const orderToInsert = {
          ...orderData,
          totalAmount: parseFloat(orderData.totalAmount).toFixed(2),
        };
        
        const result = await db.insert(orders).values(orderToInsert as InsertOrder);
        const orderId = (result as any).insertId;
        
        // إدراج عناصر الطلب مع تحويل السعر إلى رقم عشري
        for (const item of items) {
          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price).toFixed(2),
          } as InsertOrderItem);
        }
        return { id: orderId, ...orderData };
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
        return result;
      }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.delete(orders).where(eq(orders.id, input));
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;

if (process.env.NODE_ENV === "development") {
  // يمكن تشغيل seed هنا إذا أردت
}
