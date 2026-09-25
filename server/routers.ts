import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  getAdminCookieOptions,
  isAdminSession,
  validateAdminCredentials,
} from "./adminAuth";
import {
  getStoreSettings,
  updateStoreSettings,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  createProduct,
  uploadProductImage,
  uploadPaymentProof,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderById,
  getOrderItems,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "./db";
import { seedDatabase } from "./seed";
import { z } from "zod";

const requireAdmin = (ctx: any) => {
  if (!isAdminSession(ctx.req)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "يلزم تسجيل دخول المدير" });
  }
};

export const appRouter = router({
  system: systemRouter,

  admin: router({
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
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
      requireAdmin(ctx);
      return { authenticated: true } as const;
    }),

    seed: adminProcedure.mutation(async () => {
      try {
        await seedDatabase();
        return { success: true, message: "تم إضافة البيانات الافتراضية بنجاح" };
      } catch (error: any) {
        return { success: false, message: error?.message || "تعذر تهيئة البيانات" };
      }
    }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  store: router({
    settings: publicProcedure.query(() => getStoreSettings()),
    updateSettings: adminProcedure
      .input(z.object({ vodafoneCashNumber: z.string().regex(/^01[0125][0-9]{8}$/, "رقم فودافون كاش يجب أن يكون 11 رقمًا") }))
      .mutation(({ input }) => updateStoreSettings(input)),
  }),

  categories: router({
    list: publicProcedure.query(() => getCategories()),
    getById: publicProcedure.input(z.number()).query(({ input }) => getCategoryById(input)),
    create: adminProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(({ input }) => createCategory(input)),
    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(({ input }) => updateCategory(input)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => deleteCategory(input)),
  }),

  products: router({
    list: publicProcedure.input(z.number().optional()).query(({ input }) => getProducts(input)),
    getById: publicProcedure.input(z.number()).query(({ input }) => getProductById(input)),
    uploadImage: adminProcedure
      .input(z.object({
        base64: z.string().min(1).max(4_000_000),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
      }))
      .mutation(({ input }) => uploadProductImage(input)),
    create: adminProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        image: z.string().optional(),
        stock: z.number().default(0),
        isActive: z.boolean().optional(),
      }))
      .mutation(({ input }) => createProduct(input)),
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
      .mutation(({ input }) => updateProduct(input)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => deleteProduct(input)),
  }),

  orders: router({
    uploadPaymentProof: publicProcedure
      .input(z.object({
        base64: z.string().min(1).max(4_000_000),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
      }))
      .mutation(({ input }) => uploadPaymentProof(input)),
    list: adminProcedure.query(() => getOrders()),
    getById: adminProcedure.input(z.number()).query(({ input }) => getOrderById(input)),
    getItems: adminProcedure.input(z.number()).query(({ input }) => getOrderItems(input)),
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل يجب أن يكون رقمًا مصريًا صحيحًا مكوّنًا من 11 رقمًا"),
        customerAddress: z.string(),
        totalAmount: z.string(),
        paymentMethod: z.enum(["cash_on_delivery", "vodafone_cash"]),
        vodafoneWalletNumber: z.string().optional(),
        paymentProofUrl: z.string().url().optional(),
        items: z.array(z.object({ productId: z.number(), quantity: z.number(), price: z.string() })),
      }))
      .mutation(({ input }) => createOrder(input)),
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]),
      }))
      .mutation(({ input }) => updateOrderStatus(input.id, input.status)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => deleteOrder(input)),
  }),
});

export type AppRouter = typeof appRouter;
