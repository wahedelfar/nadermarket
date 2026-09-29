import type { SmartProduct } from "@/lib/smartAssistant";

const OFFER_MARKERS = ["عرض اليوم", "عروض اليوم", "عرض", "خصم", "تخفيض"];

export function getDailyOffers(products: SmartProduct[]) {
  return products
    .filter((product) => product.isActive !== false && (product.stock === undefined || product.stock > 0))
    .filter((product) => {
      const text = `${product.name} ${product.description || ""}`.toLowerCase();
      return OFFER_MARKERS.some((marker) => text.includes(marker));
    })
    .slice(0, 8);
}
