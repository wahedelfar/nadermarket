import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MapPin, Phone, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { getNextSlideIndex, getPreviousSlideIndex, selectFeaturedProducts } from "@/lib/featuredProducts";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const { addToCart } = useCart();
  const { data: categoriesData, isLoading } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery();

  const featuredProducts = selectFeaturedProducts(productsData ?? []);

  const activeProduct = featuredProducts[activeSlide];

  useEffect(() => {
    setActiveSlide((current) => featuredProducts.length ? current % featuredProducts.length : 0);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (featuredProducts.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => getNextSlideIndex(current, featuredProducts.length));
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Logo */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663186632256/fDwgbLi8MTwHPsfBbGL7bd/nader-market-logo-mmFgRXmD7rbQX4rmisPczg.webp"
              alt="نادر ماركت"
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-600">نادر ماركت</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                رأس البر - سوق 89
              </p>
            </div>
          </div>
          <Link href="/cart">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 ml-2" />
              السلة
            </Button>
          </Link>
        </div>
      </header>

      {/* Promotional Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
        <img 
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663186632256/fDwgbLi8MTwHPsfBbGL7bd/nader-market-banner-XjcBUxU6RXsiUoxscux4Lk.webp"
          alt="كل ما تطلب أكتر - هتوفر أكتر"
          className="w-full h-auto object-cover"
        />
        <style>{`
          @keyframes pulse-banner {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          .banner-pulse {
            animation: pulse-banner 2s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">مرحباً بك في نادر ماركت</h2>
          <p className="text-xl mb-8 opacity-90">أفضل المنتجات بأسعار منافسة</p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                تصفح المنتجات
              </Button>
            </Link>
            <a href="tel:01002934519">
              <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                <Phone className="w-4 h-4 ml-2" />
                اتصل بنا
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-gray-800">توصيل سريع</p>
            </div>
            <div className="flex flex-col items-center border-l border-r border-blue-300">
              <ShoppingCart className="w-6 h-6 text-green-600 mb-1" />
              <p className="text-xs font-semibold text-gray-800">منتجات متنوعة</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-6 h-6 text-orange-600 mb-1" />
              <p className="text-xs font-semibold text-gray-800">خدمة العملاء</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Latest Products Slider */}
      <section className="max-w-7xl mx-auto px-4 pb-8" aria-labelledby="latest-products-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-blue-600">اختيارات نادر ماركت</p>
            <h2 id="latest-products-title" className="text-2xl font-bold text-gray-800">أحدث المنتجات الطازة</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            عرض الكل
          </Link>
        </div>

        {productsLoading ? (
          <div className="h-56 animate-pulse rounded-2xl bg-blue-100" aria-label="جاري تحميل المنتجات" />
        ) : activeProduct ? (
          <Card className="group relative overflow-hidden border-blue-100 bg-gradient-to-l from-blue-700 via-blue-600 to-cyan-500 text-white shadow-lg motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/25">
            <div className="grid min-h-56 md:grid-cols-[0.9fr_1.1fr]">
              <div className="order-2 flex flex-col justify-center p-5 text-right md:order-1 md:p-7">
                <div className="mb-3 flex items-center gap-2 text-blue-100">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-semibold">طازة ومختارة بعناية</span>
                </div>
                <h3 className="mb-2 text-2xl font-bold">{activeProduct.name}</h3>
                <p className="mb-4 line-clamp-2 min-h-10 text-sm text-blue-50">
                  {activeProduct.description || "جودة ممتازة وسعر مناسب من نادر ماركت"}
                </p>
                <div className="mb-5 text-2xl font-extrabold">
                  {Number(activeProduct.price).toFixed(2)} <span className="text-base font-medium">ج.م</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addToCart(activeProduct)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 active:scale-[0.97]"
                  >
                    أضف للسلة
                  </button>
                  <Link href={`/product/${activeProduct.id}`}>
                    <Button variant="outline" className="border-white bg-transparent text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-white active:scale-[0.97]">
                      عرض المنتج
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="order-1 min-h-48 overflow-hidden bg-white/10 md:order-2">
                <div className="relative h-full min-h-48 md:min-h-56">
                  <img
                    src={activeProduct.image || "https://via.placeholder.com/600x400?text=Nader+Market"}
                    alt={activeProduct.name}
                    className="h-full min-h-48 w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out group-hover:scale-105 md:min-h-56"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-950/45 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">نادر ماركت</h3>
              <p className="text-gray-400">أفضل متجر تجزئة في رأس البر</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
              <p className="text-gray-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                01002934519
              </p>
              <p className="text-gray-400 flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4" />
                رأس البر - سوق 89
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">ساعات العمل</h3>
              <p className="text-gray-400">السبت - الخميس: 8:00 - 22:00</p>
              <p className="text-gray-400">الجمعة: 10:00 - 22:00</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 نادر ماركت. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
