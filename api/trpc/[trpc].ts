import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// The API bundle is generated during the Vercel build and intentionally has no declaration file.
// @ts-expect-error Generated JavaScript bundle.
import { appRouter, createContext } from "../../dist/api-server.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;
