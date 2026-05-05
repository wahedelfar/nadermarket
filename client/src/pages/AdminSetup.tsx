import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const seedMutation = trpc.admin.seed.useMutation();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          window.location.href = "/admin/products";
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">إعداد المتجر</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              مرحباً بك في نادر ماركت
            </h2>
            <p className="text-gray-600">
              يبدو أن هذه أول مرة تستخدم المتجر. دعنا نضيف البيانات الافتراضية.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-4">ماذا سيتم إضافته؟</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span>8 أقسام (اللحوم، البقوليات، الألبان، إلخ)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span>20 منتج متنوع مع أسعار وأوصاف</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span>صور توضيحية لكل منتج</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 ml-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "إضافة البيانات الافتراضية"
              )}
            </Button>

            <Link href="/admin">
              <Button variant="outline" className="w-full">
                العودة إلى الإدارة
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p>
              <strong>ملاحظة:</strong> يمكنك إضافة المزيد من المنتجات والأقسام لاحقاً من
              لوحة التحكم.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
