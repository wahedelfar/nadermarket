import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { ADMIN_COOKIE_NAME, createAdminSession, getAdminCookieOptions, isAdminSession, validateAdminCredentials } from "./adminAuth";
import { seedDatabase } from "./seed";
import { z } from "zod";
import { getCategories, getCategoryById, getProducts, getProductById, getOrders, getOrderById, getOrderItems, getDb } from "./db";
import { categories, products, orders, orderItems, type InsertCategory, type InsertProduct, type InsertOrder, type InsertOrderItem } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  admin: router({
    login: publicProcedure
      .input(z.object({ email: z.string().email(), username: z.string().min(1), password: z.string().min(1) }))
      .mutation(({ input, ctx }) => {
        if (!validateAdminCredentials(input)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات الدخول غير صحيحة" });
        }
        ctx.res.cookie(ADMIN_COOKIE_NAME, createAdminSession(), getAdminCookieOptions(ctx.req));
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...getAdminCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
    me: publicProcedure.query(({ ctx }) => {
      if (!isAdminSession(ctx.req)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "يلزم تسجيل دخول المدير" });
      }
      return { authenticated: true } as const;
    }),
    seed: adminProcedure.mutation(async () => {
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
    create: adminProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.insert(categories).values(input as InsertCategory);
        return result;
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        const result = await db.update(categories).set(data).where(eq(categories.id, id));
        return result;
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.delete(categories).where(eq(categories.id, input));
      return result;
    }),
  }),

  products: router({
    list: publicProcedure.input(z.number().optional()).query(({ input }) => getProducts(input)),
    getById: publicProcedure.input(z.number()).query(({ input }) => getProductById(input)),
    create: adminProcedure
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
    update: adminProcedure
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
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.delete(products).where(eq(products.id, input));
      return result;
    }),
  }),

  orders: router({
    list: adminProcedure.query(() => getOrders()),
    getById: adminProcedure.input(z.number()).query(({ input }) => getOrderById(input)),
    getItems: adminProcedure.input(z.number()).query(({ input }) => getOrderItems(input)),
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
        
        try {
          const totalAmountDecimal = parseFloat(orderData.totalAmount).toString();
          
          const orderToInsert = {
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerAddress: orderData.customerAddress,
            totalAmount: totalAmountDecimal,
            vodafoneWalletNumber: orderData.vodafoneWalletNumber || null,
            paymentMethod: 'vodafone_cash',
            paymentStatus: 'pending' as const,
            status: 'pending' as const,
          } as InsertOrder
          
          // إدراج الطلب والحصول على ID
          const insertResult = await db.insert(orders).values(orderToInsert);
          
          // استخراج orderId من النتيجة
          let orderId: number;
          if (typeof insertResult === 'object' && insertResult !== null && 'insertId' in insertResult) {
            orderId = (insertResult as any).insertId as number;
          } else if (typeof insertResult === 'object' && insertResult !== null && 'lastInsertRowid' in insertResult) {
            orderId = (insertResult as any).lastInsertRowid as number;
          } else {
            // إذا فشل استخراج ID، نحاول الحصول على آخر طلب
            const lastOrder = await db.select().from(orders).orderBy(orders.id).limit(1);
            if (lastOrder.length === 0) throw new Error('فشل في الحصول على رقم الطلب');
            orderId = lastOrder[0].id;
          }
          
          // إدراج عناصر الطلب
          for (const item of items) {
            const priceDecimal = parseFloat(item.price).toString();
            const itemToInsert: InsertOrderItem = {
              orderId: orderId,
              productId: item.productId,
              quantity: item.quantity,
              price: priceDecimal,
            };
            await db.insert(orderItems).values(itemToInsert);
          }
          return { id: orderId, ...orderData };
        } catch (error: any) {
          throw new Error(`فشل إنشاء الطلب: ${error.message}`);
        }
      }),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
        return result;
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
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
