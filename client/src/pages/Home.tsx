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
      {/* Premium storefront header */}
      <section className="relative overflow-hidden bg-white shadow-[0_10px_35px_-20px_rgba(15,70,130,0.45)]">
        <div className="mx-auto max-w-7xl border-x border-blue-100" dir="rtl">
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:py-5">
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="الوحيد ماركت" className="h-14 w-14 object-contain md:h-16 md:w-16" />
              <div className="text-right">
                <h1 className="text-2xl font-black tracking-tight text-[#123f91] md:text-3xl">الوحيد ماركت</h1>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-600">
                  <MapPin className="h-4 w-4 text-[#123f91]" aria-hidden="true" />
                  رأس البر - سوق 89
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Link href="/products" className="flex-1 sm:flex-none">
                <Button className="w-full rounded-xl bg-[#123f91] px-5 py-2.5 font-black text-white shadow-md hover:bg-[#0d3275]">تصفح المنتجات</Button>
              </Link>
              <a href="#contact" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full rounded-xl border-2 border-[#123f91] bg-white px-5 py-2.5 font-black text-[#123f91] hover:bg-blue-50">
                  <Phone className="ml-2 h-4 w-4" aria-hidden="true" />اتصل بنا
                </Button>
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0c43a8] via-[#1166c4] to-[#197fd0] px-5 py-7 text-center text-white md:px-8 md:py-9">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-950/25 blur-3xl" />
            <div className="relative">
              <p className="mb-1 text-sm font-bold text-blue-100">كل احتياجاتك في مكان واحد</p>
              <h2 className="text-3xl font-black md:text-5xl">الوحيد ماركت</h2>
              <p className="mx-auto mt-2 max-w-2xl text-base font-semibold text-blue-50 md:text-xl">أفضل المنتجات بأسعار منافسة</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link href="/products">
                  <Button className="rounded-xl bg-white px-7 py-3 font-black text-[#123f91] shadow-lg hover:bg-blue-50">تصفح المنتجات</Button>
                </Link>
                <a href="#contact">
                  <Button variant="outline" className="rounded-xl border-2 border-white bg-transparent px-7 py-3 font-black text-white hover:bg-white/10">
                    <Phone className="ml-2 h-4 w-4" aria-hidden="true" />اتصل بنا
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating cart */}
      <Link
        href="/cart"
        aria-label="سلة المشتريات"
        className="fixed right-4 top-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-[#063b78] text-white shadow-[0_12px_30px_-8px_rgba(3,37,78,0.75)] backdrop-blur-md transition duration-200 hover:scale-105 hover:bg-[#084b96] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 md:right-6 md:top-6"
      >
        <ShoppingCart className="h-6 w-6" />
        {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
          <span className="absolute -left-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#4aa8ef] px-1.5 text-[11px] font-black text-[#063b78] shadow-md">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </Link>

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

      {/* Simple Footer */}
      <footer className="mt-12 border-t border-blue-900/15 bg-gradient-to-l from-[#073b7a] via-[#0b4f9e] to-[#1266b8] text-white">
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
