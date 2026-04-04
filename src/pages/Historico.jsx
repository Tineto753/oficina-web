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
                color === 'red' ? 'rgba(192,57,43,0.12)' : 'var(--bg-subtle)',
    color: color === 'green' ? 'var(--success)' :
           color === 'amber' ? 'var(--accent)' :
           color === 'red' ? 'var(--danger)' : 'var(--text-faint)',
    border: `1px solid ${
      color === 'green' ? 'var(--success)' :
      color === 'amber' ? 'var(--accent)' :
      color === 'red' ? 'var(--danger)' : 'var(--border)'
    }`,
  }),
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
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
}

const statusMap = {
  aberta:   { label: 'Aberta',    color: 'amber' },
  concluida: { label: 'Concluída', color: 'green' },
  orcamento: { label: 'Orçamento', color: 'amber' },
  cancelado: { label: 'Cancelado', color: 'red' },
}

export default function Historico() {
  const [busca, setBusca] = useState('')
  const [veiculo, setVeiculo] = useState(null)
  const [os, setOs] = useState([])
  const [kms, setKms] = useState([])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleBuscar() {
    if (!busca) return
    setLoading(true)
    setNotFound(false)
    setVeiculo(null)
    setOs([])
    setKms([])

    const placa = busca.toUpperCase().replace(/[^A-Z0-9]/g, '')

    const { data: v } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome)), clientes(nome_completo, telefone)')
      .eq('placa', placa)
      .single()

    if (!v) { setNotFound(true); setLoading(false); return }
    setVeiculo(v)

    const { data: ordens } = await supabase
      .from('ordens_servico')
      .select('*, os_servicos(preco_cobrado, observacoes, servicos(nome))')
      .eq('veiculo_id', v.id)
      .in('status', ['concluida', 'aberta', 'orcamento', 'cancelado'])
      .order('created_at', { ascending: false })
    setOs(ordens || [])

    const { data: kmData } = await supabase
      .from('km_registros')
      .select('*')
      .eq('veiculo_id', v.id)
      .order('registrado_em', { ascending: false })
    setKms(kmData || [])

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={S.h1}>Histórico do Veículo</h1>

      {/* Busca */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input
          style={{ ...S.input, width: '220px' }}
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBuscar()}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          placeholder="Placa... Ex: ABC1234"
        />
        <button style={S.btnPrimary} onClick={handleBuscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {notFound && (
        <p style={S.emptyState}>Nenhum veículo encontrado com essa placa.</p>
      )}

      {veiculo && (
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
          <p style={S.sectionTitle}>Histórico de Ordens de Serviço</p>

          {os.length === 0 ? (
            <p style={S.emptyState}>Nenhuma OS encontrada.</p>
          ) : (
            os.map(o => (
              <div key={o.id} style={S.card}>
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

                <table style={S.table}>
                  <tbody>
                    {o.os_servicos?.map((s, i) => (
                      <tr key={i}>
                        <td style={S.td}>{s.servicos?.nome}</td>
                        {s.observacoes && <td style={{ ...S.td, color: 'var(--text-faint)', fontSize: '12px' }}>{s.observacoes}</td>}
                        <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>R$ {parseFloat(s.preco_cobrado).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ ...S.td, fontFamily: 'Syne, sans-serif', fontWeight: 700, borderBottom: 'none' }}>Total</td>
                      <td style={{ borderBottom: 'none' }}></td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontSize: '15px', borderBottom: 'none' }}>
                        R$ {parseFloat(o.valor_total || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {(o.forma_pagamento || o.observacoes) && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '16px' }}>
                    {o.forma_pagamento && (
                      <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Pagamento: {o.forma_pagamento}</span>
                    )}
                    {o.observacoes && (
                      <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Obs: {o.observacoes}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
