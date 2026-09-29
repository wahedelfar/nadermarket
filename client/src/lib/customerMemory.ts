export type CustomerMemory = {
  name: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visits: number;
};

const KEY = "nader-market:ask-me-customer-v1";

export function getCustomerMemory(): CustomerMemory | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CustomerMemory>;
    if (!parsed.name || typeof parsed.name !== "string") return null;
    return {
      name: parsed.name.trim(),
      firstSeenAt: Number(parsed.firstSeenAt) || Date.now(),
      lastSeenAt: Number(parsed.lastSeenAt) || Date.now(),
      visits: Math.max(1, Number(parsed.visits) || 1),
    };
  } catch {
    return null;
  }
}

export function saveCustomerName(name: string): CustomerMemory | null {
  const clean = name.trim().replace(/\\s+/g, " ").slice(0, 40);
  if (!clean) return null;
  const now = Date.now();
  const current = getCustomerMemory();
  const next: CustomerMemory = {
    name: clean,
    firstSeenAt: current?.firstSeenAt ?? now,
    lastSeenAt: now,
    visits: current ? current.visits + 1 : 1,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Memory is a convenience; the assistant continues normally if storage is unavailable.
  }
  return next;
}

export function touchCustomerVisit(memory: CustomerMemory): CustomerMemory {
  const next = { ...memory, lastSeenAt: Date.now(), visits: memory.visits + 1 };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Continue without persistence.
  }
  return next;
}
