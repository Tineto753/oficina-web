import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text)',
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

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({ nome: '', telefone: '' })
  const [editando, setEditando] = useState(null)

  useEffect(() => { fetchFornecedores() }, [])

  async function fetchFornecedores() {
    const { data } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    setFornecedores(data || [])
  }

  function abrirEdicao(f) {
    setEditando(f)
    setForm({ nome: f.nome, telefone: f.telefone || '' })
    setOpen(true)
  }

  function fecharModal() {
    setOpen(false)
    setEditando(null)
    setForm({ nome: '', telefone: '' })
  }

  async function handleSalvar() {
    if (!form.nome.trim()) { alert('Nome é obrigatório'); return }
    const payload = { nome: form.nome.trim(), telefone: form.telefone.trim() || null }
    if (editando) {
      const { error } = await supabase.from('fornecedores').update(payload).eq('id', editando.id)
      if (error) { alert('Erro: ' + error.message); return }
    } else {
      const { error } = await supabase.from('fornecedores').insert([payload])
      if (error) { alert('Erro: ' + error.message); return }
    }
    fecharModal()
    fetchFornecedores()
  }

  async function handleRemover(id) {
    if (!confirm('Remover este fornecedor?')) return
    await supabase.from('fornecedores').update({ ativo: false }).eq('id', id)
    fetchFornecedores()
  }

  const filtrados = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (f.telefone || '').includes(busca)
  )

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.h1}>Fornecedores</h1>
        <button style={S.btnPrimary} onClick={() => setOpen(true)}>+ Novo Fornecedor</button>
      </div>

      <div style={S.searchWrap}>
        <Input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
        />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Nome</th>
              <th style={S.th}>Telefone</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(f => (
              <tr
                key={f.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...S.td, fontWeight: 500 }}>{f.nome}</td>
                <td style={{ ...S.td, color: 'var(--text-muted)' }}>{f.telefone || '—'}</td>
                <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button style={{ ...S.btnSecondary, fontSize: '12px', padding: '4px 10px', marginRight: '6px' }} onClick={() => abrirEdicao(f)}>Editar</button>
                  <button style={S.btnDanger} onClick={() => handleRemover(f.id)}>Remover</button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={3} style={S.emptyState}>Nenhum fornecedor encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={fecharModal} title={editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Auto Center Silva"
              autoFocus
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
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
