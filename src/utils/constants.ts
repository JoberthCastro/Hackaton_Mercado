/**
 * Constantes compartilhadas do projeto
 */

// Questionário de Avaliação
export const QUESTIONNAIRE = {
  TRANSITION_DELAY_MS: 300,
  TOTAL_QUESTIONS: 5,
  MAX_STARS: 5,
} as const

// Layout e Responsividade
export const LAYOUT = {
  SIDEBAR_WIDTH_DESKTOP: 420,
  MOBILE_BOTTOM_SHEET_HEIGHT_VH: 44,
  TABLET_DRAWER_WIDTH: 420,
  TABLET_DRAWER_MAX_WIDTH_VW: 90,
} as const

// Z-Index Layers
export const Z_INDEX = {
  MAP: 0,
  OVERLAY: 2000,
  BOTTOM_SHEET: 2100,
  TABLET_DRAWER: 80,
  TABLET_DRAWER_OVERLAY: 70,
  TABLET_DRAWER_BUTTON: 60,
  MOBILE_BOTTOM_SHEET: 1500,
} as const

// Map Configuration
export const MAP_CONFIG = {
  MIN_ZOOM: -10,
  MAX_ZOOM: 4,
  DEFAULT_ZOOM: 1,
  ZOOM_SNAP: 0.25,
  ZOOM_DELTA: 0.25,
} as const

// Bottom Sheet Heights (vh)
export const BOTTOM_SHEET = {
  MIN_VH: 44,
  MID_VH: 58,
  MAX_VH: 88,
  TRANSITION_MS: 200,
} as const

// Gemini API
export const GEMINI = {
  DEFAULT_MODEL: 'gemini-2.5-flash',
  FALLBACK_MODELS: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'],
  API_VERSION: 'v1beta' as const,
  BASE_URL: 'https://generativelanguage.googleapis.com',
  MAX_HISTORY_TURNS_DECIDE: 3, // Reduzido de 6 para 3 - menos contexto = resposta mais rápida
  MAX_HISTORY_TURNS_REPLY: 4, // Reduzido de 8 para 4 - menos contexto = resposta mais rápida
  MAX_OUTPUT_TOKENS_DECIDE: 150, // Reduzido de 200 para 150 - respostas mais curtas
  MAX_OUTPUT_TOKENS_REPLY: 800, // Reduzido de 2000 para 800 - respostas mais curtas e rápidas
  TEMPERATURE_DECIDE: 0,
  TEMPERATURE_REPLY: 0.2,
  TOP_P_REPLY: 0.9,
} as const

// Product Matching
export const SEARCH = {
  MIN_QUERY_LENGTH: 3,
  MIN_PRODUCT_MATCH_LENGTH: 3,
  MAX_RESULTS: 3,
  PRODUCT_HIT_SCORE: 3,
  NAME_HIT_SCORE: 1,
  SECTOR_BOOST_SCORE: 2,
} as const

// Animation Durations
export const ANIMATION = {
  SLIDE_TRANSITION_MS: 500,
  BUTTON_TRANSITION_MS: 200,
  PROGRESS_BAR_MS: 500,
} as const
