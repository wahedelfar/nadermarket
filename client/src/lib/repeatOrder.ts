import type { CartItem } from "@/lib/cartStorage";

export const LAST_ORDER_STORAGE_KEY = "nadermarket:last-order-v1";

export function saveLastOrder(items: CartItem[]) {
  try {
    localStorage.setItem(
      LAST_ORDER_STORAGE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        items,
      }),
    );
  } catch {
    // Local storage may be unavailable.
  }
}

export function getLastOrder(): CartItem[] {
  try {
    const raw = localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return [];
    return parsed.items.filter(
      (item: any) =>
        item &&
        Number.isFinite(Number(item.id)) &&
        typeof item.name === "string" &&
        typeof item.price === "string" &&
        Number(item.quantity) > 0,
    );
  } catch {
    return [];
  }
}
