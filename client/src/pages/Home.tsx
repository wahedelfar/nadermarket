import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, MapPin, Phone, Truck } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const { data: categoriesData, isLoading } = trpc.categories.list.useQuery();

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
            <a href="tel:01004520056">
              <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                <Phone className="w-4 h-4 ml-2" />
                اتصل بنا
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">توصيل سريع</h3>
            <p className="text-gray-600">نوصل طلبك بسرعة وأمان إلى باب منزلك</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <ShoppingCart className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">منتجات متنوعة</h3>
            <p className="text-gray-600">تشكيلة واسعة من أفضل المنتجات الطازة</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Phone className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">خدمة العملاء</h3>
            <p className="text-gray-600">فريق متخصص جاهز للإجابة على استفساراتك</p>
          </Card>
        </div>
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
                01004520056
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
