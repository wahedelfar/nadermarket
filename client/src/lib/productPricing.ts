export type DiscountableProduct = {
  price: string | number;
  description?: string | null;
  dailyOfferEnabled?: boolean;
  discountPercent?: string | number;
};

function markerDiscount(product: DiscountableProduct) {
  const match = String(product.description || "").match(/\[خصم\s*:\s*(\d{1,3}(?:\.\d{1,2})?)\]/);
  return match ? Number(match[1]) : 0;
}

export function normalizedDiscountPercent(product: DiscountableProduct) {
  const structured = Number(product.discountPercent ?? 0);
  const raw = product.dailyOfferEnabled ? structured : markerDiscount(product);
  return Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
}

export function discountedPrice(product: DiscountableProduct) {
  const original = Number(product.price);
  const discount = normalizedDiscountPercent(product);
  if (!Number.isFinite(original)) return 0;
  return Math.round((original * (1 - discount / 100) + Number.EPSILON) * 100) / 100;
}

export function hasDiscount(product: DiscountableProduct) {
  return normalizedDiscountPercent(product) > 0;
}
