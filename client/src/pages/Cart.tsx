import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ArrowRight, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import SmartCartInsights from "@/components/SmartCartInsights";
import type { SmartProduct } from "@/lib/smartAssistant";
import { useMemo } from "react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, total, customRequests, removeCustomRequest } = useCart();
  const { data: productsData } = trpc.products.list.useQuery();
  const { data: categoriesData } = trpc.categories.list.useQuery();
  const smartProducts = useMemo(
    () => (productsData ?? []).map((product) => ({
      ...product,
      categoryName: categoriesData?.find((category) => Number(category.id) === Number(product.categoryId))?.name ?? null,
    })) as SmartProduct[],
    [productsData, categoriesData],
  );

  return (
    <div className="min-h-screen bg-[#e8f6ff]">
      {/* Header */}
      <header className="bg-gradient-to-l from-[#9fd8ff] via-[#bfe7ff] to-[#dff3ff] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-black text-blue-800 cursor-pointer">الوحيد ماركت</h1>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ml-2" />
              متابعة التسوق
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">سلة المشتريات</h1>

        <div className="mb-8">
          <SmartCartInsights items={items} products={smartProducts} />
        </div>

        {items.length === 0 && customRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">السلة فارغة</p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                تصفح المنتجات
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-blue-600 font-semibold mt-2">
                          {parseFloat(item.price).toFixed(2)} ج.م
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            variant="outline"
                            className="p-1"
                            size="sm"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            variant="outline"
                            className="p-1"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {customRequests.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h2 className="text-lg font-black text-gray-800">طلبات خاصة للإدارة</h2>
                  {customRequests.map((request) => (
                    <Card key={request.id} className="border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center justify-between gap-3" dir="rtl">
                        <div>
                          <p className="text-xs font-black text-amber-900">طلب خارج الكتالوج</p>
                          <p className="mt-1 font-bold text-gray-800">{request.text} × {request.quantity}</p>
                          <p className="mt-1 text-xs text-gray-600">سيُرسل للإدارة مع الطلب للتجهيز حسب التوفر.</p>
                        </div>
                        <Button onClick={() => removeCustomRequest(request.id)} variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-gray-800">ملخص الطلب</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد المنتجات:</span>
                    <span className="font-semibold">{items.length + customRequests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإجمالي:</span>
                    <span className="text-2xl font-black text-blue-800">
                      {total.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href="/checkout">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                      إتمام الطلب
                    </Button>
                  </Link>
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full"
                  >
                    مسح السلة
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
