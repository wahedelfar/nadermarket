import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

describe("storefront admin entry point", () => {
  it("does not render a visible admin button in the header", () => {
    expect(homeSource).not.toContain("دخول الإدارة");
    expect(homeSource).not.toContain("LockKeyhole");
  });

  it("keeps the hidden admin route on the 2026 footer year", () => {
    expect(homeSource).toMatch(
      /<Link href="\/admin" aria-label="الدخول إلى لوحة الإدارة"[^>]*>2026<\/Link>/,
    );
  });
});
