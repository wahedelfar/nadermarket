export type CustomRequest = {
  id: string;
  text: string;
  quantity: number;
  createdAt: number;
};

const STORAGE_KEY = "nader-market:custom-requests-v1";

function read(): CustomRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.text === "string" && item.text.trim())
      .map((item) => ({
        id: String(item.id || crypto.randomUUID()),
        text: String(item.text).trim(),
        quantity: Math.max(1, Number(item.quantity || 1)),
        createdAt: Number(item.createdAt || Date.now()),
      }));
  } catch {
    return [];
  }
}

function write(items: CustomRequest[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}

export function getCustomRequests() {
  return read();
}

export function addCustomRequest(text: string, quantity = 1) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return read();

  const items = read();
  const existing = items.find((item) => item.text.toLowerCase() === clean.toLowerCase());
  if (existing) {
    existing.quantity += Math.max(1, quantity);
    write(items);
    return items;
  }

  const next = [
    ...items,
    {
      id: crypto.randomUUID(),
      text: clean,
      quantity: Math.max(1, quantity),
      createdAt: Date.now(),
    },
  ];
  write(next);
  return next;
}

export function removeCustomRequest(id: string) {
  const next = read().filter((item) => item.id !== id);
  write(next);
  return next;
}

export function clearCustomRequests() {
  write([]);
}
