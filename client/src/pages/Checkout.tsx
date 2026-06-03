import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
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

  const handleWhatsAppSubmit = async () => {
    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast.error("يرجى ملء جميع البيانات المطلوبة");
      return;
    }

    setLoading(true);

    try {
      // بناء رسالة الطلب
      let message = "طلب جديد من نادر ماركت\n\n";
      message += "بيانات العميل:\n";
      message += `الاسم: ${formData.customerName}\n`;
      message += `الهاتف: ${formData.customerPhone}\n`;
      message += `العنوان: ${formData.customerAddress}\n\n`;
      message += "المنتجات:\n";
      
      items.forEach((item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        message += `- ${item.name}: ${item.quantity} x ${price} ج.م = ${(item.quantity * price).toFixed(2)} ج.م\n`;
      });
      
      message += `\nالإجمالي: ${total.toFixed(2)} ج.م\n`;
      if (formData.vodafoneWalletNumber) {
        message += `رقم محفظة فودافون كاش: ${formData.vodafoneWalletNumber}`;
      }

      // إنشاء الطلب في قاعدة البيانات
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
      
      // فتح الواتساب برقم المحل
      const shopPhone = "201002934519";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
      
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); }}>
                {/* Customer Information */}
                <div className="mb-6">
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
                        placeholder="أدخل رقم هاتفك"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        العنوان *
                      </label>
                      <Input
                        type="text"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        placeholder="أدخل عنوانك"
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
                      رقم محفظة فودافون كاش (اختياري)
                    </label>
                    <Input
                      type="tel"
                      name="vodafoneWalletNumber"
                      value={formData.vodafoneWalletNumber}
                      onChange={handleInputChange}
                      placeholder="أدخل رقم محفظتك"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      هذا الرقم سيُستخدم لتأكيد الدفع
                    </p>
                  </div>
                </div>

                {/* Submit Button - WhatsApp */}
                <div className="border-t pt-6 space-y-3">
                  <Button
                    type="button"
                    onClick={handleWhatsAppSubmit}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.258-1.688 1.694-2.637 3.957-2.637 6.383 0 1.564.311 3.081.902 4.555l-1.38 5.116 5.319-1.384c1.279.855 2.807 1.279 4.152 1.279h.004c5.079 0 9.237-4.155 9.237-9.237 0-2.469-.967-4.787-2.724-6.528-1.757-1.74-4.09-2.697-6.549-2.697z"/>
                    </svg>
                    {loading ? "جاري المعالجة..." : "إرسال الطلب عبر واتساب"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    سيتم فتح واتساب برقم المحل مع تفاصيل طلبك
                  </p>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-800">ملخص الطلب</h3>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(item.quantity * (typeof item.price === 'string' ? parseFloat(item.price) : item.price)).toFixed(2)} ج.م
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {total.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
