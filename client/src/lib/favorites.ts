export const FAVORITES_STORAGE_KEY = "nader-market:favorites-v1";

export function getFavoriteIds(): number[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((id) => Number.isFinite(id))
      : [];
  } catch {
    return [];
  }
}

function save(ids: number[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
    window.dispatchEvent(new CustomEvent("nader-market:favorites-changed"));
  } catch {
    // Favorites are optional convenience data.
  }
}

export function isFavorite(id: number) {
  return getFavoriteIds().includes(Number(id));
}

export function toggleFavorite(id: number) {
  const numericId = Number(id);
  const ids = getFavoriteIds();
  const next = ids.includes(numericId) ? ids.filter((value) => value !== numericId) : [...ids, numericId];
  save(next);
  return next.includes(numericId);
}

export function removeFavorite(id: number) {
  save(getFavoriteIds().filter((value) => value !== Number(id)));
}
