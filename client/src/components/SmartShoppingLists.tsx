import { useMemo } from "react";
import { ListPlus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import type { SmartProduct } from "@/lib/smartAssistant";
import { buildShoppingList } from "@/lib/shoppingLists";

type Props = { products: SmartProduct[] };

export default function SmartShoppingLists({ products }: Props) {
  const { addToCart } = useCart();
  const lists = useMemo(() => buildShoppingList(products), [products]);

  if (!lists.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8" dir="rtl" aria-labelledby="shopping-lists-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-blue-600">اختيارات جاهزة من الكتالوج</p>
          <h2 id="shopping-lists-title" className="text-2xl font-black text-slate-800">قوائم تسوق جاهزة</h2>
          <p className="mt-1 text-sm text-slate-500">القوائم تتحدث تلقائيًا مع المنتجات المتاحة في الوحيد ماركت.</p>
        </div>
        <ListPlus className="hidden h-7 w-7 text-blue-600 sm:block" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <div key={list.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800">{list.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{list.description}</p>
              </div>
              <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{list.products.length} منتجات</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {list.products.slice(0, 5).map((product) => (
                <span key={product.id} className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {product.name}
                </span>
              ))}
            </div>

            <Button
              type="button"
              disabled={!list.products.length}
              onClick={() => list.products.forEach((product) => addToCart(product))}
              className="mt-4 w-full rounded-xl bg-blue-600 font-black hover:bg-blue-700"
            >
              <ShoppingCart className="ml-2 h-4 w-4" />
              أضف القائمة للسلة
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
