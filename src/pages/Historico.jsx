import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { parseValor, formatValor } from '../lib/utils'
import { gerarHtmlOS } from '../lib/impressao'

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  )
}

function Input({ style, ...props }) {
  return (
    <input
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 13px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%', transition: 'border 0.15s', ...style }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
  )
}

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px', fontFamily: 'Syne, sans-serif', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{children}</label>
}

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

function OSCard({ o, onEditado, veiculo }) {
  const [editando, setEditando] = useState(false)
  const [itensEdit, setItensEdit] = useState([])
  const [kmEdit, setKmEdit] = useState('')
  const [obsEdit, setObsEdit] = useState('')
  const [formaPagEdit, setFormaPagEdit] = useState('')
  const [parcelasEdit, setParcelasEdit] = useState('')
  const [valorEntradaEdit, setValorEntradaEdit] = useState('')
  const [dataConclusaoEdit, setDataConclusaoEdit] = useState('')
  const [dataAbertaEdit, setDataAbertaEdit] = useState('')
  const [servicosDisponiveis, setServicosDisponiveis] = useState([])
  const [novoServicoId, setNovoServicoId] = useState('')
  const [novoPreco, setNovoPreco] = useState('')
  const [novaQtd, setNovaQtd] = useState('1')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [todosClientes, setTodosClientes] = useState([])
  const [clienteEdit, setClienteEdit] = useState(null)
  const [clientesResultados, setClientesResultados] = useState([])
  const [veiculosEdit, setVeiculosEdit] = useState([])
  const [veiculoIdEdit, setVeiculoIdEdit] = useState('')
  const [loading, setLoading] = useState(false)

  function imprimir() {
    const win = window.open('', '_blank', 'width=820,height=700')
    win.document.write(gerarHtmlOS({
      isOrcamento:      o.status === 'orcamento',
      cliente:          { nome: veiculo?.clientes?.nome_completo, telefone: veiculo?.clientes?.telefone },
      veiculo:          { marca: veiculo?.modelos?.marcas?.nome, modelo: veiculo?.modelos?.nome, placa: veiculo?.placa },
      data:             o.aberta_em || o.created_at,
      dataSolicitada:   o.data_solicitada,
      kmEntrada:        o.km_entrada,
      itens:            (o.os_servicos || []).filter(i => !i.devolvido),
      total:            o.valor_total,
      formaPagamento:   o.forma_pagamento,
      parcelas:         o.parcelas,
      valorEntrada:     o.valor_entrada,
      observacoes:      o.observacoes,
      validadeOrcamento: o.validade_orcamento,
    }))
    win.document.close()
  }

  async function abrirEdicao() {
    setItensEdit((o.os_servicos || []).filter(i => !i.devolvido).map(i => ({
      id: i.id,
      servico_id: i.servico_id,
      nome: i.servicos?.nome,
      tipo_servico: i.servicos?.tipo_servico || 'servico',
      quantidade: i.quantidade || 1,
      preco_cobrado: parseFloat(i.preco_cobrado),
    })))
    setKmEdit(o.km_entrada?.toString() || '')
    setObsEdit(o.observacoes || '')
    setFormaPagEdit(o.forma_pagamento || '')
    setParcelasEdit(o.parcelas?.toString() || '')
    setValorEntradaEdit(formatValor(o.valor_entrada))
    setDataConclusaoEdit(o.concluida_em ? o.concluida_em.split('T')[0] : '')
    setDataAbertaEdit(o.aberta_em ? o.aberta_em.split('T')[0] : '')
    setBuscaCliente(o.clientes?.nome_completo || '')
    setClienteEdit({ id: o.cliente_id, nome_completo: o.clientes?.nome_completo })
    setVeiculoIdEdit(o.veiculo_id || '')
    const { data: veics } = await supabase.from('veiculos').select('*, modelos(nome, marcas(nome))').eq('cliente_id', o.cliente_id).eq('ativo', true)
    setVeiculosEdit(veics || [])
    const { data: svcs } = await supabase.from('servicos').select('*').eq('ativo', true).order('nome')
    setServicosDisponiveis(svcs || [])
    const { data: clts } = await supabase.from('clientes').select('id, nome_completo').eq('ativo', true).order('nome_completo')
    setTodosClientes(clts || [])
    setEditando(true)
  }

  function buscarClientes(q) {
    setBuscaCliente(q)
    setClienteEdit(null)
    setVeiculosEdit([])
    setVeiculoIdEdit('')
    if (q.length < 2) { setClientesResultados([]); return }
    const norm = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    setClientesResultados(todosClientes.filter(c =>
      c.nome_completo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(norm)
    ).slice(0, 8))
  }

  async function selecionarCliente(c) {
    setClienteEdit(c)
    setBuscaCliente(c.nome_completo)
    setClientesResultados([])
    setVeiculoIdEdit('')
    const { data } = await supabase.from('veiculos').select('*, modelos(nome, marcas(nome))').eq('cliente_id', c.id).eq('ativo', true)
    setVeiculosEdit(data || [])
  }

  function adicionarItem() {
    if (!novoServicoId || !novoPreco) { alert('Selecione o serviço e informe o preço'); return }
    if (itensEdit.find(i => i.servico_id === novoServicoId)) { alert('Serviço já adicionado'); return }
    const svc = servicosDisponiveis.find(s => s.id === novoServicoId)
    setItensEdit(prev => [...prev, { id: null, servico_id: novoServicoId, nome: svc.nome, tipo_servico: svc.tipo_servico || 'servico', quantidade: Math.max(1, parseInt(novaQtd) || 1), preco_cobrado: parseValor(novoPreco) }])
    setNovoServicoId(''); setNovoPreco(''); setNovaQtd('1')
  }

  async function salvar() {
    setLoading(true)
    const idsOriginais = (o.os_servicos || []).filter(i => !i.devolvido).map(i => i.id)
    const idsRestantes = itensEdit.filter(i => i.id).map(i => i.id)
    const idsRemovidos = idsOriginais.filter(id => !idsRestantes.includes(id))
    if (idsRemovidos.length > 0) await supabase.from('os_servicos').delete().in('id', idsRemovidos)
    const novos = itensEdit.filter(i => !i.id)
    if (novos.length > 0) await supabase.from('os_servicos').insert(novos.map(i => ({ os_id: o.id, servico_id: i.servico_id, quantidade: i.quantidade, preco_cobrado: i.preco_cobrado })))
    const novoTotal = itensEdit.reduce((acc, i) => acc + i.quantidade * i.preco_cobrado, 0)
    const update = {
      cliente_id: clienteEdit?.id || o.cliente_id,
      veiculo_id: veiculoIdEdit || o.veiculo_id,
      km_entrada: kmEdit ? parseInt(kmEdit) : null,
      observacoes: obsEdit || null,
      valor_total: novoTotal,
      forma_pagamento: formaPagEdit || null,
      aberta_em: dataAbertaEdit ? new Date(dataAbertaEdit + 'T12:00:00').toISOString() : o.aberta_em,
    }
    if (o.status === 'concluida') {
      update.concluida_em = dataConclusaoEdit ? new Date(dataConclusaoEdit + 'T12:00:00').toISOString() : o.concluida_em
      if (formaPagEdit === 'parcelado' || formaPagEdit === 'entrada_parcelado') {
        update.parcelas = parcelasEdit ? parseInt(parcelasEdit) : null
        update.valor_entrada = valorEntradaEdit ? parseValor(valorEntradaEdit) : null
      } else {
        update.parcelas = null
        update.valor_entrada = null
      }
    }
    await supabase.from('ordens_servico').update(update).eq('id', o.id)
    setEditando(false)
    setLoading(false)
    onEditado()
  }

  const sSel = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 13px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' }

  return (
    <>
    <Modal open={editando} onClose={() => setEditando(false)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text)' }}>Editar OS</h2>
        <button onClick={() => setEditando(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
      </div>

      {/* Cliente */}
      <div style={{ marginBottom: '12px', position: 'relative' }}>
        <Label>Cliente</Label>
        <Input value={buscaCliente} onChange={e => buscarClientes(e.target.value)} placeholder="Digite o nome..." />
        {clientesResultados.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 50, marginTop: '4px', overflow: 'hidden' }}>
            {clientesResultados.map(c => (
              <div key={c.id} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => selecionarCliente(c)}>
                <span style={{ fontWeight: 500 }}>{c.nome_completo}</span>
                <span style={{ color: 'var(--text-faint)', marginLeft: '10px', fontSize: '12px' }}>{c.telefone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Veículo */}
      {veiculosEdit.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <Label>Veículo</Label>
          <select style={sSel} value={veiculoIdEdit} onChange={e => setVeiculoIdEdit(e.target.value)}>
            <option value="">Selecione o veículo</option>
            {veiculosEdit.map(v => <option key={v.id} value={v.id}>{v.modelos?.marcas?.nome} {v.modelos?.nome} — {v.placa} ({v.ano_modelo})</option>)}
          </select>
        </div>
      )}

      {/* KM, Obs, Datas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div><Label>KM de Entrada</Label><Input type="number" value={kmEdit} onChange={e => setKmEdit(e.target.value)} placeholder="Ex: 52000" /></div>
        <div><Label>Data de Entrada</Label><Input type="date" value={dataAbertaEdit} onChange={e => setDataAbertaEdit(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <Label>Observações</Label>
        <Input value={obsEdit} onChange={e => setObsEdit(e.target.value)} placeholder="Opcional" />
      </div>

      {/* Pagamento (só para concluída) */}
      {o.status === 'concluida' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <Label>Forma de Pagamento</Label>
              <select style={sSel} value={formaPagEdit} onChange={e => { setFormaPagEdit(e.target.value); setParcelasEdit(''); setValorEntradaEdit('') }}>
                <option value="">Selecione</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="parcelado">Parcelado</option>
                <option value="entrada_parcelado">Entrada + Parcelado</option>
              </select>
            </div>
            <div><Label>Valor Total</Label><div style={{ padding: '9px 0', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--success)' }}>R$ {formatValor(itensEdit.reduce((acc, i) => acc + (i.quantidade || 1) * (i.preco_cobrado || 0), 0))}</div></div>
            <div><Label>Data de Conclusão</Label><Input type="date" value={dataConclusaoEdit} onChange={e => setDataConclusaoEdit(e.target.value)} /></div>
          </div>
          {(formaPagEdit === 'parcelado' || formaPagEdit === 'entrada_parcelado') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {formaPagEdit === 'entrada_parcelado' && <div><Label>Valor de Entrada (R$)</Label><Input type="text" inputMode="decimal" value={valorEntradaEdit} onChange={e => setValorEntradaEdit(e.target.value)} onBlur={e => setValorEntradaEdit(formatValor(e.target.value))} placeholder="0,00" /></div>}
              <div><Label>Nº de Parcelas</Label><Input type="number" value={parcelasEdit} onChange={e => setParcelasEdit(e.target.value)} placeholder="Ex: 3" min="2" /></div>
            </div>
          )}
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

      {/* Itens */}
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Itens</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {itensEdit.map((item, idx) => (
            <tr key={item.id || `new-${idx}`}>
              <td style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{item.nome}</td>
              <td style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text-faint)', textAlign: 'center', width: '40px', borderBottom: '1px solid var(--border)' }}>{item.quantidade > 1 ? `${item.quantidade}×` : ''}</td>
              <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 600, textAlign: 'right', width: '90px', borderBottom: '1px solid var(--border)' }}>R$ {formatValor(item.quantidade * item.preco_cobrado)}</td>
              <td style={{ padding: '10px 0', width: '30px', borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => setItensEdit(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <select style={{ ...sSel, flex: 1 }} value={novoServicoId} onChange={e => setNovoServicoId(e.target.value)}>
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
        <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 14px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }} onClick={adicionarItem}>+</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--success)' }}>
          R$ {formatValor(itensEdit.reduce((acc, i) => acc + i.quantidade * i.preco_cobrado, 0))}
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 16px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }} onClick={() => setEditando(false)}>Cancelar</button>
          <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }} onClick={salvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>

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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={S.badge(statusMap[o.status]?.color)}>
            {statusMap[o.status]?.label}
          </span>
          <button
            onClick={imprimir}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
          >
            Imprimir
          </button>
          <button
            onClick={abrirEdicao}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
          >
            Editar
          </button>
        </div>
      </div>

      {TIPOS.map(grupo => {
        const itens = (o.os_servicos || []).filter(s => !s.devolvido && (s.servicos?.tipo_servico || 'servico') === grupo.value)
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
                      R$ {formatValor((s.quantidade || 1) * parseFloat(s.preco_cobrado))}
                    </td>
                  </tr>
                ))}
                {itens.length > 1 && (
                  <tr>
                    <td style={{ ...S.td, fontSize: '11px', color: 'var(--text-faint)', borderBottom: 'none' }}>Subtotal</td>
                    <td style={{ borderBottom: 'none' }}></td>
                    <td style={{ ...S.td, textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: 'none' }}>
                      R$ {formatValor(subtotal)}
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
          R$ {formatValor(o.valor_total || 0)}
        </span>
      </div>

      {(o.forma_pagamento || o.observacoes) && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {o.forma_pagamento && (() => {
            const totalNum = parseFloat(o.valor_total || 0)
            const entradaNum = parseFloat(o.valor_entrada || 0)
            const parcNum = parseInt(o.parcelas || 0)
            const valorParcela = parcNum > 0 ? (totalNum - entradaNum) / parcNum : 0
            return (
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                Pagamento: {pagamentoLabel[o.forma_pagamento] || o.forma_pagamento}
                {o.valor_entrada ? ` · Entrada R$ ${formatValor(entradaNum)}` : ''}
                {parcNum ? ` · ${parcNum}x de R$ ${formatValor(valorParcela)}` : ''}
              </span>
            )
          })()}
          {o.observacoes && (
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Obs: {o.observacoes}</span>
          )}
        </div>
      )}
    </div>
    </>
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
  const [todosClientes, setTodosClientes] = useState([])
  const [clienteResultados, setClienteResultados] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculosCliente, setVeiculosCliente] = useState([])
  const [veiculo, setVeiculo] = useState(null)
  const [os, setOs] = useState([])
  const [kms, setKms] = useState([])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nome_completo').eq('ativo', true).order('nome_completo')
      .then(({ data }) => setTodosClientes(data || []))
  }, [])

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

  function buscarClientes(q) {
    setBusca(q)
    setClienteSelecionado(null)
    setVeiculosCliente([])
    resetResultados()
    if (q.length < 2) { setClienteResultados([]); return }
    const norm = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    setClienteResultados(todosClientes.filter(c =>
      c.nome_completo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(norm)
    ).slice(0, 8))
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
        .select('*, os_servicos(id, quantidade, preco_cobrado, observacoes, devolvido, servicos(nome, tipo_servico))')
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ ...S.sectionTitle, marginBottom: 0 }}>
              Histórico de Ordens de Serviço
              <span style={{ fontWeight: 400, marginLeft: '8px', color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0 }}>
                ({os.filter(o => mostrarCanceladas || o.status !== 'cancelado').length})
              </span>
            </p>
            {os.some(o => o.status === 'cancelado') && (
              <button
                style={{ ...S.btnSecondary, fontSize: '12px', padding: '5px 12px' }}
                onClick={() => setMostrarCanceladas(v => !v)}
              >
                {mostrarCanceladas ? 'Ocultar canceladas' : 'Mostrar canceladas'}
              </button>
            )}
          </div>

          {os.filter(o => mostrarCanceladas || o.status !== 'cancelado').length === 0 ? (
            <p style={S.emptyState}>Nenhuma OS encontrada.</p>
          ) : (
            os.filter(o => mostrarCanceladas || o.status !== 'cancelado').map(o => <OSCard key={o.id} o={o} onEditado={() => carregarHistorico(veiculo.id)} veiculo={veiculo} />)
          )}
        </>
      )}
    </div>
  )
}
