import { Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { buildCartInsights } from "@/lib/smartCart";
import type { SmartProduct } from "@/lib/smartAssistant";

type Props = { items: ReturnType<typeof useCart>["items"]; products: SmartProduct[] };

export default function SmartCartInsights({ items, products }: Props) {
  const { addToCart } = useCart();
  const insights = buildCartInsights(items, products);
  if (!insights.length) return null;

  return (
    <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5">
      <div className="mb-4 flex items-center gap-2" dir="rtl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Sparkles className="h-5 w-5" /></span>
        <div><h2 className="font-black text-gray-800">مساعد السلة</h2><p className="text-xs text-gray-500">اقتراحات مبنية على السلة والمنتجات المتاحة الآن</p></div>
      </div>
      <div className="space-y-3" dir="rtl">
        {insights.map((insight, index) => (
          <div key={index} className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-sm font-bold leading-6 text-slate-700">{insight.text}</p>
            {insight.products.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {insight.products.map((product) => (
                  <div key={product.id} className="min-w-[170px] rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <div className="flex items-center gap-2">
                      <img src={product.image || "/icon.svg"} alt="" className="h-12 w-12 rounded-lg bg-white object-cover" />
                      <div className="min-w-0"><p className="line-clamp-2 text-xs font-black text-slate-800">{product.name}</p><p className="text-xs font-bold text-blue-700">{Number(product.price).toFixed(2)} ج.م</p></div>
                    </div>
                    <Button onClick={() => addToCart(product)} size="sm" className="mt-2 w-full bg-blue-600 text-xs hover:bg-blue-700"><Plus className="ml-1 h-3.5 w-3.5" /> أضف للسلة</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
