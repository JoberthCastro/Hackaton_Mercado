export type SectorId =
  | 'ADMINISTRACAO'
  | 'ARTESANATO'
  | 'ACOUGUE_FRIOS_LATICINIOS'
  | 'BARBEARIA_SALAO'
  | 'FRUTAS_HORTALICAS_ERVAS'
  | 'MERCEARIA'
  | 'PEIXE_MARISCO'
  | 'PRODUTOS_REGIONAIS'
  | 'RESTAURANTE_LANCHONETE'

export type Sector = {
  id: SectorId
  label: string
  color: string
}

export type NormalizedPoint = {
  /** 0..1 (horizontal) */
  x: number
  /** 0..1 (vertical) */
  y: number
}

export type Poi = {
  id: string
  kind: 'BOX' | 'BANCA'
  name: string
  sectorId: SectorId
  products: string[]
  point: NormalizedPoint
  /** Se false, aparece só como sugestão (sem rota). */
  hasRoute?: boolean
  /** URL da imagem do estabelecimento (apenas para POIs com rota) */
  imageUrl?: string
  /** Descrição/história do estabelecimento (apenas para POIs com rota) */
  about?: string
  /** Informações no estilo Google Maps (mock) */
  rating?: number
  ratingCount?: number
  /** "Aberto agora", "Fechado", etc (mock) */
  statusText?: string
  /** Endereço/descrição curta (mock) */
  addressShort?: string
  /** Telefone (opcional) */
  phone?: string
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string; ts: number }
  | {
      id: string
      role: 'assistant'
      text: string
      ts: number
      recommendations?: { poiId: string; title: string; subtitle: string }[]
    }

