import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Utilidades de data ───────────────────────────────────────────
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function startOfDay(d) { const r = new Date(d); r.setHours(0,0,0,0); return r }
function endOfDay(d) { const r = new Date(d); r.setHours(23,59,59,999); return r }
function sameDay(a, b) { return a.toDateString() === b.toDateString() }
function toLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fmtTime(iso) { if (!iso) return ''; return new Date(iso).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) }
function fmtDate(d) { return d.toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'}) }

function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0,0,0,0)
  return d
}
function getWeekDays(date) {
  const s = getWeekStart(date)
  return Array.from({length:7}, (_,i) => addDays(s, i))
}
function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const firstDay = first.getDay()
  const total = new Date(year, month+1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push({date: addDays(first, i - firstDay), current: false})
  for (let i = 1; i <= total; i++) cells.push({date: new Date(year, month, i), current: true})
  while (cells.length % 7 !== 0) cells.push({date: new Date(year, month+1, cells.length - firstDay - total + 1), current: false})
  return cells
}
function eventsForDay(evs, date) {
  const s = startOfDay(date), e = endOfDay(date)
  return evs.filter(ev => {
    const es = new Date(ev.data_inicio)
    const ef = ev.data_fim ? new Date(ev.data_fim) : es
    return es <= e && ef >= s
  })
}

// ── Tipos e cores ────────────────────────────────────────────────
const TIPOS = [
  { value: 'agendamento_cliente', label: 'Agendamento do Cliente' },
  { value: 'entrega_servico',     label: 'Entrega de Serviço' },
  { value: 'outro',               label: 'Outro' },
]
const TIPO_COR = {
  agendamento_cliente: { bg: 'rgba(193,127,36,0.15)', border: 'var(--accent)',    text: 'var(--accent)' },
  entrega_servico:     { bg: 'rgba(45,122,79,0.15)',  border: 'var(--success)',   text: 'var(--success)' },
  outro:               { bg: 'var(--bg-subtle)',       border: 'var(--text-faint)', text: 'var(--text-muted)' },
}
function cor(tipo) { return TIPO_COR[tipo] || TIPO_COR.outro }

// ── Modal base ───────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
    >
      <div style={{background:'var(--bg-card)',borderRadius:'12px',padding:'28px',width:'100%',maxWidth:'520px',maxHeight:'90vh',overflowY:'auto',border:'1px solid var(--border)'}}>
        {children}
      </div>
    </div>
  )
}

