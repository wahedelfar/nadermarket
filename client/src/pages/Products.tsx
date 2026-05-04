import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";

export default function Products() {
  const [location] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { addToCart } = useCart();

  // Get category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const categoryId = params.get("category");
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId));
    }
  }, [location]);

  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery(selectedCategory || undefined);
  const { data: categoriesData } = trpc.categories.list.useQuery();

  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1>
          </Link>
          <Link href="/cart">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 ml-2" />
              السلة
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-800">الأقسام</h2>
              <div className="space-y-2">
                <Button
                  onClick={() => setSelectedCategory(null)}
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="w-full justify-start"
                >
                  جميع المنتجات
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Products Grid */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || "المنتجات"
                : "جميع المنتجات"}
            </h1>

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">لا توجد منتجات في هذا القسم</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold">غير متوفر</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-lg text-gray-800 cursor-pointer hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {parseFloat(product.price).toFixed(2)} ج.م
                        </span>
                        <span className="text-sm text-gray-600">
                          المتوفر: {product.stock}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <ShoppingCart className="w-4 h-4 ml-2" />
                          أضف للسلة
                        </Button>
                        <Link href={`/product/${product.id}`}>
                          <Button variant="outline" className="flex-1">
                            التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
