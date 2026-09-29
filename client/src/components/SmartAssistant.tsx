import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Plus, Send, ShoppingCart, Sparkles, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { askSmartAssistant, toCartItem, type SmartProduct, type CustomAssistantRequest } from "@/lib/smartAssistant";
import { getCustomerMemory, saveCustomerName, touchCustomerVisit, type CustomerMemory } from "@/lib/customerMemory";
import { getLastOrder } from "@/lib/repeatOrder";
import { getWeeklyShopping } from "@/lib/shoppingMemory";

type Props = { products: SmartProduct[] };

const starters = [
  ["نفس الطلب", "نفس طلبك المعتاد"],
  ["قائمة الأسبوع", "وريني قائمة الأسبوع"],
  ["فطار", "اقترحلي فطار"],
  ["غدا", "اقترحلي غدا"],
  ["عشا", "اقترحلي عشا"],
  ["فواكه", "إيه الفواكه عندكم؟"],
  ["لحوم", "إيه أنواع اللحوم؟"],
  ["ألبان", "إيه منتجات الألبان؟"],
  ["جبن", "إيه أنواع الجبن؟"],
  ["منظفات", "عايز منظفات"],
  ["اقتصادي", "عايز حاجة اقتصادية"],
];

type Message = {
  role: "user" | "assistant";
  text: string;
  products?: SmartProduct[];
  customRequests?: CustomAssistantRequest[];
};

function welcomeFor(memory: CustomerMemory) {
  if (memory.visits >= 3) {
    return `يا ${memory.name}! نورت الوحيد ماركت تاني 😄 اشتقنا لك. هنطلب حاجة جديدة النهارده ولا نرجع لآخر طلب؟`;
  }
  return `أهلاً يا ${memory.name}! 😄 رجعت تاني. نفس طلبك المعتاد ولا هنطلب حاجة جديدة النهارده؟`;
}

