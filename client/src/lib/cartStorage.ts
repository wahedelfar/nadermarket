export interface CartItem {
  id: number;
  categoryId: number;
  name: string;
  price: string;
  image?: string;
  quantity: number;
}

export const CART_STORAGE_KEY = "nader-market-cart";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;
  return (
    Number.isInteger(item.id) &&
    Number.isInteger(item.categoryId) &&
    typeof item.name === "string" &&
    typeof item.price === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.name.trim().length > 0
  );
}

export function parseStoredCart(rawValue: string | null): CartItem[] {
  if (!rawValue) return [];

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}
