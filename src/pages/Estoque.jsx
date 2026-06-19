import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { naoNegativoOuNull } from '../lib/validacao'

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  h1: { fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' },
  cards: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: '160px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 18px', boxShadow: 'var(--shadow)' },
  statLabel: { fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' },
  statValue: { fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text)' },
  searchWrap: { marginBottom: '16px', maxWidth: '360px' },
  input: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 13px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%', transition: 'border 0.15s' },
  label: { display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px', fontFamily: 'Syne, sans-serif', letterSpacing: '0.03em', textTransform: 'uppercase' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' },
  td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border)' },
  emptyState: { padding: '48px', textAlign: 'center', color: 'var(--text-faint)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
  btnPrimary: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 16px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  modal: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px', letterSpacing: '-0.02em' },
}

function Input({ style, ...props }) {
  return <input style={{ ...S.input, ...style }} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} {...props} />
}
function Label({ children }) { return <label style={S.label}>{children}</label> }

function fmt(n) { return (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function MovimentarModal({ peca, onClose, onSalvo }) {
  const [entrada, setEntrada] = useState('')
  const [saida, setSaida] = useState('')
  const [custo, setCusto] = useState(peca.custo ?? '')
  const [minimo, setMinimo] = useState(peca.estoque_minimo ?? '')

  async function salvar() {
    const delta = Math.max(0, parseFloat(entrada) || 0) - Math.max(0, parseFloat(saida) || 0)
    const update = {
      custo: naoNegativoOuNull(custo),
      estoque_minimo: naoNegativoOuNull(minimo) ?? 0,
    }
    if (delta !== 0) update.estoque = (Number(peca.estoque) || 0) + delta
    const { error } = await supabase.from('servicos').update(update).eq('id', peca.id)
    if (error) { alert('Erro: ' + error.message); return }
    onSalvo()
    onClose()
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <h2 style={S.modalTitle}>{peca.nome}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Saldo atual: <b style={{ color: 'var(--text)', fontSize: '18px' }}>{Number(peca.estoque) || 0}</b>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <Label>Entrada (+)</Label>
              <Input type="number" value={entrada} onChange={e => setEntrada(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Saída (−)</Label>
              <Input type="number" value={saida} onChange={e => setSaida(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <Label>Custo (R$)</Label>
            <Input type="number" value={custo} onChange={e => setCusto(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Estoque mínimo</Label>
            <Input type="number" value={minimo} onChange={e => setMinimo(e.target.value)} placeholder="0" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button style={S.btnSecondary} onClick={onClose}>Cancelar</button>
            <button style={S.btnPrimary} onClick={salvar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Estoque() {
  const [pecas, setPecas] = useState([])
  const [busca, setBusca] = useState('')
  const [movimentar, setMovimentar] = useState(null)

  useEffect(() => { fetchPecas() }, [])

  async function fetchPecas() {
    const { data } = await supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .eq('tipo_servico', 'peca')
      .eq('controla_estoque', true)
      .order('nome')
    setPecas(data || [])
  }

  function baixo(p) { return (Number(p.estoque) || 0) <= (Number(p.estoque_minimo) || 0) }

  const filtradas = pecas.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
  const abaixoMin = pecas.filter(baixo).length
  const valorTotal = pecas.reduce((acc, p) => acc + (Number(p.estoque) || 0) * (Number(p.custo) || 0), 0)

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.h1}>Estoque</h1>
      </div>

      <div style={S.cards}>
        <div style={S.stat}>
          <div style={S.statLabel}>Peças controladas</div>
          <div style={S.statValue}>{pecas.length}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Abaixo do mínimo</div>
          <div style={{ ...S.statValue, color: abaixoMin > 0 ? 'var(--danger)' : 'var(--text)' }}>{abaixoMin}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Valor em estoque</div>
          <div style={S.statValue}>R$ {fmt(valorTotal)}</div>
        </div>
      </div>

      <div style={S.searchWrap}>
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar peça..." />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Peça</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Saldo</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Mínimo</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Custo</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Valor</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...S.td, fontWeight: 500 }}>{p.nome}</td>
                <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: baixo(p) ? 'var(--danger)' : 'var(--text)' }}>
                  {Number(p.estoque) || 0}{baixo(p) ? ' ⚠' : ''}
                </td>
                <td style={{ ...S.td, textAlign: 'right', color: 'var(--text-muted)' }}>{Number(p.estoque_minimo) || 0}</td>
                <td style={{ ...S.td, textAlign: 'right', color: 'var(--text-muted)' }}>{p.custo != null ? `R$ ${fmt(p.custo)}` : '—'}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>R$ {fmt((Number(p.estoque) || 0) * (Number(p.custo) || 0))}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <button style={{ ...S.btnSecondary, fontSize: '12px', padding: '5px 12px' }} onClick={() => setMovimentar(p)}>Movimentar</button>
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr><td colSpan={6} style={S.emptyState}>
                {pecas.length === 0
                  ? 'Nenhuma peça com controle de estoque. Ative em Serviços (editar peça → Controlar estoque).'
                  : 'Nenhuma peça encontrada.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {movimentar && (
        <MovimentarModal peca={movimentar} onClose={() => setMovimentar(null)} onSalvo={fetchPecas} />
      )}
    </div>
  )
}
