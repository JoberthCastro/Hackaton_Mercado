import { Map, Star, ArrowRight, Calendar, MapPin, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backgroundImage from '../assets/IMAGEM DE FUNDO HOME.jpg'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const canSubmit = useMemo(() => query.trim().length > 0, [query])

  return (
    <div className="relative min-h-screen">
      {/* Imagem de Fundo */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Mercado da Cidade de São Luís"
          className="h-full w-full object-cover"
        />
        {/* Overlay escuro para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Conteúdo sobreposto */}
      <div className="relative z-10">
        {/* Hero Section com Busca */}
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-primary-700 border border-primary-100 shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              Entregue em 2024
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
              Mercado da Cidade
              <span className="block text-accent-400">de São Luís</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/95 md:text-lg drop-shadow-md">
              Espaço moderno e estruturado que abriga os feirantes do tradicional Mercado Central durante sua reforma e modernização.
            </p>
          </div>

          {/* Atalho de busca (leva para o mapa/chat) */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const q = query.trim()
              if (!q) return
              navigate(`/buscar?q=${encodeURIComponent(q)}`)
            }}
            className="mx-auto mt-8 max-w-3xl"
          >
            <div className="flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3 pr-2">
                <span className="text-[11px] font-extrabold tracking-wide text-primary-700">BUSCA</span>
                <span className="h-5 w-px bg-gray-200" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você procura?"
                className="min-w-0 flex-1 bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none"
                aria-label="Buscar no Mercado da Cidade"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl border-2 border-blue-800 transition-all hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Pesquisar"
                title="Pesquisar"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-white/90">
              Dica: tente “mocotó”, “peixe”, “artesanato” ou “comida”.
            </div>
          </form>

        </div>

        {/* Conteúdo Principal com Fundo Branco */}
        <div className="bg-white/98 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">

        {/* História do Mercado */}
        <div className="mb-12 rounded-card border border-gray-200 bg-white p-6 shadow-card md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-institutional bg-primary-100">
              <MapPin className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nossa História</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-gray-700 md:text-base">
            <p>
              O <strong className="text-gray-900">Mercado da Cidade</strong> foi entregue em <strong className="text-primary-700">2024</strong> pelo prefeito Eduardo Braide, 
              localizado na <strong className="text-primary-700">Avenida Vitorino Freire, Aterro do Bacanga, Centro</strong>. 
              Este espaço moderno foi criado para abrigar os feirantes do tradicional Mercado Central durante o período de reforma e modernização do equipamento histórico.
            </p>
            <p>
              O <strong className="text-gray-900">Mercado Central de São Luís</strong> foi fundado em <strong className="text-primary-700">1864</strong>, sendo o mercado mais antigo da capital maranhense. 
              Enquanto passa por reforma, os feirantes continuam suas atividades no Mercado da Cidade, mantendo viva a tradição do comércio popular de São Luís.
            </p>
            <p>
              Com <strong className="text-primary-700">4 galpões estruturados e capacidade para cerca de 450 feirantes</strong>, o Mercado da Cidade oferece 
              boxes padronizados, ampla área de circulação, praça de alimentação, banheiros e mais de 300 vagas de estacionamento. 
              O espaço está organizado em setores especializados: Restaurantes e Lanchonetes, Produtos Regionais, Frutas e Hortaliças, 
              Peixe e Marisco, Açougue, Mercearia, Artesanato e outros.
            </p>
            <p className="font-medium text-gray-900">
              O Mercado da Cidade representa a valorização do comércio popular de São Luís, garantindo que centenas de famílias mantenham 
              sua fonte de renda enquanto o novo Mercado Central é construído, preservando a tradição e a identidade cultural da capital maranhense.
            </p>
          </div>
        </div>

        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <a
            href="/buscar"
            className="group relative overflow-hidden rounded-card border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-card transition-all hover:border-primary-300 hover:shadow-elevated md:p-8"
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-institutional bg-blue-600 text-white shadow-md">
                  <Map className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Explorar o Mapa</h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 md:text-base">
                Navegue pelo mapa interativo do Mercado da Cidade. Encontre produtos, setores e estabelecimentos. 
                Use nosso assistente virtual para buscar o que precisa e veja rotas detalhadas até o destino.
              </p>
              <button className="inline-flex items-center gap-2 rounded-institutional bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-xl border-2 border-blue-800 transition-all hover:bg-blue-800 active:bg-blue-900">
                Entrar no Mapa
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-100 opacity-30 blur-2xl" />
          </a>

          <a
            href="/avaliacoes"
            className="group relative overflow-hidden rounded-card border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-card transition-all hover:border-accent-300 hover:shadow-elevated md:p-8"
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-institutional bg-yellow-500 text-white shadow-md">
                  <Star className="h-6 w-6 fill-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Avaliações</h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 md:text-base">
                Compartilhe sua experiência no Mercado da Cidade. Avalie estabelecimentos, deixe comentários e 
                ajude outros visitantes a descobrirem os melhores lugares.
              </p>
              <div className="inline-flex items-center gap-2 rounded-institutional border-2 border-gray-900 bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all group-hover:bg-primary-700 group-hover:border-primary-700">
                Ver Avaliações
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-100 opacity-30 blur-2xl" />
          </a>
        </div>

            {/* Estatísticas */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-institutional border border-gray-200 bg-white p-4 text-center shadow-institutional">
                <div className="text-2xl font-bold text-primary-600">4</div>
                <div className="mt-1 text-xs text-gray-600">Galpões</div>
              </div>
              <div className="rounded-institutional border border-gray-200 bg-white p-4 text-center shadow-institutional">
                <div className="text-2xl font-bold text-primary-600">261</div>
                <div className="mt-1 text-xs text-gray-600">Comerciantes</div>
              </div>
              <div className="rounded-institutional border border-gray-200 bg-white p-4 text-center shadow-institutional">
                <div className="text-2xl font-bold text-primary-600">288</div>
                <div className="mt-1 text-xs text-gray-600">Box</div>
              </div>
              <div className="rounded-institutional border border-gray-200 bg-white p-4 text-center shadow-institutional">
                <div className="text-2xl font-bold text-primary-600">144</div>
                <div className="mt-1 text-xs text-gray-600">Bancas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional na HomePage */}
        <footer className="border-t border-gray-200 bg-white py-2">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium text-gray-600">
                  Mercado da Cidade de São Luís
                </p>
                <p className="text-[10px] text-gray-400">
                  Hackathon: O Mercado Central sob a ótica da Inovação
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-[10px] text-gray-400">
                  © {new Date().getFullYear()} Prefeitura de São Luís - MA
                </p>
                <p className="text-[10px] text-gray-400">
                  Por uma cidade melhor
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

