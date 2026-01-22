import { NavLink } from 'react-router-dom'
import { Map, MessageSquareText, Star } from 'lucide-react'
import logoSaoLuis from '../assets/LOGO SÃO LUIS.png'

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
        `inline-flex items-center gap-2 rounded-institutional px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
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
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex items-center gap-3">
          <img
            src={logoSaoLuis}
            alt="Prefeitura de São Luís"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <div className="min-w-0 border-l border-gray-200 pl-3 leading-tight">
            <div className="truncate text-sm font-bold text-primary-700 sm:text-base">
              Mercado da Cidade
            </div>
            <div className="hidden text-xs text-gray-600 sm:block">
              Guia Digital • Prefeitura de São Luís
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Item to="/" label="Home" icon={<Map className="h-4 w-4" />} />
          <Item to="/buscar" label="Buscar" icon={<MessageSquareText className="h-4 w-4" />} />
          <Item to="/avaliacoes" label="Avaliações" icon={<Star className="h-4 w-4" />} />
        </nav>
      </div>
    </header>
  )
}

