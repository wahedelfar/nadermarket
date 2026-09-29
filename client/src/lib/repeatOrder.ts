import type { CartItem } from "@/lib/cartStorage";

const LAST_ORDER_STORAGE_KEY = "nader-market:last-order-v2";

export function saveLastOrder(items: CartItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;

  try {
    window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}

export function getLastOrder(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!rawValue) return [];

    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const value = item as Partial<CartItem>;
      return (
        Number.isInteger(value.id) &&
        Number.isInteger(value.categoryId) &&
        typeof value.name === "string" &&
        typeof value.price === "string" &&
        typeof value.quantity === "number" &&
        Number.isInteger(value.quantity) &&
        value.quantity > 0 &&
        value.name.trim().length > 0
      );
    });
  } catch {
    return [];
  }
}
