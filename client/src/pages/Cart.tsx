import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ArrowRight, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1>
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

        {items.length === 0 ? (
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
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-gray-800">ملخص الطلب</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد المنتجات:</span>
                    <span className="font-semibold">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإجمالي:</span>
                    <span className="text-2xl font-bold text-blue-600">
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
