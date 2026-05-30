import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatValor } from '../lib/utils'

function inicioMes(d) { return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0) }
function fimMes(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) }
function inicioAno(d) { return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0) }
function fimAno(d) { return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999) }
function isoDate(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function fromIsoDate(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(n => parseInt(n))
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

const PERIODOS = [
  { value: 'mes_atual',    label: 'Este mês' },
  { value: 'mes_anterior', label: 'Mês anterior' },
  { value: 'ano',          label: 'Este ano' },
  { value: 'custom',       label: 'Personalizado' },
]

function rangeDoPeriodo(periodo, custom) {
  const hoje = new Date()
  if (periodo === 'mes_atual')    return { inicio: inicioMes(hoje), fim: fimMes(hoje) }
  if (periodo === 'mes_anterior') {
    const ant = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    return { inicio: inicioMes(ant), fim: fimMes(ant) }
  }
  if (periodo === 'ano') return { inicio: inicioAno(hoje), fim: fimAno(hoje) }
  // custom
  const ini = custom?.inicio ? fromIsoDate(custom.inicio) : inicioMes(hoje)
  const f   = custom?.fim    ? new Date(fromIsoDate(custom.fim).getTime() + 24*60*60*1000 - 1) : fimMes(hoje)
  return { inicio: ini, fim: f }
}

const S = {
  h1: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
    marginBottom: '4px',
  },
  subtitle: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '24px',
  },
  fornCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow)',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  fornHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '14px 18px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-subtle)',
  },
  fornNome: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--text)',
    letterSpacing: '-0.01em',
  },
  fornTotal: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--success)',
  },
  fornCount: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '12px',
    color: 'var(--text-faint)',
    marginLeft: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 14px',
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
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    fontFamily: 'DM Sans, sans-serif',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-faint)',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  customRange: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  dateInput: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    padding: '7px 11px',
    fontSize: '13px',
    color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
  },
  totalGeral: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border)',
  },
}

