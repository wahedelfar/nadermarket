import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Banknote, Upload, Wallet, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const VODAFONE_CASH_NUMBER = "01012345678";
async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function prepareProof(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر تجهيز صورة التحويل");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82)
  );
  if (!blob) throw new Error("تعذر ضغط صورة التحويل");
  if (blob.size > 3 * 1024 * 1024) throw new Error("صورة التحويل كبيرة. اختر صورة أصغر.");
  const optimized = new File([blob], "payment-proof.webp", { type: "image/webp" });
  return { base64: await fileToBase64(optimized), contentType: "image/webp" as const };
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "vodafone_cash">("cash_on_delivery");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation();
  const uploadProofMutation = trpc.orders.uploadPaymentProof.useMutation();

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
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">شكراً لاختيارك نادر ماركت</h2>
            <p className="text-xl text-gray-600 mb-2">تم استلام طلبك بنجاح. نرجوا انتظار اتصال المندوب. رقم الطلب: <span className="font-bold text-blue-600">#{orderId}</span></p>
            {paymentMethod === "vodafone_cash" ? (
              <p className="text-gray-600 mb-8">تم حفظ بيانات الطلب وصورة التحويل. نرجوا انتظار اتصال المندوب لتأكيد الطلب وموعد التسليم.</p>
            ) : (
              <p className="text-gray-600 mb-8">نرجوا انتظار اتصال المندوب لتأكيد الطلب وموعد التسليم.</p>
            )}
            <div className="space-y-3">
              <Link href="/products"><Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">متابعة التسوق</Button></Link>
              <Link href="/"><Button variant="outline" className="w-full py-3">العودة للرئيسية</Button></Link>
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
            <Link href="/"><h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1></Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600 mb-6">السلة فارغة</p>
          <Link href="/products"><Button className="bg-blue-600 hover:bg-blue-700">تصفح المنتجات</Button></Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.customerAddress.trim()) {
      toast.error("اكتب الاسم ورقم الموبايل والعنوان بالتفصيل أولاً");
      return;
    }
    if (paymentMethod === "vodafone_cash" && !proofFile) {
      toast.error("ارفع صورة التحويل لفودافون كاش قبل إرسال الطلب");
      return;
    }

    setLoading(true);
    try {
      let paymentProofUrl: string | undefined;

      if (paymentMethod === "vodafone_cash" && proofFile) {
        const prepared = await prepareProof(proofFile);
        const uploaded = await uploadProofMutation.mutateAsync(prepared);
        paymentProofUrl = uploaded.url;
      }

      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrderMutation.mutateAsync({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerAddress: formData.customerAddress.trim(),
        totalAmount: total.toFixed(2),
        paymentMethod,
        paymentProofUrl,
        items: orderItems,
      });

      toast.success(`تم استلام طلبك بنجاح! رقم الطلب: ${result.id}`);
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
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1></Link>
          <Link href="/cart"><Button variant="outline"><ArrowRight className="w-4 h-4 ml-2" />العودة للسلة</Button></Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">إتمام الطلب</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800">بيانات التسليم</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">الاسم الكامل *</label>
                    <Input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="اكتب اسمك بالكامل" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">رقم الموبايل *</label>
                    <Input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} placeholder="مثال: 01012345678" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">العنوان بالتفصيل *</label>
                    <textarea name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} placeholder="المدينة، المنطقة، الشارع، رقم العقار، الدور، الشقة، وأي علامة مميزة تساعد مندوب التوصيل" rows={4} required className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500" />
                    <p className="mt-1 text-xs text-gray-500">كلما كان العنوان أدق، كان التسليم أسهل وأسرع.</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">طريقة الدفع</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <button type="button" onClick={() => setPaymentMethod("cash_on_delivery")} className={`rounded-2xl border-2 p-4 text-right transition ${paymentMethod === "cash_on_delivery" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}>
                    <Banknote className="mb-2 h-7 w-7 text-blue-600" />
                    <p className="font-bold">الدفع عند الاستلام</p>
                    <p className="mt-1 text-sm text-gray-500">ادفع قيمة الطلب عند وصوله.</p>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod("vodafone_cash")} className={`rounded-2xl border-2 p-4 text-right transition ${paymentMethod === "vodafone_cash" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white"}`}>
                    <Wallet className="mb-2 h-7 w-7 text-red-600" />
                    <p className="font-bold">فودافون كاش</p>
                    <p className="mt-1 text-sm text-gray-500">حوّل على الرقم المعروض ثم ارفع صورة التحويل.</p>
                  </button>
                </div>

                {paymentMethod === "vodafone_cash" && (
                  <div className="mt-5 space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div>
                      <p className="font-bold text-red-900">رقم فودافون كاش</p>
                      <p className="mt-1 text-2xl font-black tracking-wider text-red-700">{VODAFONE_CASH_NUMBER}</p>
                      <p className="mt-2 text-sm text-red-800">تنبيه: هذا رقم تجريبي مؤقت للواجهة، ويجب استبداله برقم المحفظة الحقيقي قبل تشغيل المتجر فعليًا.</p>
                    </div>
                    <div className="rounded-xl bg-white p-4">
                      <p className="font-semibold text-gray-800">بعد التحويل</p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">يرجى إرسال Screenshot / صورة التحويل. ارفع الصورة هنا، وسيتم حفظها مع الطلب ليتمكن فريق الماركت من مراجعتها.</p>
                    </div>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-300 bg-white px-4 py-5 font-bold text-red-700 hover:bg-red-50">
                      <Upload className="h-5 w-5" />
                      {proofFile ? "تغيير صورة التحويل" : "رفع صورة التحويل"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                    </label>
                    {proofFile && <p className="text-sm text-gray-700">تم اختيار: <span className="font-semibold">{proofFile.name}</span></p>}
                  </div>
                )}
              </div>

              <div className="mt-8 border-t pt-6">
                <Button type="button" onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg">
                  {loading ? "جارٍ تجهيز الطلب..." : "إرسال طلبك للماركت"}
                </Button>
                <p className="mt-2 text-center text-xs text-gray-500">سيتم حفظ طلبك مباشرة في نظام الماركت، ونرجوا انتظار اتصال المندوب.</p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-800">ملخص الطلب</h3>
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                  return (
                    <div key={item.id} className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-600">{item.name} × {item.quantity}</span>
                      <span className="font-semibold whitespace-nowrap">{(item.quantity * price).toFixed(2)} ج.م</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} ج.م</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}