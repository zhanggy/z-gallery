import { useEffect, useState } from 'react';

const MAX_CACHE_SIZE = 10;

// LRU cache: original URL -> blob object URL
// Map maintains insertion order; we evict the oldest (first) entry when over limit
const blobCache = new Map<string, string>();
const pending = new Set<string>();

async function fetchAndCache(url: string): Promise<void> {
  if (blobCache.has(url) || pending.has(url)) return;
  pending.add(url);
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    // Evict oldest entry if cache is full
    if (blobCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = blobCache.keys().next().value as string;
      URL.revokeObjectURL(blobCache.get(oldestKey)!);
      blobCache.delete(oldestKey);
    }

    blobCache.set(url, URL.createObjectURL(blob));
  } catch {
    // silently ignore preload failures; original URL will be used as fallback
  } finally {
    pending.delete(url);
  }
}

/**
 * Preloads adjacent images as blobs stored in memory.
 * Returns getCachedUrl to get the in-memory blob URL (or the original URL as fallback).
 */
export function useImagePreloader(images: string[], current: number) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const prevIdx = current > 0 ? current - 1 : images.length - 1;
    const nextIdx = current < images.length - 1 ? current + 1 : 0;
    const nextNextIdx = nextIdx < images.length - 1 ? nextIdx + 1 : 0;

    // Preload current + adjacent images, then re-render so cached URLs are used
    Promise.all(
      [current, prevIdx, nextIdx, nextNextIdx].map((i) => fetchAndCache(images[i]))
    ).then(() => forceUpdate((n) => n + 1));
  }, [images, current]);

  const getCachedUrl = (url: string): string => blobCache.get(url) ?? url;

  return { getCachedUrl };
}
