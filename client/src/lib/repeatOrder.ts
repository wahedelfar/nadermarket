import { parseStoredCart, type CartItem } from "@/lib/cartStorage";

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
    return parseStoredCart(window.localStorage.getItem(LAST_ORDER_STORAGE_KEY));
  } catch {
    return [];
  }
}
