import { useMemo } from 'react';

/**
 * Computes the image URLs that should be preloaded using hidden <img> tags.
 * Browser cache will store already fetched resources.
 */
export function useImagePreloader(images: string[], current: number) {
  const preloadSources = useMemo(() => {
    if (images.length === 0) return [] as string[];

    const prevIdx = current > 0 ? current - 1 : images.length - 1;
    const nextIdx = current < images.length - 1 ? current + 1 : 0;
    const nextNextIdx = nextIdx < images.length - 1 ? nextIdx + 1 : 0;

    // Keep unique values while preserving order.
    return Array.from(new Set([images[current], images[prevIdx], images[nextIdx], images[nextNextIdx]]));
  }, [images, current]);

  return { preloadSources };
}
