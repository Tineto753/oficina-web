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
  const [servicosDisponiveis, setServicosDisponiveis] = useState([])
  const [novoServicoId, setNovoServicoId] = useState('')
  const [novoPreco, setNovoPreco] = useState('')
  const [novaQtd, setNovaQtd] = useState('1')
  const [buscaClienteEdit, setBuscaClienteEdit] = useState('')
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

  async function fetchItens() {
    const { data } = await supabase
      .from('os_servicos')
      .select('*, servicos(nome, tipo_servico)')
      .eq('os_id', os.id)
    setItens(data || [])
    setValorTotal(os.valor_total || '')
  }

  async function entrarEdicao() {
    setItensEdit(itens.map(i => ({
      id: i.id,
      servico_id: i.servico_id,
      nome: i.servicos?.nome,
      tipo_servico: i.servicos?.tipo_servico || 'servico',
      quantidade: i.quantidade || 1,
      preco_cobrado: parseFloat(i.preco_cobrado),
    })))
    setKmEdit(os.km_entrada?.toString() || '')
    setObsEdit(os.observacoes || '')
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
    setEditando(true)
  }

  async function buscarClientesEdit(q) {
    setBuscaClienteEdit(q)
    setClienteEdit(null)
    setVeiculosEdit([])
    setVeiculoIdEdit('')
    if (q.length < 2) { setClientesEdit([]); return }
    const { data } = await supabase
      .from('clientes')
      .select('id, nome_completo, telefone')
      .ilike('nome_completo', `%${q}%`)
      .eq('ativo', true)
      .limit(8)
    setClientesEdit(data || [])
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
    setItensEdit(prev => [...prev, {
      id: null,
      servico_id: novoServicoId,
      nome: svc.nome,
      tipo_servico: svc.tipo_servico || 'servico',
      quantidade: Math.max(1, parseInt(novaQtd) || 1),
      preco_cobrado: parseFloat(novoPreco),
    }])
    setNovoServicoId('')
    setNovoPreco('')
    setNovaQtd('1')
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
      })))
    }
    // atualiza OS
    const novoTotal = itensEdit.reduce((acc, i) => acc + i.quantidade * i.preco_cobrado, 0)
    await supabase.from('ordens_servico').update({
      cliente_id: clienteEdit?.id || os.cliente_id,
      veiculo_id: veiculoIdEdit || os.veiculo_id,
      km_entrada: kmEdit ? parseInt(kmEdit) : null,
      observacoes: obsEdit || null,
      valor_total: novoTotal,
    }).eq('id', os.id)
    await fetchItens()
    setValorTotal(novoTotal)
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
      if (valorEntrada) extra.valor_entrada = parseFloat(valorEntrada)
    }
    const { error } = await supabase.from('ordens_servico').update({
      status: 'concluida',
      forma_pagamento: formaPagamento,
      valor_total: parseFloat(valorTotal),
      pago_em: agora,
      concluida_em: new Date(dataConclusao + 'T12:00:00').toISOString(),
      ...extra
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

  function imprimir() {
    const win = window.open('', '_blank', 'width=820,height=700')
    const fmt = (v) => parseFloat(v || 0).toFixed(2)
    const dataBR = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
    const labelPgto = { dinheiro: 'Dinheiro', pix: 'Pix', debito: 'Débito', credito: 'Crédito', parcelado: 'Parcelado', entrada_parcelado: 'Entrada + Parcelado' }
    const grupos = [
      { key: 'servico', label: 'Serviços' },
      { key: 'peca', label: 'Peças' },
      { key: 'terceirizado', label: 'Terceirizados' },
    ]
    const itensHtml = grupos.map(g => {
      const gi = itens.filter(i => (i.servicos?.tipo_servico || 'servico') === g.key)
      if (!gi.length) return ''
      const rows = gi.map(i => `
        <tr>
          <td>${i.servicos?.nome || ''}</td>
          <td style="text-align:center;width:40px">${(i.quantidade || 1) > 1 ? `${i.quantidade}×` : ''}</td>
          <td style="text-align:right;width:100px">R$ ${fmt((i.quantidade || 1) * parseFloat(i.preco_cobrado))}</td>
        </tr>`).join('')
      return `<tr><td colspan="3" class="grupo-label">${g.label}</td></tr>${rows}`
    }).join('')

    const assinatura = (esq, dir) => `
      <table class="assinatura-table">
        <tr>
          <td class="assinatura-cell">${esq}</td>
          <td style="width:60px"></td>
          <td class="assinatura-cell">${dir}</td>
        </tr>
      </table>`

    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Auto Almeida</title>
<style>
  @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; }

  /* aviso só na tela */
  .aviso-impressao { background: #fffbe6; border: 1px solid #f0c040; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #6b5000; }
  @media print { .aviso-impressao { display: none; } }

  .header-table { width: 100%; border-collapse: collapse; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 16px; }
  .header-table td { vertical-align: middle; padding-bottom: 10px; }
  .empresa { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .empresa-sub { font-size: 11px; color: #555; margin-top: 2px; }
  .tipo-badge { font-size: 13px; font-weight: 700; border: 2px solid #111; padding: 5px 14px; text-align: center; }

  .secao { margin-bottom: 14px; }
  .secao-titulo { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
  .info-table { width: 100%; border-collapse: collapse; }
  .info-table td { font-size: 12px; padding: 2px 0; width: 50%; }

  table.servicos { width: 100%; border-collapse: collapse; margin-top: 6px; }
  table.servicos th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #555; border-bottom: 1px solid #999; padding: 5px 4px; text-align: left; }
  table.servicos td { padding: 6px 4px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .grupo-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #666; background: #f0f0f0; padding: 4px 4px; border-bottom: none !important; }
  .total-row td { font-weight: 700; font-size: 14px; border-top: 2px solid #111 !important; border-bottom: none !important; padding-top: 8px !important; }

  .obs { font-size: 12px; color: #444; margin-top: 8px; }
  .validade { font-size: 11px; color: #555; margin-top: 10px; }

  .assinatura-table { width: 100%; border-collapse: collapse; margin-top: 56px; }
  .assinatura-cell { border-top: 1px solid #555; padding-top: 6px; font-size: 11px; color: #555; text-align: center; }
</style></head><body>

<div class="aviso-impressao">
  💡 Para melhor resultado: no diálogo de impressão, desmarque <b>"Cabeçalhos e rodapés"</b> (ou "Headers and footers").
</div>

<table class="header-table"><tr>
  <td><div class="empresa">Auto Almeida</div><div class="empresa-sub">Oficina Mecânica</div></td>
  <td style="text-align:right"><div class="tipo-badge">${isOrcamento ? 'ORÇAMENTO' : 'ORDEM DE SERVIÇO'}</div></td>
</tr></table>

<div class="secao">
  <div class="secao-titulo">Cliente</div>
  <table class="info-table"><tr>
    <td><b>Nome:</b> ${os.clientes?.nome_completo || '—'}</td>
    <td><b>Telefone:</b> ${os.clientes?.telefone || '—'}</td>
  </tr></table>
</div>

<div class="secao">
  <div class="secao-titulo">Veículo</div>
  <table class="info-table">
    <tr>
      <td><b>Veículo:</b> ${os.veiculos?.modelos?.marcas?.nome || ''} ${os.veiculos?.modelos?.nome || ''}</td>
      <td><b>Placa:</b> ${os.veiculos?.placa || '—'}</td>
    </tr>
    <tr>
      <td><b>${isOrcamento ? 'Data:' : 'Entrada:'}</b> ${dataBR(os.aberta_em || os.created_at)}</td>
      ${os.km_entrada ? `<td><b>KM:</b> ${os.km_entrada.toLocaleString('pt-BR')}</td>` : '<td></td>'}
    </tr>
  </table>
</div>

<div class="secao">
  <div class="secao-titulo">Serviços</div>
  <table class="servicos">
    <thead><tr><th>Descrição</th><th style="text-align:center;width:40px">Qtd</th><th style="text-align:right;width:100px">Valor</th></tr></thead>
    <tbody>
      ${itensHtml}
      <tr class="total-row">
        <td>Total</td><td></td>
        <td style="text-align:right">R$ ${fmt(os.valor_total)}</td>
      </tr>
    </tbody>
  </table>
</div>

${os.observacoes ? `<p class="obs"><b>Observações:</b> ${os.observacoes}</p>` : ''}
${os.forma_pagamento ? `<p class="obs" style="margin-top:6px"><b>Pagamento:</b> ${labelPgto[os.forma_pagamento] || os.forma_pagamento}</p>` : ''}

${isOrcamento
  ? `<p class="validade"><b>Válido até:</b> ${dataBR(os.validade_orcamento)}</p>${assinatura('Responsável — Auto Almeida', 'Aprovação do Cliente')}`
  : assinatura('Responsável — Auto Almeida', 'Recebimento do Cliente')
}

<script>
  window.onload = function() {
    window.print()
    window.onafterprint = function() { window.close() }
  }
</script>
</body></html>`)
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
            R$ {parseFloat(os.valor_total).toFixed(2)}
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
                  🖨️ Imprimir
                </button>
                <button style={{ ...S.btnSecondary, padding: '5px 12px', fontSize: '12px' }} onClick={entrarEdicao}>
                  ✏️ Editar
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <Label>KM de Entrada</Label>
                <Input type="number" value={kmEdit} onChange={e => setKmEdit(e.target.value)} placeholder="Ex: 52000" />
              </div>
              <div>
                <Label>Observações</Label>
                <Input value={obsEdit} onChange={e => setObsEdit(e.target.value)} placeholder="Opcional" />
              </div>
            </div>

            <hr style={S.divider} />

            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Itens</p>
            <table style={S.table}>
              <tbody>
                {itensEdit.map((item, idx) => (
                  <tr key={item.id || `new-${idx}`}>
                    <td style={S.td}>{item.nome}</td>
                    <td style={{ ...S.td, color: 'var(--text-faint)', textAlign: 'center', width: '40px' }}>
                      {item.quantidade > 1 ? `${item.quantidade}×` : ''}
                    </td>
                    <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, width: '90px' }}>
                      R$ {(item.quantidade * item.preco_cobrado).toFixed(2)}
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
                onChange={e => setNovoServicoId(e.target.value)}
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
              <Input type="number" value={novoPreco} onChange={e => setNovoPreco(e.target.value)} placeholder="R$" style={{ width: '90px' }} />
              <button style={S.btnPrimary} onClick={adicionarItemEdit}>+</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--success)' }}>
                R$ {itensEdit.reduce((acc, i) => acc + i.quantidade * i.preco_cobrado, 0).toFixed(2)}
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
          return (
            <div key={grupo.value} style={{ marginBottom: '16px' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {grupo.label}
              </p>
              <table style={S.table}>
                <tbody>
                  {grupoItens.map(i => (
                    <tr key={i.id}>
                      <td style={S.td}>{i.servicos?.nome}</td>
                      <td style={{ ...S.td, color: 'var(--text-faint)', textAlign: 'center', width: '40px' }}>
                        {(i.quantidade || 1) > 1 ? `${i.quantidade}×` : ''}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, width: '100px' }}>
                        R$ {((i.quantidade || 1) * parseFloat(i.preco_cobrado)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {grupoItens.length > 1 && (
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
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>Total</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--success)' }}>
            R$ {parseFloat(os.valor_total || 0).toFixed(2)}
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
              <div>
                <Label>Valor Total (R$)</Label>
                <Input type="number" value={valorTotal} onChange={e => setValorTotal(e.target.value)} />
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
                    <Input type="number" value={valorEntrada} onChange={e => setValorEntrada(e.target.value)} placeholder="0,00" />
                  </div>
                )}
                <div>
                  <Label>Nº de Parcelas</Label>
                  <Input type="number" value={parcelas} onChange={e => setParcelas(e.target.value)} placeholder="Ex: 3" min="2" />
                </div>
              </div>
            )}
            <button style={{ ...S.btnPrimary, width: '100%', padding: '11px' }} onClick={handleConcluir} disabled={loading}>
              Concluir OS
            </button>
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
