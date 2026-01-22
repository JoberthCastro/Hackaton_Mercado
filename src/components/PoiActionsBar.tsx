import { useState } from 'react'
import { MapPin, Star, Share2, MoreVertical, X } from 'lucide-react'
import type { Poi } from '../types'

type Props = {
  poi: Poi
  onGoTo: () => void
  onFavorite?: () => void
  onShare?: () => void
  isFavorite?: boolean
}

/**
 * Barra de ações principais (máximo 3 botões visíveis no mobile)
 * Aplica Lei de Hick e Teste do Polegar
 */
export function PoiActionsBar({ poi, onGoTo, onFavorite, onShare, isFavorite = false }: Props) {
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Ações principais (sempre visíveis no mobile)
  const primaryActions = [
    {
      id: 'go',
      label: 'Ir até',
      icon: MapPin,
      onClick: onGoTo,
      primary: true,
    },
    {
      id: 'favorite',
      label: 'Favoritar',
      icon: Star,
      onClick: onFavorite,
      active: isFavorite,
      show: !!onFavorite,
    },
  ].filter((a) => a.show !== false)

  // Ações secundárias (no menu "Mais opções")
  const secondaryActions = [
    {
      id: 'share',
      label: 'Compartilhar',
      icon: Share2,
      onClick: onShare || (() => {
        if (navigator.share) {
          navigator.share({
            title: poi.name,
            text: `Confira ${poi.name} no Mercado da Cidade`,
            url: window.location.href,
          }).catch(() => {})
        }
      }),
    },
  ]

  return (
    <>
      {/* Mobile/Tablet: Barra fixa no rodapé (zona do polegar) */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-[2200] bg-white border-t border-gray-200 shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Ação principal: "Ir até" */}
          <button
            onClick={onGoTo}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white px-4 py-3.5 font-bold text-sm shadow-lg border-2 border-primary-700 active:scale-95 transition-transform"
          >
            <MapPin className="h-5 w-5" />
            <span>Ir até</span>
          </button>

          {/* Favoritar (se disponível) */}
          {onFavorite && (
            <button
              onClick={onFavorite}
              className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-yellow-100 text-yellow-600 border-yellow-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Menu "Mais opções" */}
          {secondaryActions.length > 0 && (
            <>
              <button
                onClick={() => setShowMoreMenu(true)}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 active:scale-95 transition-all"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {/* Modal "Mais opções" */}
              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[2300] bg-black/50"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="fixed inset-x-0 bottom-0 z-[2400] bg-white rounded-t-2xl shadow-2xl animate-slide-up">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Mais opções</h3>
                        <button
                          onClick={() => setShowMoreMenu(false)}
                          className="p-2 rounded-full hover:bg-gray-100"
                          aria-label="Fechar"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {secondaryActions.map((action) => {
                          const Icon = action.icon
                          return (
                            <button
                              key={action.id}
                              onClick={() => {
                                action.onClick()
                                setShowMoreMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-left"
                            >
                              <Icon className="h-5 w-5 text-gray-600" />
                              <span className="font-medium text-gray-900">{action.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop: Ações no painel lateral (mais espaço, pode mostrar mais) */}
      <div className="hidden lg:block border-t border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={onGoTo}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white px-4 py-3 font-bold text-sm shadow-lg border-2 border-primary-700 hover:bg-primary-700 transition-colors"
          >
            <MapPin className="h-5 w-5" />
            <span>Ver rota</span>
          </button>
          <div className="flex gap-2">
            {onFavorite && (
              <button
                onClick={onFavorite}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isFavorite
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Favorito' : 'Favoritar'}</span>
              </button>
            )}
            {secondaryActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
