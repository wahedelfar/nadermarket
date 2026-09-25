import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Trash2, ArrowRight, Volume2, Bell, BellRing } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const knownOrderIdsRef = useRef<Set<number> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { data: ordersData } = trpc.orders.list.useQuery(undefined, {
    refetchInterval: 4000,
    refetchIntervalInBackground: true,
  });
  const { data: selectedOrderItems } = trpc.orders.getItems.useQuery(selectedOrder?.id ?? 0, { enabled: Boolean(selectedOrder?.id) });
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const deleteMutation = trpc.orders.delete.useMutation();

  useEffect(() => {
    if (ordersData) setOrders(ordersData);
  }, [ordersData]);

  useEffect(() => {
    setOrderItems(selectedOrderItems || []);
  }, [selectedOrderItems]);

  const playAlertSound = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const now = ctx.currentTime;
      [0, 0.18, 0.36].forEach((offset, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = index === 1 ? 880 : 660;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + 0.16);
      });
    } catch {}
  };

  const enableNotifications = async () => {
    await playAlertSound();
    setSoundEnabled(true);
    if ("Notification" in window) {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      setNotificationEnabled(permission === "granted");
    }
    toast.success("تم تفعيل تنبيهات الطلبات الجديدة");
  };

  useEffect(() => {
    if (!ordersData) return;
    const incoming = ordersData as any[];
    const incomingIds = new Set(incoming.map((order) => Number(order.id)));

    if (knownOrderIdsRef.current === null) {
      knownOrderIdsRef.current = incomingIds;
      setOrders(incoming);
      return;
    }

    const newOrders = incoming.filter((order) => !knownOrderIdsRef.current!.has(Number(order.id)));
    knownOrderIdsRef.current = incomingIds;
    setOrders(incoming);

    if (newOrders.length > 0) {
      void playAlertSound();
      newOrders.forEach((order) => {
        toast.error(`طلب جديد #${order.id} — ${order.customerName}`, {
          duration: 10000,
          icon: <BellRing className="h-5 w-5" />,
        });
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("طلب جديد — نادر ماركت", {
            body: `#${order.id} — ${order.customerName} — ${Number(order.totalAmount).toFixed(2)} ج.م`,
            tag: `order-${order.id}`,
          });
        }
      });
    }
  }, [ordersData]);

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus as any,
      });
      toast.success("تم تحديث حالة الطلب");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("تم حذف الطلب بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      completed: "مكتمل",
      cancelled: "ملغى",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">إدارة الطلبات</h1>
            <p className="text-sm text-gray-500 mt-1">تتحدث الطلبات تلقائياً كل 4 ثوانٍ</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={soundEnabled ? "default" : "outline"}
              onClick={enableNotifications}
              className={soundEnabled ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {soundEnabled ? <Bell className="w-4 h-4 ml-2" /> : <Volume2 className="w-4 h-4 ml-2" />}
              {soundEnabled ? "التنبيهات مفعلة" : "تفعيل صوت التنبيهات"}
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-right font-semibold text-gray-800">رقم الطلب</th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-800">العميل</th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-800">الإجمالي</th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-800">الحالة</th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-800">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">#{order.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600">
                          {parseFloat(order.totalAmount).toFixed(2)} ج.م
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            onClick={() => handleViewOrder(order)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  تفاصيل الطلب #{selectedOrder.id}
                </h2>

                <div className="mb-6 rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-900">حالة الدفع</p>
                  <p className="mt-1 font-semibold text-blue-800">{selectedOrder.paymentMethod === "vodafone_cash" ? "تم الدفع عبر Vodafone Cash — راجع إثبات التحويل قبل التأكيد" : "الدفع عند الاستلام — العميل سيدفع للمندوب عند التسليم"}</p>
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">اسم العميل</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.customerPhone}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">العنوان</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.customerAddress}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">طريقة الدفع</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.paymentMethod === "vodafone_cash" ? "Vodafone Cash — مدفوع" : "الدفع عند الاستلام — غير مدفوع"}</p>
                  </div>

                  {selectedOrder.paymentMethod === "vodafone_cash" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">رقم المحفظة</p>
                        <p className="font-semibold text-gray-800">{selectedOrder.vodafoneWalletNumber || "غير مسجل"}</p>
                      </div>
                      {selectedOrder.paymentProofUrl && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">صورة التحويل</p>
                          <a href={selectedOrder.paymentProofUrl} target="_blank" rel="noreferrer" className="block">
                            <img src={selectedOrder.paymentProofUrl} alt="صورة تحويل فودافون كاش" className="w-full max-h-64 rounded-xl border object-contain bg-gray-50" />
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">المنتجات</h3>
                  {orderItems.map((item) => (
                    <div key={item.id} className="text-sm">
                      <p className="text-gray-600">المنتج {item.productId}</p>
                      <p className="font-semibold text-gray-800">
                        {item.quantity} × {parseFloat(item.price).toFixed(2)} ج.م
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-600">الإجمالي</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {parseFloat(selectedOrder.totalAmount).toFixed(2)} ج.م
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm font-semibold text-gray-700">تحديث الحالة</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="processing">قيد المعالجة</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>

                <Button
                  onClick={() => handleDelete(selectedOrder.id)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف الطلب
                </Button>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600">اختر طلباً لعرض التفاصيل</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
