import express from "express";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// @ts-expect-error Generated JavaScript bundle has no declaration file.
import { appRouter, createContext } from "../dist/api-server.js";

const app = express();
const internal = express();
const distPath = path.join(process.cwd(), "dist", "public");

internal.use(express.json({ limit: "50mb" }));
internal.use(express.urlencoded({ limit: "50mb", extended: true }));


internal.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use("/api/index", internal);
app.use(express.static(distPath));
app.use((_req: express.Request, res: express.Response) => res.sendFile(path.join(distPath, "index.html")));

export default app;
