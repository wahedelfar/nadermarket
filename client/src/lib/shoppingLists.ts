import type { SmartProduct } from "@/lib/smartAssistant";

export type ShoppingList = {
  id: string;
  title: string;
  description: string;
  products: SmartProduct[];
};

const rules: Array<{ id: string; title: string; description: string; terms: string[] }> = [
  { id: "breakfast", title: "فطار", description: "أساسيات فطار يومي من المنتجات المتاحة.", terms: ["عيش", "توست", "جبن", "لبن", "زبادي", "مربى", "حلاوه", "عسل", "فول"] },
  { id: "lunch", title: "غداء", description: "اختيارات مناسبة لتجهيز غداء البيت.", terms: ["ارز", "مكرونه", "فراخ", "دجاج", "لحمه", "لحم", "تونه", "بطاطس", "خضار", "عدس"] },
  { id: "cleaning", title: "تنظيف البيت", description: "منتجات التنظيف المتاحة حاليًا.", terms: ["منظف", "مسحوق", "كلور", "صابون", "مطهر", "معطر", "ملمع"] },
  { id: "drinks", title: "مشروبات", description: "مشروبات للاستخدام اليومي والضيافة.", terms: ["مياه", "ماء", "عصير", "بيبسي", "كوكا", "مشروب", "شاي", "قهوه"] },
  { id: "snacks", title: "سناكس", description: "اختيارات خفيفة من الكتالوج الحالي.", terms: ["شيبسي", "بسكويت", "ويفر", "شوكولاته", "مقرمشات", "سناك"] },
  { id: "weekly", title: "مشتريات الأسبوع", description: "مزيج عملي من الأقسام الأساسية المتاحة.", terms: ["لبن", "جبن", "عيش", "ارز", "مكرونه", "زيت", "مياه", "منظف", "خضار", "فواكه"] },
];

const norm = (v: string) => v.toLowerCase()
  .replace(/[إأآ]/g, "ا")
  .replace(/ة/g, "ه")
  .replace(/ى/g, "ي");

export function availableForShoppingList(product: SmartProduct) {
  return product.isActive !== false && (product.stock === undefined || product.stock > 0);
}

export function buildShoppingList(products: SmartProduct[]): ShoppingList[] {
  const available = products.filter(availableForShoppingList);
  return rules.map((rule) => {
    const selected = available
      .map((product) => {
        const haystack = norm([product.name, product.description || "", product.categoryName || ""].join(" "));
        const score = rule.terms.reduce((sum, term) => sum + (haystack.includes(norm(term)) ? 1 : 0), 0);
        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || Number(a.product.price) - Number(b.product.price))
      .slice(0, 8)
      .map((item) => item.product);
    return { id: rule.id, title: rule.title, description: rule.description, products: selected };
  }).filter((list) => list.products.length > 0);
}
