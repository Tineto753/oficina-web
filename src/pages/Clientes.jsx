import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select'

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
    ano_fabricacao: '', ano_modelo: '', cor: '',chassi: '', observacoes: ''
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
    // busca modelos FIPE
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Cadastrar Carro</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Cadastrar Veículo</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">

          {/* Marca */}
          <div className="col-span-2">
            <Label>Marca</Label>
            {addMarca ? (
              <div className="flex gap-2 mt-1">
                <Input value={novaMarca} onChange={e => setNovaMarca(e.target.value)} placeholder="Nome da marca" />
                <Button size="sm" onClick={salvarNovaMarca}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setAddMarca(false)}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Select value={form.marca_id} onValueChange={handleMarcaChange}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione a marca" /></SelectTrigger>
                  <SelectContent>
                    {marcas.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => setAddMarca(true)}>+ Nova</Button>
              </div>
            )}
          </div>

          {/* Modelo */}
          <div className="col-span-2">
            <Label>Modelo</Label>
            {addModelo ? (
              <div className="flex gap-2 mt-1">
                <Input value={novoModelo} onChange={e => setNovoModelo(e.target.value)} placeholder="Nome do modelo" />
                <Button size="sm" onClick={salvarNovoModelo}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setAddModelo(false)}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Select value={form.modelo_id} onValueChange={v => setForm(f => ({ ...f, modelo_id: v }))} disabled={!form.marca_id}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione o modelo" /></SelectTrigger>
                  <SelectContent>
                    {modelos.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => setAddModelo(true)} disabled={!form.marca_id}>+ Novo</Button>
              </div>
            )}
          </div>

          <div>
            <Label>Placa</Label>
            <Input name="placa" value={form.placa} onChange={e => setForm(f => ({ ...f, placa: e.target.value }))} placeholder="ABC1234" maxLength={7} />
          </div>
          <div>
            <Label>Cor</Label>
            <Input name="cor" value={form.cor} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <Label>Chassi</Label>
            <Input name="chassi" value={form.chassi} onChange={e => setForm(f => ({ ...f, chassi: e.target.value }))} placeholder="17 caracteres" maxLength={17} />
          </div>
          <div>
            <Label>Ano Fabricação</Label>
            <Input name="ano_fabricacao" value={form.ano_fabricacao} onChange={e => setForm(f => ({ ...f, ano_fabricacao: e.target.value }))} placeholder="2020" maxLength={4} />
          </div>
          <div>
            <Label>Ano Modelo</Label>
            <Input name="ano_modelo" value={form.ano_modelo} onChange={e => setForm(f => ({ ...f, ano_modelo: e.target.value }))} placeholder="2021" maxLength={4} />
          </div>
          <div className="col-span-2">
            <Label>Observações</Label>
            <Input name="observacoes" value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={!form.modelo_id || !form.placa}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ClienteModal({ cliente }) {
  const [open, setOpen] = useState(false)
  const [veiculos, setVeiculos] = useState([])

  useEffect(() => { if (open) fetchVeiculos() }, [open])

  async function fetchVeiculos() {
    const { data } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome))')
      .eq('cliente_id', cliente.id)
      .eq('ativo', true)
    setVeiculos(data || [])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <tr className="border-t hover:bg-gray-50 cursor-pointer">
          <td className="p-3">{cliente.nome_completo}</td>
          <td className="p-3"><Badge variant="outline">{cliente.tipo_pessoa}</Badge></td>
          <td className="p-3">{cliente.cpf_cnpj}</td>
          <td className="p-3">{cliente.telefone}</td>
          <td className="p-3">{cliente.cidade}</td>
        </tr>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cliente.nome_completo}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <span><b>Telefone:</b> {cliente.telefone}</span>
          <span><b>Email:</b> {cliente.email || '—'}</span>
          <span><b>CPF/CNPJ:</b> {cliente.cpf_cnpj}</span>
          <span><b>Cidade:</b> {cliente.cidade} - {cliente.uf}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Veículos</h3>
          <VeiculoModal clienteId={cliente.id} onSalvo={fetchVeiculos} />
        </div>

        {veiculos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum veículo cadastrado</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Marca</th>
                <th className="p-2">Modelo</th>
                <th className="p-2">Placa</th>
                <th className="p-2">Ano</th>
                <th className="p-2">Cor</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map(v => (
                <tr key={v.id} className="border-t">
                  <td className="p-2">{v.modelos?.marcas?.nome}</td>
                  <td className="p-2">{v.modelos?.nome}</td>
                  <td className="p-2">{v.placa}</td>
                  <td className="p-2">{v.ano_fabricacao}/{v.ano_modelo}</td>
                  <td className="p-2">{v.cor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSalvar() {
    const { error } = await supabase.from('clientes').insert([form])
    if (error) { alert('Erro: ' + error.message); return }
    setOpen(false)
    setForm({
      nome_completo: '', tipo_pessoa: 'PF', cpf_cnpj: '',
      telefone: '', email: '', cep: '', logradouro: '',
      numero: '', complemento: '', bairro: '', cidade: '', uf: ''
    })
    fetchClientes()
  }

  async function buscarCep() {
    if (form.cep.length < 8) return
    const res = await fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
    const data = await res.json()
    if (!data.erro) {
      setForm(f => ({
        ...f,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf
      }))
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf_cnpj.includes(busca) ||
    c.telefone.includes(busca)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo</Label>
                <Input name="nome_completo" value={form.nome_completo} onChange={handleChange} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo_pessoa} onValueChange={v => setForm({ ...form, tipo_pessoa: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{form.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'}</Label>
                <Input name="cpf_cnpj" value={form.cpf_cnpj} onChange={handleChange} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input name="telefone" value={form.telefone} onChange={handleChange} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <Label>CEP</Label>
                <Input name="cep" value={form.cep} onChange={handleChange} onBlur={buscarCep} placeholder="00000000" />
              </div>
              <div>
                <Label>Número</Label>
                <Input name="numero" value={form.numero} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <Label>Logradouro</Label>
                <Input name="logradouro" value={form.logradouro} onChange={handleChange} />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input name="complemento" value={form.complemento} onChange={handleChange} />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input name="bairro" value={form.bairro} onChange={handleChange} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input name="cidade" value={form.cidade} onChange={handleChange} />
              </div>
              <div>
                <Label>UF</Label>
                <Input name="uf" value={form.uf} onChange={handleChange} maxLength={2} />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleSalvar}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input placeholder="Buscar por nome, CPF/CNPJ ou telefone..." value={busca} onChange={e => setBusca(e.target.value)} className="max-w-sm" />
      </div>

      <table className="w-full bg-white rounded-lg shadow text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">CPF/CNPJ</th>
            <th className="p-3">Telefone</th>
            <th className="p-3">Cidade</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map(c => (
            <ClienteModal key={c.id} cliente={c} />
          ))}
          {clientesFiltrados.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-gray-400">Nenhum cliente encontrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}