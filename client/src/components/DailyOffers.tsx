import { Flame, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { getDailyOffers } from "@/lib/dailyOffers";
import type { SmartProduct } from "@/lib/smartAssistant";

type Props = { products: SmartProduct[] };

export default function DailyOffers({ products }: Props) {
  const { addToCart } = useCart();
  const offers = getDailyOffers(products);
  if (!offers.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-7" dir="rtl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Flame className="h-5 w-5" /></span>
          <div><h2 className="text-2xl font-black text-gray-800">🔥 العروض اليوم</h2><p className="text-xs text-gray-500">اختيارات العرض المتاحة حاليًا من الكتالوج</p></div>
        </div>
        <Link href="/products" className="text-sm font-bold text-blue-600 hover:text-blue-800">عرض كل المنتجات</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {offers.map((product) => (
          <Card key={product.id} className="overflow-hidden border-orange-100 bg-white shadow-sm">
            <div className="relative bg-orange-50">
              <span className="absolute right-2 top-2 z-10 rounded-full bg-orange-600 px-2 py-1 text-[10px] font-black text-white">عرض اليوم</span>
              <img src={product.image || "/icon.svg"} alt={product.name} className="h-36 w-full object-cover" />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-black text-gray-800">{product.name}</p>
              <p className="mt-1 text-lg font-black text-blue-800">{Number(product.price).toFixed(2)} ج.م</p>
              <Button onClick={() => addToCart(product)} disabled={product.stock === 0} className="mt-2 w-full bg-orange-600 text-xs hover:bg-orange-700"><Plus className="ml-1 h-4 w-4" /> أضف للسلة</Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
