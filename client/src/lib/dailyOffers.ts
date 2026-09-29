import type { SmartProduct } from "@/lib/smartAssistant";
import { hasDiscount, normalizedDiscountPercent } from "@/lib/productPricing";

export const isDailyOffer = (product: SmartProduct) =>
  product.isActive !== false &&
  (product.stock === undefined || product.stock > 0) &&
  Boolean(product.dailyOfferEnabled) &&
  normalizedDiscountPercent(product) > 0;

export const dailyOffers = (products: SmartProduct[]) =>
  products.filter(isDailyOffer).sort((a, b) => normalizedDiscountPercent(b) - normalizedDiscountPercent(a) || Number(a.price) - Number(b.price));

export const cleanOfferDescription = (description: string) =>
  String(description || "").replace(/\[?(عرض|خصم) اليوم\]?/g, "").replace(/\s{2,}/g, " ").trim();

export { hasDiscount };
