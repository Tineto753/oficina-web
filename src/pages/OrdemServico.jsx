import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '18px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: 'var(--shadow)',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.04em',
    background: color === 'amber' ? 'rgba(193,127,36,0.12)' : 'rgba(45,122,79,0.12)',
    color: color === 'amber' ? 'var(--accent)' : 'var(--success)',
    border: `1px solid ${color === 'amber' ? 'var(--accent)' : 'var(--success)'}`,
  }),
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border)',
    margin: '16px 0',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '8px 0',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-faint)',
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '10px 0',
    fontSize: '13px',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--text-faint)',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    padding: '60px 0',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
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

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>{children}</div>
    </div>
  )
}

function OSCard({ os, onAtualizado }) {
  const [open, setOpen] = useState(false)
  const [itens, setItens] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [kmEntrada, setKmEntrada] = useState('')
  const [loading, setLoading] = useState(false)
  const isOrcamento = os.status === 'orcamento'

  useEffect(() => { if (open) fetchItens() }, [open])

  async function fetchItens() {
    const { data } = await supabase
      .from('os_servicos')
      .select('*, servicos(nome)')
      .eq('os_id', os.id)
    setItens(data || [])
    setValorTotal(os.valor_total || '')
  }

  async function handleConcluir() {
    if (!formaPagamento) { alert('Informe a forma de pagamento'); return }
    setLoading(true)
    const agora = new Date().toISOString()
    const { error } = await supabase.from('ordens_servico').update({
      status: 'concluida',
      forma_pagamento: formaPagamento,
      valor_total: parseFloat(valorTotal),
      pago_em: agora,
      concluida_em: agora
    }).eq('id', os.id)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }
    setOpen(false)
    onAtualizado()
  }

  async function handleConverter() {
    if (!kmEntrada) { alert('Informe o KM de entrada'); return }
    setLoading(true)
    const agora = new Date().toISOString()
    const { error } = await supabase.from('ordens_servico').update({
      status: 'aberta',
      km_entrada: parseInt(kmEntrada),
      aberta_em: agora,
      orcamento_convertido_em: agora
    }).eq('id', os.id)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }
    await supabase.from('km_registros').insert([{
      veiculo_id: os.veiculo_id,
      os_id: os.id,
      km: parseInt(kmEntrada),
      origem: 'entrada_os'
    }])
    setOpen(false)
    onAtualizado()
  }

  async function handleCancelar() {
    if (!confirm('Cancelar esta OS?')) return
    await supabase.from('ordens_servico').update({ status: 'cancelado' }).eq('id', os.id)
    setOpen(false)
    onAtualizado()
  }

  return (
    <>
      <div
        style={S.card}
        onClick={() => setOpen(true)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>
            {os.clientes?.nome_completo}
          </span>
          <span style={S.badge(isOrcamento ? 'amber' : 'green')}>
            {isOrcamento ? 'Orçamento' : 'Aberta'}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          {os.veiculos?.modelos?.marcas?.nome} {os.veiculos?.modelos?.nome}
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
          {os.veiculos?.placa}
        </div>
        {os.km_entrada && (
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '6px' }}>
            KM: {os.km_entrada.toLocaleString()}
          </div>
        )}
        {os.valor_total && (
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--success)', marginTop: '10px' }}>
            R$ {parseFloat(os.valor_total).toFixed(2)}
          </div>
        )}
        {isOrcamento && os.validade_orcamento && (
          <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '6px' }}>
            Válido até {new Date(os.validade_orcamento).toLocaleDateString('pt-BR')}
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>
          {new Date(os.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>{isOrcamento ? 'Orçamento' : 'OS Aberta'}</h2>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>

        <div style={S.infoRow}>
          <span><b>Cliente:</b> {os.clientes?.nome_completo}</span>
        </div>
        <div style={S.infoRow}>
          <span><b>Veículo:</b> {os.veiculos?.modelos?.marcas?.nome} {os.veiculos?.modelos?.nome}</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}>{os.veiculos?.placa}</span>
        </div>
        {os.km_entrada && <div style={S.infoRow}><span><b>KM:</b> {os.km_entrada.toLocaleString()}</span></div>}
        {os.aberta_em && <div style={S.infoRow}><span><b>Aberta em:</b> {new Date(os.aberta_em).toLocaleDateString('pt-BR')}</span></div>}

        <hr style={S.divider} />

        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Serviços</p>
        <table style={S.table}>
          <tbody>
            {itens.map(i => (
              <tr key={i.id}>
                <td style={S.td}>{i.servicos?.nome}</td>
                <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>R$ {parseFloat(i.preco_cobrado).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...S.td, fontWeight: 700, fontFamily: 'Syne, sans-serif', borderBottom: 'none' }}>Total</td>
              <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontSize: '16px', borderBottom: 'none' }}>
                R$ {parseFloat(os.valor_total || 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {os.observacoes && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <b>Obs:</b> {os.observacoes}
          </p>
        )}

        <hr style={S.divider} />

        {isOrcamento ? (
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Converter em OS</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Input type="number" value={kmEntrada} onChange={e => setKmEntrada(e.target.value)} placeholder="KM de entrada" />
              <button style={S.btnPrimary} onClick={handleConverter} disabled={loading}>Converter</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Concluir OS</p>
            <div style={{ ...S.grid2, marginBottom: '14px' }}>
              <div>
                <Label>Forma de Pagamento</Label>
                <select style={S.select} value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">Pix</option>
                  <option value="cartao">Cartão</option>
                </select>
              </div>
              <div>
                <Label>Valor Total (R$)</Label>
                <Input type="number" value={valorTotal} onChange={e => setValorTotal(e.target.value)} />
              </div>
            </div>
            <button style={{ ...S.btnPrimary, width: '100%', padding: '11px' }} onClick={handleConcluir} disabled={loading}>
              Concluir OS
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button style={S.btnDanger} onClick={handleCancelar}>Cancelar OS</button>
        </div>
      </Modal>
    </>
  )
}

export default function OrdemServico() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('abertas')
  const [os, setOs] = useState([])

  useEffect(() => { fetchOS() }, [aba])

  async function fetchOS() {
    const status = aba === 'abertas' ? 'aberta' : 'orcamento'
    const { data } = await supabase
      .from('ordens_servico')
      .select('*, clientes(nome_completo), veiculos(placa, modelos(nome, marcas(nome)))')
      .eq('status', status)
      .order('created_at', { ascending: false })
    setOs(data || [])
  }

  const tabStyle = (ativo) => ({
    padding: '8px 20px',
    borderRadius: '7px',
    fontSize: '13px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: ativo ? 600 : 400,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: ativo ? 'var(--accent)' : 'var(--bg-card)',
    color: ativo ? '#fff' : 'var(--text-muted)',
    boxShadow: ativo ? 'none' : 'var(--shadow)',
  })

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.h1}>Ordens de Serviço</h1>
        <button style={S.btnPrimary} onClick={() => navigate('/os/nova')}>+ Nova OS</button>
      </div>

      <div style={S.tabs}>
        <button style={tabStyle(aba === 'abertas')} onClick={() => setAba('abertas')}>OS Abertas</button>
        <button style={tabStyle(aba === 'orcamentos')} onClick={() => setAba('orcamentos')}>Orçamentos</button>
      </div>

      {os.length === 0 ? (
        <p style={S.emptyState}>
          {aba === 'abertas' ? 'Nenhuma OS aberta' : 'Nenhum orçamento pendente'}
        </p>
      ) : (
        <div style={S.grid}>
          {os.map(o => <OSCard key={o.id} os={o} onAtualizado={fetchOS} />)}
        </div>
      )}
    </div>
  )
}
