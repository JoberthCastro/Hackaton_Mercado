import type { Poi } from '../types'

/**
 * MVP: poucos pontos por setor (coordenadas normalizadas 0..1 sobre a imagem).
 * Depois dá pra trocar isso por um JSON completo gerado do `.map`/PDF.
 */
export const MOCK_POIS: Poi[] = [
  // AÇOUGUE (vermelho - bloco à esquerda)
  {
    id: 'box-aco-01',
    kind: 'BOX',
    name: 'Box 12 — Açougue do Zé',
    sectorId: 'ACOUGUE_FRIOS_LATICINIOS',
    products: ['carne', 'mocotó', 'frango', 'linguiça', 'queijo'],
    point: { x: 0.12, y: 0.20 },
  },
  {
    id: 'box-aco-02',
    kind: 'BOX',
    name: 'Box 18 — Frios & Laticínios',
    sectorId: 'ACOUGUE_FRIOS_LATICINIOS',
    products: ['presunto', 'queijo', 'manteiga', 'requeijão'],
    point: { x: 0.14, y: 0.32 },
  },

  // MERCEARIA (verde escuro - faixa superior / colunas centrais)
  {
    id: 'box-mer-01',
    kind: 'BOX',
    name: 'Box 74 — Mercearia Central',
    sectorId: 'MERCEARIA',
    products: ['arroz', 'feijão', 'macarrão', 'óleo', 'sal'],
    point: { x: 0.39, y: 0.16 },
  },
  {
    id: 'box-mer-02',
    kind: 'BOX',
    name: 'Box 81 — Temperos & Grãos',
    sectorId: 'MERCEARIA',
    products: ['pimenta', 'cominho', 'colorau', 'grãos', 'farinha'],
    point: { x: 0.41, y: 0.30 },
  },

  // ARTESANATO (roxo - parte inferior central-esquerda)
  {
    id: 'box-art-01',
    kind: 'BOX',
    name: 'Box 121 — Artesanato Maranhense',
    sectorId: 'ARTESANATO',
    products: ['artesanato', 'lembrança', 'biojoia', 'azulejo', 'rede'],
    point: { x: 0.40, y: 0.72 },
  },
  {
    id: 'box-art-02',
    kind: 'BOX',
    name: 'Box 132 — Palha & Cerâmica',
    sectorId: 'ARTESANATO',
    products: ['cestaria', 'palha', 'cerâmica', 'souvenir'],
    point: { x: 0.45, y: 0.80 },
  },

  // RESTAURANTE/LANCHONETE (laranja - parte inferior central)
  {
    id: 'box-res-01',
    kind: 'BOX',
    name: 'Box 205 — Lanchonete da Praça',
    sectorId: 'RESTAURANTE_LANCHONETE',
    products: ['comida', 'lanche', 'café', 'sanduíche', 'suco'],
    point: { x: 0.61, y: 0.80 },
  },
  {
    id: 'box-res-02',
    kind: 'BOX',
    name: 'Box 212 — Restaurante Popular (mock)',
    sectorId: 'RESTAURANTE_LANCHONETE',
    products: ['comida', 'almoço', 'jantar', 'prato feito', 'caldo'],
    point: { x: 0.63, y: 0.75 },
  },

  // FRUTAS/HORTALIÇAS/ERVAS (verde claro - coluna direita central)
  {
    id: 'banca-fru-01',
    kind: 'BANCA',
    name: 'Banca 33 — Frutas & Verduras',
    sectorId: 'FRUTAS_HORTALICAS_ERVAS',
    products: ['banana', 'mamão', 'tomate', 'cebola', 'verdura'],
    point: { x: 0.82, y: 0.56 },
  },
  {
    id: 'banca-fru-02',
    kind: 'BANCA',
    name: 'Banca 41 — Ervas & Temperos',
    sectorId: 'FRUTAS_HORTALICAS_ERVAS',
    products: ['erva', 'cheiro-verde', 'hortelã', 'manjericão'],
    point: { x: 0.81, y: 0.61 },
  },

  // PEIXE & MARISCO (ciano/azulado - bloco esquerdo inferior e coluna direita)
  {
    id: 'box-pei-01',
    kind: 'BOX',
    name: 'Box 16 — Peixaria do Porto',
    sectorId: 'PEIXE_MARISCO',
    products: ['peixe', 'camarão', 'marisco', 'pescado', 'atum'],
    point: { x: 0.12, y: 0.74 },
  },
  {
    id: 'box-pei-02',
    kind: 'BOX',
    name: 'Box 29 — Mariscos & Cia',
    sectorId: 'PEIXE_MARISCO',
    products: ['marisco', 'sururu', 'ostras', 'camarão'],
    point: { x: 0.92, y: 0.63 },
  },

  // PRODUTOS REGIONAIS (azul - bloco esquerdo inferior)
  {
    id: 'box-reg-01',
    kind: 'BOX',
    name: 'Box 44 — Produtos Regionais',
    sectorId: 'PRODUTOS_REGIONAIS',
    products: ['farinha', 'tapioca', 'açaí', 'rapadura', 'cajuína'],
    point: { x: 0.12, y: 0.84 },
  },

  // BARBEARIA / SALÃO (amarelo - parte superior central-direita)
  {
    id: 'box-bar-01',
    kind: 'BOX',
    name: 'Box 156 — Barbearia (mock)',
    sectorId: 'BARBEARIA_SALAO',
    products: ['barbearia', 'corte', 'barba', 'salão', 'beleza'],
    point: { x: 0.62, y: 0.16 },
  },

  // ADMINISTRAÇÃO (azul claro - centro inferior)
  {
    id: 'adm-01',
    kind: 'BOX',
    name: 'Administração',
    sectorId: 'ADMINISTRACAO',
    products: ['informação', 'administração', 'achados e perdidos'],
    point: { x: 0.58, y: 0.66 },
  },
]

