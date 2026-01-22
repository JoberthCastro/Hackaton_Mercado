/**
 * Utilitários para manipulação de strings
 */

/**
 * Normaliza uma string para comparação (remove acentos, converte para minúsculas)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/**
 * Remove pontuação de uma string
 */
export function removePunctuation(str: string): string {
  return str.replace(/[^\p{L}\p{N}\s]/gu, '').trim()
}

/**
 * Gera um ID único com prefixo
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`
}

/**
 * Mascara chaves de API em strings (para logs/erros)
 */
export function maskApiKey(text: string): string {
  return text.replace(/AIza[0-9A-Za-z\-_]{10,}/g, 'AIza***')
}
