export type DiscountableProduct = {
  price: string | number;
  dailyOfferEnabled?: boolean;
  discountPercent?: string | number;
};

export function normalizedDiscountPercent(product: DiscountableProduct) {
  if (!product.dailyOfferEnabled) return 0;
  const value = Number(product.discountPercent ?? 0);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
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
