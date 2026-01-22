import { Info, Route, Star } from 'lucide-react'
import type { Poi } from '../types'
import { SECTORS } from '../data/sectors'

type Props = {
  query: string
  results: Poi[]
  onSelectPoi: (poiId: string) => void
  onShowInfo?: (poiId: string) => void
}

export function ResultsPanel({ query, results, onSelectPoi, onShowInfo }: Props) {
  return (
    <section className="flex min-h-0 flex-col border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">Resultados</div>
          <div className="truncate text-xs text-gray-500">
            {query ? (
              <>
                Busca: <span className="font-medium text-primary-700">{query}</span> • {results.length}{' '}
                {results.length === 1 ? 'local' : 'locais'}
              </>
            ) : (
              <>Pergunte no chat para ver resultados aqui.</>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
        {results.length === 0 ? (
          <div className="rounded-card border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
            Sem resultados ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((p) => {
              const sector = SECTORS[p.sectorId]
              const canOpenInfo = !!onShowInfo
              const ratingText =
                typeof p.rating === 'number'
                  ? `${p.rating.toFixed(1)}${typeof p.ratingCount === 'number' ? ` (${p.ratingCount})` : ''}`
                  : null
              return (
                <div
                  key={p.id}
                  className="w-full rounded-card border border-gray-200 bg-white p-3 shadow-institutional transition-all hover:border-primary-300 hover:shadow-card"
                >
                  <button
                    onClick={() => {
                      // No mobile/tablet estilo Maps: tocar no card centraliza no ponto (sem rota)
                      if (canOpenInfo) onShowInfo?.(p.id)
                      else onSelectPoi(p.id)
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-semibold text-gray-900">{p.name}</div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                          {ratingText ? (
                            <span className="inline-flex items-center gap-1 text-gray-700">
                              <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
                              {ratingText}
                            </span>
                          ) : null}
                          <span className="text-gray-400">•</span>
                          <span>{sector.label}</span>
                          {p.statusText ? (
                            <>
                              <span className="text-gray-400">•</span>
                              <span
                                className={
                                  p.statusText.toLowerCase().includes('fechado')
                                    ? 'text-error-dark'
                                    : p.statusText.toLowerCase().includes('breve')
                                      ? 'text-warning-dark'
                                      : 'text-success-dark'
                                }
                              >
                                {p.statusText}
                              </span>
                            </>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {p.addressShort ?? `${p.kind === 'BOX' ? 'Box' : 'Banca'} • Mercado da Cidade`}
                        </div>

                        <div className="mt-2 line-clamp-2 text-xs text-gray-600">
                          Produtos: {p.products.slice(0, 6).join(', ')}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Mobile: Apenas 1 botão principal (Lei de Hick) */}
                  <div className="mt-3 md:hidden">
                    {p.hasRoute !== false ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectPoi(p.id)
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white border-2 border-primary-700 transition-all active:scale-95 shadow-lg"
                      >
                        <Route className="h-4 w-4" />
                        Ir até
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onShowInfo?.(p.id)
                        }}
                        disabled={!onShowInfo}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white border-2 border-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        <Info className="h-4 w-4" />
                        Ver detalhes
                      </button>
                    )}
                  </div>

                  {/* Tablet/Desktop: Mais opções visíveis */}
                  <div className="mt-3 hidden md:flex gap-2">
                    {p.hasRoute !== false ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectPoi(p.id)
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-institutional bg-blue-700 px-4 py-2 text-xs font-bold text-white border-2 border-blue-800 transition-all hover:bg-blue-800 active:bg-blue-900 shadow-xl"
                      >
                        <Route className="h-4 w-4" />
                        Rotas
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onShowInfo?.(p.id)
                        }}
                        disabled={!onShowInfo}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-institutional bg-primary-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-800 active:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        Ver
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onShowInfo?.(p.id)
                      }}
                      disabled={!onShowInfo}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-institutional border-2 border-gray-800 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-900 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-900 active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Info className="h-4 w-4" />
                      Info
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

