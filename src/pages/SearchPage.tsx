import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import type { ChatMessage, Poi } from '../types'
import { POIS } from '../data/pois'
import marketImg from '../assets/MERCADO-DA-CIDADE_SETORIZAÇÃO_page-0001.jpg'
import { ChatAndResultsSidebar } from '../components/ChatAndResultsSidebar'
import { MarketMap } from '../components/MarketMap'
import { PoiDetailsPanel } from '../components/PoiDetailsPanel'

export function SearchPage() {
  const location = useLocation()
  const initialChatText = useMemo(() => {
    const q = new URLSearchParams(location.search).get('q') ?? ''
    return q.trim()
  }, [location.search])

  const pois = useMemo(() => {
    return POIS as Poi[]
  }, [])
  // Separação: um POI pode estar selecionado para rota ("Ver") e outro aberto em "Info" (painel)
  const [routePoiId, setRoutePoiId] = useState<string | undefined>(undefined)
  const [infoPoiId, setInfoPoiId] = useState<string | undefined>(undefined)
  const [focusPoiId, setFocusPoiId] = useState<string | undefined>(undefined)
  const [resultsQuery, setResultsQuery] = useState<string>('')
  const [results, setResults] = useState<Poi[]>([])
  const [isTabletDrawerOpen, setIsTabletDrawerOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      ts: Date.now(),
      text: 'Olá! Digite o que você procura. Exemplo: "mocotó" ou "peixe".',
    },
  ])

  // Entrada (Acesso Principal) como default
  const startPoint = { x: 0.8320, y: 0.4933 }

  const infoPoi = useMemo(() => {
    if (!infoPoiId) return null
    const found = pois.find((p) => p.id === infoPoiId)
    return found || null
  }, [pois, infoPoiId])

  function handleShowInfo(poiId: string) {
    const p = pois.find((x) => x.id === poiId)
    // Sempre centraliza no ponto
    setFocusPoiId(poiId)
    // Só abre painel se tiver rota + descrição (não polui a tela com sugestão)
    if (p?.hasRoute !== false && p?.about) setInfoPoiId(poiId)
    else setInfoPoiId(undefined)
  }

  const isMobileBottomSheetOpen = !infoPoi && isMobileSearchOpen

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full lg:flex">
        {/* Desktop (>=1024): sidebar fixa */}
        <aside className="hidden lg:flex lg:w-[420px] lg:flex-none lg:border-r lg:border-gray-200 lg:bg-white">
          <ChatAndResultsSidebar
            pois={pois}
            messages={messages}
            onMessagesChange={setMessages}
            // "Ver" => rota
            onSelectPoi={setRoutePoiId}
            // "Info" => painel (sem rota)
            onShowInfo={handleShowInfo}
            resultsQuery={resultsQuery}
            results={results}
            initialChatText={initialChatText || undefined}
            autoSendInitialChatText={!!initialChatText}
            onResults={(q, r) => {
              setResultsQuery(q)
              setResults(r)
              setRoutePoiId(undefined)
              setInfoPoiId(undefined)
              setFocusPoiId(undefined)
            }}
          />
        </aside>

        {/* Desktop: painel de info ao lado do chat */}
        {infoPoi && infoPoi.hasRoute && (
          <aside className="hidden lg:block lg:w-[420px] lg:flex-none border-r border-gray-200 bg-white">
            <PoiDetailsPanel
              poi={infoPoi}
              onClose={() => {
                setInfoPoiId(undefined)
                setFocusPoiId(undefined)
              }}
              onGoTo={() => {
                setRoutePoiId(infoPoi.id)
                setInfoPoiId(undefined)
              }}
            />
          </aside>
        )}

        {/* Mapa (sempre em destaque) */}
        <main
          className={[
            'relative h-full flex-1',
            // Só ajusta o encaixe do mapa quando o bottom-sheet de busca está aberto (não quando é Info).
            // Assim: Busca = mapa "encaixa acima" / Info = mapa fica por trás (igual Maps).
            // Um pouco mais baixo (mais mapa visível) sem perder o chat
            isMobileBottomSheetOpen ? 'pb-[60vh] md:pb-0' : 'pb-0',
          ].join(' ')}
        >
          <MarketMap
            imageUrl={marketImg}
            pois={pois}
            selectedPoiId={routePoiId}
            focusPoiId={focusPoiId}
            onShowInfo={handleShowInfo}
            startPointNorm={startPoint}
            visiblePoiIds={resultsQuery ? results.map((r) => r.id) : []}
          />

          {/* Tablet (768-1023): botão toggle + drawer - melhor posicionamento */}
          <div className="hidden md:block lg:hidden">
            <button
              onClick={() => setIsTabletDrawerOpen(true)}
              className="absolute left-4 bottom-4 z-[60] rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 text-sm font-bold text-zinc-900 shadow-lg border-2 border-zinc-300 hover:bg-white transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>Buscar</span>
              </div>
            </button>

            {isTabletDrawerOpen ? (
              <>
                <div
                  className="absolute inset-0 z-[70] bg-black/40"
                  onClick={() => setIsTabletDrawerOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 z-[80] w-[420px] max-w-[90vw] bg-white shadow-2xl border-r border-zinc-200">
                  <ChatAndResultsSidebar
                    pois={pois}
                    messages={messages}
                    onMessagesChange={setMessages}
                    onSelectPoi={(id) => {
                      setRoutePoiId(id)
                      setIsTabletDrawerOpen(false)
                    }}
                    onShowInfo={(poiId) => {
                      handleShowInfo(poiId)
                      setIsTabletDrawerOpen(false)
                    }}
                    resultsQuery={resultsQuery}
                    results={results}
                    initialChatText={initialChatText || undefined}
                    autoSendInitialChatText={!!initialChatText}
                    onResults={(q, r) => {
                      setResultsQuery(q)
                      setResults(r)
                      setRoutePoiId(undefined)
                      setInfoPoiId(undefined)
                      setFocusPoiId(undefined)
                    }}
                  />
                </div>
              </>
            ) : null}
          </div>

          {/* Mobile (<768): FAB de busca + bottom sheet */}
          <div className="md:hidden">
            {/* FAB (Floating Action Button) - Zona do polegar */}
            {!isMobileSearchOpen && !infoPoi && (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="fixed bottom-20 right-4 z-[1400] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-2xl border-2 border-primary-700 active:scale-95 transition-transform"
                aria-label="Abrir busca"
              >
                <Search className="h-6 w-6" />
              </button>
            )}

            {/* Bottom sheet de busca/resultados */}
            {isMobileBottomSheetOpen ? (
              <div className="absolute inset-x-0 bottom-0 z-[1500] h-[60vh] rounded-t-2xl border-t border-zinc-200 bg-white shadow-2xl overflow-hidden">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center justify-center flex-1">
                      <div className="h-1 w-10 rounded-full bg-zinc-300" />
                    </div>
                    <button
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Fechar busca"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1">
                    <ChatAndResultsSidebar
                      pois={pois}
                      messages={messages}
                      onMessagesChange={setMessages}
                      onSelectPoi={(id) => {
                        setRoutePoiId(id)
                        setIsMobileSearchOpen(false)
                      }}
                      onShowInfo={(poiId) => {
                        handleShowInfo(poiId)
                        setIsMobileSearchOpen(false)
                      }}
                      resultsQuery={resultsQuery}
                      results={results}
                      initialChatText={initialChatText || undefined}
                      autoSendInitialChatText={!!initialChatText}
                      onResults={(q, r) => {
                        setResultsQuery(q)
                        setResults(r)
                        setRoutePoiId(undefined)
                        setInfoPoiId(undefined)
                        setFocusPoiId(undefined)
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Info: no mobile e tablet vira bottom-sheet (estilo Maps). No desktop fica no painel lateral. */}
          {infoPoi && infoPoi.hasRoute ? (
            <div className="lg:hidden">
              <PoiDetailsPanel
                poi={infoPoi}
                onClose={() => {
                  setInfoPoiId(undefined)
                  setFocusPoiId(undefined)
                }}
                onGoTo={() => {
                  setRoutePoiId(infoPoi.id)
                  setInfoPoiId(undefined)
                }}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

