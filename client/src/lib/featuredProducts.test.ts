import { describe, expect, it } from "vitest";
import {
  getNextSlideIndex,
  getPreviousSlideIndex,
  selectFeaturedProducts,
  SLIDER_INTERVAL_MS,
} from "./featuredProducts";

describe("featured products slider helpers", () => {
  it("uses a five-second auto-advance interval", () => {
    expect(SLIDER_INTERVAL_MS).toBe(5000);
  });
  it("selects active in-stock products in newest-first order", () => {
    const products = [
      { id: 1, name: "قديم", isActive: true, stock: 4, createdAt: "2026-01-01" },
      { id: 2, name: "أحدث", isActive: true, stock: 2, createdAt: "2026-03-01" },
      { id: 3, name: "غير متاح", isActive: true, stock: 0, createdAt: "2026-04-01" },
      { id: 4, name: "مخفي", isActive: false, stock: 8, createdAt: "2026-05-01" },
    ];

    expect(selectFeaturedProducts(products).map((product) => product.id)).toEqual([2, 1]);
  });

  it("respects the maximum number of slides", () => {
    const products = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      isActive: true,
      stock: 1,
      createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`,
    }));

    expect(selectFeaturedProducts(products, 3)).toHaveLength(3);
  });

  it("wraps next and previous indexes for a circular slider", () => {
    expect(getNextSlideIndex(5, 6)).toBe(0);
    expect(getPreviousSlideIndex(0, 6)).toBe(5);
    expect(getNextSlideIndex(0, 0)).toBe(0);
    expect(getPreviousSlideIndex(0, 0)).toBe(0);
  });
});
