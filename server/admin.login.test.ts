import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { ADMIN_COOKIE_NAME } from "./adminAuth";

describe("admin login procedure", () => {
  it("accepts the configured credentials and creates an httpOnly session cookie", async () => {
    const cookie = vi.fn();
    const caller = appRouter.createCaller({
      req: { protocol: "http", headers: {} } as any,
      res: { cookie } as any,
      user: null,
    });

    const result = await caller.admin.login({
      email: "akardomiat@gmail.com",
      username: "nader",
      password: "nadermarket",
    });

    expect(result.success).toBe(true);
    expect(cookie).toHaveBeenCalledWith(
      ADMIN_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ httpOnly: true, path: "/", maxAge: expect.any(Number) }),
    );
  });

  it("rejects invalid credentials without creating a session", async () => {
    const cookie = vi.fn();
    const caller = appRouter.createCaller({
      req: { protocol: "http", headers: {} } as any,
      res: { cookie } as any,
      user: null,
    });

    await expect(
      caller.admin.login({
        email: "wrong@example.com",
        username: "nader",
        password: "nadermarket",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
  });
});
