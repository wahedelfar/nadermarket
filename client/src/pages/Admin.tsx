import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Admin() {
  const { user, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(true);

  // Default admin credentials
  const ADMIN_PASSWORD = "admin123";

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
      toast.success("تم تسجيل الدخول بنجاح");
    } else {
      toast.error("كلمة المرور غير صحيحة");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setShowPasswordForm(true);
    toast.success("تم تسجيل الخروج");
  };

  if (showPasswordForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-600 mt-2">نادر ماركت - الإدارة</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
            >
              دخول
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">نادر ماركت - الإدارة</h1>
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
          <Link href="/admin/categories">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-2">الأقسام</h3>
              <p className="text-gray-600">إدارة أقسام المنتجات</p>
            </Card>
          </Link>

          <Link href="/admin/products">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-2">المنتجات</h3>
              <p className="text-gray-600">إضافة وتعديل المنتجات</p>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-2">الطلبات</h3>
              <p className="text-gray-600">إدارة الطلبات والحالات</p>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">معلومات المتجر</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600">اسم المتجر</p>
              <p className="text-2xl font-bold text-blue-600">نادر ماركت</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600">العنوان</p>
              <p className="text-2xl font-bold text-blue-600">رأس البر - سوق 89</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600">رقم واتساب</p>
              <p className="text-2xl font-bold text-green-600">01004520056</p>
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
