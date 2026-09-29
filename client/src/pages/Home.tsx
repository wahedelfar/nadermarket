import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Search, ShoppingCart, Truck, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { getLastOrder } from "@/lib/repeatOrder";
import SmartAssistant from "@/components/SmartAssistant";
import SmartShoppingLists from "@/components/SmartShoppingLists";
import DailyOfferPopup from "@/components/DailyOfferPopup";
import { dailyOffers } from "@/lib/dailyOffers";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const { addToCart, items } = useCart();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [lastOrder, setLastOrder] = useState<any[]>([]);
  const { data: categoriesData, isLoading } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery();

  const assistantProducts = (productsData ?? []).map((product) => ({
    ...product,
    categoryName: categoriesData?.find((category) => Number(category.id) === Number(product.categoryId))?.name ?? null,
  }));
  const repeatableOrder = lastOrder.filter((item) =>
    productsData?.some((product) => Number(product.id) === item.id),
  );

  const dailyOfferProducts = dailyOffers(assistantProducts).slice(0, 4);
  const showcaseProducts = assistantProducts.filter((product) => product.isActive !== false && (product.stock === undefined || product.stock > 0)).slice(0, 4);

  useEffect(() => {
    setLastOrder(getLastOrder());
  }, []);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  return (
    <div className="min-h-screen bg-[#f8faf9]" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-white/95 shadow-[0_8px_30px_-20px_rgba(0,80,45,.45)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:py-4">
          <Link href="/" className="shrink-0">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="الوحيد ماركت" className="h-12 w-12 object-contain md:h-14 md:w-14" />
              <div className="hidden sm:block">
                <div className="text-xl font-black text-[#006b3c]">الوحيد ماركت</div>
                <div className="text-[11px] font-semibold text-slate-500">رأس البر · سوق 89</div>
              </div>
            </div>
          </Link>
          <form className="mx-auto flex min-w-0 flex-1 max-w-2xl items-center overflow-hidden rounded-full border-2 border-slate-200 bg-[#f8fafb] shadow-inner focus-within:border-[#006b3c] focus-within:bg-white"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(searchQuery.trim() ? `/products?search=${encodeURIComponent(searchQuery.trim())}` : "/products");
            }}>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن المنتجات..." aria-label="البحث عن المنتجات"
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm font-semibold text-slate-800 outline-none md:text-base" />
            <button type="submit" aria-label="بحث" className="m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#006b3c] text-white shadow-md transition hover:scale-105 hover:bg-[#005a32]">
              <Search className="h-5 w-5" />
            </button>
          </form>
          <Link href="/cart" aria-label="السلة" className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#006b3c] text-white shadow-lg transition hover:scale-105">
            <ShoppingCart className="h-5 w-5" />
            {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
              <span className="absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-400 px-1 text-[10px] font-black text-emerald-950">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-3 pt-4 md:px-5 md:pt-6">
          <div className="overflow-hidden rounded-[28px] bg-[#003d28] shadow-[0_25px_60px_-35px_rgba(0,80,45,.55)]">
            <img src="/nadermarket-banner.svg" alt="الوحيد ماركت" className="block h-auto w-full object-cover" loading="eager" fetchPriority="high" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-5">
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
            {[
              { icon: Truck, title: "توصيل سريع", text: "لحد باب بيتك" },
              { icon: ShoppingCart, title: "اختيارات كتير", text: "كل احتياجاتك" },
              { icon: Phone, title: "خدمة العملاء", text: "معاك وقت ما تحتاج" },
            ].map(({ icon: Icon, title, text }, index) => (
              <div key={title} className={`flex items-center justify-center gap-2 px-2 py-3 text-center ${index > 0 ? "border-r border-emerald-100" : ""}`}>
                <Icon className="hidden h-5 w-5 text-[#006b3c] sm:block" />
                <div><div className="text-xs font-black text-slate-800 sm:text-sm">{title}</div><div className="hidden text-[10px] text-slate-400 sm:block">{text}</div></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-5" aria-labelledby="categories-title">
          <div className="mb-4 flex items-end justify-between">
            <div><p className="text-xs font-bold text-[#006b3c]">اختار اللي محتاجه</p><h2 id="categories-title" className="text-2xl font-black text-slate-900 md:text-3xl">تسوّق حسب القسم</h2></div>
            <Link href="/products" className="flex items-center gap-1 text-sm font-bold text-[#006b3c]">كل الأقسام <ArrowLeft className="h-4 w-4" /></Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`} className="group">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-lg">
                    <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50 p-3">
                      {category.image ? <img src={category.image} alt={category.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /> : <ShoppingCart className="h-10 w-10 text-emerald-300" />}
                    </div>
                    <div className="px-3 py-3 text-center text-sm font-black text-slate-800">{category.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6" aria-labelledby="featured-title">
          <div className="mb-4 flex items-end justify-between">
            <div><p className="text-xs font-bold text-[#006b3c]">مختارات من الكتالوج</p><h2 id="featured-title" className="text-2xl font-black text-slate-900 md:text-3xl">اختيارات مميزة</h2></div>
            <Link href="/products" className="text-sm font-bold text-[#006b3c]">عرض الكل ←</Link>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200" />)}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {showcaseProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <Link href={`/product/${product.id}`}><div className="h-40 bg-white p-3 md:h-48"><img src={product.image || "/icon.svg"} alt={product.name} className="h-full w-full object-contain" loading="lazy" /></div></Link>
                  <div className="p-3 text-right">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-black text-slate-900">{product.name}</h3>
                    <div className="mt-2 text-lg font-black text-[#006b3c]">{Number(product.price).toFixed(2)} <span className="text-xs">ج.م</span></div>
                    <button type="button" onClick={() => addToCart(product)} className="mt-3 w-full rounded-xl bg-[#006b3c] px-3 py-2.5 text-sm font-black text-white transition hover:bg-[#005a32]">أضف +</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {dailyOfferProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-7" aria-labelledby="daily-offers-title">
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-l from-[#003d28] via-[#006b3c] to-[#07945a] p-4 md:p-6">
              <div className="mb-4 flex items-end justify-between text-white"><div><p className="text-xs font-bold text-emerald-200">لفترة محدودة</p><h2 id="daily-offers-title" className="text-2xl font-black md:text-3xl">🔥 عروض اليوم</h2></div><span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">متاحة حسب المخزون</span></div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {dailyOfferProducts.map((product) => (
                  <div key={product.id} className="overflow-hidden rounded-2xl bg-white p-2 text-right shadow-lg">
                    <Link href={`/product/${product.id}`}><div className="h-32 bg-white p-2 md:h-40"><img src={product.image || "/icon.svg"} alt={product.name} className="h-full w-full object-contain" loading="lazy" /></div></Link>
                    <div className="p-2"><div className="line-clamp-2 min-h-9 text-xs font-black text-slate-900">{product.name}</div><div className="mt-1 text-lg font-black text-[#006b3c]">{Number(product.price).toFixed(2)} <span className="text-[10px]">ج.م</span></div><button type="button" onClick={() => addToCart(product)} className="mt-2 w-full rounded-xl bg-[#006b3c] py-2 text-xs font-black text-white">أضف +</button></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-7">
          <div className="mb-4"><p className="text-xs font-bold text-[#006b3c]">اكتشف بسهولة</p><h2 className="text-2xl font-black text-slate-900 md:text-3xl">كل احتياجات البيت في مكان واحد</h2></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["فطار اليوم", "ابدأ يومك باختيارات من الألبان والمخبوزات."],
              ["غداء اليوم", "لحوم ودواجن وبقالة وخضروات لوجبة كاملة."],
              ["طازج يوميًا", "خضار وفاكهة حسب المنتجات المتاحة الآن."],
              ["مستلزمات البيت", "منظفات ومشروبات وسناكس واحتياجات يومية."],
            ].map(([title, text]) => (
              <Link key={title} href="/products" className="group rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-10 text-3xl text-emerald-600">✦</div><h3 className="text-lg font-black text-slate-900">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{text}</p><div className="mt-4 flex items-center gap-1 text-sm font-black text-[#006b3c]">استكشف <ArrowLeft className="h-4 w-4" /></div>
              </Link>
            ))}
          </div>
        </section>

      <SmartShoppingLists products={assistantProducts} />

      <SmartAssistant products={assistantProducts} />
      <DailyOfferPopup products={assistantProducts} />

      {/* Simple Footer */}
      <footer id="contact" className="mt-12 border-t border-blue-900/15 bg-gradient-to-l from-[#073b7a] via-[#0b4f9e] to-[#1266b8] text-white">
        <div className="mx-auto max-w-7xl px-4 py-7">
          <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#0a478f] p-2 shadow-md">
                <img src="/icon.svg" alt="" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="font-black">الوحيد ماركت</h3>
                <p className="text-xs text-blue-100">كل احتياجاتك في مكان واحد</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-blue-100">
              <Link href="/" className="transition hover:text-white">الرئيسية</Link>
              <Link href="/products" className="transition hover:text-white">المنتجات</Link>
              <Link href="/cart" className="transition hover:text-white">السلة</Link>
              <span className="hidden sm:inline text-white/25">|</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 01002934519</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> رأس البر - سوق 89</span>
            </div>
          </div>
          <div className="mt-5 border-t border-white/15 pt-4 text-center text-[11px] text-blue-200">
            © <Link href="/admin" aria-label="الدخول إلى لوحة الإدارة" data-admin-entry="footer-year" className="font-bold text-white">2026</Link> الوحيد ماركت · جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
