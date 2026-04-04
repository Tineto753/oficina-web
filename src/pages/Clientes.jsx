import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const S = {
  page: { },
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
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-faint)',
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: 'var(--bg-subtle)',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.04em',
    background: 'var(--accent-subtle)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
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
    maxWidth: '640px',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  colSpan2: {
    gridColumn: '1 / -1',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border)',
    margin: '20px 0',
  },
  row: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  searchWrap: {
    marginBottom: '16px',
    maxWidth: '360px',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-faint)',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
  },
  veiculoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '16px',
  },
  infoItem: {
    fontSize: '13px',
    color: 'var(--text-muted)',
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

function Modal({ open, onClose, title, children, maxWidth = '640px' }) {
  if (!open) return null
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, maxWidth }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={S.modalTitle}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '20px' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const FIPE_URL = 'https://fipe.parallelum.com.br/api/v2/cars/brands'

function VeiculoModal({ clienteId, onSalvo }) {
  const [open, setOpen] = useState(false)
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [novaMarca, setNovaMarca] = useState('')
  const [novoModelo, setNovoModelo] = useState('')
  const [addMarca, setAddMarca] = useState(false)
  const [addModelo, setAddModelo] = useState(false)
  const [form, setForm] = useState({
    marca_id: '', modelo_id: '', placa: '',
    ano_fabricacao: '', ano_modelo: '', cor: '', chassi: '', observacoes: ''
  })

  useEffect(() => { if (open) fetchMarcas() }, [open])

  async function fetchMarcas() {
    const { data } = await supabase.from('marcas').select('*').eq('ativo', true).order('nome')
    if (!data || data.length === 0) await popularFipe()
    else setMarcas(data)
  }

  async function popularFipe() {
    const res = await fetch(FIPE_URL)
    const data = await res.json()
    const rows = data.map(m => ({ nome: m.name, codigo_fipe: m.code }))
    await supabase.from('marcas').insert(rows)
    const { data: novas } = await supabase.from('marcas').select('*').order('nome')
    setMarcas(novas || [])
  }

  async function fetchModelos(marcaId) {
    const { data } = await supabase.from('modelos').select('*').eq('marca_id', marcaId).eq('ativo', true).order('nome')
    setModelos(data || [])
  }

  async function handleMarcaChange(marcaId) {
    setForm(f => ({ ...f, marca_id: marcaId, modelo_id: '' }))
    setModelos([])
    const marca = marcas.find(m => m.id === marcaId)
    const { data: existentes } = await supabase.from('modelos').select('*').eq('marca_id', marcaId)
    if (!existentes || existentes.length === 0) {
      try {
        const res = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${marca.codigo_fipe}/models`)
        const fipeModelos = await res.json()
        if (Array.isArray(fipeModelos)) {
          const rows = fipeModelos.map(m => ({ marca_id: marcaId, nome: m.name }))
          await supabase.from('modelos').insert(rows)
        }
      } catch {}
    }
    fetchModelos(marcaId)
  }

  async function salvarNovaMarca() {
    const { data } = await supabase.from('marcas').insert([{ nome: novaMarca }]).select().single()
    setMarcas(m => [...m, data])
    setForm(f => ({ ...f, marca_id: data.id }))
    setNovaMarca('')
    setAddMarca(false)
  }

  async function salvarNovoModelo() {
    const { data } = await supabase.from('modelos').insert([{ marca_id: form.marca_id, nome: novoModelo }]).select().single()
    setModelos(m => [...m, data])
    setForm(f => ({ ...f, modelo_id: data.id }))
    setNovoModelo('')
    setAddModelo(false)
  }

  async function handleSalvar() {
    const placa = form.placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (placa.length !== 7) { alert('Placa inválida'); return }
    const { error } = await supabase.from('veiculos').insert([{
      cliente_id: clienteId,
      modelo_id: form.modelo_id,
      placa,
      ano_fabricacao: parseInt(form.ano_fabricacao),
      ano_modelo: parseInt(form.ano_modelo),
      cor: form.cor,
      chassi: form.chassi,
      observacoes: form.observacoes
    }])
    if (error) { alert('Erro: ' + error.message); return }
    setOpen(false)
    onSalvo()
  }

  return (
    <>
      <button style={S.btnPrimary} onClick={() => setOpen(true)}>+ Cadastrar Carro</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar Veículo" maxWidth="520px">
        <div style={S.grid2}>
          <div style={S.colSpan2}>
            <Label>Marca</Label>
            {addMarca ? (
              <div style={S.row}>
                <Input value={novaMarca} onChange={e => setNovaMarca(e.target.value)} placeholder="Nome da marca" />
                <button style={S.btnPrimary} onClick={salvarNovaMarca}>Salvar</button>
                <button style={S.btnSecondary} onClick={() => setAddMarca(false)}>×</button>
              </div>
            ) : (
              <div style={S.row}>
                <select style={S.select} value={form.marca_id} onChange={e => handleMarcaChange(e.target.value)}>
                  <option value="">Selecione a marca</option>
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                <button style={S.btnSecondary} onClick={() => setAddMarca(true)}>+ Nova</button>
              </div>
            )}
          </div>

          <div style={S.colSpan2}>
            <Label>Modelo</Label>
            {addModelo ? (
              <div style={S.row}>
                <Input value={novoModelo} onChange={e => setNovoModelo(e.target.value)} placeholder="Nome do modelo" />
                <button style={S.btnPrimary} onClick={salvarNovoModelo}>Salvar</button>
                <button style={S.btnSecondary} onClick={() => setAddModelo(false)}>×</button>
              </div>
            ) : (
              <div style={S.row}>
                <select style={S.select} value={form.modelo_id} onChange={e => setForm(f => ({ ...f, modelo_id: e.target.value }))} disabled={!form.marca_id}>
                  <option value="">Selecione o modelo</option>
                  {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                <button style={S.btnSecondary} onClick={() => setAddModelo(true)} disabled={!form.marca_id}>+ Novo</button>
              </div>
            )}
          </div>

          <div>
            <Label>Placa</Label>
            <Input value={form.placa} onChange={e => setForm(f => ({ ...f, placa: e.target.value }))} placeholder="ABC1234" maxLength={7} />
          </div>
          <div>
            <Label>Cor</Label>
            <Input value={form.cor} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} />
          </div>
          <div>
            <Label>Ano Fabricação</Label>
            <Input value={form.ano_fabricacao} onChange={e => setForm(f => ({ ...f, ano_fabricacao: e.target.value }))} placeholder="2020" maxLength={4} />
          </div>
          <div>
            <Label>Ano Modelo</Label>
            <Input value={form.ano_modelo} onChange={e => setForm(f => ({ ...f, ano_modelo: e.target.value }))} placeholder="2021" maxLength={4} />
          </div>
          <div style={S.colSpan2}>
            <Label>Chassi</Label>
            <Input value={form.chassi} onChange={e => setForm(f => ({ ...f, chassi: e.target.value }))} placeholder="17 caracteres" maxLength={17} />
          </div>
          <div style={S.colSpan2}>
            <Label>Observações</Label>
            <Input value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
          <div style={{ ...S.colSpan2, display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button style={S.btnSecondary} onClick={() => setOpen(false)}>Cancelar</button>
            <button style={S.btnPrimary} onClick={handleSalvar} disabled={!form.modelo_id || !form.placa}>Salvar</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function ClienteModal({ cliente, onAtualizado }) {
  const [open, setOpen] = useState(false)
  const [veiculos, setVeiculos] = useState([])
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { if (open) fetchVeiculos() }, [open])

  function abrirEdicao() {
    setForm({
      nome_completo: cliente.nome_completo || '',
      tipo_pessoa: cliente.tipo_pessoa || 'PF',
      cpf_cnpj: cliente.cpf_cnpj || '',
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      cep: cliente.cep || '',
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      uf: cliente.uf || '',
    })
    setEditando(true)
  }

  async function fetchVeiculos() {
    const { data } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome))')
      .eq('cliente_id', cliente.id)
      .eq('ativo', true)
    setVeiculos(data || [])
  }

  async function buscarCep() {
    if (form.cep.length < 8) return
    const res = await fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
    const data = await res.json()
    if (!data.erro) {
      setForm(f => ({ ...f, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }))
    }
  }

  async function handleSalvar() {
    const { error } = await supabase.from('clientes').update(form).eq('id', cliente.id)
    if (error) { alert('Erro: ' + error.message); return }
    setEditando(false)
    onAtualizado()
  }

  return (
    <>
      <tr
        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
        onClick={() => setOpen(true)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <td style={S.td}>{cliente.nome_completo}</td>
        <td style={S.td}><span style={S.badge}>{cliente.tipo_pessoa}</span></td>
        <td style={S.td}>{cliente.cpf_cnpj}</td>
        <td style={S.td}>{cliente.telefone}</td>
        <td style={S.td}>{cliente.cidade || '—'}</td>
      </tr>

      <Modal open={open} onClose={() => { setOpen(false); setEditando(false) }} title={editando ? 'Editar Cliente' : cliente.nome_completo}>
        {!editando ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button style={S.btnSecondary} onClick={abrirEdicao}>✏️ Editar</button>
            </div>
            <div style={S.infoGrid}>
              <div style={S.infoItem}><b>Telefone:</b> {cliente.telefone}</div>
              <div style={S.infoItem}><b>Email:</b> {cliente.email || '—'}</div>
              <div style={S.infoItem}><b>CPF/CNPJ:</b> {cliente.cpf_cnpj}</div>
              <div style={S.infoItem}><b>Cidade:</b> {cliente.cidade} {cliente.uf ? `- ${cliente.uf}` : ''}</div>
            </div>

            <hr style={S.divider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Veículos</span>
              <VeiculoModal clienteId={cliente.id} onSalvo={fetchVeiculos} />
            </div>

            {veiculos.length === 0 ? (
              <p style={{ color: 'var(--text-faint)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Nenhum veículo cadastrado</p>
            ) : (
              veiculos.map(v => (
                <div key={v.id} style={S.veiculoRow}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '14px' }}>
                      {v.modelos?.marcas?.nome} {v.modelos?.nome}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {v.ano_fabricacao}/{v.ano_modelo} · {v.cor}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{v.placa}</span>
                    <button
                      style={{ ...S.btnSecondary, padding: '4px 10px', fontSize: '12px' }}
                      onClick={async () => {
                        if (!confirm('Remover este veículo?')) return
                        await supabase.from('veiculos').update({ ativo: false }).eq('id', v.id)
                        fetchVeiculos()
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <div style={S.grid2}>
            <div style={S.colSpan2}>
              <Label>Nome Completo</Label>
              <Input value={form.nome_completo} onChange={e => setForm(f => ({ ...f, nome_completo: e.target.value }))} />
            </div>
            <div>
              <Label>Tipo</Label>
              <select style={S.select} value={form.tipo_pessoa} onChange={e => setForm(f => ({ ...f, tipo_pessoa: e.target.value }))}>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </div>
            <div>
              <Label>{form.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'}</Label>
              <Input value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label>CEP</Label>
              <Input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} onBlur={buscarCep} placeholder="00000000" />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
            </div>
            <div style={S.colSpan2}>
              <Label>Logradouro</Label>
              <Input value={form.logradouro} onChange={e => setForm(f => ({ ...f, logradouro: e.target.value }))} />
            </div>
            <div>
              <Label>Complemento</Label>
              <Input value={form.complemento} onChange={e => setForm(f => ({ ...f, complemento: e.target.value }))} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} />
            </div>
            <div>
              <Label>UF</Label>
              <Input value={form.uf} onChange={e => setForm(f => ({ ...f, uf: e.target.value }))} maxLength={2} />
            </div>
            <div style={{ ...S.colSpan2, display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button style={S.btnSecondary} onClick={() => setEditando(false)}>Cancelar</button>
              <button style={S.btnPrimary} onClick={handleSalvar}>Salvar</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({
    nome_completo: '', tipo_pessoa: 'PF', cpf_cnpj: '',
    telefone: '', email: '', cep: '', logradouro: '',
    numero: '', complemento: '', bairro: '', cidade: '', uf: ''
  })

  useEffect(() => { fetchClientes() }, [])

  async function fetchClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome_completo')
    setClientes(data || [])
  }

  async function handleSalvar() {
    const { error } = await supabase.from('clientes').insert([form])
    if (error) { alert('Erro: ' + error.message); return }
    setOpen(false)
    setForm({ nome_completo: '', tipo_pessoa: 'PF', cpf_cnpj: '', telefone: '', email: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' })
    fetchClientes()
  }

  async function buscarCep() {
    if (form.cep.length < 8) return
    const res = await fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
    const data = await res.json()
    if (!data.erro) {
      setForm(f => ({ ...f, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }))
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf_cnpj.includes(busca) ||
    c.telefone.includes(busca)
  )

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.h1}>Clientes</h1>
        <button style={S.btnPrimary} onClick={() => setOpen(true)}>+ Novo Cliente</button>
      </div>

      <div style={S.searchWrap}>
        <Input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
        />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Nome</th>
              <th style={S.th}>Tipo</th>
              <th style={S.th}>CPF/CNPJ</th>
              <th style={S.th}>Telefone</th>
              <th style={S.th}>Cidade</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(c => (
              <ClienteModal key={c.id} cliente={c} onAtualizado={fetchClientes} />
            ))}
            {clientesFiltrados.length === 0 && (
              <tr><td colSpan={5} style={S.emptyState}>Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Cliente">
        <div style={S.grid2}>
          <div style={S.colSpan2}>
            <Label>Nome Completo</Label>
            <Input value={form.nome_completo} onChange={e => setForm({ ...form, nome_completo: e.target.value })} />
          </div>
          <div>
            <Label>Tipo</Label>
            <select style={S.select} value={form.tipo_pessoa} onChange={e => setForm({ ...form, tipo_pessoa: e.target.value })}>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>
          <div>
            <Label>{form.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'}</Label>
            <Input value={form.cpf_cnpj} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>CEP</Label>
            <Input value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} onBlur={buscarCep} placeholder="00000000" />
          </div>
          <div>
            <Label>Número</Label>
            <Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} />
          </div>
          <div style={S.colSpan2}>
            <Label>Logradouro</Label>
            <Input value={form.logradouro} onChange={e => setForm({ ...form, logradouro: e.target.value })} />
          </div>
          <div>
            <Label>Complemento</Label>
            <Input value={form.complemento} onChange={e => setForm({ ...form, complemento: e.target.value })} />
          </div>
          <div>
            <Label>Bairro</Label>
            <Input value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
          </div>
          <div>
            <Label>UF</Label>
            <Input value={form.uf} onChange={e => setForm({ ...form, uf: e.target.value })} maxLength={2} />
          </div>
          <div style={{ ...S.colSpan2, display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button style={S.btnSecondary} onClick={() => setOpen(false)}>Cancelar</button>
            <button style={S.btnPrimary} onClick={handleSalvar}>Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
