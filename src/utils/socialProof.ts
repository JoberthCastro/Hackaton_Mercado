import type { Poi } from '../types'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Converte avaliação (0..5) + volume de avaliações em uma "prova social" legível.
 * Ex: "80% das pessoas voltam para esse estabelecimento".
 *
 * Observação: é uma estimativa heurística (UX), não uma métrica real.
 */
export function getReturnRateText(poi: Poi): string | null {
  if (typeof poi.rating !== 'number') return null

  const rating = poi.rating
  const count = typeof poi.ratingCount === 'number' ? poi.ratingCount : 0

  // Base: mapeia 3.0..5.0 -> 65..92 (abaixo de 3 ainda pode existir, mas segura)
  const base = 65 + (clamp(rating, 3, 5) - 3) * 13.5

  // Bônus de confiança: quanto mais avaliações, mais "estável" (até +6)
  const confidence = Math.log10(count + 1) * 2.5

  // Penaliza pouco quando há pouquíssimas avaliações (para evitar números "altos" com n pequeno)
  const smallSamplePenalty = count < 20 ? (20 - count) * 0.12 : 0

  const percent = Math.round(clamp(base + confidence - smallSamplePenalty, 60, 95))
  return `${percent}% das pessoas voltam para esse estabelecimento`
}

