import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border)',
    margin: '14px 0',
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

function NovoServicoModal({ onSalvo }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', categoria: '' })
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    if (open) fetchCategorias()
  }, [open])

  async function fetchCategorias() {
    const { data } = await supabase.from('servicos').select('categoria').eq('ativo', true)
    const unicas = [...new Set((data || []).map(s => s.categoria).filter(Boolean))]
    setCategorias(unicas)
  }

  async function handleSalvar() {
    if (!form.nome) { alert('Nome é obrigatório'); return }
    const { data, error } = await supabase.from('servicos').insert([form]).select().single()
    if (error) { alert('Erro: ' + error.message); return }
    onSalvo(data)
    setOpen(false)
    setForm({ nome: '', descricao: '', categoria: '' })
  }

  if (!open) return (
    <button style={{ ...S.btnSecondary, padding: '6px 12px', fontSize: '12px' }} onClick={() => setOpen(true)}>
      + Novo Serviço
    </button>
  )

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>Novo Serviço</h2>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <Label>Nome</Label>
            <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Troca de óleo" />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Revisão, Freios" list="cats" />
            <datalist id="cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button style={S.btnSecondary} onClick={() => setOpen(false)}>Cancelar</button>
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
  const [clientes, setClientes] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculos, setVeiculos] = useState([])
  const [veiculoId, setVeiculoId] = useState('')
  const [kmEntrada, setKmEntrada] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [servicos, setServicos] = useState([])
  const [servicosDisponiveis, setServicosDisponiveis] = useState([])
  const [servicoId, setServicoId] = useState('')
  const [preco, setPreco] = useState('')
  const [obsServico, setObsServico] = useState('')
  const [validadeDias, setValidadeDias] = useState(30)

  useEffect(() => {
    fetchServicosDisponiveis()
    supabase.from('configuracoes').select('valor').eq('chave', 'validade_orcamento_dias').single()
      .then(({ data }) => { if (data) setValidadeDias(parseInt(data.valor)) })
  }, [])

  async function fetchServicosDisponiveis() {
    const { data } = await supabase.from('servicos').select('*').eq('ativo', true).order('nome')
    setServicosDisponiveis(data || [])
  }

  async function buscarClientes(q) {
    setBusca(q)
    setClienteSelecionado(null)
    if (q.length < 2) { setClientes([]); return }
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nome_completo', `%${q}%`)
      .eq('ativo', true)
      .limit(8)
    setClientes(data || [])
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
    setServicos(sv => [...sv, {
      servico_id: servicoId,
      nome: svc.nome,
      preco_cobrado: parseFloat(preco),
      observacoes: obsServico
    }])
    setServicoId('')
    setPreco('')
    setObsServico('')
  }

  async function handleSalvar() {
    if (!clienteSelecionado) { alert('Selecione um cliente'); return }
    if (!veiculoId) { alert('Selecione um veículo'); return }
    if (tipo === 'aberta' && !kmEntrada) { alert('Informe o KM de entrada'); return }
    if (servicos.length === 0) { alert('Adicione pelo menos um serviço'); return }

    const valorTotal = servicos.reduce((acc, s) => acc + s.preco_cobrado, 0)
    const agora = new Date().toISOString()

    const osData = {
      cliente_id: clienteSelecionado.id,
      veiculo_id: veiculoId,
      status: tipo,
      km_entrada: tipo === 'aberta' ? parseInt(kmEntrada) : null,
      observacoes,
      valor_total: valorTotal,
      aberta_em: tipo === 'aberta' ? agora : null,
      validade_orcamento: tipo === 'orcamento'
        ? new Date(Date.now() + validadeDias * 86400000).toISOString()
        : null
    }

    const { data: os, error } = await supabase.from('ordens_servico').insert([osData]).select().single()
    if (error) { alert('Erro: ' + error.message); return }

    await supabase.from('os_servicos').insert(
      servicos.map(s => ({ os_id: os.id, servico_id: s.servico_id, preco_cobrado: s.preco_cobrado, observacoes: s.observacoes }))
    )

    if (tipo === 'aberta' && kmEntrada) {
      await supabase.from('km_registros').insert([{
        veiculo_id: veiculoId, os_id: os.id, km: parseInt(kmEntrada), origem: 'entrada_os'
      }])
    }

    navigate('/os')
  }

  const totalOS = servicos.reduce((acc, s) => acc + s.preco_cobrado, 0)

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

      {/* KM */}
      {tipo === 'aberta' && (
        <div style={S.section}>
          <p style={S.sectionTitle}>KM de Entrada</p>
          <Input type="number" value={kmEntrada} onChange={e => setKmEntrada(e.target.value)} placeholder="Ex: 52000" style={{ maxWidth: '200px' }} />
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
              {servicosDisponiveis.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          <Input
            type="number"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            placeholder="R$ preço"
            style={{ width: '120px' }}
          />
          <button style={S.btnPrimary} onClick={adicionarServico}>Adicionar</button>
        </div>

        {servicoId && (
          <div style={{ marginBottom: '12px' }}>
            <Input value={obsServico} onChange={e => setObsServico(e.target.value)} placeholder="Observação do serviço (opcional)" />
          </div>
        )}

        {servicos.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Serviço</th>
                <th style={S.th}>Obs</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Preço</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {servicos.map(s => (
                <tr key={s.servico_id}>
                  <td style={S.td}>{s.nome}</td>
                  <td style={{ ...S.td, color: 'var(--text-faint)', fontSize: '12px' }}>{s.observacoes || '—'}</td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>R$ {s.preco_cobrado.toFixed(2)}</td>
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
                <td style={{ ...S.td, ...S.totalRow, textAlign: 'right', borderBottom: 'none' }}>R$ {totalOS.toFixed(2)}</td>
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
        <button style={S.btnPrimary} onClick={handleSalvar}>
          {tipo === 'aberta' ? 'Abrir OS' : 'Salvar Orçamento'}
        </button>
      </div>
    </div>
  )
}
