import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { parseValor, formatValor } from '../lib/utils'

const TIPOS = [
  { value: 'servico', label: 'Serviço', color: 'var(--accent)' },
  { value: 'peca', label: 'Peça', color: 'var(--success)' },
  { value: 'terceirizado', label: 'Terceirizado', color: 'var(--text-muted)' },
]

function tipoBadgeStyle(tipo) {
  const t = TIPOS.find(t => t.value === tipo) || TIPOS[0]
  return {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.04em',
    color: t.color,
    border: `1px solid ${t.color}`,
    background: 'transparent',
    whiteSpace: 'nowrap',
  }
}

const S = {
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
  btnOutline: (ativo) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '7px',
    border: ativo ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: ativo ? 'var(--accent-subtle)' : 'transparent',
    color: ativo ? 'var(--accent)' : 'var(--text-muted)',
    fontFamily: 'Syne, sans-serif',
    fontWeight: ativo ? 600 : 400,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
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
  section: {
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
  autocompleteWrap: {
    position: 'relative',
  },
  autocompleteList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    boxShadow: 'var(--shadow-md)',
    zIndex: 50,
    marginTop: '4px',
    overflow: 'hidden',
  },
  autocompleteItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text)',
    transition: 'background 0.1s',
    borderBottom: '1px solid var(--border)',
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
  totalRow: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--success)',
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
    marginBottom: '20px',
    letterSpacing: '-0.02em',
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

