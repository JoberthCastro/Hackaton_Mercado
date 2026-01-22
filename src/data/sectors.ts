import type { Sector, SectorId } from '../types'

export const SECTORS: Record<SectorId, Sector> = {
  ADMINISTRACAO: { id: 'ADMINISTRACAO', label: 'Administração', color: '#67e8f9' },
  ARTESANATO: { id: 'ARTESANATO', label: 'Artesanato', color: '#a78bfa' },
  ACOUGUE_FRIOS_LATICINIOS: {
    id: 'ACOUGUE_FRIOS_LATICINIOS',
    label: 'Açougue / frios / laticínios',
    color: '#ef4444',
  },
  BARBEARIA_SALAO: {
    id: 'BARBEARIA_SALAO',
    label: 'Barbearia / salão de beleza',
    color: '#fbbf24',
  },
  FRUTAS_HORTALICAS_ERVAS: {
    id: 'FRUTAS_HORTALICAS_ERVAS',
    label: 'Frutas / hortaliças / ervas',
    color: '#86efac',
  },
  MERCEARIA: { id: 'MERCEARIA', label: 'Mercearia', color: '#22c55e' },
  PEIXE_MARISCO: { id: 'PEIXE_MARISCO', label: 'Peixe e marisco', color: '#38bdf8' },
  PRODUTOS_REGIONAIS: {
    id: 'PRODUTOS_REGIONAIS',
    label: 'Produtos regionais',
    color: '#60a5fa',
  },
  RESTAURANTE_LANCHONETE: {
    id: 'RESTAURANTE_LANCHONETE',
    label: 'Restaurante e lanchonete',
    color: '#f97316',
  },
}

export const SECTOR_LIST: Sector[] = Object.values(SECTORS)

