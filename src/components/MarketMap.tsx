import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, ImageOverlay, Polyline } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import type { Poi } from '../types'
import { buildCorridorRoute } from '../lib/routeGraph'
import { SECTORS } from '../data/sectors'
import { LeafletAutoResize } from './LeafletAutoResize'
import { poiToPixels } from '../utils/mapUtils'
import { MAP_CONFIG } from '../utils/constants'

// Fix padrão do Leaflet (paths de ícones não resolvem bem em bundlers).
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

type Props = {
  imageUrl: string
  pois: Poi[]
  selectedPoiId?: string
  /** Abre o painel de informações (sem alterar rota) */
  onShowInfo?: (poiId: string) => void
  /** Apenas centraliza/zooma no POI (sem rota) */
  focusPoiId?: string
  startPointNorm?: { x: number; y: number }
  /** Se informado, só renderiza markers desses POIs (estilo "resultados do Maps"). */
  visiblePoiIds?: string[]
  /** Se true, mantém a visão "imagem inteira" quando não há destino selecionado. */
  autoFitWholeImage?: boolean
}


export function MarketMap({
  imageUrl,
  pois,
  selectedPoiId,
  onShowInfo,
  focusPoiId,
  startPointNorm,
  visiblePoiIds,
  autoFitWholeImage = true,
}: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)
  const [hasUserInteracted] = useState(false)
  const didInitialFitRef = useRef(false)
  const fitInProgressRef = useRef(false)
  const fitRafRef = useRef<number | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = imageUrl
  }, [imageUrl])

  const bounds = useMemo(() => {
    if (!imgSize) return null
    // bounds = [[y1,x1],[y2,x2]]
    return L.latLngBounds([0, 0], [imgSize.h, imgSize.w])
  }, [imgSize])

  const selectedPoi = useMemo(() => pois.find((p) => p.id === selectedPoiId), [pois, selectedPoiId])
  const focusPoi = useMemo(() => pois.find((p) => p.id === focusPoiId), [pois, focusPoiId])
  const visibleSet = useMemo(() => {
    if (!visiblePoiIds) return null
    const s = new Set(visiblePoiIds)
    if (selectedPoiId) s.add(selectedPoiId)
    if (focusPoiId) s.add(focusPoiId)
    return s
  }, [visiblePoiIds, selectedPoiId, focusPoiId])
  const startPx = useMemo(() => {
    if (!startPointNorm || !imgSize) return null
    return { x: startPointNorm.x * imgSize.w, y: startPointNorm.y * imgSize.h }
  }, [startPointNorm, imgSize])

  useEffect(() => {
    if (!selectedPoi || !imgSize || !mapRef.current) return
    if (selectedPoi.hasRoute === false) return
    
    const map = mapRef.current
    const endPx = poiToPixels(selectedPoi, imgSize)
    
    // Ao clicar em "Ver", queremos mostrar a rota, mas sem zoom excessivo (mantém visão mais aberta).
    if (startPx) {
      const bounds = L.latLngBounds([startPx.y, startPx.x], [endPx.y, endPx.x])
      const minZoom = map.getMinZoom()
      map.setView(bounds.getCenter(), minZoom, { animate: true })
      return
    }
    
    const minZoom = Math.max(map.getZoom(), 2)
    map.setView([endPx.y, endPx.x], minZoom, { animate: true })
  }, [selectedPoi, imgSize, startPx])

  // Info: centraliza no POI (sem desenhar rota)
  // Importante (mobile/tablet): Info NÃO pode mudar o zoom. Só centraliza (pan) mantendo o zoom atual.
  useEffect(() => {
    if (!focusPoi || !imgSize || !mapRef.current) return
    const map = mapRef.current
    const px = poiToPixels(focusPoi, imgSize)
    map.panTo([px.y, px.x], { animate: true })
  }, [focusPoi, imgSize])

  function fitWholeImageAndLockMinZoom() {
    const map = mapRef.current
    if (!map || !bounds) return
    // Debounce/guard para evitar loop de ResizeObserver -> fit -> ResizeObserver...
    if (fitInProgressRef.current) return
    fitInProgressRef.current = true

    try {
      map.invalidateSize({ animate: false })
      const size = map.getSize()
      // Se o container ainda não tem tamanho (ex: layout ainda montando),
      // não calcule zoom agora (pode gerar NaN/Infinity e quebrar a renderização).
      if (!size || size.x < 10 || size.y < 10) {
        requestAnimationFrame(() => {
          fitInProgressRef.current = false
          fitWholeImageAndLockMinZoom()
        })
        return
      }
      // Zoom que "encaixa" os bounds no viewport
      const z = map.getBoundsZoom(bounds, false, L.point(0, 0))
      map.setMinZoom(z)
      map.setZoom(z, { animate: false })
      map.panTo(bounds.getCenter(), { animate: false })
    } finally {
      // libera no próximo frame
      requestAnimationFrame(() => {
        fitInProgressRef.current = false
      })
    }
  }

  // Se não há destino selecionado, volta para a visão geral (imagem inteira).
  useEffect(() => {
    if (!autoFitWholeImage) return
    if (!bounds || !mapRef.current) return
    if (selectedPoiId) return
    if (hasUserInteracted) return
    fitWholeImageAndLockMinZoom()
  }, [autoFitWholeImage, bounds, selectedPoiId, hasUserInteracted])

  if (!bounds || !imgSize) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50">
        {/* Skeleton loading - microinteração */}
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-primary-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 mx-auto" />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  const center: LatLngExpression = [imgSize.h / 2, imgSize.w / 2]

  return (
    <div className="relative h-full w-full">
      <MapContainer
        crs={L.CRS.Simple}
        center={center}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        zoomSnap={MAP_CONFIG.ZOOM_SNAP}
        zoomDelta={MAP_CONFIG.ZOOM_DELTA}
        minZoom={MAP_CONFIG.MIN_ZOOM}
        maxZoom={MAP_CONFIG.MAX_ZOOM}
        scrollWheelZoom={'center' as any}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        boxZoom={true}
        keyboard={true}
        inertia={true}
        // trava o mapa nos limites da imagem (evita "se perder no branco")
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        whenReady={() => {
          // `whenReady` no react-leaflet v5 não expõe o evento tipado.
          // Pegamos a instância via ref callback do MapContainer.
          if (!mapRef.current) return
          // Começa sempre mostrando a imagem inteira (zoom mínimo "encaixado"),
          // mas só depois do layout estabilizar (2 frames) pra evitar zoom errado.
          if (didInitialFitRef.current) return
          didInitialFitRef.current = true
          // 2 frames para layout estabilizar
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              fitWholeImageAndLockMinZoom()
            }),
          )
        }}
        ref={(instance) => {
          if (instance) mapRef.current = instance
        }}
      >
        <LeafletAutoResize
          onResize={() => {
            // Enquanto o usuário ainda não mexeu no mapa, recalcula o zoom mínimo
            // para garantir que a imagem inteira caiba (responsivo).
            if (!autoFitWholeImage) return
            if (hasUserInteracted || selectedPoiId) return
            // agenda (evita "loop" de resize)
            if (fitRafRef.current) cancelAnimationFrame(fitRafRef.current)
            fitRafRef.current = requestAnimationFrame(() => {
              fitRafRef.current = null
              fitWholeImageAndLockMinZoom()
            })
          }}
        />
        <ImageOverlay url={imageUrl} bounds={bounds} />

        {startPx ? (
          <Marker
            position={[startPx.y, startPx.x]}
            icon={
              L.divIcon({
                className: '',
                html: `<div style="
                  transform: translate(-50%, -50%);
                  display:flex;align-items:center;gap:6px;
                  background: rgba(24,24,27,.92);
                  color:white;
                  padding:6px 10px;
                  border-radius:9999px;
                  box-shadow:0 10px 24px rgba(0,0,0,.22);
                  border:1px solid rgba(255,255,255,.22);
                  font: 600 12px system-ui, -apple-system, Segoe UI, Roboto, Arial;
                ">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:#22c55e;"></span>
                  Acesso Principal
                </div>`,
                iconSize: [0, 0],
              }) as any
            }
          />
        ) : null}

        {startPx && selectedPoi && selectedPoi.hasRoute !== false ? (
          <Polyline
            positions={(() => {
              const endPx = poiToPixels(selectedPoi, imgSize)
              const routeNorm = buildCorridorRoute(
                { x: startPx.x / imgSize.w, y: startPx.y / imgSize.h },
                { x: endPx.x / imgSize.w, y: endPx.y / imgSize.h },
              )
              return routeNorm.map((p) => [p.y * imgSize.h, p.x * imgSize.w] as [number, number])
            })()}
            pathOptions={{ color: '#0066CC', weight: 6, opacity: 0.95 }}
          />
        ) : null}

        {pois
          .filter((p) => (visibleSet ? visibleSet.has(p.id) : true))
          .map((p) => {
            const px = poiToPixels(p, imgSize)
            const sector = SECTORS[p.sectorId]
            const isSelected = p.id === selectedPoiId
            const color = sector.color

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:${isSelected ? 20 : 16}px;
                height:${isSelected ? 20 : 16}px;
                border-radius:9999px;
                background:${color};
                border:2px solid white;
                box-shadow:0 6px 16px rgba(0,0,0,.18);
                transform: translate(-50%, -50%);
              "></div>`,
              iconSize: [0, 0],
            })

            return (
              <Marker 
                key={p.id} 
                position={[px.y, px.x]} 
                icon={icon as any}
                eventHandlers={{
                  click: () => {
                    onShowInfo?.(p.id)
                  },
                }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-zinc-600">{sector.label}</div>
                    {p.hasRoute === false ? (
                      <div className="text-xs text-zinc-500">Sugestão (sem rota por enquanto)</div>
                    ) : (
                      p.hasRoute && onShowInfo && (
                        <button
                          onClick={() => onShowInfo(p.id)}
                          className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Ver informações
                        </button>
                      )
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>

    </div>
  )
}

