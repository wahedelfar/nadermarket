import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, LogOut } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Admin() {
  const [localAuthenticated, setLocalAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const adminSession = trpc.admin.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const loginMutation = trpc.admin.login.useMutation();
  const logoutMutation = trpc.admin.logout.useMutation();
  const utils = trpc.useUtils();
  const isAuthenticated = localAuthenticated || adminSession.data?.authenticated === true;

  const { data: ordersData = [] } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const todayKey = new Date().toDateString();
  const todayOrders = (ordersData as any[]).filter((order) => new Date(order.createdAt).toDateString() === todayKey);
  const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const todayDelivered = todayOrders.filter((order) => order.status === "delivered").length;
  const todayNotDelivered = todayOrders.filter((order) => order.status !== "delivered").length;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { username: username.trim(), password },
      {
        onSuccess: async () => {
          setLocalAuthenticated(true);
          setPassword("");
          await utils.admin.me.invalidate();
          toast.success("تم تسجيل الدخول بنجاح");
        },
        onError: (error) => {
          toast.error(error.message || "بيانات الدخول غير صحيحة");
          setPassword("");
        },
      },
    );
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: async () => {
        setLocalAuthenticated(false);
        await utils.admin.me.reset();
        setUsername("");
        setPassword("");
        toast.success("تم تسجيل الخروج");
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-600 mt-2">الوحيد ماركت - الإدارة</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">اسم المستخدم</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                autoComplete="username"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                autoComplete="current-password"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
            >
              {loginMutation.isPending ? "جارٍ التحقق..." : "دخول آمن"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="outline" className="w-full">
                العودة للمتجر
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">الوحيد ماركت - الإدارة</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">العودة للمتجر</Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/setup">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-blue-50">
              <h3 className="text-xl font-bold text-green-600 mb-2">إعداد البيانات</h3>
              <p className="text-gray-600">إضافة البيانات الافتراضية والأقسام</p>
            </Card>
          </Link>

          <Link href="/admin/categories">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-blue-600 mb-2">الأقسام</h3>
              <p className="text-gray-600">إدارة أقسام المنتجات</p>
            </Card>
          </Link>

          <Link href="/admin/products">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-2">المنتجات</h3>
              <p className="text-gray-600">إضافة وتعديل المنتجات</p>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-blue-50">
              <h3 className="text-xl font-bold text-purple-600 mb-2">إعدادات المتجر</h3>
              <p className="text-gray-600">تغيير رقم فودافون كاش</p>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-2">الطلبات</h3>
              <p className="text-gray-600">إدارة الطلبات والحالات</p>
            </Card>
          </Link>
        </div>

        <Card className="mb-5 w-full max-w-3xl overflow-hidden border-blue-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-50 bg-gradient-to-l from-blue-50 to-sky-50 px-3 py-2.5">
            <h2 className="text-sm font-black text-blue-900">ملخص اليوم</h2>
            <span className="text-[11px] font-semibold text-blue-600">يتحدث تلقائيًا</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4" dir="rtl">
            <div className="border-b border-l border-blue-50 px-2.5 py-2.5 text-center md:border-b-0">
              <p className="text-[10px] font-semibold text-gray-500">المبيعات</p>
              <p className="mt-0.5 text-base font-black text-blue-700">{todaySales.toFixed(2)} <span className="text-[10px]">ج.م</span></p>
            </div>
            <div className="border-b border-blue-50 px-2.5 py-2.5 text-center md:border-b-0 md:border-l">
              <p className="text-[10px] font-semibold text-gray-500">الأوردرات</p>
              <p className="mt-0.5 text-base font-black text-gray-800">{todayOrders.length}</p>
            </div>
            <div className="border-l border-blue-50 px-2.5 py-2.5 text-center">
              <p className="text-[10px] font-semibold text-gray-500">تم التوصيل</p>
              <p className="mt-0.5 text-base font-black text-green-600">{todayDelivered}</p>
            </div>
            <div className="px-2.5 py-2.5 text-center">
              <p className="text-[10px] font-semibold text-gray-500">لسه</p>
              <p className="mt-0.5 text-base font-black text-orange-600">{todayNotDelivered}</p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">معلومات المتجر</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600">اسم المتجر</p>
              <p className="text-2xl font-bold text-blue-600">الوحيد ماركت</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600">العنوان</p>
              <p className="text-2xl font-bold text-blue-600">رأس البر - سوق 89</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600">رقم واتساب</p>
              <p className="text-2xl font-bold text-green-600">01063537686</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600">طريقة الدفع</p>
              <p className="text-2xl font-bold text-purple-600">فودافون كاش</p>
            </div>
          </div>
        </Card>
      </div>
      </div>
    );
  }

  return null;
}
