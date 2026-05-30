import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TIPOS = [
  { value: 'servico', label: 'Serviço', color: 'var(--accent)' },
  { value: 'peca', label: 'Peça', color: 'var(--success)' },
  { value: 'terceirizado', label: 'Terceirizado', color: 'var(--text-muted)' },
]

function tipoBadgeStyle(tipo) {
  const t = TIPOS.find(t => t.value === tipo) || TIPOS[0]
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.04em',
    color: t.color,
    border: `1px solid ${t.color}`,
    background: 'transparent',
  }
}

const S = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  h1: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  btnPrimary: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    padding: '9px 18px',
    fontSize: '13px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'background 0.15s',
  },
  btnSecondary: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    padding: '8px 16px',
    fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnDanger: {
    background: 'transparent',
    color: 'var(--danger)',
    border: 'none',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  input: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    padding: '9px 13px',
    fontSize: '14px',
    color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    width: '100%',
    transition: 'border 0.15s',
  },
  select: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    padding: '9px 13px',
    fontSize: '14px',
    color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: '5px',
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-faint)',
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: 'var(--bg-subtle)',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '28px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '20px',
    letterSpacing: '-0.02em',
  },
  searchWrap: {
    marginBottom: '16px',
    maxWidth: '360px',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-faint)',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  hint: {
    fontSize: '11px',
    color: 'var(--text-faint)',
    marginTop: '4px',
    display: 'block',
    fontFamily: 'DM Sans, sans-serif',
  },
  erro: {
    fontSize: '11px',
    color: 'var(--danger)',
    marginTop: '4px',
    display: 'block',
    fontFamily: 'DM Sans, sans-serif',
  },
}

function btnFiltro(ativo) {
  return {
    padding: '6px 14px',
    borderRadius: '6px',
    border: ativo ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: ativo ? 'var(--accent)' : 'transparent',
    color: ativo ? '#fff' : 'var(--text-muted)',
    fontFamily: 'Syne, sans-serif',
    fontWeight: ativo ? 600 : 400,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
}

function Input({ style, ...props }) {
  return (
    <input
      style={{ ...S.input, ...style }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
  )
}

function Label({ children }) {
  return <label style={S.label}>{children}</label>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [form, setForm] = useState({ nome: '', descricao: '', tipo_servico: 'servico' })
  const [editando, setEditando] = useState(null)
  const [nomeErro, setNomeErro] = useState('')

  useEffect(() => { fetchServicos() }, [])

  async function fetchServicos() {
    const { data } = await supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    setServicos(data || [])
  }

  function handleNomeChange(valor) {
    const temInvalido = /[^a-zA-ZÀ-ÿ0-9 ]/.test(valor)
    setNomeErro(temInvalido ? 'Use apenas letras, números e espaço.' : '')
    setForm(f => ({ ...f, nome: valor }))
  }

  function abrirEdicao(s) {
    setEditando(s)
    setForm({ nome: s.nome, descricao: s.descricao || '', tipo_servico: s.tipo_servico || 'servico' })
    setNomeErro('')
    setOpen(true)
  }

  async function handleSalvar() {
    if (editando) {
      if (!form.nome) { alert('Nome é obrigatório'); return }
      if (nomeErro) { alert('Corrija o nome antes de salvar'); return }
      const nomeNormalizado = form.nome.trim().toLowerCase().replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '')
      const { error } = await supabase.from('servicos').update({ nome: nomeNormalizado, descricao: form.descricao, tipo_servico: form.tipo_servico }).eq('id', editando.id)
      if (error) { alert('Erro: ' + error.message); return }
      fecharModal()
      fetchServicos()
      return
    }
    // criação — lógica existente abaixo
    if (!form.nome) { alert('Nome é obrigatório'); return }
    if (nomeErro) { alert('Corrija o nome antes de salvar'); return }
    const nomeNormalizado = form.nome.trim().toLowerCase().replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '')
    const { data: existente } = await supabase
      .from('servicos')
      .select('id')
      .eq('nome', nomeNormalizado)
      .eq('ativo', true)
      .maybeSingle()
    if (existente) { alert('Já existe um serviço com este nome.'); return }
    const { error } = await supabase.from('servicos').insert([{ ...form, nome: nomeNormalizado }])
    if (error) { alert('Erro: ' + error.message); return }
    fecharModal()
    fetchServicos()
  }

  async function handleRemover(id) {
    if (!confirm('Remover este serviço?')) return
    await supabase.from('servicos').update({ ativo: false }).eq('id', id)
    fetchServicos()
  }

  const servicosFiltrados = servicos.filter(s => {
    const matchBusca = s.nome.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || s.tipo_servico === filtroTipo
    return matchBusca && matchTipo
  })

  function fecharModal() {
    setOpen(false)
    setEditando(null)
    setNomeErro('')
    setForm({ nome: '', descricao: '', tipo_servico: 'servico' })
  }

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.h1}>Serviços</h1>
        <button style={S.btnPrimary} onClick={() => setOpen(true)}>+ Novo Serviço</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ ...S.searchWrap, marginBottom: 0 }}>
          <Input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
          />
        </div>
        <div style={S.filterBar}>
          <button style={btnFiltro(filtroTipo === 'todos')} onClick={() => setFiltroTipo('todos')}>Todos</button>
          {TIPOS.map(t => (
            <button key={t.value} style={btnFiltro(filtroTipo === t.value)} onClick={() => setFiltroTipo(t.value)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Nome</th>
              <th style={S.th}>Tipo</th>
              <th style={S.th}>Descrição</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {servicosFiltrados.map(s => (
              <tr
                key={s.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...S.td, fontWeight: 500 }}>{s.nome}</td>
                <td style={S.td}>
                  <span style={tipoBadgeStyle(s.tipo_servico)}>
                    {TIPOS.find(t => t.value === s.tipo_servico)?.label || 'Serviço'}
                  </span>
                </td>
                <td style={{ ...S.td, color: 'var(--text-muted)' }}>{s.descricao || '—'}</td>
                <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button style={{ ...S.btnSecondary, fontSize: '12px', padding: '4px 10px', marginRight: '6px' }} onClick={() => abrirEdicao(s)}>Editar</button>
                  <button style={S.btnDanger} onClick={() => handleRemover(s.id)}>Remover</button>
                </td>
              </tr>
            ))}
            {servicosFiltrados.length === 0 && (
              <tr><td colSpan={4} style={S.emptyState}>Nenhum serviço encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={fecharModal} title={editando ? 'Editar Serviço' : 'Novo Serviço'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={e => handleNomeChange(e.target.value)}
              placeholder="Ex: troca de oleo"
            />
            {nomeErro && <span style={S.erro}>{nomeErro}</span>}
            <span style={S.hint}>Letras, números e espaço. Será salvo em minúsculo.</span>
          </div>
          <div>
            <Label>Tipo</Label>
            <select
              style={S.select}
              value={form.tipo_servico}
              onChange={e => setForm(f => ({ ...f, tipo_servico: e.target.value }))}
            >
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Descrição</Label>
            <Input
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Detalhes opcionais"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button style={S.btnSecondary} onClick={fecharModal}>Cancelar</button>
            <button style={S.btnPrimary} onClick={handleSalvar}>Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
