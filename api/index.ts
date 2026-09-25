import express from "express";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";

const app = express();
const internal = express();
const distPath = path.join(process.cwd(), "dist", "public");

internal.use(express.json({ limit: "50mb" }));
internal.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(internal);
registerOAuthRoutes(internal);

internal.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use("/api/index", internal);
app.use(express.static(distPath));
app.use((_req, res) => res.sendFile(path.join(distPath, "index.html")));

export default app;
