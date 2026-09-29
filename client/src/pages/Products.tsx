import { useEffect, useMemo, useState } from "react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { getFavoriteIds, toggleFavorite } from "@/lib/favorites";
import { askSmartAssistant, type SmartProduct } from "@/lib/smartAssistant";
import { discountedPrice, normalizedDiscountPercent, hasDiscount } from "@/lib/productPricing";

export default function Products() {
  const [location] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const { addToCart, items } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const categoryId = params.get("category");
    const searchParam = params.get("search") || "";
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setSearch(searchParam);
  }, [location]);

  useEffect(() => {
    const sync = () => setFavoriteIds(getFavoriteIds());
    sync();
    const handler = () => sync();
    window.addEventListener("nader-market:favorites-changed", handler);
    return () => window.removeEventListener("nader-market:favorites-changed", handler);
  }, []);

  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery(selectedCategory || undefined);
  const { data: categoriesData } = trpc.categories.list.useQuery();

  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  useEffect(() => {
    if (categoriesData) setCategories(categoriesData);
  }, [categoriesData]);

  const smartProducts = useMemo(
    () => products.map((product) => ({
      ...product,
      categoryName: categories.find((category) => Number(category.id) === Number(product.categoryId))?.name ?? null,
    })) as SmartProduct[],
    [products, categories],
  );

  const searchResults = useMemo(
    () => search.trim() ? askSmartAssistant(search, smartProducts).products : smartProducts,
    [search, smartProducts],
  );

  return (
    <div className="min-h-screen bg-[#e8f6ff]" dir="rtl">
      <header className="sticky top-0 z-50 bg-gradient-to-l from-[#9fd8ff] via-[#bfe7ff] to-[#dff3ff] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/">
            <h1 className="cursor-pointer text-2xl font-black text-blue-800">الوحيد ماركت</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/favorites">
              <Button variant="outline" className="rounded-xl border-rose-200 text-rose-600">
                <Heart className="ml-2 h-4 w-4" /> المفضلة
              </Button>
            </Link>
            <Link href="/cart">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="ml-2 h-4 w-4" /> السلة
                {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-black text-blue-700">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-black text-gray-800">الأقسام</h2>
              <div className="space-y-2">
                <Button onClick={() => setSelectedCategory(null)} variant={selectedCategory === null ? "default" : "outline"} className="w-full justify-start">
                  جميع المنتجات
                </Button>
                {categories.map((category) => (
                  <Button key={category.id} onClick={() => setSelectedCategory(category.id)} variant={selectedCategory === category.id ? "default" : "outline"} className="w-full justify-start">
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-800">
                  {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name || "المنتجات" : "جميع المنتجات"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">ابحث باسم المنتج أو اكتب طلبك بطريقة طبيعية.</p>
              </div>
              <Link href="/favorites" className="text-sm font-black text-rose-600">❤️ المفضلة ({favoriteIds.length})</Link>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 shrink-0 text-blue-600" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="مثال: جبنة للفطار، أرخص لبن، حاجة ساقعة..."
                  className="w-full bg-transparent px-2 py-2 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  aria-label="البحث الذكي عن المنتجات"
                />
                {search && <button type="button" onClick={() => setSearch("")} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100">مسح</button>}
              </div>
              <p className="mt-2 px-7 text-[11px] text-slate-400">البحث يعتمد على المنتجات المتاحة حاليًا فقط.</p>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-80 animate-pulse rounded-lg bg-blue-100" />)}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="rounded-2xl bg-white/70 py-12 text-center">
                <p className="text-xl text-gray-600">{search ? "لم أجد منتجات مطابقة حاليًا" : "لا توجد منتجات في هذا القسم"}</p>
                {search && <p className="mt-2 text-sm text-slate-500">جرّب اسمًا مختلفًا أو اطلب من «إسألني».</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((product) => {
                  const favorite = favoriteIds.includes(Number(product.id));
                  return (
                    <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative bg-blue-50">
                        {product.image ? <img src={product.image} alt={product.name} className="h-48 w-full object-cover" /> : <div className="h-48" />}
                        <button
                          type="button"
                          onClick={() => { toggleFavorite(product.id); setFavoriteIds(getFavoriteIds()); }}
                          aria-label={favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                          className="absolute left-3 top-3 rounded-full bg-white/95 p-2 text-rose-500 shadow-md"
                        >
                          <Heart className={favorite ? "h-5 w-5 fill-current" : "h-5 w-5"} />
                        </button>
                        {product.stock === 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><span className="font-bold text-white">غير متوفر</span></div>}
                      </div>
                      <div className="p-4">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="cursor-pointer text-lg font-bold text-gray-800 hover:text-blue-600">{product.name}</h3>
                        </Link>
                        {product.description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description.replace(/\[?(عرض|خصم) اليوم\]?/g, "").trim()}</p>}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-right">{hasDiscount(product) ? <><span className="block text-xs text-gray-400 line-through">{Number(product.price).toFixed(2)} ج.م</span><span className="text-2xl font-black text-blue-800">{discountedPrice(product).toFixed(2)} ج.م</span><span className="mr-2 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-black text-red-600">خصم {normalizedDiscountPercent(product)}%</span></> : <span className="text-2xl font-black text-blue-800">{Number(product.price).toFixed(2)} ج.م</span>}</div>
                          <span className="text-sm text-gray-600">المتوفر: {product.stock}</span>
                        </div>
                        <Button onClick={() => addToCart(product)} disabled={product.stock === 0} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                          <ShoppingCart className="ml-2 h-4 w-4" /> أضف للسلة
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
