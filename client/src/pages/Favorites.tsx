import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { getFavoriteIds, toggleFavorite } from "@/lib/favorites";

export default function Favorites() {
  const { addToCart, items } = useCart();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const { data: productsData, isLoading } = trpc.products.list.useQuery();

  const sync = () => setFavoriteIds(getFavoriteIds());

  useEffect(() => {
    sync();
    const handler = () => sync();
    window.addEventListener("nader-market:favorites-changed", handler);
    return () => window.removeEventListener("nader-market:favorites-changed", handler);
  }, []);

  const products = useMemo(
    () => (productsData ?? []).filter((product) => favoriteIds.includes(Number(product.id))),
    [productsData, favoriteIds],
  );

  return (
    <div className="min-h-screen bg-[#e8f6ff]" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black text-blue-800">الوحيد ماركت</Link>
          <Link href="/products">
            <Button variant="outline" className="rounded-xl">تصفح المنتجات</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-600">محفوظة عندك</p>
            <h1 className="text-3xl font-black text-slate-800">منتجاتك المفضلة</h1>
            <p className="mt-1 text-sm text-slate-500">المفضلة محفوظة على جهازك ولا تغيّر بيانات المتجر.</p>
          </div>
          <Heart className="h-9 w-9 fill-current text-rose-500" />
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-blue-100" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <Heart className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-3 text-xl font-black text-slate-700">لسه مفيش منتجات مفضلة</h2>
            <p className="mt-1 text-sm text-slate-500">اضغط على القلب بجوار أي منتج لحفظه هنا.</p>
            <Link href="/products">
              <Button className="mt-5 rounded-xl bg-blue-600 hover:bg-blue-700">تصفح المنتجات</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <div className="relative h-52 bg-blue-50">
                  {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : null}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute left-3 top-3 rounded-full bg-white/95 p-2 text-rose-500 shadow"
                    aria-label="إزالة من المفضلة"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <Link href={`/product/${product.id}`}>
                    <h2 className="font-black text-slate-800 hover:text-blue-700">{product.name}</h2>
                  </Link>
                  <p className="mt-2 text-xl font-black text-blue-800">{Number(product.price).toFixed(2)} ج.م</p>
                  {product.stock === 0 ? (
                    <p className="mt-2 text-sm font-bold text-rose-600">غير متوفر حاليًا</p>
                  ) : (
                    <Button onClick={() => addToCart(product)} className="mt-4 w-full rounded-xl bg-blue-600 hover:bg-blue-700">
                      <ShoppingCart className="ml-2 h-4 w-4" />
                      أضف للسلة
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-sm text-slate-500">
          {items.length > 0 ? `في السلة الآن ${items.length} منتجات مختلفة.` : ""}
        </div>
      </main>
    </div>
  );
}
