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

// Alíquotas efetivas do Simples (faixa 3, ~600k) — ver docs/simples-faixas.md.
// Usadas como fallback quando não há aliquota_servico / aliquota_peca em `configuracoes`.
const ALIQUOTA_FALLBACK = { servico: 10.56, peca: 7.19 }

// Valor sempre em pontos percentuais: "10,56" ou "10.56" → 10.56.
function parseAliquota(v) {
  if (v == null || v === '') return null
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? null : n
}

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
  // KPIs
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px',
    marginBottom: '14px',
  },
  kpi: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px 18px',
    boxShadow: 'var(--shadow)',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-faint)',
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  kpiValue: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.1,
  },
  kpiSub: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  funilRow: {
    display: 'flex',
    gap: '14px',
    marginTop: '4px',
  },
  funilItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  funilNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1,
  },
  funilCap: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '11px',
    color: 'var(--text-faint)',
    marginTop: '3px',
  },
  // Cards / tabelas (padrão do app)
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
  sectionTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    margin: '24px 0 12px',
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
    padding: '32px',
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
    marginBottom: '20px',
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
    marginBottom: '14px',
  },
  // rodapé de status
  footStats: {
    display: 'flex',
    gap: '22px',
    flexWrap: 'wrap',
    marginTop: '10px',
    padding: '14px 4px 4px',
    borderTop: '1px solid var(--border)',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px',
    color: 'var(--text-muted)',
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

  // KPIs
  const [kpi, setKpi] = useState({
    faturamento: 0, baseServico: 0, basePeca: 0,
    imposto: 0, aliqEstimada: false,
    osConcluidas: 0, osAbertas: 0, osOrcamento: 0,
    ticket: 0,
  })
  const [estoqueBaixo, setEstoqueBaixo] = useState([])
  const [contadores, setContadores] = useState({ clientes: 0, veiculos: 0, entregas: 0 })

  useEffect(() => {
    supabase.from('fornecedores').select('id, nome').eq('ativo', true).order('nome')
      .then(({ data }) => setFornecedoresLista(data || []))
  }, [])

  async function fetchData() {
    setLoading(true)
    const { inicio, fim } = rangeDoPeriodo(periodo, custom)
    const ini = inicio.toISOString()
    const f = fim.toISOString()

    // Faturamento e "compras por fornecedor" usam datas diferentes de propósito:
    // faturamento é reconhecido na conclusão (concluida_em), compra de peça na
    // entrada da OS (aberta_em). Por isso são duas queries, ambas filtradas no
    // servidor — sem filtro o select estoura o teto de 1000 linhas do PostgREST.
    const qItensConcluidos = supabase
      .from('os_servicos')
      .select('quantidade, preco_cobrado, servicos!inner(tipo_servico), ordens_servico!inner(id, concluida_em, status)')
      .eq('devolvido', false)
      .eq('ordens_servico.status', 'concluida')
      .gte('ordens_servico.concluida_em', ini)
      .lte('ordens_servico.concluida_em', f)

    let qFornecedores = supabase
      .from('os_servicos')
      .select(`
        id, quantidade, preco_cobrado, fornecedor_id, devolvido,
        fornecedores(id, nome),
        servicos!inner(nome, tipo_servico),
        ordens_servico!inner(id, status, aberta_em, created_at, clientes(nome_completo), veiculos(placa))
      `)
      .not('fornecedor_id', 'is', null)
      .eq('servicos.tipo_servico', 'peca')
      .in('ordens_servico.status', ['aberta', 'concluida'])
      .gte('ordens_servico.aberta_em', ini)
      .lte('ordens_servico.aberta_em', f)
    if (fornecedorFiltro !== 'todos') qFornecedores = qFornecedores.eq('fornecedor_id', fornecedorFiltro)

    const [
      { data: itensConcluidos }, { data: itensForn }, { data: cfg },
      { count: cAbertas }, { count: cOrc },
      { data: pecas },
      { count: cClientes }, { count: cVeiculos }, { count: cEntregas },
    ] = await Promise.all([
      qItensConcluidos,
      qFornecedores,
      supabase.from('configuracoes').select('chave, valor'),
      supabase.from('ordens_servico').select('id', { count: 'exact', head: true }).eq('status', 'aberta'),
      supabase.from('ordens_servico').select('id', { count: 'exact', head: true }).eq('status', 'orcamento'),
      supabase.from('servicos').select('id, nome, estoque, estoque_minimo, custo').eq('controla_estoque', true),
      supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('ativo', true),
      supabase.from('veiculos').select('id', { count: 'exact', head: true }),
      supabase.from('ordens_servico').select('id', { count: 'exact', head: true })
        .not('data_solicitada', 'is', null).in('status', ['aberta', 'orcamento']),
    ])

    // ── KPIs financeiros ──
    let baseServico = 0, basePeca = 0
    const osConcluidasSet = new Set()
    ;(itensConcluidos || []).forEach(i => {
      const v = (i.quantidade || 1) * parseFloat(i.preco_cobrado || 0)
      if (i.servicos?.tipo_servico === 'peca') basePeca += v
      else baseServico += v // servico + terceirizado
      osConcluidasSet.add(i.ordens_servico?.id)
    })
    const faturamento = baseServico + basePeca
    const osConcluidas = osConcluidasSet.size
    const ticket = osConcluidas ? faturamento / osConcluidas : 0

    // Alíquotas: config se houver, senão fallback faixa 3
    const cfgMap = Object.fromEntries((cfg || []).map(c => [c.chave, c.valor]))
    const cfgServ = parseAliquota(cfgMap.aliquota_servico)
    const cfgPeca = parseAliquota(cfgMap.aliquota_peca)
    const aliqServ = cfgServ ?? ALIQUOTA_FALLBACK.servico
    const aliqPeca = cfgPeca ?? ALIQUOTA_FALLBACK.peca
    const aliqEstimada = cfgServ == null || cfgPeca == null
    const imposto = baseServico * aliqServ / 100 + basePeca * aliqPeca / 100

    setKpi({
      faturamento, baseServico, basePeca,
      imposto, aliqEstimada,
      osConcluidas, osAbertas: cAbertas || 0, osOrcamento: cOrc || 0,
      ticket,
    })

    // ── Estoque baixo ──
    setEstoqueBaixo((pecas || [])
      .filter(p => (Number(p.estoque) || 0) <= (Number(p.estoque_minimo) || 0))
      .sort((a, b) => (Number(a.estoque) || 0) - (Number(b.estoque) || 0)))

    // ── Contadores de rodapé ──
    setContadores({
      clientes: cClientes || 0,
      veiculos: cVeiculos || 0,
      entregas: cEntregas || 0,
    })

    // ── Compras por fornecedor ──
    const mapa = new Map()
    ;(itensForn || []).forEach(i => {
      const fid = i.fornecedor_id
      const nome = i.fornecedores?.nome || '—'
      if (!mapa.has(fid)) mapa.set(fid, { id: fid, nome, itens: [] })
      mapa.get(fid).itens.push(i)
    })

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

    lista.sort((a, b) => b.total - a.total)

    setGrupos(lista)
    setLoading(false)
  }

  // Deps primitivas: `custom` é objeto novo a cada setCustom e dispararia refetch
  // por referência. Com período personalizado, só busca quando as duas datas existem.
  useEffect(() => {
    if (periodo === 'custom' && !(custom.inicio && custom.fim)) return
    fetchData()
  }, [periodo, custom.inicio, custom.fim, fornecedorFiltro]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const periodoLabel = PERIODOS.find(p => p.value === periodo)?.label.toLowerCase()

  return (
    <div>
      <h1 style={S.h1}>Dashboard</h1>
      <p style={S.subtitle}>Indicadores do negócio — {periodoLabel}</p>

      <div style={S.filterBar}>
        {PERIODOS.map(p => (
          <button key={p.value} style={btnPeriodo(periodo === p.value)} onClick={() => setPeriodo(p.value)}>
            {p.label}
          </button>
        ))}
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

      {/* ─── KPIs ─── */}
      <div style={S.kpiGrid}>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Faturamento</div>
          <div style={{ ...S.kpiValue, color: 'var(--success)' }}>R$ {formatValor(kpi.faturamento)}</div>
          <div style={S.kpiSub}>{kpi.osConcluidas} {kpi.osConcluidas === 1 ? 'OS concluída' : 'OS concluídas'}</div>
        </div>

        <div style={S.kpi}>
          <div style={S.kpiLabel}>Ticket médio</div>
          <div style={S.kpiValue}>R$ {formatValor(kpi.ticket)}</div>
          <div style={S.kpiSub}>peças R$ {formatValor(kpi.basePeca)} · serviço R$ {formatValor(kpi.baseServico)}</div>
        </div>

        <div style={S.kpi}>
          <div style={S.kpiLabel}>Imposto estimado{kpi.aliqEstimada ? ' ·  faixa 3' : ''}</div>
          <div style={{ ...S.kpiValue, color: 'var(--danger)' }}>R$ {formatValor(kpi.imposto)}</div>
          <div style={S.kpiSub}>DAS aproximada sobre o faturamento</div>
        </div>

        <div style={S.kpi}>
          <div style={S.kpiLabel}>OS no funil</div>
          <div style={S.funilRow}>
            <div style={S.funilItem}>
              <span style={{ ...S.funilNum, color: 'var(--accent)' }}>{kpi.osOrcamento}</span>
              <span style={S.funilCap}>orçamento</span>
            </div>
            <div style={S.funilItem}>
              <span style={{ ...S.funilNum, color: 'var(--text)' }}>{kpi.osAbertas}</span>
              <span style={S.funilCap}>abertas</span>
            </div>
            <div style={S.funilItem}>
              <span style={{ ...S.funilNum, color: 'var(--success)' }}>{kpi.osConcluidas}</span>
              <span style={S.funilCap}>concluídas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Estoque baixo ─── */}
      <div style={{ ...S.fornCard, marginBottom: '4px' }}>
        <div style={S.fornHeader}>
          <div>
            <span style={S.fornNome}>Estoque baixo</span>
            <span style={S.fornCount}>{estoqueBaixo.length} {estoqueBaixo.length === 1 ? 'peça' : 'peças'} no/abaixo do mínimo</span>
          </div>
          {estoqueBaixo.length > 0 && (
            <span style={{ ...S.fornTotal, color: 'var(--danger)' }}>⚠</span>
          )}
        </div>
        {estoqueBaixo.length === 0 ? (
          <div style={{ padding: '18px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-faint)' }}>
            Nenhuma peça abaixo do mínimo. 👍
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Peça</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Saldo</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Mínimo</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Custo</th>
              </tr>
            </thead>
            <tbody>
              {estoqueBaixo.map(p => (
                <tr key={p.id}>
                  <td style={S.td}>{p.nome}</td>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: 'var(--danger)' }}>{Number(p.estoque) || 0}</td>
                  <td style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)' }}>{Number(p.estoque_minimo) || 0}</td>
                  <td style={{ ...S.td, textAlign: 'right', color: 'var(--text-muted)' }}>{p.custo != null ? `R$ ${formatValor(p.custo)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Rodapé de status ─── */}
      <div style={S.footStats}>
        <span><b style={{ color: 'var(--text)' }}>{contadores.clientes}</b> clientes ativos</span>
        <span><b style={{ color: 'var(--text)' }}>{contadores.veiculos}</b> veículos</span>
        <span><b style={{ color: 'var(--text)' }}>{contadores.entregas}</b> entregas pendentes</span>
        <span><b style={{ color: 'var(--text)' }}>{kpi.osOrcamento}</b> orçamentos em aberto</span>
      </div>

      {/* ─── Compras por fornecedor (mantido) ─── */}
      <div style={{ ...S.sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Compras por fornecedor</span>
        <select
          style={{ ...S.dateInput, minWidth: '180px', cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}
          value={fornecedorFiltro}
          onChange={e => setFornecedorFiltro(e.target.value)}
        >
          <option value="todos">Todos os fornecedores</option>
          {fornecedoresLista.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

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
