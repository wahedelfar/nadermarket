export const SLIDER_INTERVAL_MS = 5000;

export type FeaturedProductCandidate = {
  isActive: boolean;
  stock: number;
  createdAt: Date | string | null;
};

export function selectFeaturedProducts<T extends FeaturedProductCandidate>(
  products: T[],
  limit = 6,
): T[] {
  return [...products]
    .filter((product) => product.isActive && product.stock > 0)
    .sort((first, second) => {
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return secondDate - firstDate;
    })
    .slice(0, limit);
}

export function getNextSlideIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

export function getPreviousSlideIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}
