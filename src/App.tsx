import { Navigate, Route, Routes } from 'react-router-dom'
import { TopNav } from './components/TopNav'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { ReviewsPage } from './pages/ReviewsPage'

function App() {

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
      {/* Rodapé removido para dar mais espaço ao chat */}
    </div>
  )
}

export default App
