import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Clientes from './pages/Clientes'
import Servicos from './pages/Servicos'
import Estoque from './pages/Estoque'
import OrdemServico from './pages/OrdemServico'
import NovaOS from './pages/NovaOS'
import Historico from './pages/Historico'
import Configuracoes from './pages/Configuracoes'
import Agenda from './pages/Agenda'
import Fornecedores from './pages/Fornecedores'
import Dashboard from './pages/Dashboard'
import { exportarPlanilha } from './lib/exportar'

function Navbar() {
  const [dark, setDark] = useState(() => localStorage.getItem('tema') === 'dark')
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('tema', dark ? 'dark' : 'light')
  }, [dark])

  const links = [
    { to: '/', label: 'Clientes', exact: true },
    { to: '/servicos', label: 'Serviços' },
    { to: '/estoque', label: 'Estoque' },
    { to: '/fornecedores', label: 'Fornecedores' },
    { to: '/os', label: 'OS' },
    { to: '/historico', label: 'Histórico' },
    { to: '/agenda', label: 'Agenda' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/configuracoes', label: 'Config.' },
  ]

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      height: '52px',
      gap: '4px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: '15px',
        color: 'var(--nav-active)',
        letterSpacing: '-0.03em',
        marginRight: '20px',
        whiteSpace: 'nowrap'
      }}>
        AUTO<span style={{ color: 'var(--nav-text)', opacity: 0.5 }}>ALMEIDA</span>
      </div>

      {/* Links */}
      {links.map(l => {
        const isActive = l.exact
          ? location.pathname === l.to
          : location.pathname.startsWith(l.to)
        return (
          <NavLink
            key={l.to}
            to={l.to}
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: isActive ? 600 : 400,
              fontSize: '13px',
              color: isActive ? 'var(--nav-active)' : 'var(--nav-muted)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              background: isActive ? 'rgba(193,127,36,0.12)' : 'transparent',
              transition: 'all 0.15s',
              letterSpacing: '0.01em'
            }}
          >
            {l.label}
          </NavLink>
        )
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Exportar */}
      <button
        onClick={exportarPlanilha}
        style={{
          fontSize: '12px',
          color: 'var(--nav-muted)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '5px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.15s',
          marginRight: '8px'
        }}
        onMouseEnter={e => e.target.style.color = 'var(--nav-text)'}
        onMouseLeave={e => e.target.style.color = 'var(--nav-muted)'}
      >
        ↓ Exportar
      </button>

      {/* Toggle tema */}
      <button
        onClick={() => setDark(d => !d)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          padding: '5px 10px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.15s'
        }}
        title={dark ? 'Modo claro' : 'Modo escuro'}
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <main style={{ padding: '28px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/os/nova" element={<NovaOS />} />
            <Route path="/os" element={<OrdemServico />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
