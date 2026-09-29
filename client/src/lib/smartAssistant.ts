export type SmartProduct = {
  id: number;
  categoryId: number;
  categoryName?: string | null;
  name: string;
  description?: string | null;
  price: string;
  image?: string | null;
  stock?: number;
  isActive?: boolean;
};

export type CustomAssistantRequest = {
  text: string;
  quantity: number;
};

export type AssistantResult = {
  text: string;
  products: SmartProduct[];
  customRequests: CustomAssistantRequest[];
  suggestedQuestions: string[];
  intent: "search" | "category" | "meal" | "budget" | "custom" | "help";
};

const norm = (v: string) =>
  v.toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\u0600-\u06ffa-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const groups: Record<string, string[]> = {
  ألبان: ["لبن", "حليب", "زبادي", "رايب", "لبنه", "قشطه", "كريمه"],
  جبن: ["جبنه", "جبن", "شيدر", "رومي", "فيتا", "موتزاريلا", "قريش", "مثلثات"],
  منظفات: ["منظف", "منظفات", "مسحوق", "غسيل", "كلور", "مطهر", "صابون", "معطر", "ملمع"],
  مشروبات: ["عصير", "مياه", "ماء", "مشروب", "بيبسي", "كوكا", "شاي", "قهوه", "نسكافيه"],
  سناكس: ["شيبسي", "بسكويت", "ويفر", "شوكولاته", "سناك", "مقرمشات"],
  فواكه: ["فواكه", "فاكهه", "فواكه", "تفاح", "موز", "برتقال", "مانجا", "عنب"],
  لحوم: ["لحوم", "لحمه", "لحم", "فراخ", "دجاج", "صدور", "ضأن", "بقري", "كفته", "سجق", "كبدة"],
  خضروات: ["خضار", "خضروات", "طماطم", "خيار", "بطاطس", "بصل", "ثوم"],
  بقالة: ["ارز", "سكر", "مكرونه", "زيت", "دقيق", "صلصه", "تونه", "فول", "عدس", "فاصوليا", "لوبيا"],
  مخبوزات: ["عيش", "خبز", "توست", "فينو", "مخبوزات", "مخبوز"],
  مجمدات: ["مجمد", "مجمدات", "فروزن", "خضار مجمد", "فراخ مجمده"],
};

const categoryAliases: Record<string, string[]> = {
  فواكه: ["فواكه", "فاكهه", "فاكهه", "فواكه"],
  لحوم: ["لحوم", "لحمه", "لحم"],
  خضروات: ["خضروات", "خضار"],
  ألبان: ["ألبان", "لبان", "البان"],
  بقالة: ["بقاله", "بقالة"],
  مجمدات: ["مجمدات", "مجمد"],
  مخبوزات: ["مخبوزات", "مخبوز"],
};

const meals: Record<"فطار" | "غداء" | "عشاء", string[]> = {
  فطار: ["عيش", "خبز", "توست", "مربى", "مربي", "حلاوه", "جبنه", "جبن", "لبن", "حليب", "بيض", "فول", "عسل", "زعتر", "شاي", "قهوه", "زبادي"],
  غداء: ["ارز", "عدس", "عيش", "خبز", "تونه", "فاصوليا", "لوبيا", "فراخ", "دجاج", "صدور", "لحمه", "لحم", "رنجه", "بطاطس", "مكرونه"],
  عشاء: ["عيش", "خبز", "توست", "مربى", "مربي", "حلاوه", "جبنه", "جبن", "لبن", "حليب", "بيض", "فول", "تونه", "رنجه", "زبادي", "عسل", "شاي"],
};

const exclusions: Record<"فطار" | "غداء" | "عشاء", string[]> = {
  فطار: ["مسحوق", "منظف", "كلور", "صابون", "ارز", "مكرونه", "زيت", "صلصه", "دقيق", "فاصوليا", "لوبيا"],
  غداء: ["مسحوق", "منظف", "كلور", "صابون", "معطر"],
  عشاء: ["مسحوق", "منظف", "كلور", "صابون", "ارز", "مكرونه", "زيت", "صلصه", "دقيق"],
};

const customOnlyTerms = [
  "عيش فينو",
  "عيش بلدي",
  "شيبسي",
  "سجق",
  "كبدة",
  "لحمه مفرومه",
  "لحمه مفرومة",
  "كفته",
  "بيض",
  "تونه",
  "مكرونه",
  "بطاطس",
  "بصل",
  "ثوم",
  "كاتشب",
  "مايونيز",
  "مناديل",
  "مياه معدنيه",
  "سمك",
  "جمبري",
];

