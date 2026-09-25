import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MapPin, Phone, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { getNextSlideIndex, getPreviousSlideIndex, selectFeaturedProducts, SLIDER_INTERVAL_MS } from "@/lib/featuredProducts";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const { addToCart, items } = useCart();
  const { data: categoriesData, isLoading } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery();

  const featuredProducts = selectFeaturedProducts(productsData ?? []);

  const activeProduct = featuredProducts[activeSlide];

  useEffect(() => {
    setActiveSlide((current) => featuredProducts.length ? current % featuredProducts.length : 0);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (featuredProducts.length < 2 || isSliderPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => getNextSlideIndex(current, featuredProducts.length));
    }, SLIDER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [featuredProducts.length, isSliderPaused]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c7e9ff] via-[#e8f6ff] to-[#f8fcff]">
      {/* Premium Hypermarket Header */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-gradient-to-l from-[#8ed0ff] via-[#b9e5ff] to-[#eaf8ff] shadow-[0_10px_35px_-18px_rgba(37,99,235,0.45)] backdrop-blur-xl">
        <div className="border-b border-blue-900/5 bg-blue-900/[0.035]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[11px] font-semibold text-blue-900/70 md:text-xs">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-blue-600" /> توصيل سريع داخل رأس البر</span>
              <span className="hidden items-center gap-1.5 sm:inline-flex"><MapPin className="h-3.5 w-3.5 text-blue-600" /> سوق 89</span>
            </div>
            <span className="hidden md:inline">السبت - الخميس 8:00 - 22:00 · الجمعة 10:00 - 22:00</span>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-5 md:py-4">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3 md:gap-4">
            <div className="relative shrink-0">
              <div className="absolute -inset-2 rounded-2xl bg-white/60 opacity-80 blur-md transition duration-300 group-hover:opacity-100" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/85 p-1.5 shadow-lg md:h-14 md:w-14">
                <img src="/icon.svg" alt="الوحيد ماركت" className="h-full w-full object-contain" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="whitespace-nowrap font-black leading-none tracking-tight text-[#073b7a] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] text-[22px] md:text-[30px]">الوحيد ماركت</h1>
              <p className="mt-1.5 whitespace-nowrap text-[10px] font-bold text-blue-900/60 md:text-xs">كل احتياجاتك في مكان واحد</p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <Link href="/products" className="group mx-auto flex max-w-2xl items-center rounded-2xl border border-white/80 bg-white/75 px-4 py-2.5 shadow-inner shadow-white/70 ring-1 ring-blue-100/50 transition hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <span className="flex-1 text-right text-sm text-slate-400">ابحث عن منتج، قسم، أو احتياجاتك...</span>
              <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition group-hover:bg-blue-700"><Sparkles className="h-4 w-4" /></span>
            </Link>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden shrink-0 lg:block" aria-label="واجهة الوحيد ماركت">
              <div className="relative h-[58px] w-[178px] overflow-hidden rounded-xl border border-white/90 bg-gradient-to-b from-white via-[#d9f2ff] to-[#7fc8ff] shadow-[0_12px_24px_-12px_rgba(7,59,122,0.8)]">
                <div className="absolute inset-x-2 top-1 h-7 -skew-x-6 rounded-md border border-blue-950/20 bg-gradient-to-r from-[#062f68] via-[#0b59ae] to-[#42aaf4] shadow-[0_4px_8px_rgba(7,59,122,0.35)]">
                  <div className="flex h-full items-center justify-center gap-2">
                    <span className="text-sm font-black text-white drop-shadow">الوحيد</span>
                    <span className="text-[9px] font-black tracking-[0.16em] text-sky-100">MARKET</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-2 right-2 h-7 rounded-t-md border border-blue-400/50 bg-white/75 p-1">
                  <div className="grid h-full grid-cols-3 gap-1">
                    <span className="rounded-sm border border-blue-200/60 bg-gradient-to-b from-white to-sky-100 shadow-inner" />
                    <span className="rounded-sm border border-blue-200/60 bg-gradient-to-b from-white to-blue-100 shadow-inner" />
                    <span className="rounded-sm border border-blue-200/60 bg-gradient-to-b from-white to-sky-100 shadow-inner" />
                  </div>
                </div>
                <span className="absolute bottom-0 left-4 h-1.5 w-16 rounded-full bg-blue-950/25 blur-sm" />
              </div>
            </div>
            <Link href="/cart">
              <Button className="h-11 rounded-xl bg-blue-600 px-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-700/25 md:px-4">
                <ShoppingCart className="ml-2 h-4 w-4" />
                <span className="hidden sm:inline">السلة</span>
                {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="mr-1.5 inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-black text-blue-700">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        <nav className="hidden border-t border-white/55 bg-white/25 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-1.5">
            <Link href="/" className="rounded-lg px-4 py-2 text-sm font-bold text-blue-950 transition hover:bg-white/60 hover:text-blue-700">الرئيسية</Link>
            <Link href="/products" className="rounded-lg px-4 py-2 text-sm font-bold text-blue-950/75 transition hover:bg-white/60 hover:text-blue-700">تصفح المنتجات</Link>
            <Link href="/products" className="rounded-lg px-4 py-2 text-sm font-bold text-blue-950/75 transition hover:bg-white/60 hover:text-blue-700">الأقسام</Link>
            <Link href="/products" className="rounded-lg px-4 py-2 text-sm font-bold text-blue-950/75 transition hover:bg-white/60 hover:text-blue-700">الأكثر طلبًا</Link>
          </div>
        </nav>
      </header>

      {/* Hero / Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#bfe7ff] via-[#d9f1ff] to-[#f3faff] py-8 md:py-12">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute -bottom-24 -right-12 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 text-center shadow-xl backdrop-blur-sm md:p-10">
            <p className="mb-2 text-sm font-semibold text-blue-600">مرحباً بك في</p>
            <h2 className="text-3xl font-black text-blue-900 md:text-5xl">الوحيد ماركت</h2>
            <div className="mx-auto mt-5 max-w-3xl rounded-2xl bg-white px-5 py-4 shadow-lg">
              <p className="text-xl font-black text-blue-800 md:text-3xl">كل ما تطلب أكتر… هتوفر أكتر</p>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">اختار احتياجاتك، أضفها للسلة، واختار طريقة الدفع المناسبة ليك.</p>
            <Link href="/products" className="mt-6 inline-block">
              <Button className="rounded-xl bg-blue-600 px-7 py-3 font-bold text-white shadow-md hover:bg-blue-700">تسوّق الآن</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      
      {/* Features Section - Compact */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <Card className="p-4 bg-white/90 border border-blue-100 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-gray-800">توصيل سريع</p>
            </div>
            <div className="flex flex-col items-center border-l border-r border-blue-300">
              <ShoppingCart className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-gray-800">منتجات متنوعة</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-gray-800">خدمة العملاء</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Latest Products Slider */}
      <section className="max-w-7xl mx-auto px-4 pb-8" aria-labelledby="latest-products-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-blue-600">اختيارات الوحيد ماركت</p>
            <h2 id="latest-products-title" className="text-2xl font-bold text-gray-800">أحدث المنتجات الطازة</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            عرض الكل
          </Link>
        </div>

        {productsLoading ? (
          <div className="h-56 animate-pulse rounded-2xl bg-blue-100" aria-label="جاري تحميل المنتجات" />
        ) : activeProduct ? (
          <Card
              className="group relative overflow-hidden border-blue-100 bg-white text-gray-800 shadow-lg motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/25"
              onMouseEnter={() => setIsSliderPaused(true)}
              onMouseLeave={() => setIsSliderPaused(false)}
              onFocus={() => setIsSliderPaused(true)}
              onBlur={() => setIsSliderPaused(false)}
              aria-label={isSliderPaused ? "السلايدر متوقف مؤقتاً" : "سلايدر أحدث المنتجات"}
            >
            <div className="grid min-h-56 md:grid-cols-[0.9fr_1.1fr]">
              <div className="order-2 flex flex-col justify-center p-5 text-right md:order-1 md:p-7">
                <div className="mb-3 flex items-center gap-2 text-blue-600">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-semibold">طازة ومختارة بعناية</span>
                </div>
                <h3 className="mb-2 text-2xl font-bold">{activeProduct.name}</h3>
                <p className="mb-4 line-clamp-2 min-h-10 text-sm text-gray-600">
                  {activeProduct.description || "جودة ممتازة وسعر مناسب من الوحيد ماركت"}
                </p>
                <div className="mb-5 text-2xl font-extrabold text-blue-700">
                  {Number(activeProduct.price).toFixed(2)} <span className="text-base font-medium">ج.م</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addToCart(activeProduct)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-[0.97]"
                  >
                    أضف للسلة
                  </button>
                  <Link href={`/product/${activeProduct.id}`}>
                    <Button variant="outline" className="border-blue-200 bg-white text-blue-700 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-800 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-200 active:scale-[0.97]">
                      عرض المنتج
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="order-1 min-h-48 overflow-hidden bg-blue-50 md:order-2">
                <div className="relative h-full min-h-48 md:min-h-56">
                  <img
                    src={activeProduct.image || "/icon.svg"}
                    alt={activeProduct.name}
                    className="h-full min-h-48 w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out group-hover:scale-105 md:min-h-56"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>
            </div>

            {featuredProducts.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between md:left-auto md:right-5 md:w-52">
                <button
                  type="button"
                  onClick={() => setActiveSlide((current) => getPreviousSlideIndex(current, featuredProducts.length))}
                  className="rounded-full bg-white/20 p-2 text-white backdrop-blur transition duration-200 hover:scale-110 hover:bg-white/35 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.97]"
                  aria-label="المنتج السابق"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1.5" aria-label={`المنتج ${activeSlide + 1} من ${featuredProducts.length}`}>
                  {featuredProducts.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`h-2 rounded-full transition-all duration-200 ${index === activeSlide ? "w-6 bg-white" : "w-2 bg-white/50 hover:w-4 hover:bg-white/80"}`}
                      aria-label={`عرض ${product.name}`}
                      aria-current={index === activeSlide ? "true" : undefined}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSlide((current) => (current + 1) % featuredProducts.length)}
                  className="rounded-full bg-white/20 p-2 text-white backdrop-blur transition duration-200 hover:scale-110 hover:bg-white/35 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.97]"
                  aria-label="المنتج التالي"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 text-center text-gray-600">سيتم عرض أحدث المنتجات هنا قريباً.</Card>
        )}
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">الأقسام</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Premium Footer */}
      <footer className="relative mt-16 overflow-hidden bg-gradient-to-br from-[#041f46] via-[#073b7a] to-[#0b63b7] text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-14">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 shadow-xl">
                  <img src="/icon.svg" alt="" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">الوحيد ماركت</h3>
                  <p className="text-xs font-semibold text-sky-200">كل احتياجاتك في مكان واحد</p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-7 text-blue-100">تسوّق بسهولة، اختار منتجاتك، واستلم طلبك بكل بساطة. تجربة تسوق إلكترونية مصممة لتكون سريعة وواضحة ومريحة.</p>
              <Link href="/products" className="mt-5 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-black text-[#073b7a] shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50">ابدأ التسوق</Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h3 className="mb-5 text-lg font-black text-white">روابط سريعة</h3>
              <div className="space-y-2.5 text-sm font-semibold text-blue-100">
                <Link href="/" className="block rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white">الرئيسية</Link>
                <Link href="/products" className="block rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white">تصفح المنتجات</Link>
                <Link href="/cart" className="block rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white">سلة المشتريات</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h3 className="mb-5 text-lg font-black text-white">تواصل معنا</h3>
              <div className="space-y-4 text-sm text-blue-100">
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><Phone className="h-4 w-4 text-sky-200" /></span><span dir="ltr">01002934519</span></div>
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><MapPin className="h-4 w-4 text-sky-200" /></span><span>رأس البر - سوق 89</span></div>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-bold text-white">ساعات العمل</p>
                  <p className="mt-1">السبت - الخميس: 8:00 - 22:00</p>
                  <p>الجمعة: 10:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-center text-xs text-blue-200 md:flex-row md:text-right">
            <p>&copy; <Link href="/admin" aria-label="الدخول إلى لوحة الإدارة" data-admin-entry="footer-year" className="rounded-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-sky-300">2026</Link> الوحيد ماركت. جميع الحقوق محفوظة.</p>
            <p className="font-semibold">تجربة تسوق حديثة من الوحيد ماركت</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
