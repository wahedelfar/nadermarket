import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    vodafoneWalletNumber: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation();

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1>
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card className="p-12 text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">تم إنشاء الطلب بنجاح!</h2>
            <p className="text-xl text-gray-600 mb-2">رقم الطلب: <span className="font-bold text-blue-600">#{orderId}</span></p>
            <p className="text-gray-600 mb-8">سيتم التواصل معك قريباً عبر واتساب على الرقم المسجل</p>
            <div className="space-y-3">
              <Link href="/products">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                  متابعة التسوق
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full py-3">
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1>
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600 mb-6">السلة فارغة</p>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              تصفح المنتجات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast.error("يرجى ملء جميع البيانات المطلوبة");
      return;
    }

    if (!formData.vodafoneWalletNumber) {
      toast.error("يرجى إدخال رقم محفظة فودافون كاش");
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrderMutation.mutateAsync({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        totalAmount: total.toFixed(2),
        vodafoneWalletNumber: formData.vodafoneWalletNumber,
        items: orderItems,
      });

      toast.success(`تم إنشاء الطلب بنجاح! رقم الطلب: ${result.id}`);
      setOrderId(result.id);
      setOrderCreated(true);
      clearCart();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1>
          </Link>
          <Link href="/cart">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للسلة
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">بيانات العميل</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        الاسم الكامل *
                      </label>
                      <Input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        رقم الهاتف *
                      </label>
                      <Input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="أدخل رقم الهاتف"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        العنوان *
                      </label>
                      <textarea
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        placeholder="أدخل عنوانك بالتفصيل"
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">طريقة الدفع</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-900 font-semibold">فودافون كاش</p>
                    <p className="text-sm text-blue-800 mt-1">
                      سيتم إرسال رابط الدفع إلى رقمك بعد تأكيد الطلب
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      رقم محفظة فودافون كاش *
                    </label>
                    <Input
                      type="tel"
                      name="vodafoneWalletNumber"
                      value={formData.vodafoneWalletNumber}
                      onChange={handleInputChange}
                      placeholder="أدخل رقم محفظتك"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      هذا الرقم سيُستخدم لتأكيد الدفع
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
                  >
                    {loading ? "جاري المعالجة..." : "تأكيد الطلب"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-800">ملخص الطلب</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)} ج.م
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {total.toFixed(2)} ج.م
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">01004520056</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">رأس البر - سوق 89</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
