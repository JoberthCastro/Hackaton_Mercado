export type NormPoint = { x: number; y: number }

type Node = { id: string; p: NormPoint }
type Edge = { a: string; b: string }

function dist(a: NormPoint, b: NormPoint) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

/**
 * Grafo simplificado dos corredores (MVP).
 * Ajustável depois com mais nós/arestas conforme o desenho do mercado.
 *
 * Referência visual: suas linhas vermelhas (corredor horizontal central + verticais).
 */
const NODES: Node[] = [
  // Entrada (círculo vermelho - lado direito)
  { id: 'ENTRANCE', p: { x: 0.965, y: 0.51 } },

  // Corredor horizontal central (da direita para esquerda)
  { id: 'H_E', p: { x: 0.86, y: 0.51 } },
  { id: 'H_C', p: { x: 0.60, y: 0.51 } },
  { id: 'H_W', p: { x: 0.30, y: 0.51 } },

  // Vertical central (entre blocos centrais)
  { id: 'V_C_TOP', p: { x: 0.60, y: 0.14 } },
  { id: 'V_C_BOT', p: { x: 0.60, y: 0.90 } },

  // Vertical esquerda (acesso para peixaria/produtos regionais)
  { id: 'V_W_TOP', p: { x: 0.18, y: 0.60 } },
  { id: 'V_W_BOT', p: { x: 0.18, y: 0.88 } },
]

const EDGES: Edge[] = [
  { a: 'ENTRANCE', b: 'H_E' },
  { a: 'H_E', b: 'H_C' },
  { a: 'H_C', b: 'H_W' },

  { a: 'H_C', b: 'V_C_TOP' },
  { a: 'H_C', b: 'V_C_BOT' },

  { a: 'H_W', b: 'V_W_TOP' },
  { a: 'V_W_TOP', b: 'V_W_BOT' },
]

const nodeById = new Map(NODES.map((n) => [n.id, n]))

function neighbors(id: string): { id: string; w: number }[] {
  const res: { id: string; w: number }[] = []
  const a = nodeById.get(id)?.p
  if (!a) return res
  for (const e of EDGES) {
    const other = e.a === id ? e.b : e.b === id ? e.a : null
    if (!other) continue
    const b = nodeById.get(other)?.p
    if (!b) continue
    res.push({ id: other, w: dist(a, b) })
  }
  return res
}

function nearestNodeId(p: NormPoint) {
  let best: { id: string; d: number } | null = null
  for (const n of NODES) {
    const d = dist(p, n.p)
    if (!best || d < best.d) best = { id: n.id, d }
  }
  return best?.id ?? 'H_C'
}

function dijkstra(startId: string, endId: string) {
  const distMap = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const unvisited = new Set<string>()

  for (const n of NODES) {
    distMap.set(n.id, Infinity)
    prev.set(n.id, null)
    unvisited.add(n.id)
  }
  distMap.set(startId, 0)

  while (unvisited.size > 0) {
    let u: string | null = null
    let bestD = Infinity
    for (const id of unvisited) {
      const d = distMap.get(id) ?? Infinity
      if (d < bestD) {
        bestD = d
        u = id
      }
    }
    if (!u) break
    unvisited.delete(u)
    if (u === endId) break

    for (const nb of neighbors(u)) {
      if (!unvisited.has(nb.id)) continue
      const alt = (distMap.get(u) ?? Infinity) + nb.w
      if (alt < (distMap.get(nb.id) ?? Infinity)) {
        distMap.set(nb.id, alt)
        prev.set(nb.id, u)
      }
    }
  }

  const path: string[] = []
  let cur: string | null = endId
  while (cur) {
    path.push(cur)
    cur = prev.get(cur) ?? null
  }
  path.reverse()
  return path
}

/**
 * Retorna uma polyline (pontos normalizados) seguindo corredores.
 * - “snap” no nó mais próximo do início e do destino.
 * - inclui segmento do ponto real até o corredor, e do corredor até o destino.
 */
export function buildCorridorRoute(start: NormPoint, end: NormPoint): NormPoint[] {
  const sId = nearestNodeId(start)
  const eId = nearestNodeId(end)
  const pathIds = dijkstra(sId, eId)
  const corridor = pathIds.map((id) => nodeById.get(id)!.p)

  return [start, ...corridor, end]
}

