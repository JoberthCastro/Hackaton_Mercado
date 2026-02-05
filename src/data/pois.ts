import type { Poi } from '../types'
import restImg from '../assets/RESTAURANTE 1.png'
import produtosImg from '../assets/PRODUTOS TIPICOS 1.png'
import frutariaImg from '../assets/FRUTARIA 1.png'

/**
 * POIs do MVP (começamos com 1 restaurante, conforme solicitado).
 * Coordenadas normalizadas (0..1) sobre a imagem do mercado.
 */
export const POIS: Poi[] = [
  {
    id: 'rest-seu-ze',
    kind: 'BOX',
    name: 'Restaurante da Nina',
    sectorId: 'RESTAURANTE_LANCHONETE',
    products: [
      'comida',
      'comidas',
      'almoço',
      'almoco',
      'jantar',
      'lanche',
      'mocotó',
      'mocoto',
      'mócoto',
      'caldo',
      'prato feito',
    ],
    point: { x: 0.5960, y: 0.5355 },
    hasRoute: true,
    imageUrl: restImg,
    rating: 4.8,
    ratingCount: 127,
    statusText: 'Aberto agora',
    addressShort: 'Setor Restaurante e lanchonete • Box',
    phone: '(98) 9 0000-0000',
    about: `O restaurante no Mercado Central situa a gastronomia maranhense no centro da experiência turística. Reúne mesas onde se degustam pratos tradicionais – arroz de cuxá, moqueca de camarão, arroz-de-cuxá – preparados com ingredientes locais em receitas passadas de geração em geração. Segundo avaliações de visitantes, é "atração imperdível" para quem busca culinária raiz. Além de alimentar, o restaurante compartilha histórias: na cozinha e às mesas, misturam-se território, memória e cultura, reforçando o papel do Mercado Central como coração histórico e gastronômico de São Luís.`,
  },
  {
    id: 'garrafaria-dona-ana',
    kind: 'BOX',
    name: 'Garrafaria da Dona Ana',
    sectorId: 'PRODUTOS_REGIONAIS',
    products: [
      'garrafaria',
      'garrafada',
      'garrafadas',
      'licor',
      'licores',
      'cachaça',
      'cachaca',
      'tiquira',
      'mel',
      'xarope',
      'remédio caseiro',
      'remedio caseiro',
      'erva',
      'ervas',
      'regional',
      'produtos regionais',
    ],
    point: { x: 0.8023, y: 0.4510 },
    hasRoute: true,
    imageUrl: produtosImg,
    rating: 4.7,
    ratingCount: 58,
    statusText: 'Aberto agora',
    addressShort: 'Produtos regionais • Box G1-PROD-001',
    phone: '(98) 9 1111-1111',
    about: `A Garrafaria da Dona Ana é um tesouro especializado em produtos regionais maranhenses há mais de 40 anos. Fundada por Ana Maria dos Santos em 1982 no Mercado Central, a garrafaria começou como um pequeno negócio familiar e se tornou referência em produtos típicos de São Luís. Agora está no Mercado da Cidade, continuando a tradição.

Dona Ana, uma senhora de origem rural, trouxe para o mercado os conhecimentos tradicionais sobre plantas medicinais, ervas e preparos artesanais que aprendeu com sua mãe e avó. Ela começou vendendo garrafadas medicinais e licores caseiros, produtos que eram muito procurados na época.

A garrafaria é famosa por sua tiquira artesanal, uma bebida tradicional maranhense feita a partir da mandioca, preparada seguindo receitas antigas que Dona Ana preserva com cuidado. Além disso, o estabelecimento oferece uma variedade impressionante de licores, cachaças artesanais, mel de abelhas nativas, xaropes medicinais e garrafadas para diversos fins.

O que torna a Garrafaria da Dona Ana especial é o conhecimento tradicional que ela preserva. Cada produto é feito com ingredientes selecionados, muitos deles colhidos diretamente de produtores locais ou cultivados em pequenas propriedades rurais do Maranhão.

Ao longo dos anos, Dona Ana passou seus conhecimentos para sua nora, que hoje ajuda a manter viva a tradição. A garrafaria não é apenas um comércio, mas um espaço de preservação da cultura maranhense, onde os clientes podem encontrar produtos autênticos e histórias sobre a tradição local.

Muitos moradores de São Luís e turistas visitam a garrafaria não apenas para comprar, mas para ouvir as histórias de Dona Ana sobre as propriedades medicinais das plantas e os segredos dos preparos tradicionais.`,
  },
  {
    id: 'frutaria-seu-pedro',
    kind: 'BANCA',
    name: 'Frutaria do Seu Pedro',
    sectorId: 'FRUTAS_HORTALICAS_ERVAS',
    products: [
      'fruta',
      'frutas',
      'verdura',
      'verduras',
      'hortaliça',
      'hortalica',
      'hortaliças',
      'hortalicas',
      'erva',
      'ervas',
      'banana',
      'maçã',
      'maca',
      'mamão',
      'mamao',
      'tomate',
      'cebola',
      'cheiro-verde',
    ],
    point: { x: 0.6695, y: 0.4511 },
    hasRoute: true,
    imageUrl: frutariaImg,
    rating: 4.6,
    ratingCount: 84,
    statusText: 'Fecha em breve',
    addressShort: 'Frutas / hortaliças / ervas • Banca',
    phone: '(98) 9 2222-2222',
    about: `A Frutaria do Seu Pedro é uma das bancas mais antigas e queridas do setor de frutas, hortaliças e ervas. Pedro Alves, conhecido como Seu Pedro, começou a trabalhar no Mercado Central em 1975, quando tinha apenas 18 anos, ajudando seu pai na banca da família. Agora está no Mercado da Cidade, mantendo a mesma qualidade e tradição.

A banca foi fundada pelo pai de Seu Pedro, que era agricultor e trazia produtos diretamente da roça para vender no mercado. Seu Pedro cresceu aprendendo sobre qualidade, frescor e a importância de oferecer produtos de origem local.

Ao longo de quase 50 anos, a Frutaria do Seu Pedro se tornou sinônimo de qualidade e confiança. Seu Pedro mantém relacionamentos diretos com pequenos produtores rurais da região de São Luís e municípios vizinhos, garantindo que seus clientes tenham acesso às melhores frutas e verduras da época.

A banca é conhecida por sua variedade impressionante: desde frutas tropicais típicas do Maranhão, como açaí, cupuaçu e bacuri, até hortaliças frescas e ervas medicinais. Seu Pedro tem um conhecimento profundo sobre cada produto, sabendo qual é a melhor época para cada fruta e como conservá-las adequadamente.

O que diferencia a Frutaria do Seu Pedro é o atendimento personalizado. Seu Pedro conhece muitos de seus clientes há décadas e sempre tem uma dica sobre como escolher a melhor fruta ou como preparar um prato com os ingredientes que ele vende.

Hoje, a banca é gerida por Seu Pedro e seus dois filhos, que continuam a tradição familiar de oferecer produtos frescos e de qualidade. A frutaria não é apenas um negócio, mas parte da memória afetiva de muitas famílias de São Luís que fazem suas compras semanais ali há gerações.`,
  },

  // Restaurantes mock (apenas sugestão, sem rota)
  {
    id: 'rest-mock-01',
    kind: 'BOX',
    name: 'Restaurante (sugestão) — Dona Maria',
    sectorId: 'RESTAURANTE_LANCHONETE',
    products: ['comida', 'mocotó', 'almoço', 'lanche', 'caldo'],
    point: { x: 0.6042, y: 0.9086 },
    hasRoute: false,
  },
  {
    id: 'rest-mock-02',
    kind: 'BOX',
    name: 'Restaurante (sugestão) — Cantinho do Mercado',
    sectorId: 'RESTAURANTE_LANCHONETE',
    products: ['comida', 'prato feito', 'almoço', 'jantar'],
    point: { x: 0.4735, y: 0.3581 },
    hasRoute: false,
  },
  // Produtos regionais (sugestão, sem rota)
  {
    id: 'prod-regional-mock-01',
    kind: 'BOX',
    name: 'Produtos Regionais (sugestão)',
    sectorId: 'PRODUTOS_REGIONAIS',
    products: ['produtos regionais', 'regional', 'licor', 'cachaça', 'tiquira'],
    point: { x: 0.7228, y: 0.3189 },
    hasRoute: false,
  },
  {
    id: 'prod-regional-mock-02',
    kind: 'BOX',
    name: 'Produtos Regionais (sugestão) — Artesanato',
    sectorId: 'PRODUTOS_REGIONAIS',
    products: ['produtos regionais', 'regional', 'artesanato', 'tiquira', 'licor', 'cachaça'],
    point: { x: 0.8031, y: 0.1291 },
    hasRoute: false,
  },
  // Frutarias (sugestão, sem rota)
  {
    id: 'frutaria-mock-01',
    kind: 'BANCA',
    name: 'Frutaria (sugestão)',
    sectorId: 'FRUTAS_HORTALICAS_ERVAS',
    products: ['fruta', 'frutas', 'verdura', 'verduras'],
    point: { x: 0.7042, y: 0.3151 },
    hasRoute: false,
  },
  {
    id: 'frutaria-mock-02',
    kind: 'BANCA',
    name: 'Frutaria (sugestão) — Hortaliças',
    sectorId: 'FRUTAS_HORTALICAS_ERVAS',
    products: ['fruta', 'frutas', 'hortaliça', 'hortaliças', 'verdura'],
    point: { x: 0.7077, y: 0.0743 },
    hasRoute: false,
  },
]

