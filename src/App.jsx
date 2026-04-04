import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Clientes from './pages/Clientes'
import Servicos from './pages/Servicos'
import OrdemServico from './pages/OrdemServico'
import NovaOS from './pages/NovaOS'
import Historico from './pages/Historico'
import Configuracoes from './pages/Configuracoes'
import { exportarPlanilha } from './lib/exportar'

// dentro da nav, no final

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-3 flex gap-6">
          <NavLink to="/" className={({ isActive }) => isActive ? 'font-bold text-blue-600' : 'text-gray-600'}>Clientes</NavLink>
          <NavLink to="/servicos" className={({ isActive }) => isActive ? 'font-bold text-blue-600' : 'text-gray-600'}>Serviços</NavLink>
          <NavLink to="/os" className={({ isActive }) => isActive ? 'font-bold text-blue-600' : 'text-gray-600'}>Ordens de Serviço</NavLink>
          <NavLink to="/historico" className={({ isActive }) => isActive ? 'font-bold text-blue-600' : 'text-gray-600'}>Histórico</NavLink>
          <NavLink to="/configuracoes" className={({ isActive }) => isActive ? 'font-bold text-blue-600' : 'text-gray-600'}>Configurações</NavLink>
          <button
            onClick={exportarPlanilha}
            className="ml-auto text-sm text-gray-600 hover:text-blue-600 border px-3 py-1 rounded-lg hover:border-blue-600 transition-colors"
          >
            ↓ Exportar
          </button>

        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/os/nova" element={<NovaOS />} />
            <Route path="/os" element={<OrdemServico />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
