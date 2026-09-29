import { useEffect, useMemo, useState } from "react";
import { Check, ShoppingCart, Sparkles, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { SmartProduct } from "@/lib/smartAssistant";
import { dailyOffers } from "@/lib/dailyOffers";

type Props = { products: SmartProduct[] };

const SEEN_PREFIX = "nader-market:daily-offer-seen-v2:";

const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${SEEN_PREFIX}${year}-${month}-${day}`;
};

export default function DailyOfferPopup({ products }: Props) {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);

  const offer = useMemo(() => dailyOffers(products)[0] ?? null, [products]);

  useEffect(() => {
    if (!offer || typeof window === "undefined") return;
    const key = todayKey();
    if (window.localStorage.getItem(key) === "1") return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [offer]);

  const close = () => {
    if (offer) window.localStorage.setItem(todayKey(), "1");
    setOpen(false);
  };

  if (!open || !offer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-[2px]" dir="rtl" role="dialog" aria-modal="true" aria-label="عرض اليوم">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_80px_-25px_rgba(7,59,122,.55)]">
        <button type="button" onClick={close} aria-label="إغلاق العرض" className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md hover:bg-white">
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-[#073b7a] via-[#0b4f9e] to-[#4aa8ef] px-5 pb-5 pt-6 text-white">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> عرض اليوم
          </div>
          <h2 className="text-2xl font-black">خصم/عرض مميز من الوحيد ماركت</h2>
          <p className="mt-1 text-sm text-blue-100">عرض واحد فقط عند الدخول — بدون إزعاج.</p>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40">
            <div className="aspect-[4/3] bg-white">
              <img src={offer.image || "/icon.svg"} alt={offer.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-black text-slate-900">{offer.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{String(offer.description || "").replace(/\[?(عرض|خصم) اليوم\]?/g, "").trim() || "اختيار مميز متاح حاليًا."}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="text-2xl font-black text-[#073b7a]">
                  {Number(offer.price).toFixed(2)} <span className="text-sm">ج.م</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                  <Check className="h-3 w-3" /> متاح الآن
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { addToCart({ ...offer, quantity: 1 }); close(); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#073b7a] px-4 py-3.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0a478f]"
          >
            <ShoppingCart className="h-4 w-4" /> أضف العرض للسلة
          </button>
          <button type="button" onClick={close} className="mt-2 w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600">
            تجاهل العرض
          </button>
        </div>
      </div>
    </div>
  );
}
