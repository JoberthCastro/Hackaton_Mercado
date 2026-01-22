import { NavLink } from 'react-router-dom'
import { Map, MessageSquareText, Star } from 'lucide-react'
import logoSaoLuis from '../assets/LOGO SÃO LUIS.png'
import logoMvp from '../assets/LOGO MVP.png'

function Item({
  to,
  label,
  icon,
}: {
  to: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-institutional px-2 py-2 text-sm font-semibold whitespace-nowrap transition-all sm:px-3 ${
          isActive
            ? 'bg-blue-700 text-white shadow-xl border-2 border-blue-800'
            : 'text-gray-800 hover:bg-blue-50 hover:text-blue-800 active:bg-blue-100 border border-transparent hover:border-blue-300'
        }`
      }
      end
    >
      <span className="h-4 w-4">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  )
}

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/98 backdrop-blur-sm shadow-institutional">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <img
            src={logoMvp}
            alt="Rotas do Mercado"
            className="h-10 w-auto max-w-[110px] object-contain sm:h-14 sm:max-w-none md:h-16"
          />
          <div className="min-w-0 border-l border-gray-200 pl-2 leading-tight sm:pl-3">
            <div className="truncate text-xs font-extrabold text-primary-700 sm:text-base md:text-lg">
              Rotas do Mercado
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 md:text-sm">
              <span className="truncate">Mercado da Cidade • São Luís</span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1">
                <img src={logoSaoLuis} alt="Prefeitura de São Luís" className="h-4 w-auto object-contain md:h-5" />
                <span className="truncate">Prefeitura de São Luís</span>
              </span>
            </div>
          </div>
        </div>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Item to="/" label="Home" icon={<Map className="h-4 w-4" />} />
          <Item to="/buscar" label="Buscar" icon={<MessageSquareText className="h-4 w-4" />} />
          <Item to="/avaliacoes" label="Avaliações" icon={<Star className="h-4 w-4" />} />
        </nav>
      </div>
    </header>
  )
}