// ── Modal de evento (apenas agendamento_cliente) ─────────────────
function EventoModal({ evento, dataInicial, onClose, onSalvo }) {
  const ini = dataInicial ? toLocal(dataInicial) : toLocal(new Date().toISOString())
  const [form, setForm] = useState({
    titulo:      evento?.titulo || '',
    descricao:   evento?.descricao || '',
    data_inicio: evento ? toLocal(evento.data_inicio) : ini,
    cliente_id:  evento?.cliente_id || '',
  })
  const [buscaCliente, setBuscaCliente] = useState(evento?.clientes?.nome_completo || '')
  const [todosClientes, setTodosClientes] = useState([])
  const [clientesRes, setClientesRes]   = useState([])
  const [semResultado, setSemResultado] = useState(false)
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nome_completo').eq('ativo', true).order('nome_completo')
      .then(({ data }) => setTodosClientes(data || []))
  }, [])

  function buscarClientes(q) {
    setBuscaCliente(q)
    setSemResultado(false)
    if (q.length < 2) { setClientesRes([]); return }
    const norm = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    const resultado = todosClientes.filter(c =>
      c.nome_completo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(norm)
    ).slice(0, 8)
    setClientesRes(resultado)
    setSemResultado(resultado.length === 0)
  }
  function selecionarCliente(c) {
    setForm(f => ({...f, cliente_id: c.id}))
    setBuscaCliente(c.nome_completo)
    setClientesRes([])
  }
  async function salvar() {
    if (!form.titulo) { alert('Título é obrigatório'); return }
    if (!form.data_inicio) { alert('Data é obrigatória'); return }
    setLoading(true)
    const payload = {
      titulo:      form.titulo,
      tipo:        'agendamento_cliente',
      descricao:   form.descricao || null,
      data_inicio: new Date(form.data_inicio).toISOString(),
      data_fim:    null,
      cliente_id:  form.cliente_id || null,
      os_id:       null,
    }
    if (evento?.id) {
      await supabase.from('agendamentos').update(payload).eq('id', evento.id)
    } else {
      await supabase.from('agendamentos').insert([payload])
    }
    setLoading(false)
    onSalvo()
  }
  async function excluir() {
    if (!confirm('Excluir este evento?')) return
    await supabase.from('agendamentos').delete().eq('id', evento.id)
    onSalvo()
  }

  const iS = {background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'7px',padding:'9px 13px',fontSize:'14px',color:'var(--text)',fontFamily:'DM Sans, sans-serif',outline:'none',width:'100%',transition:'border 0.15s'}
  const lS = {display:'block',fontSize:'12px',fontWeight:500,color:'var(--text-muted)',marginBottom:'5px',fontFamily:'Syne, sans-serif',letterSpacing:'0.03em',textTransform:'uppercase'}
  const focus = e => e.target.style.borderColor = 'var(--accent)'
  const blur  = e => e.target.style.borderColor = 'var(--border)'

  return (
    <Overlay onClose={onClose}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <h2 style={{fontFamily:'Syne, sans-serif',fontSize:'16px',fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em'}}>
          {evento?.id ? 'Editar agendamento' : 'Novo agendamento'}
        </h2>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)',fontSize:'20px'}}>×</button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
        <div>
          <label style={lS}>Título</label>
          <input style={iS} value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} placeholder="Ex: Revisão do Fusca" onFocus={focus} onBlur={blur} />
        </div>

        <div>
          <label style={lS}>Data e hora</label>
          <input type="datetime-local" style={iS} value={form.data_inicio} onChange={e => setForm(f => ({...f, data_inicio: e.target.value}))} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{position:'relative'}}>
          <label style={lS}>Cliente (opcional)</label>
          <input style={iS} value={buscaCliente} onChange={e => buscarClientes(e.target.value)} placeholder="Digite o nome..." onFocus={focus} onBlur={e => { blur(e); setTimeout(() => { setClientesRes([]); setSemResultado(false) }, 150) }} />
          {clientesRes.length > 0 && (
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'7px',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:50,marginTop:'4px',overflow:'hidden'}}>
              {clientesRes.map(c => (
                <div key={c.id} onMouseDown={() => selecionarCliente(c)}
                  style={{padding:'10px 14px',cursor:'pointer',fontSize:'14px',color:'var(--text)',borderBottom:'1px solid var(--border)'}}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {c.nome_completo}
                </div>
              ))}
            </div>
          )}
          {semResultado && (
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'7px',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:50,marginTop:'4px',padding:'12px 14px',fontSize:'13px',color:'var(--text-muted)',fontFamily:'DM Sans, sans-serif'}}>
              Nenhum cliente encontrado.{' '}
              <a href="/" style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>Cadastrar em Clientes →</a>
            </div>
          )}
        </div>

        <div>
          <label style={lS}>Descrição</label>
          <textarea style={{...iS,minHeight:'64px',resize:'vertical'}} value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} placeholder="Opcional" onFocus={focus} onBlur={blur} />
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'4px'}}>
          <div>
            {evento?.id && <button onClick={excluir} style={{background:'transparent',color:'var(--danger)',border:'none',fontSize:'12px',cursor:'pointer',fontFamily:'DM Sans, sans-serif'}}>Excluir evento</button>}
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={onClose} style={{background:'transparent',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:'7px',padding:'8px 16px',fontSize:'13px',fontFamily:'DM Sans, sans-serif',cursor:'pointer'}}>Cancelar</button>
            <button onClick={salvar} disabled={loading} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:'7px',padding:'9px 18px',fontSize:'13px',fontFamily:'Syne, sans-serif',fontWeight:600,cursor:'pointer'}}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ── Visão Mês ────────────────────────────────────────────────────
