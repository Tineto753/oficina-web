import { useState } from 'react'
import { supabase } from '../lib/supabase'

const S = {
  h1: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
    marginBottom: '24px',
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
  input: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    padding: '9px 13px',
    fontSize: '14px',
    color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border 0.15s',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: 'var(--shadow)',
  },
  sectionTitle: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '14px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border)',
    margin: '16px 0',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.04em',
    background: color === 'green' ? 'rgba(45,122,79,0.12)' :
                color === 'amber' ? 'rgba(193,127,36,0.12)' :
                color === 'red'   ? 'rgba(192,57,43,0.12)' : 'var(--bg-subtle)',
    color: color === 'green' ? 'var(--success)' :
           color === 'amber' ? 'var(--accent)'  :
           color === 'red'   ? 'var(--danger)'  : 'var(--text-faint)',
    border: `1px solid ${
      color === 'green' ? 'var(--success)' :
      color === 'amber' ? 'var(--accent)'  :
      color === 'red'   ? 'var(--danger)'  : 'var(--border)'
    }`,
  }),
  table: { width: '100%', borderCollapse: 'collapse' },
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
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  autocompleteList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 50,
    marginTop: '4px',
    overflow: 'hidden',
  },
  autocompleteItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.1s',
  },
}

const statusMap = {
  aberta:    { label: 'Aberta',    color: 'amber' },
  concluida: { label: 'Concluída', color: 'green' },
  orcamento: { label: 'Orçamento', color: 'amber' },
  cancelado: { label: 'Cancelado', color: 'red'   },
}

const pagamentoLabel = {
  dinheiro:         'Dinheiro',
  pix:              'Pix',
  debito:           'Débito',
  credito:          'Crédito',
  cartao:           'Cartão',
  parcelado:        'Parcelado',
  entrada_parcelado: 'Entrada + Parcelado',
}

const TIPOS = [
  { value: 'servico',      label: 'Serviços'      },
  { value: 'peca',         label: 'Peças'          },
  { value: 'terceirizado', label: 'Terceirizados'  },
]