function NovoFornecedorModal({ onSalvo }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', telefone: '' })

  function fechar() {
    setOpen(false)
    setForm({ nome: '', telefone: '' })
  }

  async function handleSalvar() {
    if (!form.nome.trim()) { alert('Nome é obrigatório'); return }
    const { data, error } = await supabase
      .from('fornecedores')
      .insert([{ nome: form.nome.trim(), telefone: form.telefone.trim() || null }])
      .select()
      .single()
    if (error) { alert('Erro: ' + error.message); return }
    onSalvo(data)
    fechar()
  }

  if (!open) return (
    <button style={{ ...S.btnSecondary, padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => setOpen(true)}>
      + Fornecedor
    </button>
  )

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && fechar()}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>Novo Fornecedor</h2>
          <button onClick={fechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <Label>Nome</Label>
            <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Auto Center Silva" autoFocus />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button style={S.btnSecondary} onClick={fechar}>Cancelar</button>
            <button style={S.btnPrimary} onClick={handleSalvar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NovoServicoModal({ onSalvo }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', tipo_servico: 'servico' })
  const [nomeErro, setNomeErro] = useState('')

  function handleNomeChange(valor) {
    const temInvalido = /[^a-zA-ZÀ-ÿ ]/.test(valor)
    setNomeErro(temInvalido ? 'Use apenas letras e espaço.' : '')
    setForm(f => ({ ...f, nome: valor }))
  }

  function fechar() {
    setOpen(false)
    setNomeErro('')
    setForm({ nome: '', descricao: '', tipo_servico: 'servico' })
  }

  async function handleSalvar() {
    if (!form.nome) { alert('Nome é obrigatório'); return }
    if (nomeErro) { alert('Corrija o nome antes de salvar'); return }
    const nomeNormalizado = form.nome.trim().toLowerCase().replace(/[^a-zA-ZÀ-ÿ ]/g, '')
    const { data: existente } = await supabase
      .from('servicos')
      .select('id')
      .eq('nome', nomeNormalizado)
      .eq('ativo', true)
      .maybeSingle()
    if (existente) { alert('Já existe um serviço com este nome.'); return }
    const { data, error } = await supabase.from('servicos').insert([{ ...form, nome: nomeNormalizado }]).select().single()
    if (error) { alert('Erro: ' + error.message); return }
    onSalvo(data)
    fechar()
  }

  if (!open) return (
    <button style={{ ...S.btnSecondary, padding: '6px 12px', fontSize: '12px' }} onClick={() => setOpen(true)}>
      + Novo Serviço
    </button>
  )

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && fechar()}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>Novo Serviço</h2>
          <button onClick={fechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={e => handleNomeChange(e.target.value)}
              placeholder="Ex: troca de oleo"
            />
            {nomeErro && <span style={S.erro}>{nomeErro}</span>}
            <span style={S.hint}>Apenas letras e espaço. Será salvo em minúsculo.</span>
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
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button style={S.btnSecondary} onClick={fechar}>Cancelar</button>
            <button style={S.btnPrimary} onClick={handleSalvar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NovaOS() {
  const navigate = useNavigate()
  const [tipo, setTipo] = useState('aberta')
  const [busca, setBusca] = useState('')
  const [todosClientes, setTodosClientes] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculos, setVeiculos] = useState([])
  const [veiculoId, setVeiculoId] = useState('')
  const [kmEntrada, setKmEntrada] = useState('')
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [servicos, setServicos] = useState([])
  const [servicosDisponiveis, setServicosDisponiveis] = useState([])
  const [fornecedoresDisponiveis, setFornecedoresDisponiveis] = useState([])
  const [servicoId, setServicoId] = useState('')
  const [preco, setPreco] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [obsServico, setObsServico] = useState('')
  const [fornecedorId, setFornecedorId] = useState('')
  const [validadeDias, setValidadeDias] = useState(30)
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().split('T')[0])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetchServicosDisponiveis()
    fetchFornecedoresDisponiveis()
    supabase.from('configuracoes').select('valor').eq('chave', 'validade_orcamento_dias').single()
      .then(({ data }) => { const n = parseInt(data?.valor); if (Number.isFinite(n) && n > 0) setValidadeDias(n) })
    supabase.from('clientes').select('id, nome_completo').eq('ativo', true).order('nome_completo')
      .then(({ data }) => setTodosClientes(data || []))
  }, [])

  async function fetchServicosDisponiveis() {
    const { data } = await supabase.from('servicos').select('*').eq('ativo', true).order('nome')
    setServicosDisponiveis(data || [])
  }

  async function fetchFornecedoresDisponiveis() {
    const { data } = await supabase.from('fornecedores').select('id, nome').eq('ativo', true).order('nome')
    setFornecedoresDisponiveis(data || [])
  }

  function buscarClientes(q) {
    setBusca(q)
    setClienteSelecionado(null)
    if (q.length < 2) { setClientes([]); return }
    const norm = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    setClientes(todosClientes.filter(c =>
      c.nome_completo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(norm)
    ).slice(0, 8))
  }

  async function selecionarCliente(c) {
    setClienteSelecionado(c)
    setBusca(c.nome_completo)
    setClientes([])
    const { data } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome))')
      .eq('cliente_id', c.id)
      .eq('ativo', true)
    setVeiculos(data || [])
    setVeiculoId('')
  }

  function adicionarServico() {
    if (!servicoId || !preco) { alert('Selecione o serviço e informe o preço'); return }
    if (servicos.find(s => s.servico_id === servicoId)) { alert('Serviço já adicionado'); return }
    const svc = servicosDisponiveis.find(s => s.id === servicoId)
    const qtd = Math.max(1, parseInt(quantidade) || 1)
    const tipo = svc.tipo_servico || 'servico'
    const forn = tipo === 'peca' && fornecedorId ? fornecedoresDisponiveis.find(f => f.id === fornecedorId) : null
    setServicos(sv => [...sv, {
      servico_id: servicoId,
      nome: svc.nome,
      tipo_servico: tipo,
      quantidade: qtd,
      preco_cobrado: parseValor(preco),
      observacoes: obsServico,
      fornecedor_id: forn?.id || null,
      fornecedor_nome: forn?.nome || null,
    }])
    setServicoId('')
    setPreco('')
    setQuantidade('1')
    setObsServico('')
    setFornecedorId('')
  }

  async function handleSalvar() {
    if (salvando) return
    if (!clienteSelecionado) { alert('Selecione um cliente'); return }
    if (!veiculoId) { alert('Selecione um veículo'); return }
    if (servicos.length === 0) { alert('Adicione pelo menos um serviço'); return }
    setSalvando(true)
    const valorTotal = servicos.reduce((acc, s) => acc + s.quantidade * s.preco_cobrado, 0)
    const agora = new Date().toISOString()
    const osData = {
      cliente_id: clienteSelecionado.id,
      veiculo_id: veiculoId,
      status: tipo,
      km_entrada: tipo === 'aberta' && kmEntrada ? parseInt(kmEntrada) : null,
      observacoes,
      valor_total: valorTotal,
      aberta_em: tipo === 'aberta' ? new Date(dataEntrada + 'T12:00:00').toISOString() : null,
      validade_orcamento: tipo === 'orcamento'
        ? new Date(Date.now() + validadeDias * 86400000).toISOString()
        : null
    }
    const { data: os, error } = await supabase.from('ordens_servico').insert([osData]).select().single()
    if (error) { alert('Erro: ' + error.message); setSalvando(false); return }
    await supabase.from('os_servicos').insert(
      servicos.map(s => ({
        os_id: os.id,
        servico_id: s.servico_id,
        quantidade: s.quantidade,
        preco_cobrado: s.preco_cobrado,
        observacoes: s.observacoes,
        fornecedor_id: s.fornecedor_id || null,
      }))
    )
    if (tipo === 'aberta' && kmEntrada) {
      await supabase.from('km_registros').insert([{
        veiculo_id: veiculoId, os_id: os.id, km: parseInt(kmEntrada), origem: 'entrada_os'
      }])
    }
    navigate('/os')
  }

  const totalOS = servicos.reduce((acc, s) => acc + s.quantidade * s.preco_cobrado, 0)

  const servicosAgrupados = TIPOS.map(t => ({
    ...t,
    itens: servicosDisponiveis.filter(s => (s.tipo_servico || 'servico') === t.value)
  })).filter(g => g.itens.length > 0)

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button style={S.btnSecondary} onClick={() => navigate('/os')}>← Voltar</button>
        <h1 style={S.h1}>Nova OS</h1>
      </div>

      {/* Tipo */}
      <div style={S.section}>
        <p style={S.sectionTitle}>Tipo</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={S.btnOutline(tipo === 'aberta')} onClick={() => setTipo('aberta')}>OS Direta</button>
          <button style={S.btnOutline(tipo === 'orcamento')} onClick={() => setTipo('orcamento')}>Orçamento</button>
        </div>
      </div>

      {/* Cliente */}
      <div style={S.section}>
        <p style={S.sectionTitle}>Cliente</p>
        <div style={S.autocompleteWrap}>
          <Input
            value={busca}
            onChange={e => buscarClientes(e.target.value)}
            placeholder="Digite o nome do cliente..."
          />
          {clientes.length > 0 && (
            <div style={S.autocompleteList}>
              {clientes.map(c => (
                <div
                  key={c.id}
                  style={S.autocompleteItem}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => selecionarCliente(c)}
                >
                  <span style={{ fontWeight: 500 }}>{c.nome_completo}</span>
                  <span style={{ color: 'var(--text-faint)', marginLeft: '10px', fontSize: '12px' }}>{c.telefone}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {clienteSelecionado && veiculos.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <Label>Veículo</Label>
            <select style={S.select} value={veiculoId} onChange={e => setVeiculoId(e.target.value)}>
              <option value="">Selecione o veículo</option>
              {veiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.modelos?.marcas?.nome} {v.modelos?.nome} — {v.placa} ({v.ano_modelo})
                </option>
              ))}
            </select>
          </div>
        )}
        {clienteSelecionado && veiculos.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '10px' }}>
            Este cliente não tem veículos cadastrados.
          </p>
        )}
      </div>

      {/* KM e Data de Entrada */}
      {tipo === 'aberta' && (
        <div style={S.section}>
          <p style={S.sectionTitle}>Entrada</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <Label>Data de Entrada</Label>
              <Input type="date" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} />
            </div>
            <div>
              <Label>KM de Entrada</Label>
              <Input type="number" value={kmEntrada} onChange={e => setKmEntrada(e.target.value)} placeholder="Ex: 52000" />
            </div>
          </div>
        </div>
      )}

      {/* Serviços */}
      <div style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ ...S.sectionTitle, marginBottom: 0 }}>Serviços</p>
          <NovoServicoModal onSalvo={svc => {
            setServicosDisponiveis(sv => [...sv, svc])
            setServicoId(svc.id)
          }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <select style={S.select} value={servicoId} onChange={e => setServicoId(e.target.value)}>
              <option value="">Selecione o serviço</option>
              {servicosAgrupados.map(grupo => (
                <optgroup key={grupo.value} label={grupo.label}>
                  {grupo.itens.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <Input
            type="number"
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
            placeholder="Qtd"
            min="1"
            style={{ width: '70px' }}
          />
          <Input
            type="text"
            inputMode="decimal"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            onBlur={e => setPreco(formatValor(e.target.value))}
            placeholder="R$ preço"
            style={{ width: '120px' }}
          />
          <button style={S.btnPrimary} onClick={adicionarServico}>Adicionar</button>
        </div>
        {servicoId && (
          <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input value={obsServico} onChange={e => setObsServico(e.target.value)} placeholder="Observação do serviço (opcional)" />
            {servicosDisponiveis.find(s => s.id === servicoId)?.tipo_servico === 'peca' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  style={{ ...S.select, flex: 1 }}
                  value={fornecedorId}
                  onChange={e => setFornecedorId(e.target.value)}
                >
                  <option value="">Fornecedor (opcional)</option>
                  {fornecedoresDisponiveis.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
                <NovoFornecedorModal onSalvo={f => {
                  setFornecedoresDisponiveis(prev => [...prev, f].sort((a, b) => a.nome.localeCompare(b.nome)))
                  setFornecedorId(f.id)
                }} />
              </div>
            )}
          </div>
        )}
        {servicos.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Serviço</th>
                <th style={S.th}>Tipo</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Qtd</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Unit.</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Total</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {servicos.map(s => (
                <tr key={s.servico_id}>
                  <td style={{ ...S.td, fontWeight: 500 }}>
                    {s.nome}
                    {s.fornecedor_nome && <span style={{ display: 'block', color: 'var(--text-faint)', fontSize: '11px', fontWeight: 400 }}>Fornecedor: {s.fornecedor_nome}</span>}
                    {s.observacoes && <span style={{ display: 'block', color: 'var(--text-faint)', fontSize: '11px', fontWeight: 400 }}>{s.observacoes}</span>}
                  </td>
                  <td style={S.td}>
                    <span style={tipoBadgeStyle(s.tipo_servico)}>
                      {TIPOS.find(t => t.value === s.tipo_servico)?.label || 'Serviço'}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)' }}>{s.quantidade}×</td>
                  <td style={{ ...S.td, textAlign: 'right', color: 'var(--text-muted)' }}>R$ {formatValor(s.preco_cobrado)}</td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>R$ {formatValor(s.quantidade * s.preco_cobrado)}</td>
                  <td style={{ ...S.td, textAlign: 'right' }}>
                    <button
                      onClick={() => setServicos(sv => sv.filter(x => x.servico_id !== s.servico_id))}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }}
                    >
                      remover
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ ...S.td, ...S.totalRow, borderBottom: 'none' }}>Total</td>
                <td style={{ borderBottom: 'none' }}></td>
                <td style={{ borderBottom: 'none' }}></td>
                <td style={{ borderBottom: 'none' }}></td>
                <td style={{ ...S.td, ...S.totalRow, textAlign: 'right', borderBottom: 'none' }}>R$ {formatValor(totalOS)}</td>
                <td style={{ borderBottom: 'none' }}></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-faint)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            Nenhum serviço adicionado
          </p>
        )}
      </div>

      {/* Observações */}
      <div style={S.section}>
        <p style={S.sectionTitle}>Observações</p>
        <Input value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Opcional" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        <button style={S.btnSecondary} onClick={() => navigate('/os')}>Cancelar</button>
        <button
          style={{ ...S.btnPrimary, opacity: salvando ? 0.6 : 1, cursor: salvando ? 'not-allowed' : 'pointer' }}
          onClick={handleSalvar}
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : tipo === 'aberta' ? 'Abrir OS' : 'Salvar Orçamento'}
        </button>
      </div>
    </div>
  )
}
