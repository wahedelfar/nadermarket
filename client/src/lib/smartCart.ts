import type { CartItem } from "@/lib/cartStorage";
import type { SmartProduct } from "@/lib/smartAssistant";

export type CartInsight = {
  type: "warning" | "suggestion" | "alternative" | "info";
  text: string;
  products: SmartProduct[];
};

const norm = (v: string) =>
  v.toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\u0600-\u06ffa-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const available = (p: SmartProduct) => p.isActive !== false && (p.stock === undefined || p.stock > 0);
const price = (p: SmartProduct) => Number(p.price) || 0;

export function buildCartInsights(items: CartItem[], products: SmartProduct[]): CartInsight[] {
  if (!items.length) return [];

  const live = products.filter(available);
  const insights: CartInsight[] = [];
  const cartIds = new Set(items.map((item) => Number(item.id)));

  const unavailable = items.filter((item) => !live.some((p) => Number(p.id) === Number(item.id)));
  if (unavailable.length) {
    insights.push({
      type: "warning",
      text: `راجع ${unavailable.length} منتج في السلة؛ بعض المنتجات لم تعد متاحة حاليًا.`,
      products: [],
    });
  }

  const expensiveItems = items
    .map((item) => {
      const product = live.find((p) => Number(p.id) === Number(item.id));
      if (!product) return null;
      const alternatives = live
        .filter((p) =>
          Number(p.id) !== Number(item.id) &&
          Number(p.categoryId) === Number(product.categoryId) &&
          !cartIds.has(Number(p.id)) &&
          price(p) > 0 &&
          price(p) < price(product),
        )
        .sort((a, b) => price(a) - price(b))
        .slice(0, 2);
      return alternatives.length ? { product, alternatives } : null;
    })
    .filter(Boolean) as Array<{ product: SmartProduct; alternatives: SmartProduct[] }>;

  if (expensiveItems.length) {
    const first = expensiveItems[0];
    insights.push({
      type: "alternative",
      text: `ممكن توفّر في ${first.product.name}؛ عندي بديل أرخص من نفس القسم.`,
      products: first.alternatives,
    });
  }

  const cartText = norm(items.map((item) => item.name).join(" "));
  const basketHints = [
    { terms: ["لبن", "حليب"], need: ["جبنه", "جبن", "عيش", "خبز", "توست"], text: "لو ده فطار، ممكن تكمله بعيش أو جبن من الموجود." },
    { terms: ["ارز", "مكرونه", "بطاطس"], need: ["فراخ", "دجاج", "لحمه", "لحم", "تونه"], text: "السلة فيها أساس للغداء؛ ممكن تكملها بمصدر بروتين مناسب." },
    { terms: ["شيبسي", "بسكويت", "شوكولاته"], need: ["مشروب", "عصير", "مياه"], text: "ممكن تكمل السناكس بمشروب مناسب." },
  ];
  for (const hint of basketHints) {
    if (hint.terms.some((term) => cartText.includes(norm(term))) && !hint.need.some((term) => cartText.includes(norm(term)))) {
      const suggestions = live
        .filter((p) => !cartIds.has(Number(p.id)) && hint.need.some((term) => norm(`${p.name} ${p.description || ""} ${p.categoryName || ""}`).includes(norm(term))))
        .sort((a, b) => price(a) - price(b))
        .slice(0, 3);
      if (suggestions.length) {
        insights.push({ type: "suggestion", text: hint.text, products: suggestions });
        break;
      }
    }
  }

  return insights.slice(0, 3);
}
