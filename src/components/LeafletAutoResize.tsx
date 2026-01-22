import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Leaflet precisa de `invalidateSize()` quando o container muda de tamanho
 * (ex: layout responsivo, sidebar overlay, orientation change).
 */
export function LeafletAutoResize({ onResize }: { onResize?: () => void }) {
  const map = useMap()

  useEffect(() => {
    const el = map.getContainer()
    // Alguns browsers (ou webviews) não têm ResizeObserver.
    // Sem esse guard, a app pode ficar toda branca por erro em runtime.
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        map.invalidateSize({ animate: false })
        onResize?.()
      })
      ro.observe(el)
    }

    // Também invalida quando a janela muda (mobile rotate)
    const onWin = () => {
      map.invalidateSize({ animate: false })
      onResize?.()
    }
    window.addEventListener('resize', onWin, { passive: true })

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', onWin)
    }
  }, [map, onResize])

  return null
}

