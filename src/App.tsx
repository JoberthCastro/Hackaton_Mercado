import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TopNav } from './components/TopNav'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { ReviewsPage } from './pages/ReviewsPage'

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-700">
              Mercado da Cidade de São Luís
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Hackathon: O Mercado Central sob a ótica da Inovação
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Prefeitura de São Luís - MA
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Por uma cidade melhor
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <TopNav />
      <div className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/avaliacoes" element={<ReviewsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {/* Rodapé Institucional - não aparece na HomePage (ela tem seu próprio rodapé) */}
      {!isHomePage && <Footer />}
    </div>
  )
}

export default App
