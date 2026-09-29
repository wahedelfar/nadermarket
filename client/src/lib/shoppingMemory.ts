import { parseStoredCart, type CartItem } from "@/lib/cartStorage";

const WEEKLY_KEY = "nader-market:weekly-shopping-v1";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type WeeklyEntry = {
  item: CartItem;
  lastBoughtAt: number;
  quantityBought: number;
};

function read(): WeeklyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WEEKLY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - WEEK_MS;
    return parsed.filter(
      (entry) =>
        entry &&
        entry.item &&
        Number.isInteger(entry.item.id) &&
        typeof entry.item.name === "string" &&
        Number(entry.lastBoughtAt) >= cutoff,
    );
  } catch {
    return [];
  }
}

function write(entries: WeeklyEntry[]) {
  try {
    window.localStorage.setItem(WEEKLY_KEY, JSON.stringify(entries));
  } catch {
    // Shopping memory is optional; checkout must never fail because storage is unavailable.
  }
}

export function saveWeeklyPurchase(items: CartItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;

  const now = Date.now();
  const existing = read();
  const byId = new Map(existing.map((entry) => [entry.item.id, entry]));

  for (const item of items) {
    const previous = byId.get(item.id);
    byId.set(item.id, {
      item,
      lastBoughtAt: now,
      quantityBought: (previous?.quantityBought ?? 0) + item.quantity,
    });
  }

  write([...byId.values()].sort((a, b) => b.lastBoughtAt - a.lastBoughtAt));
}

export function getWeeklyShopping(): CartItem[] {
  return read()
    .sort((a, b) => b.lastBoughtAt - a.lastBoughtAt)
    .map((entry) => entry.item)
    .filter((item) => item.id && item.name);
}

export function getWeeklyShoppingFromRaw(raw: string | null): CartItem[] {
  return parseStoredCart(raw);
}
