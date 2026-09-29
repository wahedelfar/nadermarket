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

export type CustomAssistantRequest = { text: string; quantity: number };

export type AssistantResult = {
  text: string;
  products: SmartProduct[];
  customRequests: CustomAssistantRequest[];
  suggestedQuestions: string[];
  intent: "search" | "category" | "meal" | "budget" | "custom" | "help";
};

const norm = (v: string) => v.toLowerCase().replace(/[إأآا]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[^\u0600-\u06ffa-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();

const groups: Record<string, string[]> = {
  ألبان: ["لبن", "حليب", "زبادي", "رايب", "لبنه", "قشطه", "كريمه"],
  جبن: ["جبنه", "جبن", "شيدر", "رومي", "فيتا", "موتزاريلا", "قريش", "مثلثات"],
  منظفات: ["منظف", "منظفات", "مسحوق", "غسيل", "كلور", "مطهر", "صابون", "معطر", "ملمع"],
  مشروبات: ["عصير", "مياه", "ماء", "مشروب", "بيبسي", "كوكا", "شاي", "قهوه", "نسكافيه"],
  سناكس: ["شيبسي", "بسكويت", "ويفر", "شوكولاته", "سناك", "مقرمشات"],
  فواكه: ["فواكه", "فاكهه", "تفاح", "موز", "برتقال", "مانجا", "عنب"],
  لحوم: ["لحوم", "لحمه", "لحم", "فراخ", "دجاج", "صدور", "ضأن", "بقري", "كفته", "سجق", "كبدة"],
  خضروات: ["خضار", "خضروات", "طماطم", "خيار", "بطاطس", "بصل", "ثوم"],
  بقالة: ["ارز", "سكر", "مكرونه", "زيت", "دقيق", "صلصه", "تونه", "فول", "عدس", "فاصوليا", "لوبيا"],
  مخبوزات: ["عيش", "خبز", "توست", "فينو", "مخبوزات", "مخبوز"],
  مجمدات: ["مجمد", "مجمدات", "فروزن", "خضار مجمد", "فراخ مجمده"],
};

const categoryAliases: Record<string, string[]> = {
  فواكه: ["فواكه", "فاكهه"], لحوم: ["لحوم", "لحمه", "لحم"], خضروات: ["خضروات", "خضار"],
  ألبان: ["ألبان", "لبان", "البان"], بقالة: ["بقاله", "بقالة"], مجمدات: ["مجمدات", "مجمد"], مخبوزات: ["مخبوزات", "مخبوز"],
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

const customOnlyTerms = ["عيش فينو", "عيش بلدي", "شيبسي", "سجق", "كبدة", "لحمه مفرومه", "لحمه مفرومة", "كفته", "بيض", "تونه", "مكرونه", "بطاطس", "بصل", "ثوم", "كاتشب", "مايونيز", "مناديل", "مياه معدنيه", "سمك", "جمبري"];
const available = (p: SmartProduct) => p.isActive !== false && (p.stock === undefined || p.stock > 0);
const name = (p: SmartProduct) => norm(p.name);
const category = (p: SmartProduct) => norm(p.categoryName || "");
const hay = (p: SmartProduct) => norm([p.name, p.description || "", p.categoryName || ""].join(" "));
const price = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
const has = (p: SmartProduct, terms: string[]) => terms.some((t) => name(p).includes(norm(t)) || category(p).includes(norm(t)));

const budget = (q: string) => {
  const x = norm(q);
  const m = x.match(/(?:حدود|ميزانيه|بميزانيه|لحد|اقل من|تحت|معايا|عندي)\s*\D{0,8}(\d{2,5})/) || x.match(/(\d{2,5})\s*(?:جنيه|ج|جنيهات)/);
  return m ? Number(m[1]) : null;
};

const people = (q: string) => {
  const m = norm(q).match(/(\d+)\s*(?:شخص|افراد|فرد|اشخاص)/);
  return m ? Number(m[1]) : null;
};

const days = (q: string) => {
  const x = norm(q);
  const m = x.match(/(\d+)\s*(?:يوم|ايام|اسبوع|اسابيع)/);
  if (m) return x.includes("اسبوع") || x.includes("اسابيع") ? Number(m[1]) * 7 : Number(m[1]);
  if (x.includes("الاسبوع") || x.includes("الأسبوع") || x.includes("اسبوع")) return 7;
  return null;
};

const rank = (ps: SmartProduct[], q: string) => {
  const stop = new Set(["عايز","عاوزه","عاوز","نفسي","محتاج","محتاجه","عندي","عندكم","ممكن","ايه","من","في","لو","طب","حاجه","حاجة","طلب","هات","جيب","وريني","مناسب"]);
  const tokens = norm(q).split(" ").filter((x) => x.length > 1 && !stop.has(x));
  return ps.filter(available).map((p) => {
    const pn = name(p), ph = hay(p), pc = category(p); let score = 0;
    for (const token of tokens) {
      if (pn === token) score += 18; else if (pn.includes(token)) score += token.length >= 4 ? 10 : 6; else if (pc.includes(token)) score += 8; else if (ph.includes(token)) score += 3;
    }
    if (pn.length > 2 && norm(q).includes(pn)) score += 12;
    return { p, score };
  }).filter((x) => x.score > 0).sort((a,b) => b.score - a.score || price(a.p.price) - price(b.p.price)).slice(0,8).map((x) => x.p);
};

const categoryProducts = (ps: SmartProduct[], label: string, terms: string[]) => {
  const direct = ps.filter((p) => available(p) && (terms.some((t) => category(p).includes(norm(t))) || has(p, terms)));
  if (direct.length) return direct.sort((a,b) => price(a.price) - price(b.price)).slice(0,8);
  return ps.filter((p) => available(p) && hay(p).includes(norm(label))).sort((a,b) => price(a.price) - price(b.price)).slice(0,8);
};

const catalogCategoryIndex = (ps: SmartProduct[]) => {
  const seen = new Set<string>();
  return ps.filter(available).map((p) => category(p)).filter((v) => { if (!v || seen.has(v)) return false; seen.add(v); return true; });
};

const productsForCatalogCategory = (ps: SmartProduct[], categoryName: string) => ps.filter((p) => available(p) && category(p) === norm(categoryName)).sort((a,b) => price(a.price) - price(b.price)).slice(0,30);
const findCatalogCategory = (ps: SmartProduct[], query: string) => {
  const x = norm(query);
  return catalogCategoryIndex(ps).filter((c) => x.includes(c) || c.split(" ").some((w) => w.length > 1 && x.includes(w))).sort((a,b) => b.length-a.length)[0] ?? null;
};

const meal = (ps: SmartProduct[], m: "فطار" | "غداء" | "عشاء", b: number | null, n: number | null) => {
  const excluded = exclusions[m], mult = n && n > 2 ? Math.min(2, n / 2) : 1;
  const categoryHints = m === "فطار" ? ["مخبوز","ألبان","جبن","بقاله"] : m === "غداء" ? ["لحوم","دواجن","بقاله","خضروات","مجمدات"] : ["مخبوز","ألبان","جبن","سناكس","بقاله"];
  const pool = ps.filter((p) => available(p) && !excluded.some((t) => name(p).includes(norm(t))) && (has(p, meals[m]) || categoryHints.some((h) => category(p).includes(norm(h))))).sort((a,b) => {
    const as = (has(a, meals[m]) ? 4 : 0) + categoryHints.filter((h) => category(a).includes(norm(h))).length;
    const bs = (has(b, meals[m]) ? 4 : 0) + categoryHints.filter((h) => category(b).includes(norm(h))).length;
    return bs-as || price(a.price)-price(b.price);
  });
  const out: SmartProduct[] = []; let total = 0;
  for (const p of pool) { if (out.length >= 8) break; const c = price(p.price) * mult; if (total+c <= (b ?? Infinity)) { out.push(p); total += c; } }
  return { out, total, pool };
};

/* Shopping Copilot planner: builds a diversified basket from the live catalog.
   It never invents products and never changes quantities or the cart itself. */
const shoppingPlan = (ps: SmartProduct[], q: string, b: number | null, n: number | null, d: number | null) => {
  const weekly = /مقاضي|مشتريات|قائمة|البيت|الاسبوع|اسبوع|احتياجات البيت|تموين/.test(norm(q));
  if (!weekly) return null;
  const targetBudget = b ?? Math.max(120, (n ?? 2) * Math.max(1, d ?? 3) * 35);
  const categories = ["بقاله", "لحوم", "خضروات", "فواكه", "ألبان", "جبن", "مخبوزات", "مشروبات", "سناكس"];
  const selected: SmartProduct[] = [];
  let total = 0;
  for (const cat of categories) {
    const candidates = ps.filter((p) => available(p) && (category(p).includes(cat) || has(p, groups[cat] ?? []))).sort((a,b) => price(a.price)-price(b.price));
    const pick = candidates.find((p) => total + price(p.price) <= targetBudget);
    if (pick) { selected.push(pick); total += price(pick.price); }
  }
  const ranked = ps.filter(available).sort((a,b) => price(a.price)-price(b.price));
  for (const p of ranked) {
    if (selected.length >= 12 || total + price(p.price) > targetBudget) continue;
    if (selected.some((s) => s.id === p.id)) continue;
    selected.push(p); total += price(p.price);
  }
  return { selected, total, targetBudget };
};

function genericCustomRequest(q: string, products: SmartProduct[]): CustomAssistantRequest | null {
  const x = norm(q), match = x.match(/(?:عايز|عاوزه|عاوز|محتاج|محتاجه|هات|جيب|ممكن)\s*(?:\d+\s+)?(.+)/);
  if (!match) return null;
  const cleaned = match[1].trim().replace(/^(من|في|عندكم|للغدا|للفطار|للعشا)\s+/,"").trim();
  if (!cleaned || cleaned.split(" ").length > 6) return null;
  if (products.some((p) => available(p) && hay(p).includes(cleaned))) return null;
  if (["فطار","غداء","غدا","عشاء","عشا","اقتصادي","ارخص","حلو","سناك","فواكه","لحوم","جبن","البان","منظفات","مشروبات","مقاضي","مشتريات","قائمة"].some((w) => cleaned.includes(norm(w)))) return null;
  const quantity = Number(x.match(/(?:عايز|عاوزه|عاوز|محتاج|محتاجه|هات|جيب|ممكن)\s*(\d+)/)?.[1] || 1);
  return { text: cleaned, quantity: Math.max(1, Math.min(20, quantity)) };
}

function customRequestsFromQuery(q: string, products: SmartProduct[]): CustomAssistantRequest[] {
  const x = norm(q), results: CustomAssistantRequest[] = [];
  for (const term of customOnlyTerms) {
    const n = norm(term);
    if (x.includes(n) && !products.some((p) => available(p) && hay(p).includes(n))) results.push({ text: term, quantity: 1 });
  }
  return results;
}

const fallback = "فضلاً أضف طلبك من الرئيسية، لا أستطيع الوصول إلى طلبك بهذه الصيغة حاليًا.";

/* Product alternatives must stay within the same product type, not merely
   the same broad store category. Example: cheese -> cheese, never milk/yogurt. */
const semanticProductGroup = (p: SmartProduct) => {
  const h = hay(p);
  const priority = ["جبن", "ألبان", "لحوم", "فواكه", "خضروات", "مخبوزات", "مشروبات", "سناكس", "منظفات", "بقالة", "مجمدات"];
  for (const label of priority) {
    const terms = groups[label] ?? [];
    if (terms.some((term) => h.includes(norm(term)))) return label;
  }
  return null;
};

const cheaperAlternative = (ps: SmartProduct[], context: string) => {
  const target = rank(ps, context)[0];
  if (!target) return [];
  const targetPrice = price(target.price);
  if (targetPrice <= 0) return [];

  const targetGroup = semanticProductGroup(target);
  const targetCategory = category(target);

  return ps
    .filter((p) => {
      if (!available(p) || p.id === target.id || price(p.price) <= 0 || price(p.price) >= targetPrice) return false;
      // If the product has a known semantic type, it is the hard boundary.
      if (targetGroup) return semanticProductGroup(p) === targetGroup;
      // Only fall back to exact catalog category when no semantic type is detectable.
      return Boolean(targetCategory) && category(p) === targetCategory;
    })
    .sort((a, b) => price(a.price) - price(b.price))
    .slice(0, 4);
};

export function askSmartAssistant(q: string, products: SmartProduct[], history: string[] = [], cartContext = ""): AssistantResult {
  const x = norm(q), ps = products.filter(available);
  const explicitCustom = customRequestsFromQuery(q, ps), genericCustom = explicitCustom.length ? null : genericCustomRequest(q, ps);
  const customRequests = explicitCustom.length ? explicitCustom : (genericCustom ? [genericCustom] : []);
  if (!x) return { text: "أنا جاهز. قولّي عايز تشتري إيه، وأنا أساعدك من منتجات الوحيد ماركت الموجودة حاليًا.", products: [], customRequests: [], suggestedQuestions: ["اقترحلي فطار","اقترحلي غدا","اقترحلي عشا","إيه أنواع اللحوم؟"], intent: "help" };

  const context = norm(history.slice(-8).join(" ")), b = budget(x), n = people(x), d = days(x);
  const m = x.includes("فطار") ? "فطار" : x.includes("غدا") || x.includes("غداء") ? "غداء" : x.includes("عشا") || x.includes("عشاء") ? "عشاء" : null;

  const plan = shoppingPlan(ps, x, b, n, d);
  if (plan && plan.selected.length) {
    const duration = d ? ` لمدة حوالي ${d} يوم` : "";
    const persons = n ? ` لـ${n} أفراد` : "";
    const budgetText = b ? ` في حدود ${b} جنيه` : ` بميزانية تقديرية ${plan.targetBudget} جنيه`;
    return {
      text: `تمام. فهمت إنك عايز خطة مشتريات${duration}${persons}${budgetText}. رتبت لك سلة متنوعة من الكتالوج الحالي، وبدأت بالأساسيات ثم التنويع. الإجمالي التقريبي للاختيارات دي ${plan.total.toFixed(2)} جنيه.`,
      products: plan.selected,
      customRequests,
      suggestedQuestions: ["قلل الميزانية", "زود فواكه", "بدّل اللحوم", "ضيفهم للسلة"],
      intent: b ? "budget" : "search",
    };
  }

  const wantsMore = x.includes("زود") || x.includes("كمان") || x.includes("تاني") || x.includes("المزيد") || x.includes("غيرهم");
  const wantsCheapest = x.includes("ارخص") || x.includes("اقتصادي") || x.includes("اوفر") || x.includes("موفر");
  if ((wantsMore || wantsCheapest || x.includes("بدل")) && context) {
    if (wantsCheapest) {
      const alternatives = cheaperAlternative(ps, context);
      if (alternatives.length) {
        const original = rank(ps, context)[0];
        return {
          text: `تمام. بدل ما أخلط لك أنواع مختلفة، دي اختيارات أرخص من نفس نوع ${original?.name ?? "المنتج"}.`,
          products: alternatives,
          customRequests,
          suggestedQuestions: ["ضيف الأرخص", "بدّل الاختيار", "زود بدائل", "رجّع الاختيارات"],
          intent: "budget",
        };
      }
    }
    const contextual = rank(ps, context);
    if (contextual.length) {
      return {
        text: "أكيد، زودت لك اختيارات تانية من نفس الكتالوج.",
        products: contextual.slice(0, 8),
        customRequests,
        suggestedQuestions: ["الأرخص؟", "بدّلهم", "ضيفهم للسلة", "اقترح حاجة تانية"],
        intent: "search",
      };
    }
  }

  if (m) {
    const { out, pool } = meal(ps,m,b,n);
    return { text: out.length ? "تمام. فهمت إنك بتدور على " + m + "، ودي اختيارات مناسبة فعلًا للوجبة من المنتجات الموجودة عندنا." + (n ? " مناسبة لحوالي " + n + " أفراد." : "") + (b ? " وفي حدود " + b + " جنيه." : "") : pool.length ? "عندي منتجات مرتبطة بـ" + m + "، لكن الميزانية الحالية لا تكفي لاقتراح مناسب." : "مش ظاهر عندي حاليًا منتجات كفاية لبناء اقتراح " + m + ".", products: out, customRequests, suggestedQuestions: ["إيه الأرخص؟","بدّل الاختيارات","زود اختيارات","إضافة الكل للسلة"], intent: b ? "budget" : "meal" };
  }

  const catalogCategory = findCatalogCategory(ps,x);
  if (catalogCategory && !m) {
    const out = productsForCatalogCategory(ps,catalogCategory);
    return { text: out.length ? "أيوه، دي المنتجات المتاحة حاليًا في قسم " + catalogCategory + "." : fallback, products: out, customRequests, suggestedQuestions: ["الأرخص؟","ضيف الكل للسلة","عندكم أنواع تانية؟"], intent: "category" };
  }

  if (x.includes("انواع اللحوم") || x.includes("انواع اللحم") || x.includes("اللحوم ايه")) {
    const out = categoryProducts(ps,"لحوم",["لحوم","لحم","فراخ","دجاج"]);
    return { text: out.length ? "عندنا حاليًا: " + out.map((p) => p.name).join("، ") + ". ولو عايز أضيف نوع معين للسلة، قولّي اسمه." : fallback, products: out, customRequests, suggestedQuestions: ["الأرخص؟","ضيف الدجاج","ضيف اللحم البقري"], intent: "category" };
  }

  const categoryMatch = Object.entries(categoryAliases).find(([,terms]) => terms.some((t) => x.includes(norm(t))));
  if (categoryMatch) {
    const [label,terms] = categoryMatch, out = categoryProducts(ps,label,terms);
    return { text: out.length ? "أيوه، دي كل الاختيارات المتاحة حاليًا في " + label + "." : fallback, products: out, customRequests, suggestedQuestions: label === "لحوم" ? ["إيه أنواع اللحوم؟","الأرخص؟","ضيفهم للسلة"] : ["الأرخص؟","عندكم أنواع تانية؟","ضيف الكل للسلة"], intent: "category" };
  }

  const cheap = x.includes("ارخص") || x.includes("اقتصادي") || x.includes("اوفر") || x.includes("موفر");
  const asksAlternative = x.includes("بدل") || x.includes("بديل");
  if ((cheap || asksAlternative) && context) {
    const alternatives = asksAlternative ? cheaperAlternative(ps, context) : [];
    if (alternatives.length) {
      const original = rank(ps, context)[0];
      return {
        text: `لو محتاج بديل أرخص لـ ${original?.name ?? "المنتج"}، عندي اختيار من نفس القسم: ${alternatives[0].name}. تحب أبدّله لك؟`,
        products: alternatives,
        customRequests,
        suggestedQuestions: ["بدّل ده", "الأرخص؟", "وريني بدائل تانية"],
        intent: "budget",
      };
    }

    const out = rank(ps, context).sort((a,b) => price(a.price)-price(b.price));
    if (cheap && out.length) {
      return {
        text: "تمام، دي الاختيارات الأرخص من المنتجات اللي كنا بنتكلم عنها.",
        products: out,
        customRequests,
        suggestedQuestions: ["بدّل ده", "زود اختيارات", "ضيف ده للسلة"],
        intent: "budget",
      };
    }

    if (asksAlternative) {
      return {
        text: "دورت في الكتالوج الحالي، ومش لاقي بديل أرخص من نفس القسم للمنتج ده حاليًا.",
        products: [],
        customRequests,
        suggestedQuestions: ["وريني المنتج الأصلي", "دور على الأرخص", "اقترحلي حاجة تانية"],
        intent: "budget",
      };
    }
  }

  const group = Object.entries(groups).find(([,terms]) => terms.some((v) => x.includes(norm(v))));
  if (group) {
    const out = categoryProducts(ps,group[0],group[1]);
    return { text: out.length ? "تمام، دي المنتجات المتاحة حاليًا في " + group[0] + "." : customRequests.length ? "المنتج ده مش موجود في الكتالوج، لكن أقدر أضيفه كطلب خاص يوصّل للإدارة مع الطلب." : fallback, products: out, customRequests, suggestedQuestions: ["الأرخص؟","عندكم أنواع تانية؟","ضيف الكل للسلة","إيه المناسب للغداء؟"], intent: customRequests.length && !out.length ? "custom" : "category" };
  }

  const out = rank(ps,x);
  if (out.length || customRequests.length) return { text: customRequests.length ? (out.length ? "لقيت المنتجات الموجودة عندنا، وكمان لقيت طلبًا غير موجود في الكتالوج. تقدر تضيفه كطلب خاص للإدارة مع طلبك." : "الطلب ده مش موجود في الكتالوج، لكن أقدر أضيفه كطلب خاص للإدارة مع طلبك.") : "لقيت لك اختيارات من الكتالوج الحالي. اختار اللي يعجبك بعلامة +، ولو عايزني أغيّرها أو أدوّر على الأرخص قولّي.", products: out, customRequests, suggestedQuestions: ["الأرخص؟","عندك بدائل؟","اقترحلي غدا","إضافة الكل للسلة"], intent: customRequests.length ? "custom" : cheap ? "budget" : "search" };
  return { text: fallback, products: [], customRequests: [], suggestedQuestions: ["اقترحلي فطار","اقترحلي غدا","اقترحلي عشا","إيه أنواع اللحوم؟"], intent: "help" };
}

export const toCartItem = (p: SmartProduct) => ({ id: Number(p.id), categoryId: Number(p.categoryId), name: String(p.name), price: String(p.price), image: p.image ? String(p.image) : undefined, quantity: 1 });
