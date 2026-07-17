import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Criar serviço/peça sem sair da tela. Vive aqui porque é usado tanto na
// NovaOS quanto na edição de uma OS já criada — antes só existia na NovaOS, e
// quem editava uma OS pronta não tinha como cadastrar um serviço novo.

const TIPOS = [
  { value: 'servico', label: 'Serviço' },
  { value: 'peca', label: 'Peça' },
  { value: 'terceirizado', label: 'Terceirizado' },
]

// Nome aceita letra, número e espaço: "troca de oleo 5w30", "pastilha 1.6".
// Também . - / porque especificação de peça usa ("20w-50", "1.6 16v").
const PERMITIDO = /^[a-zA-ZÀ-ÿ0-9 ./-]*$/
const limparNome = s => s.trim().toLowerCase().replace(/[^a-zA-ZÀ-ÿ0-9 ./-]/g, '').replace(/\s+/g, ' ')

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  modal: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
    padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  titulo: {
    fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700,
    color: 'var(--text)', letterSpacing: '-0.02em',
  },
  label: {
    display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)',
    marginBottom: '5px', fontFamily: 'Syne, sans-serif', letterSpacing: '0.03em', textTransform: 'uppercase',
  },
  input: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px',
    padding: '9px 13px', fontSize: '14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%',
  },
  erro: { fontSize: '12px', color: 'var(--danger)', fontFamily: 'DM Sans, sans-serif' },
  hint: { fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'DM Sans, sans-serif' },
  btnPrimary: {
    background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px',
    padding: '9px 18px', fontSize: '13px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer',
  },
  btnSecondary: {
    background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
    borderRadius: '7px', padding: '8px 16px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
  },
  abrir: {
    background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
    borderRadius: '7px', padding: '6px 12px', fontSize: '12px',
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap',
  },
}

export default function NovoServicoModal({ onSalvo, tipoInicial = 'servico' }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', tipo_servico: tipoInicial })
  const [nomeErro, setNomeErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function handleNomeChange(valor) {
    setNomeErro(PERMITIDO.test(valor) ? '' : 'Use letras, números e espaço.')
    setForm(f => ({ ...f, nome: valor }))
  }

  function fechar() {
    setOpen(false)
    setNomeErro('')
    setSalvando(false)
    setForm({ nome: '', descricao: '', tipo_servico: tipoInicial })
  }

  async function handleSalvar() {
    const nome = limparNome(form.nome)
    if (!nome) { alert('Nome é obrigatório'); return }
    if (nomeErro) { alert('Corrija o nome antes de salvar'); return }
    setSalvando(true)
    const { data: existente } = await supabase
      .from('servicos').select('id, nome').eq('nome', nome).eq('ativo', true).maybeSingle()
    if (existente) {
      setSalvando(false)
      alert('Já existe um serviço com este nome.')
      return
    }
    const { data, error } = await supabase
      .from('servicos').insert([{ ...form, nome }]).select().single()
    if (error) { setSalvando(false); alert('Erro: ' + error.message); return }
    onSalvo(data)
    fechar()
  }

  if (!open) return (
    <button style={S.abrir} onClick={() => setOpen(true)}>+ Novo Serviço</button>
  )

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && fechar()}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.titulo}>Novo Serviço</h2>
          <button onClick={fechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={S.label}>Nome</label>
            <input
              style={S.input}
              value={form.nome}
              autoFocus
              onChange={e => handleNomeChange(e.target.value)}
              placeholder="Ex: troca de oleo 5w30"
            />
            {nomeErro && <span style={S.erro}>{nomeErro}</span>}
            <span style={S.hint}>Será salvo em minúsculo.</span>
          </div>
          <div>
            <label style={S.label}>Tipo</label>
            <select
              style={{ ...S.input, cursor: 'pointer' }}
              value={form.tipo_servico}
              onChange={e => setForm(f => ({ ...f, tipo_servico: e.target.value }))}
            >
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Descrição</label>
            <input
              style={S.input}
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button style={S.btnSecondary} onClick={fechar}>Cancelar</button>
            <button style={S.btnPrimary} onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