const available = (p: SmartProduct) => p.isActive !== false && (p.stock === undefined || p.stock > 0);
const name = (p: SmartProduct) => norm(p.name);
const category = (p: SmartProduct) => norm(p.categoryName || "");
const hay = (p: SmartProduct) => norm([p.name, p.description || "", p.categoryName || ""].join(" "));
const price = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
const has = (p: SmartProduct, terms: string[]) => terms.some((t) => name(p).includes(norm(t)) || category(p).includes(norm(t)));

const budget = (q: string) => {
  const m = norm(q).match(/(?:حدود|ميزانيه|بميزانيه|لحد|اقل من|تحت)\s*\D{0,6}(\d{2,5})/);
  return m ? Number(m[1]) : null;
};

const people = (q: string) => {
  const m = norm(q).match(/(\d+)\s*(?:شخص|افراد|فرد|اشخاص)/);
  return m ? Number(m[1]) : null;
};

const rank = (ps: SmartProduct[], q: string) => {
  const stop = ["عايز", "عاوزه", "عاوز", "عندي", "عندكم", "ممكن", "ايه", "من", "في", "لو", "طب", "حاجه", "حاجة", "طلب"];
  const ts = norm(q).split(" ").filter((x) => x.length > 1 && !stop.includes(x));
  return ps.filter(available)
    .map((p) => ({ p, s: ts.reduce((n, t) => n + (name(p).includes(t) ? 7 : hay(p).includes(t) ? 3 : 0), 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || price(a.p.price) - price(b.p.price))
    .slice(0, 20)
    .map((x) => x.p);
};

const categoryProducts = (ps: SmartProduct[], label: string, terms: string[]) => {
  const direct = ps.filter((p) => available(p) && (terms.some((t) => category(p).includes(norm(t))) || has(p, terms)));
  if (direct.length) return direct.sort((a, b) => price(a.price) - price(b.price)).slice(0, 20);
  return ps.filter((p) => available(p) && hay(p).includes(norm(label))).sort((a, b) => price(a.price) - price(b.price)).slice(0, 20);
};

const meal = (ps: SmartProduct[], m: "فطار" | "غداء" | "عشاء", b: number | null, n: number | null) => {
  const excluded = exclusions[m];
  const mult = n && n > 2 ? Math.min(2, n / 2) : 1;
  const pool = ps.filter((p) => available(p) && has(p, meals[m]) && !excluded.some((t) => name(p).includes(norm(t)))).sort((a, b) => price(a.price) - price(b.price));
  const out: SmartProduct[] = [];
  let total = 0;
  for (const p of pool) {
    if (out.length >= 20) break;
    const c = price(p.price) * mult;
    if (total + c <= (b ?? Infinity)) {
      out.push(p);
      total += c;
    }
  }
  return { out, total, pool };
};

function customRequestsFromQuery(q: string, products: SmartProduct[]): CustomAssistantRequest[] {
  const x = norm(q);
  const results: CustomAssistantRequest[] = [];
  for (const term of customOnlyTerms) {
    const n = norm(term);
    if (!x.includes(n)) continue;
    const catalogHasIt = products.some((p) => available(p) && hay(p).includes(n));
    if (!catalogHasIt) results.push({ text: term, quantity: 1 });
  }
  return results;
}

const fallback = "فضلاً أضف طلبك من الرئيسية، لا أستطيع الوصول إلى طلبك بهذه الصيغة حاليًا.";

export function askSmartAssistant(q: string, products: SmartProduct[], history: string[] = []): AssistantResult {
  const x = norm(q);
  const ps = products.filter(available);
  const customRequests = customRequestsFromQuery(q, ps);

  if (!x) {
    return {
      text: "أنا جاهز. قولّي عايز تشتري إيه، وأنا أساعدك من منتجات الوحيد ماركت الموجودة حاليًا.",
      products: [],
      customRequests: [],
      suggestedQuestions: ["اقترحلي فطار", "اقترحلي غدا", "اقترحلي عشا", "إيه أنواع اللحوم؟"],
      intent: "help",
    };
  }

  const context = norm(history.slice(-8).join(" "));
  const b = budget(x);
  const n = people(x);
  const m = x.includes("فطار") ? "فطار" : x.includes("غدا") || x.includes("غداء") ? "غداء" : x.includes("عشا") || x.includes("عشاء") ? "عشاء" : null;

  if (m) {
    const { out, pool } = meal(ps, m, b, n);
    return {
      text: out.length
        ? "تمام. فهمت إنك بتدور على " + m + "، ودي اختيارات مناسبة فعلًا للوجبة من المنتجات الموجودة عندنا." + (n ? " مناسبة لحوالي " + n + " أفراد." : "") + (b ? " وفي حدود " + b + " جنيه." : "")
        : pool.length ? "عندي منتجات مرتبطة بـ" + m + "، لكن الميزانية الحالية لا تكفي لاقتراح مناسب." : "مش ظاهر عندي حاليًا منتجات كفاية لبناء اقتراح " + m + ".",
      products: out,
      customRequests,
      suggestedQuestions: ["إيه الأرخص؟", "بدّل الاختيارات", "زود اختيارات", "إضافة الكل للسلة"],
      intent: b ? "budget" : "meal",
    };
  }

  if (x.includes("انواع اللحوم") || x.includes("انواع اللحم") || x.includes("اللحوم ايه")) {
    const out = categoryProducts(ps, "لحوم", ["لحوم", "لحم", "فراخ", "دجاج"]);
    return {
      text: out.length ? "عندنا حاليًا: " + out.map((p) => p.name).join("، ") + ". ولو عايز أضيف نوع معين للسلة، قولّي اسمه." : fallback,
      products: out,
      customRequests,
      suggestedQuestions: ["الأرخص؟", "ضيف الدجاج", "ضيف اللحم البقري"],
      intent: "category",
    };
  }

  const categoryMatch = Object.entries(categoryAliases).find(([, terms]) => terms.some((t) => x.includes(norm(t))));
  if (categoryMatch) {
    const [label, terms] = categoryMatch;
    const out = categoryProducts(ps, label, terms);
    return {
      text: out.length
        ? "أيوه، دي كل الاختيارات المتاحة حاليًا في " + label + "."
        : fallback,
      products: out,
      customRequests,
      suggestedQuestions: label === "لحوم" ? ["إيه أنواع اللحوم؟", "الأرخص؟", "ضيفهم للسلة"] : ["الأرخص؟", "عندكم أنواع تانية؟", "ضيف الكل للسلة"],
      intent: "category",
    };
  }

  const cheap = x.includes("ارخص") || x.includes("اقتصادي") || x.includes("اوفر") || x.includes("موفر");
  if ((cheap || x.includes("بدل") || x.includes("بديل")) && context) {
    const out = rank(ps, context).sort((a, b) => price(a.price) - price(b.price));
    if (out.length) {
      return {
        text: cheap ? "تمام، دي اختيارات أوفر من الموجود عندنا." : "أكيد، دي بدائل من نفس الكتالوج.",
        products: out,
        customRequests,
        suggestedQuestions: ["الأرخص؟", "ضيف ده للسلة", "زود اختيارات", "اقترحلي حاجة تانية"],
        intent: "budget",
      };
    }
  }

  const group = Object.entries(groups).find(([, terms]) => terms.some((v) => x.includes(norm(v))));
  if (group) {
    const out = categoryProducts(ps, group[0], group[1]);
    return {
      text: out.length
        ? "تمام، دي المنتجات المتاحة حاليًا في " + group[0] + "."
        : customRequests.length
          ? "المنتج ده مش موجود في الكتالوج، لكن أقدر أضيفه كطلب خاص يوصّل للإدارة مع الطلب."
          : fallback,
      products: out,
      customRequests,
      suggestedQuestions: ["الأرخص؟", "عندكم أنواع تانية؟", "ضيف الكل للسلة", "إيه المناسب للغداء؟"],
      intent: customRequests.length && !out.length ? "custom" : "category",
    };
  }

  const out = rank(ps, x);
  if (out.length || customRequests.length) {
    return {
      text: customRequests.length
        ? (out.length ? "لقيت المنتجات الموجودة عندنا، وكمان لقيت طلبًا غير موجود في الكتالوج. تقدر تضيفه كطلب خاص للإدارة مع طلبك." : "الطلب ده مش موجود في الكتالوج، لكن أقدر أضيفه كطلب خاص للإدارة مع طلبك.")
        : "لقيت لك اختيارات من الكتالوج الحالي. اختار اللي يعجبك بعلامة +، ولو عايزني أغيّرها أو أدوّر على الأرخص قولّي.",
      products: out,
      customRequests,
      suggestedQuestions: ["الأرخص؟", "عندك بدائل؟", "اقترحلي غدا", "إضافة الكل للسلة"],
      intent: customRequests.length ? "custom" : cheap ? "budget" : "search",
    };
  }

  return { text: fallback, products: [], customRequests: [], suggestedQuestions: ["اقترحلي فطار", "اقترحلي غدا", "اقترحلي عشا", "إيه أنواع اللحوم؟"], intent: "help" };
}

export const toCartItem = (p: SmartProduct) => ({
  id: Number(p.id),
  categoryId: Number(p.categoryId),
  name: String(p.name),
  price: String(p.price),
  image: p.image ? String(p.image) : undefined,
  quantity: 1,
});
