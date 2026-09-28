import { useEffect } from 'react';
import { heroSlides, vehicles as staticVehicles } from '@/data/vehicles';
import { getImageUrl } from '@/lib/api';
import type { Vehicle } from '@/types';

// Global cache map to keep preloaded HTMLImageElements in memory
const imageCache = new Map<string, HTMLImageElement>();

export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  const fullUrl = url.startsWith('http') || url.startsWith('/') ? url : getImageUrl(url);
  if (imageCache.has(fullUrl)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(), 2000);
    img.onload = () => {
      clearTimeout(timer);
      imageCache.set(fullUrl, img);
      resolve();
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve();
    };
    img.src = fullUrl;
    img.decoding = 'async';
  });
}

export function useImagePreloader(dynamicVehicles: Vehicle[] = []) {
  useEffect(() => {
    // 1. Preload Hero Carousel images immediately
    const heroUrls = heroSlides.map((s) => s.imageFallback).filter(Boolean);

    // 2. Preload static and dynamic vehicle catalog images
    const vehicleUrls = [
      ...staticVehicles.map((v) => v.image),
      ...dynamicVehicles.map((v) => v.image),
    ].filter(Boolean);

    const allUrls = Array.from(new Set([...heroUrls, ...vehicleUrls]));

    // Preload sequentially/in parallel into memory cache
    allUrls.forEach((url) => {
      preloadImage(url);
    });
  }, [dynamicVehicles]);
}
