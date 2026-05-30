import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { parseValor, formatValor } from '../lib/utils'
import { gerarHtmlOS } from '../lib/impressao'

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
    <button style={{ ...S.btnSecondary, padding: '8px 10px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => setOpen(true)}>
      + Forn.
    </button>
  )

  return (
    <Modal open={true} onClose={fechar}>
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
    </Modal>
  )
}

function OSCard({ os, onAtualizado, autoOpen }) {
  const [open, setOpen] = useState(false)
  const autoOpenedRef = useRef(false)
  const [itens, setItens] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('')
  const [parcelas, setParcelas] = useState('')
  const [valorEntrada, setValorEntrada] = useState('')
  const [kmEntrada, setKmEntrada] = useState('')
  const [dataAberta, setDataAberta] = useState('')
  const [dataConclusao, setDataConclusao] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  // edit mode
  const [editando, setEditando] = useState(false)
  const [itensEdit, setItensEdit] = useState([])
  const [kmEdit, setKmEdit] = useState('')
  const [obsEdit, setObsEdit] = useState('')
  const [dataSolicitadaEdit, setDataSolicitadaEdit] = useState('')
  const [fornecedoresDisponiveis, setFornecedoresDisponiveis] = useState([])
  const [novoFornecedorId, setNovoFornecedorId] = useState('')
  const [servicosDisponiveis, setServicosDisponiveis] = useState([])
  const [novoServicoId, setNovoServicoId] = useState('')
  const [novoPreco, setNovoPreco] = useState('')
  const [novaQtd, setNovaQtd] = useState('1')
  const [buscaClienteEdit, setBuscaClienteEdit] = useState('')
  const [todosClientesEdit, setTodosClientesEdit] = useState([])
  const [clienteEdit, setClienteEdit] = useState(null)
  const [clientesEdit, setClientesEdit] = useState([])
  const [veiculosEdit, setVeiculosEdit] = useState([])
  const [veiculoIdEdit, setVeiculoIdEdit] = useState('')

  const isOrcamento = os.status === 'orcamento'

  useEffect(() => {
    if (open) {
      fetchItens()
      setDataAberta(os.aberta_em ? os.aberta_em.split('T')[0] : new Date().toISOString().split('T')[0])
      setDataConclusao(new Date().toISOString().split('T')[0])
      setEditando(false)
    }
  }, [open])

  useEffect(() => {
    if (autoOpen && !autoOpenedRef.current) {
      autoOpenedRef.current = true
      setOpen(true)
    }
  }, [autoOpen])

  async function fetchItens() {
    const { data } = await supabase
      .from('os_servicos')
      .select('*, servicos(nome, tipo_servico), fornecedores(id, nome)')
      .eq('os_id', os.id)
      .eq('devolvido', false)
    setItens(data || [])
  }

  const valorTotal = itens.reduce((acc, i) => acc + (i.quantidade || 1) * parseFloat(i.preco_cobrado || 0), 0)

  async function entrarEdicao() {
    setItensEdit(itens.map(i => ({
      id: i.id,
      servico_id: i.servico_id,
      nome: i.servicos?.nome,
      tipo_servico: i.servicos?.tipo_servico || 'servico',
      quantidade: i.quantidade || 1,
      preco_cobrado: parseFloat(i.preco_cobrado),
      fornecedor_id: i.fornecedor_id || null,
      fornecedor_nome: i.fornecedores?.nome || null,
    })))
    setKmEdit(os.km_entrada?.toString() || '')
    setObsEdit(os.observacoes || '')
    setDataSolicitadaEdit(os.data_solicitada ? toLocalInput(os.data_solicitada) : '')
    setBuscaClienteEdit(os.clientes?.nome_completo || '')
    setClienteEdit({ id: os.cliente_id, nome_completo: os.clientes?.nome_completo })
    setVeiculoIdEdit(os.veiculo_id || '')
    const { data: veics } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome))')
      .eq('cliente_id', os.cliente_id)
      .eq('ativo', true)
    setVeiculosEdit(veics || [])
    if (servicosDisponiveis.length === 0) {
      const { data } = await supabase.from('servicos').select('*').eq('ativo', true).order('nome')
      setServicosDisponiveis(data || [])
    }
    const { data: forns } = await supabase.from('fornecedores').select('id, nome').eq('ativo', true).order('nome')
    setFornecedoresDisponiveis(forns || [])
    const { data: clts } = await supabase.from('clientes').select('id, nome_completo').eq('ativo', true).order('nome_completo')
    setTodosClientesEdit(clts || [])
    setEditando(true)
  }

  function buscarClientesEdit(q) {
    setBuscaClienteEdit(q)
    setClienteEdit(null)
    setVeiculosEdit([])
    setVeiculoIdEdit('')
    if (q.length < 2) { setClientesEdit([]); return }
    const norm = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    setClientesEdit(todosClientesEdit.filter(c =>
      c.nome_completo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(norm)
    ).slice(0, 8))
  }

  async function selecionarClienteEdit(c) {
    setClienteEdit(c)
    setBuscaClienteEdit(c.nome_completo)
    setClientesEdit([])
    setVeiculoIdEdit('')
    const { data } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome))')
      .eq('cliente_id', c.id)
      .eq('ativo', true)
    setVeiculosEdit(data || [])
  }

  function adicionarItemEdit() {
    if (!novoServicoId || !novoPreco) { alert('Selecione o serviço e informe o preço'); return }
    if (itensEdit.find(i => i.servico_id === novoServicoId)) { alert('Serviço já adicionado'); return }
    const svc = servicosDisponiveis.find(s => s.id === novoServicoId)
    const tipo = svc.tipo_servico || 'servico'
    const forn = tipo === 'peca' && novoFornecedorId ? fornecedoresDisponiveis.find(f => f.id === novoFornecedorId) : null
    setItensEdit(prev => [...prev, {
      id: null,
      servico_id: novoServicoId,
      nome: svc.nome,
      tipo_servico: tipo,
      quantidade: Math.max(1, parseInt(novaQtd) || 1),
      preco_cobrado: parseValor(novoPreco),
      fornecedor_id: forn?.id || null,
      fornecedor_nome: forn?.nome || null,
    }])
    setNovoServicoId('')
    setNovoPreco('')
    setNovaQtd('1')
    setNovoFornecedorId('')
  }

  async function salvarEdicao() {
    setLoading(true)
    // itens removidos
    const idsOriginais = itens.map(i => i.id)
    const idsRestantes = itensEdit.filter(i => i.id).map(i => i.id)
    const idsRemovidos = idsOriginais.filter(id => !idsRestantes.includes(id))
    if (idsRemovidos.length > 0) {
      await supabase.from('os_servicos').delete().in('id', idsRemovidos)
    }
    // itens novos
    const novos = itensEdit.filter(i => !i.id)
    if (novos.length > 0) {
      await supabase.from('os_servicos').insert(novos.map(i => ({
        os_id: os.id,
        servico_id: i.servico_id,
        quantidade: i.quantidade,
        preco_cobrado: i.preco_cobrado,
        fornecedor_id: i.fornecedor_id || null,
      })))
    }
    // atualiza OS
    const novoTotal = itensEdit.reduce((acc, i) => acc + i.quantidade * i.preco_cobrado, 0)
    await supabase.from('ordens_servico').update({
      cliente_id: clienteEdit?.id || os.cliente_id,
      veiculo_id: veiculoIdEdit || os.veiculo_id,
      km_entrada: kmEdit ? parseInt(kmEdit) : null,
      observacoes: obsEdit || null,
      data_solicitada: dataSolicitadaEdit ? new Date(dataSolicitadaEdit).toISOString() : null,
      valor_total: novoTotal,
    }).eq('id', os.id)
    await fetchItens()
    setEditando(false)
    setLoading(false)
    onAtualizado()
  }

  async function salvarDataEntrada() {
    await supabase.from('ordens_servico')
      .update({ aberta_em: new Date(dataAberta + 'T12:00:00').toISOString() })
      .eq('id', os.id)
  }

  async function handleConcluir() {
    if (!formaPagamento) { alert('Informe a forma de pagamento'); return }
    setLoading(true)
    const agora = new Date().toISOString()
    const extra = {}
    if (formaPagamento === 'parcelado' || formaPagamento === 'entrada_parcelado') {
      if (parcelas) extra.parcelas = parseInt(parcelas)
      if (valorEntrada) extra.valor_entrada = parseValor(valorEntrada)
    }
    const { error } = await supabase.from('ordens_servico').update({
      status: 'concluida',
      forma_pagamento: formaPagamento,
      valor_total: valorTotal,
      pago_em: agora,
      concluida_em: new Date(dataConclusao + 'T12:00:00').toISOString(),
      ...extra
    }).eq('id', os.id)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }
    setOpen(false)
    onAtualizado()
  }

  async function handleConverter() {
    setLoading(true)
    const agora = new Date().toISOString()
    const km = kmEntrada ? parseInt(kmEntrada) : null
    const { error } = await supabase.from('ordens_servico').update({
      status: 'aberta',
      km_entrada: km,
      aberta_em: agora,
      orcamento_convertido_em: agora
    }).eq('id', os.id)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }
    if (km) {
      await supabase.from('km_registros').insert([{
        veiculo_id: os.veiculo_id,
        os_id: os.id,
        km,
        origem: 'entrada_os'
      }])
    }
    setOpen(false)
    onAtualizado()
  }

  async function handleConcluirEImprimir() {
    if (!formaPagamento) { alert('Informe a forma de pagamento'); return }
    setLoading(true)
    const agora = new Date().toISOString()
    const extra = {}
    if (formaPagamento === 'parcelado' || formaPagamento === 'entrada_parcelado') {
      if (parcelas) extra.parcelas = parseInt(parcelas)
      if (valorEntrada) extra.valor_entrada = parseValor(valorEntrada)
    }
    const { error } = await supabase.from('ordens_servico').update({
      status: 'concluida',
      forma_pagamento: formaPagamento,
      valor_total: valorTotal,
      pago_em: agora,
      concluida_em: new Date(dataConclusao + 'T12:00:00').toISOString(),
      ...extra
    }).eq('id', os.id)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }
    imprimir({ formaPagamento, valorTotal, parcelas: extra.parcelas, valorEntrada: extra.valor_entrada })
    setOpen(false)
    onAtualizado()
  }

  function imprimir(override = {}) {
    const win = window.open('', '_blank', 'width=820,height=700')
    win.document.write(gerarHtmlOS({
      isOrcamento,
      cliente:          { nome: os.clientes?.nome_completo, telefone: os.clientes?.telefone },
      veiculo:          { marca: os.veiculos?.modelos?.marcas?.nome, modelo: os.veiculos?.modelos?.nome, placa: os.veiculos?.placa },
      data:             os.aberta_em || os.created_at,
      dataSolicitada:   os.data_solicitada,
      kmEntrada:        os.km_entrada,
      itens,
      total:            override.valorTotal    ?? os.valor_total,
      formaPagamento:   override.formaPagamento ?? os.forma_pagamento,
      parcelas:         override.parcelas       ?? os.parcelas,
      valorEntrada:     override.valorEntrada   ?? os.valor_entrada,
      observacoes:      os.observacoes,
      validadeOrcamento: os.validade_orcamento,
    }))
    win.document.close()
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
            R$ {formatValor(os.valor_total)}
          </div>
        )}
        {isOrcamento && os.validade_orcamento && (
          <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '6px' }}>
            Válido até {new Date(os.validade_orcamento).toLocaleDateString('pt-BR')}
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>
          {isOrcamento ? 'Criado' : 'Entrada'}: {new Date(os.aberta_em || os.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditando(false) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>{editando ? 'Editar OS' : isOrcamento ? 'Orçamento' : 'OS Aberta'}</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!editando && (
              <>
                <button style={{ ...S.btnSecondary, padding: '5px 12px', fontSize: '12px' }} onClick={imprimir}>
                  Imprimir
                </button>
                <button style={{ ...S.btnSecondary, padding: '5px 12px', fontSize: '12px' }} onClick={entrarEdicao}>
                  Editar
                </button>
              </>
            )}
            <button onClick={() => { setOpen(false); setEditando(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
          </div>
        </div>

        {editando ? (
          <>
            <div style={{ marginBottom: '12px', position: 'relative' }}>
              <Label>Cliente</Label>
              <Input
                value={buscaClienteEdit}
                onChange={e => buscarClientesEdit(e.target.value)}
                placeholder="Digite o nome..."
              />
              {clientesEdit.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', boxShadow: 'var(--shadow-md)', zIndex: 50, marginTop: '4px', overflow: 'hidden' }}>
                  {clientesEdit.map(c => (
                    <div
                      key={c.id}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => selecionarClienteEdit(c)}
                    >
                      <span style={{ fontWeight: 500 }}>{c.nome_completo}</span>
                      <span style={{ color: 'var(--text-faint)', marginLeft: '10px', fontSize: '12px' }}>{c.telefone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {veiculosEdit.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <Label>Veículo</Label>
                <select style={S.select} value={veiculoIdEdit} onChange={e => setVeiculoIdEdit(e.target.value)}>
                  <option value="">Selecione o veículo</option>
                  {veiculosEdit.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.modelos?.marcas?.nome} {v.modelos?.nome} — {v.placa} ({v.ano_modelo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <Label>KM de Entrada</Label>
                <Input type="number" value={kmEdit} onChange={e => setKmEdit(e.target.value)} placeholder="Ex: 52000" />
              </div>
              <div>
                <Label>Observações</Label>
                <Input value={obsEdit} onChange={e => setObsEdit(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Label>Data solicitada pelo cliente</Label>
              <Input type="datetime-local" value={dataSolicitadaEdit} onChange={e => setDataSolicitadaEdit(e.target.value)} />
            </div>

            <hr style={S.divider} />

            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Itens</p>
            <table style={S.table}>
              <tbody>
                {itensEdit.map((item, idx) => (
                  <tr key={item.id || `new-${idx}`}>
                    <td style={S.td}>
                      {item.nome}
                      {item.fornecedor_nome && <span style={{ display: 'block', color: 'var(--text-faint)', fontSize: '11px' }}>Fornecedor: {item.fornecedor_nome}</span>}
                    </td>
                    <td style={{ ...S.td, color: 'var(--text-faint)', textAlign: 'center', width: '40px' }}>
                      {item.quantidade > 1 ? `${item.quantidade}×` : ''}
                    </td>
                    <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, width: '90px' }}>
                      R$ {formatValor(item.quantidade * item.preco_cobrado)}
                    </td>
                    <td style={{ ...S.td, width: '30px', borderBottom: '1px solid var(--border)' }}>
                      <button
                        onClick={() => setItensEdit(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <select
                style={{ ...S.select, flex: 1 }}
                value={novoServicoId}
                onChange={e => { setNovoServicoId(e.target.value); setNovoFornecedorId('') }}
              >
                <option value="">+ Serviço</option>
                {['servico', 'peca', 'terceirizado'].map(tipo => {
                  const grupo = servicosDisponiveis.filter(s => (s.tipo_servico || 'servico') === tipo)
                  if (!grupo.length) return null
                  const labels = { servico: 'Serviços', peca: 'Peças', terceirizado: 'Terceirizados' }
                  return <optgroup key={tipo} label={labels[tipo]}>{grupo.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</optgroup>
                })}
              </select>
              <Input type="number" value={novaQtd} onChange={e => setNovaQtd(e.target.value)} placeholder="Qtd" min="1" style={{ width: '60px' }} />
              <Input type="text" inputMode="decimal" value={novoPreco} onChange={e => setNovoPreco(e.target.value)} onBlur={e => setNovoPreco(formatValor(e.target.value))} placeholder="R$" style={{ width: '90px' }} />
              <button style={S.btnPrimary} onClick={adicionarItemEdit}>+</button>
            </div>
            {servicosDisponiveis.find(s => s.id === novoServicoId)?.tipo_servico === 'peca' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <select
                  style={{ ...S.select, flex: 1 }}
                  value={novoFornecedorId}
                  onChange={e => setNovoFornecedorId(e.target.value)}
                >
                  <option value="">Fornecedor (opcional)</option>
                  {fornecedoresDisponiveis.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
                <NovoFornecedorModal onSalvo={f => {
                  setFornecedoresDisponiveis(prev => [...prev, f].sort((a, b) => a.nome.localeCompare(b.nome)))
                  setNovoFornecedorId(f.id)
                }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--success)' }}>
                R$ {formatValor(itensEdit.reduce((acc, i) => acc + i.quantidade * i.preco_cobrado, 0))}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={S.btnSecondary} onClick={() => setEditando(false)}>Cancelar</button>
                <button style={S.btnPrimary} onClick={salvarEdicao} disabled={loading}>Salvar</button>
              </div>
            </div>
          </>
        ) : (
          <>
        <div style={S.infoRow}>
          <span><b>Cliente:</b> {os.clientes?.nome_completo}</span>
        </div>
        <div style={S.infoRow}>
          <span><b>Veículo:</b> {os.veiculos?.modelos?.marcas?.nome} {os.veiculos?.modelos?.nome}</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}>{os.veiculos?.placa}</span>
        </div>
        {os.km_entrada && <div style={S.infoRow}><span><b>KM:</b> {os.km_entrada.toLocaleString()}</span></div>}
        {os.data_solicitada && (
          <div style={S.infoRow}>
            <span><b>Solicitada para:</b> {new Date(os.data_solicitada).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
        {!isOrcamento && (
          <div style={{ ...S.infoRow, alignItems: 'center', gap: '8px' }}>
            <span style={{ whiteSpace: 'nowrap' }}><b>Entrada:</b></span>
            <input
              type="date"
              value={dataAberta}
              onChange={e => setDataAberta(e.target.value)}
              onBlur={salvarDataEntrada}
              style={{ ...S.input, width: 'auto', padding: '4px 8px', fontSize: '13px' }}
            />
          </div>
        )}

        <hr style={S.divider} />

        {[
          { value: 'servico', label: 'Serviços' },
          { value: 'peca', label: 'Peças' },
          { value: 'terceirizado', label: 'Terceirizados' },
        ].map(grupo => {
          const grupoItens = itens.filter(i => (i.servicos?.tipo_servico || 'servico') === grupo.value)
          if (grupoItens.length === 0) return null
          const subtotal = grupoItens.reduce((acc, i) => acc + (i.quantidade || 1) * parseFloat(i.preco_cobrado), 0)

          // Para peças: agrupar por fornecedor (incluindo "Sem fornecedor")
          let subgrupos
          if (grupo.value === 'peca') {
            const mapa = new Map()
            grupoItens.forEach(i => {
              const key = i.fornecedor_id || '__none__'
              const nome = i.fornecedores?.nome || 'Sem fornecedor'
              if (!mapa.has(key)) mapa.set(key, { nome, itens: [] })
              mapa.get(key).itens.push(i)
            })
            // Sem fornecedor por último
            subgrupos = [...mapa.entries()]
              .sort(([a], [b]) => a === '__none__' ? 1 : b === '__none__' ? -1 : 0)
              .map(([, v]) => v)
          } else {
            subgrupos = [{ nome: null, itens: grupoItens }]
          }

          return (
            <div key={grupo.value} style={{ marginBottom: '16px' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {grupo.label}
              </p>
              {subgrupos.map((sub, sidx) => {
                const subSubtotal = sub.itens.reduce((acc, i) => acc + (i.quantidade || 1) * parseFloat(i.preco_cobrado), 0)
                return (
                  <div key={sidx} style={{ marginBottom: subgrupos.length > 1 ? '10px' : 0 }}>
                    {sub.nome && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', marginTop: sidx > 0 ? '8px' : 0 }}>
                        {sub.nome}
                      </p>
                    )}
                    <table style={S.table}>
                      <tbody>
                        {sub.itens.map(i => (
                          <tr key={i.id}>
                            <td style={S.td}>{i.servicos?.nome}</td>
                            <td style={{ ...S.td, color: 'var(--text-faint)', textAlign: 'center', width: '40px' }}>
                              {(i.quantidade || 1) > 1 ? `${i.quantidade}×` : ''}
                            </td>
                            <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, width: '100px' }}>
                              R$ {formatValor((i.quantidade || 1) * parseFloat(i.preco_cobrado))}
                            </td>
                          </tr>
                        ))}
                        {grupo.value === 'peca' && sub.itens.length > 1 && subgrupos.length > 1 && (
                          <tr>
                            <td style={{ ...S.td, fontSize: '11px', color: 'var(--text-faint)', borderBottom: 'none' }}>Subtotal</td>
                            <td style={{ borderBottom: 'none' }}></td>
                            <td style={{ ...S.td, textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: 'none' }}>
                              R$ {formatValor(subSubtotal)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              })}
              {grupoItens.length > 1 && (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                  Total {grupo.label.toLowerCase()}: <b>R$ {formatValor(subtotal)}</b>
                </p>
              )}
            </div>
          )
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>Total</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--success)' }}>
            R$ {formatValor(os.valor_total || 0)}
          </span>
        </div>

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
                <select style={S.select} value={formaPagamento} onChange={e => { setFormaPagamento(e.target.value); setParcelas(''); setValorEntrada('') }}>
                  <option value="">Selecione</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">Pix</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="parcelado">Parcelado</option>
                  <option value="entrada_parcelado">Entrada + Parcelado</option>
                </select>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Label>Valor Total</Label>
                <div style={{ padding: '9px 0', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--success)' }}>
                  R$ {formatValor(valorTotal)}
                </div>
              </div>
              <div>
                <Label>Data de Conclusão</Label>
                <Input type="date" value={dataConclusao} onChange={e => setDataConclusao(e.target.value)} />
              </div>
            </div>
            {(formaPagamento === 'parcelado' || formaPagamento === 'entrada_parcelado') && (
              <div style={{ ...S.grid2, marginBottom: '14px' }}>
                {formaPagamento === 'entrada_parcelado' && (
                  <div>
                    <Label>Valor de Entrada (R$)</Label>
                    <Input type="text" inputMode="decimal" value={valorEntrada} onChange={e => setValorEntrada(e.target.value)} onBlur={e => setValorEntrada(formatValor(e.target.value))} placeholder="0,00" />
                  </div>
                )}
                <div>
                  <Label>Nº de Parcelas</Label>
                  <Input type="number" value={parcelas} onChange={e => setParcelas(e.target.value)} placeholder="Ex: 3" min="2" />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...S.btnPrimary, flex: 1, padding: '11px' }} onClick={handleConcluir} disabled={loading}>
                Concluir OS
              </button>
              <button style={{ ...S.btnSecondary, flex: 1, padding: '11px' }} onClick={handleConcluirEImprimir} disabled={loading}>
                Salvar e Imprimir
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button style={S.btnDanger} onClick={handleCancelar}>Cancelar OS</button>
        </div>
          </>
        )}
      </Modal>
    </>
  )
}

export default function OrdemServico() {
  const navigate = useNavigate()
  const location = useLocation()
  const abrirOsId = location.state?.abrirOsId
  const abrirStatus = location.state?.abrirStatus
  const [aba, setAba] = useState(() => abrirStatus === 'orcamento' ? 'orcamentos' : 'abertas')
  const [os, setOs] = useState([])

  useEffect(() => { fetchOS() }, [aba])

  useEffect(() => {
    if (abrirOsId) {
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          {os.map(o => <OSCard key={o.id} os={o} onAtualizado={fetchOS} autoOpen={o.id === abrirOsId} />)}
        </div>
      )}
    </div>
  )
}