function OSCard({ o }) {
  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
            {new Date(o.created_at).toLocaleDateString('pt-BR')}
          </span>
          {o.km_entrada && (
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>KM: {o.km_entrada.toLocaleString()}</span>
          )}
        </div>
        <span style={S.badge(statusMap[o.status]?.color)}>
          {statusMap[o.status]?.label}
        </span>
      </div>

      {TIPOS.map(grupo => {
        const itens = (o.os_servicos || []).filter(s => (s.servicos?.tipo_servico || 'servico') === grupo.value)
        if (itens.length === 0) return null
        const subtotal = itens.reduce((acc, s) => acc + (s.quantidade || 1) * parseFloat(s.preco_cobrado), 0)
        return (
          <div key={grupo.value} style={{ marginBottom: '12px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {grupo.label}
            </p>
            <table style={S.table}>
              <tbody>
                {itens.map((s, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      {s.servicos?.nome}
                      {s.observacoes && <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-faint)' }}>{s.observacoes}</span>}
                    </td>
                    <td style={{ ...S.td, textAlign: 'center', color: 'var(--text-faint)', width: '36px' }}>
                      {(s.quantidade || 1) > 1 ? `${s.quantidade}×` : ''}
                    </td>
                    <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, width: '100px' }}>
                      R$ {((s.quantidade || 1) * parseFloat(s.preco_cobrado)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {itens.length > 1 && (
                  <tr>
                    <td style={{ ...S.td, fontSize: '11px', color: 'var(--text-faint)', borderBottom: 'none' }}>Subtotal</td>
                    <td style={{ borderBottom: 'none' }}></td>
                    <td style={{ ...S.td, textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: 'none' }}>
                      R$ {subtotal.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>Total</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--success)' }}>
          R$ {parseFloat(o.valor_total || 0).toFixed(2)}
        </span>
      </div>

      {(o.forma_pagamento || o.observacoes) && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {o.forma_pagamento && (
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
              Pagamento: {pagamentoLabel[o.forma_pagamento] || o.forma_pagamento}
              {o.parcelas ? ` · ${o.parcelas}x` : ''}
              {o.valor_entrada ? ` · Entrada R$ ${parseFloat(o.valor_entrada).toFixed(2)}` : ''}
            </span>
          )}
          {o.observacoes && (
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Obs: {o.observacoes}</span>
          )}
        </div>
      )}
    </div>
  )
}

function VeiculoCard({ veiculo, ativo, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: ativo ? 'var(--bg-subtle)' : 'var(--bg-card)',
        border: ativo ? '2px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: '10px',
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!ativo) e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { if (!ativo) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: ativo ? 'var(--accent)' : 'var(--text)', letterSpacing: '0.04em' }}>
        {veiculo.placa}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
        {veiculo.modelos?.marcas?.nome} {veiculo.modelos?.nome}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>
        {veiculo.ano_modelo} · {veiculo.cor}
      </div>
    </div>
  )
}

export default function Historico() {
  const [modo, setModo] = useState('placa')
  const [busca, setBusca] = useState('')
  const [clienteResultados, setClienteResultados] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculosCliente, setVeiculosCliente] = useState([])
  const [veiculo, setVeiculo] = useState(null)
  const [os, setOs] = useState([])
  const [kms, setKms] = useState([])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  function resetResultados() {
    setVeiculo(null)
    setOs([])
    setKms([])
    setNotFound(false)
  }

  function trocarModo(novoModo) {
    setModo(novoModo)
    setBusca('')
    setClienteResultados([])
    setClienteSelecionado(null)
    setVeiculosCliente([])
    resetResultados()
  }

  async function buscarPorPlaca() {
    if (!busca) return
    setLoading(true)
    resetResultados()
    const placa = busca.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const { data: v } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome)), clientes(nome_completo, telefone)')
      .eq('placa', placa)
      .single()
    if (!v) { setNotFound(true); setLoading(false); return }
    setVeiculo(v)
    await carregarHistorico(v.id)
    setLoading(false)
  }

  async function buscarClientes(q) {
    setBusca(q)
    setClienteSelecionado(null)
    setVeiculosCliente([])
    resetResultados()
    if (q.length < 2) { setClienteResultados([]); return }
    const { data } = await supabase
      .from('clientes')
      .select('id, nome_completo, telefone')
      .ilike('nome_completo', `%${q}%`)
      .eq('ativo', true)
      .limit(8)
    setClienteResultados(data || [])
  }

  async function selecionarCliente(c) {
    setClienteSelecionado(c)
    setBusca(c.nome_completo)
    setClienteResultados([])
    resetResultados()
    const { data: veics } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome))')
      .eq('cliente_id', c.id)
      .eq('ativo', true)
    setVeiculosCliente(veics || [])
    if (veics?.length === 1) await selecionarVeiculo(veics[0], c)
  }

  async function selecionarVeiculo(v, cliente) {
    const c = cliente || clienteSelecionado
    setVeiculo({ ...v, clientes: c })
    setOs([])
    setKms([])
    setNotFound(false)
    setLoading(true)
    await carregarHistorico(v.id)
    setLoading(false)
  }

  async function carregarHistorico(veiculoId) {
    const [{ data: ordens }, { data: kmData }] = await Promise.all([
      supabase
        .from('ordens_servico')
        .select('*, os_servicos(quantidade, preco_cobrado, observacoes, servicos(nome, tipo_servico))')
        .eq('veiculo_id', veiculoId)
        .in('status', ['concluida', 'aberta', 'orcamento', 'cancelado'])
        .order('created_at', { ascending: false }),
      supabase
        .from('km_registros')
        .select('*')
        .eq('veiculo_id', veiculoId)
        .order('registrado_em', { ascending: false }),
    ])
    setOs(ordens || [])
    setKms(kmData || [])
  }

  const tabStyle = (ativo) => ({
    padding: '7px 18px',
    borderRadius: '7px',
    fontSize: '13px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: ativo ? 600 : 400,
    border: 'none',
    cursor: 'pointer',
    background: ativo ? 'var(--accent)' : 'var(--bg-card)',
    color: ativo ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s',
    boxShadow: ativo ? 'none' : 'var(--shadow)',
  })

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={S.h1}>Histórico do Veículo</h1>

      {/* Modo de busca */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button style={tabStyle(modo === 'placa')} onClick={() => trocarModo('placa')}>Por Placa</button>
        <button style={tabStyle(modo === 'cliente')} onClick={() => trocarModo('cliente')}>Por Cliente</button>
      </div>

      {/* Busca por placa */}
      {modo === 'placa' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          <input
            style={{ ...S.input, width: '220px' }}
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarPorPlaca()}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            placeholder="Ex: ABC1234"
          />
          <button style={S.btnPrimary} onClick={buscarPorPlaca} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      )}

      {/* Busca por cliente */}
      {modo === 'cliente' && (
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <input
            style={{ ...S.input, width: '100%' }}
            value={busca}
            onChange={e => buscarClientes(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; setTimeout(() => setClienteResultados([]), 150) }}
            placeholder="Digite o nome do cliente..."
          />
          {clienteResultados.length > 0 && (
            <div style={S.autocompleteList}>
              {clienteResultados.map(c => (
                <div
                  key={c.id}
                  style={S.autocompleteItem}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onMouseDown={() => selecionarCliente(c)}
                >
                  <span style={{ fontWeight: 500 }}>{c.nome_completo}</span>
                  <span style={{ color: 'var(--text-faint)', marginLeft: '10px', fontSize: '12px' }}>{c.telefone}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seleção de veículo quando cliente tem mais de um */}
      {modo === 'cliente' && clienteSelecionado && veiculosCliente.length > 1 && (
        <div style={{ marginBottom: '28px' }}>
          <p style={S.sectionTitle}>Veículos de {clienteSelecionado.nome_completo}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {veiculosCliente.map(v => (
              <VeiculoCard
                key={v.id}
                veiculo={v}
                ativo={veiculo?.id === v.id}
                onClick={() => selecionarVeiculo(v)}
              />
            ))}
          </div>
        </div>
      )}

      {notFound && (
        <p style={S.emptyState}>Nenhum veículo encontrado.</p>
      )}

      {loading && (
        <p style={{ ...S.emptyState, padding: '30px 0' }}>Carregando...</p>
      )}

      {veiculo && !loading && (
        <>
          {/* Card do veículo */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {veiculo.modelos?.marcas?.nome} {veiculo.modelos?.nome}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {veiculo.ano_fabricacao}/{veiculo.ano_modelo} · {veiculo.cor}
                </p>
                {veiculo.chassi && (
                  <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>Chassi: {veiculo.chassi}</p>
                )}
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: 'var(--text)', letterSpacing: '0.06em' }}>
                {veiculo.placa}
              </span>
            </div>

            <hr style={S.divider} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={S.infoRow}><span><b>Proprietário:</b> {veiculo.clientes?.nome_completo}</span></div>
              <div style={S.infoRow}><span><b>Telefone:</b> {veiculo.clientes?.telefone}</span></div>
            </div>

            {kms.length > 0 && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '7px', display: 'inline-block' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Último KM registrado: </span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                  {kms[0].km.toLocaleString()} km
                </span>
              </div>
            )}
          </div>

          {/* Histórico de OS */}
          <p style={S.sectionTitle}>
            Histórico de Ordens de Serviço
            <span style={{ fontWeight: 400, marginLeft: '8px', color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0 }}>
              ({os.length})
            </span>
          </p>

          {os.length === 0 ? (
            <p style={S.emptyState}>Nenhuma OS encontrada.</p>
          ) : (
            os.map(o => <OSCard key={o.id} o={o} />)
          )}
        </>
      )}
    </div>
  )
}
