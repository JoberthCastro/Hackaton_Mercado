import { useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Poi } from '../types'
import { SECTORS } from '../data/sectors'

type Props = {
  poi: Poi | null
  onClose: () => void
}

export function PoiDetailsPanel({ poi, onClose }: Props) {
  if (!poi || !poi.hasRoute) return null

  const sector = SECTORS[poi.sectorId]
  // No estilo Google Maps, o sheet abre "meio" e o usuário pode expandir/recolher arrastando.
  const MIN_VH = 44
  const MID_VH = 58
  const MAX_VH = 88
  const [sheetVh, setSheetVh] = useState<number>(MID_VH)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startY: number; startVh: number } | null>(null)

  const expanded = useMemo(() => sheetVh >= (MID_VH + MAX_VH) / 2, [sheetVh])
  const sheetStyle = useMemo(
    () => ({
      height: `${sheetVh}vh`,
      transition: isDragging ? 'none' : 'height 200ms',
    }),
    [sheetVh, isDragging],
  )

  function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Só arrasta no mobile/tablet; no desktop o componente fica estático no painel lateral.
    // Mesmo assim, esse handler só existe no sheet overlay (lg:hidden).
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragRef.current = { startY: e.clientY, startVh: sheetVh }
  }

  function onHandlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const dy = e.clientY - dragRef.current.startY
    const vhDelta = (-dy / window.innerHeight) * 100
    const next = Math.max(MIN_VH, Math.min(MAX_VH, dragRef.current.startVh + vhDelta))
    setSheetVh(next)
  }

  function onHandlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
    setIsDragging(false)
    dragRef.current = null
    // Snap: meio ou cheio
    const snap = sheetVh >= (MID_VH + MAX_VH) / 2 ? MAX_VH : MID_VH
    setSheetVh(snap)
  }

  return (
    <>
      {/* Mobile/Tablet: bottom-sheet (arrastável) */}
      <div className="lg:hidden">
        {/* Overlay escuro - Leaflet usa z-index alto; aqui fica acima para o mapa ficar "atrás" */}
        <div
          className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-[1px]"
          onClick={onClose}
        />
        <div
          className="fixed inset-x-0 bottom-0 z-[2100] flex flex-col bg-white shadow-2xl rounded-t-2xl"
          style={sheetStyle}
        >
          {/* Handle + Header (Maps-like) - Área de arrasto aumentada */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-white">
            {/* Área de arrasto maior e mais fácil de usar */}
            <div
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              className="w-full py-4 touch-none cursor-grab active:cursor-grabbing select-none"
              aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            >
              <div className="mx-auto h-1.5 w-16 rounded-full bg-gray-400" />
              <button
                type="button"
                onClick={() => setSheetVh((v) => (v >= (MID_VH + MAX_VH) / 2 ? MID_VH : MAX_VH))}
                className="mt-2 text-xs text-gray-500 font-medium"
              >
                {expanded ? 'Recolher' : 'Expandir'}
              </button>
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-gray-900">{poi.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <span className="truncate">{sector.label}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-2 flex-shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {poi.imageUrl && (
            <div className="flex-shrink-0 relative h-44 w-full overflow-hidden bg-gray-200">
              <img src={poi.imageUrl} alt={poi.name} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: `${sector.color}22`, color: sector.color }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: sector.color }} />
                  {sector.label}
                </span>
                <span className="text-xs text-gray-500">{poi.kind === 'BOX' ? 'Box' : 'Banca'}</span>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold text-gray-900">Produtos disponíveis</h3>
                <div className="flex flex-wrap gap-1.5">
                  {poi.products.slice(0, 12).map((product) => (
                    <span key={product} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700 border border-primary-100">
                      {product}
                    </span>
                  ))}
                  {poi.products.length > 12 && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                      +{poi.products.length - 12} mais
                    </span>
                  )}
                </div>
              </div>

              {poi.about && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-900">Sobre</h3>
                  <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-line">{poi.about}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: painel lateral (não usa bottom-sheet/drag/altura em vh) */}
      <div className="hidden lg:flex h-full flex-col bg-white">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-gray-900">{poi.name}</div>
              <div className="mt-1 text-sm text-gray-600">{sector.label}</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {poi.imageUrl && (
          <div className="flex-shrink-0 relative h-56 w-full overflow-hidden bg-gray-200">
            <img src={poi.imageUrl} alt={poi.name} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: `${sector.color}22`, color: sector.color }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: sector.color }} />
                {sector.label}
              </span>
              <span className="text-xs text-gray-500">{poi.kind === 'BOX' ? 'Box' : 'Banca'}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-900">Produtos disponíveis</h3>
              <div className="flex flex-wrap gap-1.5">
                {poi.products.slice(0, 18).map((product) => (
                  <span key={product} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700 border border-primary-100">
                    {product}
                  </span>
                ))}
                {poi.products.length > 18 && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                    +{poi.products.length - 18} mais
                  </span>
                )}
              </div>
            </div>

            {poi.about ? (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-900">Sobre</h3>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{poi.about}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
