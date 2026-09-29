import type { SmartProduct } from "@/lib/smartAssistant";

export const DAILY_OFFER_MARKERS = ["[عرض اليوم]", "عرض اليوم", "[خصم اليوم]", "خصم اليوم"];

export const isDailyOffer = (product: SmartProduct) => {
  const description = String(product.description || "");
  return DAILY_OFFER_MARKERS.some((marker) => description.includes(marker)) && product.isActive !== false && (product.stock === undefined || product.stock > 0);
};

export const dailyOffers = (products: SmartProduct[]) =>
  products.filter(isDailyOffer).sort((a, b) => Number(a.price) - Number(b.price));

export const cleanOfferDescription = (description: string) =>
  DAILY_OFFER_MARKERS.reduce((text, marker) => text.replaceAll(marker, "").replace(/\s{2,}/g, " ").trim(), description);
