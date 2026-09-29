import { useMemo } from "react";
import {
  Coffee,
  CupSoda,
  Dumbbell,
  ListPlus,
  ShoppingCart,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import type { SmartProduct } from "@/lib/smartAssistant";
import { buildShoppingList } from "@/lib/shoppingLists";

type Props = { products: SmartProduct[] };

const LIST_META: Record<string, { icon: typeof Coffee; tone: string; iconTone: string }> = {
  breakfast: { icon: Coffee, tone: "from-amber-50 to-orange-50", iconTone: "bg-amber-100 text-amber-700" },
  lunch: { icon: Utensils, tone: "from-emerald-50 to-teal-50", iconTone: "bg-emerald-100 text-emerald-700" },
  cleaning: { icon: Sparkles, tone: "from-sky-50 to-cyan-50", iconTone: "bg-sky-100 text-sky-700" },
  drinks: { icon: CupSoda, tone: "from-violet-50 to-fuchsia-50", iconTone: "bg-violet-100 text-violet-700" },
  snacks: { icon: Dumbbell, tone: "from-rose-50 to-pink-50", iconTone: "bg-rose-100 text-rose-700" },
  weekly: { icon: ListPlus, tone: "from-blue-50 to-indigo-50", iconTone: "bg-blue-100 text-blue-700" },
};

export default function SmartShoppingLists({ products }: Props) {
  const { addToCart } = useCart();
  const lists = useMemo(() => buildShoppingList(products), [products]);

  if (!lists.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-7" dir="rtl" aria-labelledby="shopping-lists-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold text-blue-600">اختيارات جاهزة من الكتالوج</p>
          </div>
          <h2 id="shopping-lists-title" className="mt-0.5 text-xl font-black text-slate-800 sm:text-2xl">
            قوائم تسوق جاهزة
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">تتحدث تلقائيًا حسب المتاح في الوحيد ماركت</p>
        </div>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {lists.map((list) => {
          const meta = LIST_META[list.id] ?? LIST_META.weekly;
          const Icon = meta.icon;

          return (
            <article
              key={list.id}
              className={`min-w-[245px] max-w-[270px] flex-1 snap-start rounded-2xl border border-white bg-gradient-to-br ${meta.tone} p-3 shadow-sm ring-1 ring-slate-100/70 transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconTone}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-black text-slate-800">{list.title}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">{list.products.length} منتجات متاحة</p>
                </div>
              </div>

              <p className="mt-2 line-clamp-1 text-[11px] text-slate-500">{list.description}</p>

              <div className="mt-2 flex min-h-6 gap-1 overflow-hidden">
                {list.products.slice(0, 3).map((product) => (
                  <span
                    key={product.id}
                    className="max-w-[90px] truncate rounded-full bg-white/75 px-2 py-1 text-[10px] font-semibold text-slate-600"
                  >
                    {product.name}
                  </span>
                ))}
                {list.products.length > 3 && (
                  <span className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-bold text-slate-500">
                    +{list.products.length - 3}
                  </span>
                )}
              </div>

              <Button
                type="button"
                disabled={!list.products.length}
                onClick={() => list.products.forEach((product) => addToCart(product))}
                className="mt-3 h-9 w-full rounded-xl bg-slate-900 text-xs font-black shadow-none hover:bg-slate-800"
              >
                <ShoppingCart className="ml-1.5 h-3.5 w-3.5" />
                أضف للسلة
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