function btnPeriodo(ativo) {
  return {
    padding: '7px 14px',
    borderRadius: '7px',
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

function fmtData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function Dashboard() {
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('mes_atual')
  const hoje = new Date()
  const [custom, setCustom] = useState({
    inicio: isoDate(inicioMes(hoje)),
    fim:    isoDate(fimMes(hoje)),
  })
  const [fornecedoresLista, setFornecedoresLista] = useState([])
  const [fornecedorFiltro, setFornecedorFiltro] = useState('todos')

  useEffect(() => {
    supabase.from('fornecedores').select('id, nome').eq('ativo', true).order('nome')
      .then(({ data }) => setFornecedoresLista(data || []))
  }, [])

  useEffect(() => { fetchData() }, [periodo, custom, fornecedorFiltro])

  async function fetchData() {
    setLoading(true)
    const { inicio, fim } = rangeDoPeriodo(periodo, custom)

    const { data } = await supabase
      .from('os_servicos')
      .select(`
        id, quantidade, preco_cobrado, fornecedor_id, devolvido,
        fornecedores!inner(id, nome),
        servicos!inner(nome, tipo_servico),
        ordens_servico!inner(id, status, aberta_em, created_at, clientes(nome_completo), veiculos(placa))
      `)
      .not('fornecedor_id', 'is', null)

    const itens = (data || []).filter(i => {
      if (i.servicos?.tipo_servico !== 'peca') return false
      if (!['aberta', 'concluida'].includes(i.ordens_servico?.status)) return false
      if (fornecedorFiltro !== 'todos' && i.fornecedor_id !== fornecedorFiltro) return false
      const dt = new Date(i.ordens_servico?.aberta_em || i.ordens_servico?.created_at)
      return dt >= inicio && dt <= fim
    })

    // Agrupar por fornecedor
    const mapa = new Map()
    itens.forEach(i => {
      const fid = i.fornecedor_id
      const nome = i.fornecedores?.nome || '—'
      if (!mapa.has(fid)) mapa.set(fid, { id: fid, nome, itens: [] })
      mapa.get(fid).itens.push(i)
    })

    // Ordenar itens dentro de cada fornecedor (data desc, depois por OS)
    const lista = [...mapa.values()].map(g => {
      const ordenados = [...g.itens].sort((a, b) => {
        const da = new Date(a.ordens_servico?.aberta_em || a.ordens_servico?.created_at).getTime()
        const db = new Date(b.ordens_servico?.aberta_em || b.ordens_servico?.created_at).getTime()
        if (db !== da) return db - da
        return (a.ordens_servico?.id || '').localeCompare(b.ordens_servico?.id || '')
      })
      const total = ordenados
        .filter(i => !i.devolvido)
        .reduce((acc, i) => acc + (i.quantidade || 1) * parseFloat(i.preco_cobrado || 0), 0)
      return { ...g, itens: ordenados, total }
    })

    // Ordenar fornecedores por total desc
    lista.sort((a, b) => b.total - a.total)

    setGrupos(lista)
    setLoading(false)
  }

  const totalGeral = grupos.reduce((acc, g) => acc + g.total, 0)
  const totalItens = grupos.reduce((acc, g) => acc + g.itens.filter(i => !i.devolvido).length, 0)
  const totalDevolvidos = grupos.reduce((acc, g) => acc + g.itens.filter(i => i.devolvido).length, 0)

  async function toggleDevolucao(item) {
    const novoEstado = !item.devolvido
    await supabase.from('os_servicos').update({
      devolvido: novoEstado,
      devolvido_em: novoEstado ? new Date().toISOString() : null,
    }).eq('id', item.id)

    // Recalcular valor_total da OS (soma só os não-devolvidos)
    const osId = item.ordens_servico?.id
    if (osId) {
      const { data: itensOS } = await supabase
        .from('os_servicos')
        .select('quantidade, preco_cobrado, devolvido')
        .eq('os_id', osId)
      const novoTotal = (itensOS || [])
        .filter(i => !i.devolvido)
        .reduce((acc, i) => acc + (i.quantidade || 1) * parseFloat(i.preco_cobrado || 0), 0)
      await supabase.from('ordens_servico').update({ valor_total: novoTotal }).eq('id', osId)
    }

    fetchData()
  }

  return (
    <div>
      <h1 style={S.h1}>Dashboard</h1>
      <p style={S.subtitle}>Itens comprados por fornecedor (apenas peças em OS abertas ou concluídas)</p>

      <div style={S.filterBar}>
        {PERIODOS.map(p => (
          <button key={p.value} style={btnPeriodo(periodo === p.value)} onClick={() => setPeriodo(p.value)}>
            {p.label}
          </button>
        ))}
        <select
          style={{ ...S.dateInput, marginLeft: 'auto', minWidth: '180px', cursor: 'pointer' }}
          value={fornecedorFiltro}
          onChange={e => setFornecedorFiltro(e.target.value)}
        >
          <option value="todos">Todos os fornecedores</option>
          {fornecedoresLista.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

      {periodo === 'custom' && (
        <div style={S.customRange}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>De</span>
          <input
            type="date"
            style={S.dateInput}
            value={custom.inicio}
            onChange={e => setCustom(c => ({ ...c, inicio: e.target.value }))}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>até</span>
          <input
            type="date"
            style={S.dateInput}
            value={custom.fim}
            onChange={e => setCustom(c => ({ ...c, fim: e.target.value }))}
          />
        </div>
      )}

      {!loading && grupos.length > 0 && (
        <div style={S.totalGeral}>
          <b>{totalItens}</b> {totalItens === 1 ? 'item' : 'itens'} · <b>{grupos.length}</b> {grupos.length === 1 ? 'fornecedor' : 'fornecedores'} · Total: <b style={{ color: 'var(--success)' }}>R$ {formatValor(totalGeral)}</b>
          {totalDevolvidos > 0 && <span style={{ marginLeft: '12px', color: 'var(--text-faint)' }}>({totalDevolvidos} {totalDevolvidos === 1 ? 'devolvido' : 'devolvidos'})</span>}
        </div>
      )}

      {loading ? (
        <div style={S.emptyState}>Carregando...</div>
      ) : grupos.length === 0 ? (
        <div style={S.emptyState}>
          Nenhuma peça com fornecedor vinculado neste período.
        </div>
      ) : (
        grupos.map(g => (
          <div key={g.id} style={S.fornCard}>
            <div style={S.fornHeader}>
              <div>
                <span style={S.fornNome}>{g.nome}</span>
                <span style={S.fornCount}>{g.itens.length} {g.itens.length === 1 ? 'item' : 'itens'}</span>
              </div>
              <span style={S.fornTotal}>R$ {formatValor(g.total)}</span>
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Data</th>
                  <th style={S.th}>OS (Cliente — Placa)</th>
                  <th style={S.th}>Peça</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Qtd</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Valor</th>
                  <th style={{ ...S.th, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {g.itens.map(i => {
                  const dt = i.ordens_servico?.aberta_em || i.ordens_servico?.created_at
                  const cliente = i.ordens_servico?.clientes?.nome_completo || '—'
                  const placa = i.ordens_servico?.veiculos?.placa || '—'
                  const valor = (i.quantidade || 1) * parseFloat(i.preco_cobrado || 0)
                  const devStyle = i.devolvido ? {
                    color: 'var(--text-faint)',
                    textDecoration: 'line-through',
                  } : {}
                  return (
                    <tr key={i.id} style={i.devolvido ? { background: 'var(--bg-subtle)' } : {}}>
                      <td style={{ ...S.td, color: 'var(--text-muted)', whiteSpace: 'nowrap', ...devStyle }}>{fmtData(dt)}</td>
                      <td style={{ ...S.td, ...devStyle }}>
                        {cliente} <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-faint)', marginLeft: '6px' }}>{placa}</span>
                      </td>
                      <td style={{ ...S.td, ...devStyle }}>
                        {i.servicos?.nome}
                        {i.devolvido && <span style={{ marginLeft: '8px', fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--danger)', border: '1px solid var(--danger)', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.06em', textDecoration: 'none' }}>DEVOLVIDO</span>}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)', ...devStyle }}>{i.quantidade || 1}×</td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, ...devStyle }}>R$ {formatValor(valor)}</td>
                      <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => toggleDevolucao(i)}
                          style={{
                            background: 'transparent',
                            color: i.devolvido ? 'var(--accent)' : 'var(--danger)',
                            border: `1px solid ${i.devolvido ? 'var(--accent)' : 'var(--danger)'}`,
                            borderRadius: '5px',
                            padding: '3px 10px',
                            fontSize: '11px',
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          title={i.devolvido ? 'Desfazer devolução' : 'Marcar como devolvido'}
                        >
                          {i.devolvido ? '↺ Desfazer' : '✓ Devolver'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
