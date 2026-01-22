import type { Poi, NormalizedPoint } from '../types'

/**
 * Converte coordenadas normalizadas (0..1) para pixels
 */
export function normalizedToPixels(
  point: NormalizedPoint,
  imageSize: { w: number; h: number },
): { x: number; y: number } {
  return {
    x: point.x * imageSize.w,
    y: point.y * imageSize.h,
  }
}

/**
 * Converte um POI para coordenadas em pixels
 */
export function poiToPixels(poi: Poi, imageSize: { w: number; h: number }): { x: number; y: number } {
  return normalizedToPixels(poi.point, imageSize)
}
