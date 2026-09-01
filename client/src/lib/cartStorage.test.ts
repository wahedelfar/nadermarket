import { describe, expect, it } from "vitest";
import { parseStoredCart } from "./cartStorage";

describe("cart storage", () => {
  it("restores valid cart items", () => {
    const item = {
      id: 30001,
      categoryId: 1,
      name: "لحم بقري طازة",
      price: "120.00",
      image: "https://example.com/meat.webp",
      quantity: 2,
    };

    expect(parseStoredCart(JSON.stringify([item]))).toEqual([item]);
  });

  it("returns an empty cart for malformed or unsafe storage data", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("not-json")).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ id: 1 }))).toEqual([]);
    expect(parseStoredCart(JSON.stringify([
      { id: 1, categoryId: 1, name: "", price: "10", quantity: 1 },
      { id: 2, categoryId: 1, name: "Valid", price: "10", quantity: 0 },
    ]))).toEqual([]);
  });
});
