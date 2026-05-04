import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, MapPin, Phone } from "lucide-react";
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
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">مرحباً بك في نادر ماركت</h2>
          <p className="text-xl mb-8 opacity-90">أفضل المنتجات بأسعار منافسة</p>
          <div className="flex justify-center gap-4">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              تصفح المنتجات
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-blue-700">
              اتصل بنا
            </Button>
          </div>
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
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">المنتجات المميزة</h2>
        <div className="text-center">
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-2">
              عرض جميع المنتجات
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">تواصل معنا</h2>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <Phone className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold">01004520056</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold">رأس البر - سوق 89</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© 2024 نادر ماركت - جميع الحقوق محفوظة</p>
          <p className="text-sm text-gray-400">تطوير بواسطة وحيد الفار (Wahid Elfar)</p>
        </div>
      </footer>
    </div>
  );
}