function MesView({ date, eventos, onDayClick, onEventClick }) {
  const today = new Date()
  const cells = getMonthGrid(date.getFullYear(), date.getMonth())
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:'4px'}}>
        {DIAS.map(d => <div key={d} style={{textAlign:'center',fontSize:'11px',fontWeight:600,color:'var(--text-faint)',fontFamily:'Syne, sans-serif',letterSpacing:'0.06em',textTransform:'uppercase',padding:'6px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px',background:'var(--border)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
        {cells.map(({date: d, current}, i) => {
          const evs = eventsForDay(eventos, d)
          const isToday = sameDay(d, today)
          return (
            <div key={i} onClick={() => onDayClick(d)}
              style={{background: current ? 'var(--bg-card)' : 'var(--bg-subtle)', minHeight:'96px', padding:'6px', cursor:'pointer', transition:'background 0.1s'}}
              onMouseEnter={e => e.currentTarget.style.background = current ? 'var(--bg-subtle)' : 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = current ? 'var(--bg-card)' : 'var(--bg-subtle)'}>
              <div style={{width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',marginBottom:'4px',background: isToday ? 'var(--accent)' : 'transparent',fontFamily:'Syne, sans-serif',fontWeight: isToday ? 700 : 400,fontSize:'13px',color: isToday ? '#fff' : current ? 'var(--text)' : 'var(--text-faint)'}}>
                {d.getDate()}
              </div>
              {evs.slice(0,3).map(ev => {
                const c = cor(ev.tipo)
                return (
                  <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                    style={{fontSize:'11px',padding:'2px 5px',borderRadius:'3px',marginBottom:'2px',background:c.bg,color:c.text,border:`1px solid ${c.border}`,fontFamily:'DM Sans, sans-serif',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',cursor:'pointer'}}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    {fmtTime(ev.data_inicio)} {ev.titulo}
                  </div>
                )
              })}
              {evs.length > 3 && <div style={{fontSize:'10px',color:'var(--text-faint)',fontFamily:'DM Sans, sans-serif'}}>+{evs.length - 3} mais</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Visão Semana / Dia ───────────────────────────────────────────
const HORAS = Array.from({length:15}, (_,i) => i + 7) // 7h–21h

function SemanaView({ date, eventos, modo, onSlotClick, onEventClick }) {
  const today = new Date()
  const days = modo === 'dia' ? [date] : getWeekDays(date)

  function posEvento(ev, d) {
    const start = new Date(ev.data_inicio)
    const end = ev.data_fim ? new Date(ev.data_fim) : new Date(start.getTime() + 60 * 60 * 1000)
    const dayStart = startOfDay(d)
    const dayEnd = endOfDay(d)
    const clampStart = start < dayStart ? dayStart : start
    const clampEnd = end > dayEnd ? dayEnd : end
    const sh = clampStart.getHours() + clampStart.getMinutes() / 60
    const eh = clampEnd.getHours() + clampEnd.getMinutes() / 60
    return {
      top: Math.max(0, (sh - 7) * 60),
      height: Math.max(20, (eh - sh) * 60),
    }
  }

  return (
    <div style={{overflowY:'auto',maxHeight:'calc(100vh - 300px)'}}>
      {/* Headers */}
      <div style={{display:'flex',position:'sticky',top:0,zIndex:10,background:'var(--bg-card)',borderBottom:'1px solid var(--border)'}}>
        <div style={{width:'48px',flexShrink:0}} />
        {days.map((d, i) => {
          const isToday = sameDay(d, today)
          return (
            <div key={i} style={{flex:1,textAlign:'center',padding:'8px 4px'}}>
              <div style={{fontSize:'11px',color:'var(--text-faint)',fontFamily:'Syne, sans-serif',textTransform:'uppercase',letterSpacing:'0.06em'}}>{DIAS[d.getDay()]}</div>
              <div style={{width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',margin:'2px auto 0',background: isToday ? 'var(--accent)' : 'transparent',fontFamily:'Syne, sans-serif',fontWeight:700,fontSize:'14px',color: isToday ? '#fff' : 'var(--text)'}}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{display:'flex',position:'relative'}}>
        <div style={{width:'48px',flexShrink:0}}>
          {HORAS.map(h => (
            <div key={h} style={{height:'60px',display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:'8px',paddingTop:'2px'}}>
              <span style={{fontSize:'11px',color:'var(--text-faint)',fontFamily:'Syne, sans-serif'}}>{h}h</span>
            </div>
          ))}
        </div>
        {days.map((d, di) => (
          <div key={di} style={{flex:1,borderLeft:'1px solid var(--border)',position:'relative',minWidth:0}}>
            {HORAS.map(h => (
              <div key={h} onClick={() => { const dt = new Date(d); dt.setHours(h,0,0,0); onSlotClick(dt) }}
                style={{height:'60px',borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background 0.1s'}}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'} />
            ))}
            {eventsForDay(eventos, d).map(ev => {
              const {top, height} = posEvento(ev, d)
              const c = cor(ev.tipo)
              return (
                <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                  style={{position:'absolute',left:'2px',right:'2px',top:`${top}px`,height:`${height}px`,background:c.bg,border:`1px solid ${c.border}`,borderLeft:`3px solid ${c.border}`,borderRadius:'4px',padding:'3px 5px',overflow:'hidden',cursor:'pointer',zIndex:5,transition:'opacity 0.1s'}}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  <div style={{fontSize:'11px',fontWeight:600,color:c.text,fontFamily:'Syne, sans-serif',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {fmtTime(ev.data_inicio)} {ev.titulo}
                  </div>
                  {height > 40 && ev.clientes && (
                    <div style={{fontSize:'10px',color:c.text,opacity:0.8,fontFamily:'DM Sans, sans-serif',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                      {ev.clientes.nome_completo}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function Agenda() {
  const navigate = useNavigate()
  const [view, setView]     = useState('mes')
  const [date, setDate]     = useState(new Date())
  const [eventos, setEvs]   = useState([])
  const [modal, setModal]   = useState(null) // null | { evento?, dataInicial? }

  useEffect(() => { fetchEventos() }, [date, view])

  async function fetchEventos() {
    let inicio, fim
    if (view === 'mes') {
      inicio = new Date(date.getFullYear(), date.getMonth(), 1)
      fim    = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59)
    } else {
      const ws = getWeekStart(date)
      inicio = startOfDay(ws)
      fim    = endOfDay(addDays(ws, 6))
    }

    const [{ data: ags }, { data: oss }] = await Promise.all([
      supabase
        .from('agendamentos')
        .select('*, clientes(nome_completo)')
        .eq('tipo', 'agendamento_cliente')
        .gte('data_inicio', inicio.toISOString())
        .lte('data_inicio', fim.toISOString())
        .order('data_inicio'),
      supabase
        .from('ordens_servico')
        .select('id, status, data_solicitada, clientes(nome_completo), veiculos(placa)')
        .not('data_solicitada', 'is', null)
        .in('status', ['aberta', 'orcamento'])
        .gte('data_solicitada', inicio.toISOString())
        .lte('data_solicitada', fim.toISOString())
        .order('data_solicitada'),
    ])

    const agendamentos = (ags || []).map(a => ({ ...a, _origem: 'agendamento' }))
    const entregas = (oss || []).map(o => ({
      id: 'os-' + o.id,
      titulo: `Entrega: ${o.clientes?.nome_completo || ''}${o.veiculos?.placa ? ` · ${o.veiculos.placa}` : ''}`.trim(),
      tipo: 'entrega_servico',
      data_inicio: o.data_solicitada,
      data_fim: null,
      cliente_id: null,
      os_id: o.id,
      clientes: o.clientes,
      _origem: 'os',
      _osStatus: o.status,
    }))

    const todos = [...agendamentos, ...entregas].sort(
      (a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)
    )
    setEvs(todos)
  }

  function abrirEvento(ev) {
    if (ev._origem === 'os') {
      navigate('/os', { state: { abrirOsId: ev.os_id, abrirStatus: ev._osStatus } })
    } else {
      setModal({ evento: ev })
    }
  }

  function navegar(dir) {
    const d = new Date(date)
    if (view === 'mes')     d.setMonth(d.getMonth() + dir)
    else if (view === 'dia') d.setDate(d.getDate() + dir)
    else                     d.setDate(d.getDate() + dir * 7)
    setDate(d)
  }

  function titulo() {
    if (view === 'mes') return `${MESES[date.getMonth()]} ${date.getFullYear()}`
    if (view === 'dia') return date.toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})
    const days = getWeekDays(date)
    return `${fmtDate(days[0])} — ${fmtDate(days[6])} · ${days[0].getFullYear()}`
  }

  function abrirNovoEvento(d) {
    const dt = new Date(d)
    if (dt.getHours() === 0) dt.setHours(8, 0, 0, 0)
    setModal({ dataInicial: dt.toISOString() })
  }

  const tabStyle = (ativo) => ({
    padding:'6px 14px', borderRadius:'6px', fontSize:'13px',
    fontFamily:'Syne, sans-serif', fontWeight: ativo ? 600 : 400,
    border:'none', cursor:'pointer', transition:'all 0.15s',
    background: ativo ? 'var(--accent)' : 'var(--bg-card)',
    color: ativo ? '#fff' : 'var(--text-muted)',
    boxShadow: ativo ? 'none' : 'var(--shadow)',
  })

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'12px'}}>
        <h1 style={{fontFamily:'Syne, sans-serif',fontSize:'24px',fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em'}}>Agenda</h1>
        <button onClick={() => setModal({})} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:'7px',padding:'9px 18px',fontSize:'13px',fontFamily:'Syne, sans-serif',fontWeight:600,cursor:'pointer'}}>
          + Novo Evento
        </button>
      </div>

      {/* Controles */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <button onClick={() => navegar(-1)} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'6px',padding:'6px 12px',cursor:'pointer',color:'var(--text-muted)',fontSize:'14px'}}>←</button>
          <span style={{fontFamily:'Syne, sans-serif',fontWeight:600,fontSize:'15px',color:'var(--text)',minWidth:'200px',textAlign:'center',textTransform:'capitalize'}}>
            {titulo()}
          </span>
          <button onClick={() => navegar(1)} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'6px',padding:'6px 12px',cursor:'pointer',color:'var(--text-muted)',fontSize:'14px'}}>→</button>
          <button onClick={() => setDate(new Date())} style={{background:'transparent',border:'1px solid var(--border)',borderRadius:'6px',padding:'5px 10px',cursor:'pointer',color:'var(--text-muted)',fontSize:'12px',fontFamily:'DM Sans, sans-serif'}}>Hoje</button>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          {[['mes','Mês'],['semana','Semana'],['dia','Dia']].map(([v,l]) => (
            <button key={v} style={tabStyle(view === v)} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div style={{display:'flex',gap:'16px',marginBottom:'16px',flexWrap:'wrap'}}>
        {TIPOS.filter(t => t.value !== 'outro').map(t => {
          const c = cor(t.value)
          return (
            <div key={t.value} style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <div style={{width:'10px',height:'10px',borderRadius:'2px',background:c.bg,border:`1px solid ${c.border}`}} />
              <span style={{fontSize:'12px',color:'var(--text-muted)',fontFamily:'DM Sans, sans-serif'}}>{t.label}</span>
            </div>
          )
        })}
      </div>

      {/* Calendário */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'10px',padding:'20px',boxShadow:'var(--shadow)'}}>
        {view === 'mes' && (
          <MesView date={date} eventos={eventos} onDayClick={abrirNovoEvento} onEventClick={abrirEvento} />
        )}
        {(view === 'semana' || view === 'dia') && (
          <SemanaView date={date} eventos={eventos} modo={view} onSlotClick={abrirNovoEvento} onEventClick={abrirEvento} />
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <EventoModal
          evento={modal.evento || null}
          dataInicial={modal.dataInicial || null}
          onClose={() => setModal(null)}
          onSalvo={() => { setModal(null); fetchEventos() }}
        />
      )}
    </div>
  )
}
