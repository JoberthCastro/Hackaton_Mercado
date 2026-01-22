import type { Poi, SectorId } from '../types'
import { SECTORS } from '../data/sectors'
import { normalizeString, removePunctuation } from '../utils/stringUtils'
import { SEARCH } from '../utils/constants'

export type Intent =
  | { type: 'FIND_PRODUCT'; query: string }
  | { type: 'FIND_SECTOR'; sectorId: SectorId; query: string }
  | { type: 'HELP'; query: string }

export function detectIntent(text: string): Intent {
  const q = normalizeString(text)

  // Saudações / conversa curta => não executar busca (evita "ola" bater em "cebola")
  if (!q) return { type: 'HELP', query: text }
  const qNoPunct = removePunctuation(q)
  const smallTalk = new Set([
    'oi',
    'ola',
    'olá',
    'bom dia',
    'boa tarde',
    'boa noite',
    'tudo bem',
    'tudo bom',
    'obrigado',
    'obrigada',
    'valeu',
    'blz',
    'beleza',
    'obg',
  ])
  if (smallTalk.has(qNoPunct)) return { type: 'HELP', query: text }
  if (qNoPunct.length <= SEARCH.MIN_QUERY_LENGTH - 1) return { type: 'HELP', query: text }

  // Setor explícito
  if (q.includes('artesan')) return { type: 'FIND_SECTOR', sectorId: 'ARTESANATO', query: text }
  if (q.includes('acougue') || q.includes('açougue') || q.includes('latic') || q.includes('frios'))
    return { type: 'FIND_SECTOR', sectorId: 'ACOUGUE_FRIOS_LATICINIOS', query: text }
  if (q.includes('peix') || q.includes('marisc') || q.includes('camarao') || q.includes('camarão'))
    return { type: 'FIND_SECTOR', sectorId: 'PEIXE_MARISCO', query: text }
  if (q.includes('mercear') || q.includes('mercado') || q.includes('graos') || q.includes('grãos'))
    return { type: 'FIND_SECTOR', sectorId: 'MERCEARIA', query: text }
  if (q.includes('fruta') || q.includes('hort') || q.includes('erva'))
    return { type: 'FIND_SECTOR', sectorId: 'FRUTAS_HORTALICAS_ERVAS', query: text }
  if (q.includes('regional') || q.includes('tapioca') || q.includes('farinha'))
    return { type: 'FIND_SECTOR', sectorId: 'PRODUTOS_REGIONAIS', query: text }
  if (q.includes('barbear') || q.includes('salao') || q.includes('salão') || q.includes('corte'))
    return { type: 'FIND_SECTOR', sectorId: 'BARBEARIA_SALAO', query: text }
  if (q.includes('admin') || q.includes('informacao') || q.includes('informação'))
    return { type: 'FIND_SECTOR', sectorId: 'ADMINISTRACAO', query: text }

  // Intenção "comida" => Restaurante/Lanchonete (regra do desafio)
  if (q.includes('comida') || q.includes('lanche') || q.includes('almoco') || q.includes('almoço') || q.includes('jantar') || q.includes('cafe') || q.includes('café'))
    return { type: 'FIND_SECTOR', sectorId: 'RESTAURANTE_LANCHONETE', query: text }

  return { type: 'FIND_PRODUCT', query: text }
}

export function recommendPois(text: string, pois: Poi[]) {
  const intent = detectIntent(text)
  const q = normalizeString(text)

  let candidates = pois

  // Se é HELP, não sugere locais automaticamente
  if (intent.type === 'HELP') {
    return { intent, pois: [] }
  }

  if (intent.type === 'FIND_SECTOR') {
    candidates = candidates.filter((p) => p.sectorId === intent.sectorId)
  }

  // Scoring simples por match de produtos / nome
  const scored = candidates
    .map((p) => {
      const name = normalizeString(p.name)
      // Evita matches por substring muito curta (ex: "ola" em "cebola")
      const productHits = p.products
        .map(normalizeString)
        .filter(
          (w) =>
            q.length >= SEARCH.MIN_PRODUCT_MATCH_LENGTH &&
            w.length >= SEARCH.MIN_PRODUCT_MATCH_LENGTH &&
            (q.includes(w) || w.includes(q)),
        ).length
      const nameHit = name.includes(q) || q.split(/\s+/).some((t) => t && name.includes(t)) ? SEARCH.NAME_HIT_SCORE : 0
      const sectorBoost =
        intent.type === 'FIND_SECTOR'
          ? SEARCH.SECTOR_BOOST_SCORE
          : q.includes('comida')
            ? p.sectorId === 'RESTAURANTE_LANCHONETE'
              ? SEARCH.SECTOR_BOOST_SCORE
              : 0
            : 0
      const score = productHits * SEARCH.PRODUCT_HIT_SCORE + nameHit + sectorBoost
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)

  const top = scored
    .filter((x) => x.score > 0)
    .map((x) => x.p)
    // Prioriza os que têm rota
    .sort((a, b) => (b.hasRoute === false ? 0 : 1) - (a.hasRoute === false ? 0 : 1))
    .slice(0, SEARCH.MAX_RESULTS)

  // Fallback por setor (quando a busca foi vaga)
  if (top.length === 0 && intent.type === 'FIND_SECTOR') {
    const fallback = pois.filter((p) => p.sectorId === intent.sectorId).slice(0, SEARCH.MAX_RESULTS)
    return { intent, pois: fallback }
  }

  return { intent, pois: top }
}

export function buildAssistantText(intent: Intent) {
  if (intent.type === 'HELP') {
    const q = normalizeString(intent.query)
    // Respostas simples de atendente quando não há Gemini
    if (q.includes('historia') || q.includes('história') || (q.includes('mercado') && (q.includes('conta') || q.includes('sobre')))) {
      return 'O Mercado da Cidade de São Luís foi criado em 2024 para abrigar os feirantes do tradicional Mercado Central (fundado em 1864) durante sua reforma. Aqui você encontra vários setores (comida, peixes, frutas, produtos regionais e artesanato) e é um ótimo lugar pra conhecer sabores e tradições locais. Quer procurar comida, frutas, produtos regionais, peixe/marisco ou artesanato?'
    }
    if (q.includes('cultura') || q.includes('sao luis') || q.includes('são luis')) {
      return 'São Luís tem uma cultura muito rica: culinária maranhense, artesanato, bebidas regionais e um centro histórico famoso pelos azulejos. Se quiser, eu te ajudo a achar no mercado itens típicos como comida, produtos regionais ou artesanato. O que você quer procurar?'
    }
    return 'Oi! Eu posso te ajudar a achar coisas no Mercado da Cidade. Você procura comida, peixe/marisco, frutas/verduras, produtos regionais ou artesanato?'
  }

  if (intent.type === 'FIND_SECTOR') {
    const sector = SECTORS[intent.sectorId]
    return `Encontrei sugestões no setor **${sector.label}**. Selecione um resultado para eu dar zoom no mapa.`
  }

  return 'Achei algumas opções. Selecione um resultado para eu dar zoom no mapa.'
}

