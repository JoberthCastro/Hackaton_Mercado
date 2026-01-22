import { useMemo, useState } from 'react'
import { Search, Share2, X, MapPinned, Route } from 'lucide-react'
import type { Poi } from '../types'
import { recommendPois } from '../lib/llmMock'
import { SECTORS } from '../data/sectors'

type Props = {
  pois: Poi[]
  onSelectPoi: (poiId: string) => void
}

export function ResultsSidebar({ pois, onSelectPoi }: Props) {
  const [query, setQuery] = useState('')
  const [lastQuery, setLastQuery] = useState<string>('mocotó')
  const [results, setResults] = useState<Poi[]>(() => recommendPois('mocotó', pois).pois)

  const hint = useMemo(
    () => ['mocotó', 'peixe', 'artesanato', 'comida', 'mercearia'].map((s) => `"${s}"`).join(', '),
    [],
  )

  function runSearch(q: string) {
    const clean = q.trim()
    if (!clean) return
    const rec = recommendPois(clean, pois)
    setLastQuery(clean)
    setResults(rec.pois)
    // zoom automático no primeiro (Maps-like)
    if (rec.pois[0]) onSelectPoi(rec.pois[0].id)
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch(query)
            }}
            placeholder="Buscar no Mercado da Cidade…"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-zinc-100"
              aria-label="Limpar"
            >
              <X className="h-4 w-4 text-zinc-600" />
            </button>
          ) : null}
        </div>
        <div className="mt-2 text-xs text-zinc-500">Exemplos: {hint}</div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">Resultados</div>
          <div className="truncate text-xs text-zinc-500">
            Busca: <span className="font-medium text-zinc-700">{lastQuery}</span> • {results.length}{' '}
            {results.length === 1 ? 'local' : 'locais'}
          </div>
        </div>
        <button
          onClick={() => {
            // MVP: copiar texto simples; depois dá pra copiar deep-link
            const text = `Mercado da Cidade: resultados para \"${lastQuery}\"`
            navigator.clipboard?.writeText(text)
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-700">
            Não encontrei nada para <span className="font-semibold">{lastQuery}</span>. Tente um setor
            (ex: “artesanato”) ou algo mais geral (ex: “comida”).
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((p) => {
              const sector = SECTORS[p.sectorId]
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPoi(p.id)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-left hover:border-zinc-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">{p.name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                          style={{ background: `${sector.color}22`, color: sector.color }}
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: sector.color }}
                          />
                          {sector.label}
                        </span>
                        <span className="text-xs text-zinc-500">{p.kind === 'BOX' ? 'Box' : 'Banca'}</span>
                      </div>
                      <div className="mt-2 line-clamp-2 text-xs text-zinc-600">
                        Produtos: {p.products.slice(0, 6).join(', ')}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white">
                          <MapPinned className="h-4 w-4" />
                          Ver no mapa
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900">
                          <Route className="h-4 w-4" />
                          Rotas
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