export default function SmartAssistant({ products }: Props) {
  const { items, addToCart, addCustomRequest, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [awaitingName, setAwaitingName] = useState(false);
  const [memory, setMemory] = useState<CustomerMemory | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const available = useMemo(
    () => products.filter((p) => p.isActive !== false && (!p.stock || p.stock > 0)),
    [products],
  );

  useEffect(() => {
    if (!open || messages.length) return;

    const saved = getCustomerMemory();
    if (saved) {
      const updated = touchCustomerVisit(saved);
      setMemory(updated);
      setMessages([{ role: "assistant", text: welcomeFor(updated) }]);
      return;
    }

    setAwaitingName(true);
    setMessages([
      {
        role: "assistant",
        text: "أهلاً بيك في الوحيد ماركت 👋 أنا «إسألني» مساعدك في الماركت 😄 تحب أناديك بإيه؟",
      },
    ]);
  }, [open, messages.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const ask = (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    if (awaitingName) {
      const saved = saveCustomerName(clean);
      if (!saved) return;
      setMemory(saved);
      setAwaitingName(false);
      setMessages((current) => [
        ...current,
        { role: "user", text: clean },
        {
          role: "assistant",
          text: `تشرفت بيك يا ${saved.name} 😄 نبدأ بإيه؟ فطار، غدا، ولا هنطلب حاجة جديدة النهارده؟`,
        },
      ]);
      setQuery("");
      return;
    }

    const normalized = clean.replace(/[إأآ]/g, "ا").toLowerCase();

    // Natural cart commands: "ضيف 2 لبن", "حط 3 شيبسي", etc.
    const quantityMatch = normalized.match(/(?:ضيف|حط|اضيف|أضف)\\s*(\\d+)\\s+(.+)/);
    if (quantityMatch) {
      const quantity = Math.max(1, Math.min(20, Number(quantityMatch[1])));
      const target = quantityMatch[2].trim();
      const match = available.find((product) => {
        const n = product.name.toLowerCase().replace(/[إأآ]/g, "ا");
        return n.includes(target) || target.includes(n);
      });
      if (match) {
        for (let i = 0; i < quantity; i += 1) addToCart(toCartItem(match));
        setMessages((current) => [
          ...current,
          { role: "user", text: clean },
          { role: "assistant", text: "تم 😄 ضفت " + quantity + " × " + match.name + " للسلة." },
        ]);
        setQuery("");
        return;
      }
    }

    if (/^(ضيفهم|ضيفهم للسله|حطهم|تمام ضيف|ضيف ده|ضيف دي)/.test(normalized)) {
      const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant" && ((message.products && message.products.length) || (message.customRequests && message.customRequests.length)));
      if (lastAssistant) {
        lastAssistant.products?.forEach((product) => addToCart(toCartItem(product)));
        lastAssistant.customRequests?.forEach((request) => addCustomRequest(request.text, request.quantity));
        setMessages((current) => [
          ...current,
          { role: "user", text: clean },
          { role: "assistant", text: "تمام 😄 ضفت الاختيارات للسلة، والطلبات الخاصة اتسجلت مع الطلب للإدارة." },
        ]);
        setQuery("");
        return;
      }
    }

    if (/^(شيل|احذف|الغى|مش عايز)/.test(normalized)) {
      const target = normalized.replace(/^(شيل|احذف|الغى|مش عايز)\s*/, "").trim();
      const item = items.find((cartItem) => target && cartItem.name.toLowerCase().includes(target));
      if (item) {
        removeFromCart(item.id);
        setMessages((current) => [
          ...current,
          { role: "user", text: clean },
          { role: "assistant", text: "حاضر، شلت " + item.name + " من السلة." },
        ]);
        setQuery("");
        return;
      }
    }

    // Basket-aware answers: the assistant can reason over the live cart before searching the catalog.
    if (/السله.*(اجمالي|المجموع|كام)|اجمالي.*السله/.test(normalized)) {
      const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      setMessages((current) => [
        ...current,
        { role: "user", text: clean },
        { role: "assistant", text: total > 0 ? `إجمالي السلة حاليًا ${total.toFixed(2)} جنيه. لو عايز أوفّر عليك، قولّي "خلّيها أوفر".` : "السلة لسه فاضية. قولّي عايز نبدأ بإيه وأنا أرتبها لك." },
      ]);
      setQuery("");
      return;
    }

    const cartContext = items.length
      ? `السلة الحالية: ${items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}`
      : "السلة الحالية: فارغة";

    const lastOrder = getLastOrder().filter((item) => available.some((p) => Number(p.id) === Number(item.id)));
    const weeklyShopping = getWeeklyShopping().filter((item) => available.some((p) => Number(p.id) === Number(item.id)));

    if (/نفس.*(طلب|الطلب)|الطلب.*المعتاد/.test(normalized) && lastOrder.length > 0) {
      setMessages((current) => [
        ...current,
        { role: "user", text: clean },
        {
          role: "assistant",
          text: `تمام يا ${memory?.name ?? ""} 😄 لقيت آخر طلب ليك. تحب أرجّعه للسلة؟`,
          products: lastOrder.map((item) => available.find((p) => Number(p.id) === Number(item.id))!).filter(Boolean),
        },
      ]);
      setQuery("");
      return;
    }

    if (/قائمة.*(الأسبوع|البيت)|طلبات.*الأسبوع/.test(normalized) && weeklyShopping.length > 0) {
      setMessages((current) => [
        ...current,
        { role: "user", text: clean },
        {
          role: "assistant",
          text: `حاضر يا ${memory?.name ?? ""} 😄 دي الحاجات اللي طلبتها خلال الأسبوع. نضيفهم للسلة؟`,
          products: weeklyShopping.map((item) => available.find((p) => Number(p.id) === Number(item.id))!).filter(Boolean),
        },
      ]);
      setQuery("");
      return;
    }

    if ((/نفس.*(طلب|الطلب)|الطلب.*المعتاد/.test(normalized) || /قائمة.*(الأسبوع|البيت)|طلبات.*الأسبوع/.test(normalized)) && !lastOrder.length && !weeklyShopping.length) {
      setMessages((current) => [
        ...current,
        { role: "user", text: clean },
        { role: "assistant", text: "لسه مفيش قائمة محفوظة عندي. لما تطلب من الوحيد ماركت هقدر أرجعلك مشترياتك بعد كده." },
      ]);
      setQuery("");
      return;
    }

    const r = askSmartAssistant(
      clean,
      available,
      messages.flatMap((m) => [
        m.text,
        ...(m.products ?? []).map((p) => p.name),
        ...(m.customRequests ?? []).map((request) => request.text),
      ]),
      cartContext,
    );
    setMessages((current) => [
      ...current,
      { role: "user", text: clean },
      { role: "assistant", text: r.text, products: r.products, customRequests: r.customRequests },
    ]);
    setQuery("");
  };

  const addAll = (ps: SmartProduct[]) => ps.forEach((p) => addToCart(toCartItem(p)));

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح إسألني"
          className="fixed bottom-4 left-4 z-[80] flex items-center gap-2 rounded-full border border-white/70 bg-[#073b7a] px-3 py-2 text-white shadow-[0_16px_40px_-12px_rgba(7,59,122,.65)] transition hover:-translate-y-1 hover:bg-[#0a478f] focus:outline-none focus:ring-4 focus:ring-blue-200"
          dir="rtl"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-right">
            <span className="block text-xs font-black">إسألني</span>
            <span className="block text-[9px] text-blue-100">اسألني وأنا أدوّر لك</span>
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex h-[min(620px,calc(100vh-24px))] max-w-[390px] flex-col overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_30px_80px_-25px_rgba(3,37,78,.55)]"
          dir="rtl"
        >
          <header className="shrink-0 bg-gradient-to-l from-[#073b7a] to-[#1266b8] px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black">إسألني</h2>
                  <p className="text-[11px] text-blue-100">مساعد التسوق في الوحيد ماركت</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="rounded-full p-2 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-blue-50">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <span>بيبحث في المنتجات المتاحة حاليًا</span>
            </div>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 1 && !awaitingName && (
              <div className="grid grid-cols-2 gap-2">
                {starters.map(([label, text]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => ask(text)}
                    className="rounded-2xl border border-blue-100 bg-white px-3 py-3 text-right text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-[#073b7a]"
                  >
                    <Sparkles className="mb-1 h-4 w-4 text-blue-500" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-start" : "flex justify-end"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[82%] rounded-2xl rounded-br-md bg-[#073b7a] px-4 py-3 text-sm font-medium text-white"
                      : "max-w-[94%] rounded-2xl rounded-bl-md border border-blue-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                  }
                >
                  {m.text}

                  {m.customRequests && m.customRequests.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {m.customRequests.map((request) => (
                        <div key={request.text} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black text-amber-950">طلب خاص خارج الكتالوج</p>
                              <p className="mt-1 text-sm font-bold text-slate-800">{request.text}</p>
                              <p className="mt-1 text-[10px] text-slate-500">سيظهر للإدارة مع طلبك لتجهيزه إن كان متوفرًا.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addCustomRequest(request.text, request.quantity)}
                              className="shrink-0 rounded-xl bg-amber-600 px-3 py-2 text-xs font-black text-white hover:bg-amber-700"
                            >
                              أضف للطلب
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {m.products.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-2.5">
                          <img src={p.image || "/icon.svg"} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-white object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-black text-slate-800">{p.name}</p>
                            <p className="mt-1 text-xs font-bold text-[#1266b8]">{Number(p.price).toFixed(2)} ج.م</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addToCart(toCartItem(p))}
                            aria-label={`إضافة ${p.name} للسلة`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#073b7a] text-white hover:bg-[#1266b8]"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {m.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => addAll(m.products!)}
                          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#073b7a] px-3 py-2.5 text-xs font-black text-white hover:bg-[#0a478f]"
                        >
                          <ShoppingCart className="h-4 w-4" /> إضافة كل الاختيارات للسلة
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            {!awaitingName && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {starters.map(([label, text]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => ask(text)}
                    className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-[#073b7a]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(query);
              }}
              className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50 p-1.5 focus-within:border-blue-200"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={awaitingName ? "اكتب اسمك هنا..." : "اكتب سؤالك هنا..."}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                aria-label={awaitingName ? "اكتب اسمك" : "اكتب سؤالك إلى إسألني"}
                autoFocus={awaitingName}
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#073b7a] text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-2 text-center text-[9px] text-slate-400">
              الأسعار والاختيارات مبنية على المنتجات المتاحة حاليًا.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
