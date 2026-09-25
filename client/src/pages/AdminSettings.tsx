import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data, isLoading } = trpc.store.settings.useQuery();
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState("");
  const utils = trpc.useUtils();
  const updateMutation = trpc.store.updateSettings.useMutation({
    onSuccess: async (result) => {
      setVodafoneCashNumber(result.vodafoneCashNumber);
      await utils.store.settings.invalidate();
      toast.success("تم حفظ رقم فودافون كاش");
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ الإعدادات"),
  });

  useEffect(() => {
    if (data?.vodafoneCashNumber) setVodafoneCashNumber(data.vodafoneCashNumber);
  }, [data?.vodafoneCashNumber]);

  const normalizeDigits = (value: string) => value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

  const save = () => {
    const number = normalizeDigits(vodafoneCashNumber).replace(/[^0-9]/g, "").slice(0, 11);
    if (!/^01[0125][0-9]{8}$/.test(number)) {
      toast.error("رقم فودافون كاش يجب أن يكون رقمًا مصريًا صحيحًا مكوّنًا من 11 رقمًا");
      return;
    }
    updateMutation.mutate({ vodafoneCashNumber: number });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">إعدادات الوحيد ماركت</h1>
          <Link href="/admin"><Button variant="outline"><ArrowRight className="w-4 h-4 ml-2" />العودة للإدارة</Button></Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card className="max-w-xl p-6">
          <h2 className="text-xl font-bold text-gray-800">رقم فودافون كاش</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            الرقم الذي يظهر للعميل في صفحة الدفع. تغييره هنا يغيّر الرقم المستخدم في الطلبات الجديدة بدون تعديل الكود.
          </p>
          <div className="mt-5">
            <label className="block text-gray-700 font-semibold mb-2">رقم المحفظة</label>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={vodafoneCashNumber}
              onChange={(e) => setVodafoneCashNumber(normalizeDigits(e.target.value).replace(/[^0-9]/g, "").slice(0, 11))}
              placeholder="01012345678"
            />
          </div>
          <Button onClick={save} disabled={isLoading || updateMutation.isPending} className="mt-5 w-full bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 ml-2" />
            {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ رقم فودافون كاش"}
          </Button>
        </Card>
      </main>
    </div>
  );
}
