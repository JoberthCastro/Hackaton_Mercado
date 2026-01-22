/**
 * Tipos relacionados ao questionário de avaliação
 */

export type QuestionType = 'rating' | 'attendance' | 'product' | 'price' | 'return' | 'completed'

export type AttendanceRating = 'ruim' | 'regular' | 'bom' | 'otimo'

export type ProductRating = 'ruim' | 'regular' | 'bom' | 'otimo'

export type PriceRating = 'caro' | 'justo' | 'bom'

export type QuestionnaireAnswers = {
  rating: number | null
  attendance: AttendanceRating | null
  product: ProductRating | null
  price: PriceRating | null
  return: boolean | null
}

export type QuestionOption<T = string | boolean> = {
  value: T
  label: string
}
