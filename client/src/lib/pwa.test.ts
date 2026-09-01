import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync(new URL("../../public/manifest.webmanifest", import.meta.url), "utf8"),
);

describe("Nader Market PWA manifest", () => {
  it("defines the Arabic standalone shopping app", () => {
    expect(manifest.name).toContain("نادر ماركت");
    expect(manifest.lang).toBe("ar-EG");
    expect(manifest.dir).toBe("rtl");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
  });

  it("includes regular, Apple, and maskable icon sizes", () => {
    const icons = manifest.icons as Array<{ sizes: string; purpose?: string }>;
    expect(icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
    ]));
  });
});
