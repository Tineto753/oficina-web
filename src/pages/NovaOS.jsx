import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">+ Novo Serviço</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo Serviço</DialogTitle></DialogHeader>
        <div className="grid gap-4">
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvar}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

  useEffect(() => { fetchServicosDisponiveis() }, [])
  useEffect(() => {
    const config = async () => {
      const { data } = await supabase.from('configuracoes').select('valor').eq('chave', 'validade_orcamento_dias').single()
      if (data) setValidadeDias(parseInt(data.valor))
    }
    config()
  }, [])

  async function fetchServicosDisponiveis() {
    const { data } = await supabase.from('servicos').select('*').eq('ativo', true).order('nome')
    setServicosDisponiveis(data || [])
  }

  async function buscarClientes(q) {
    setBusca(q)
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
    const svc = servicosDisponiveis.find(s => s.id === servicoId)
    if (servicos.find(s => s.servico_id === servicoId)) { alert('Serviço já adicionado'); return }
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

  function removerServico(servicoId) {
    setServicos(sv => sv.filter(s => s.servico_id !== servicoId))
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

    const { data: os, error } = await supabase
      .from('ordens_servico')
      .insert([osData])
      .select()
      .single()

    if (error) { alert('Erro: ' + error.message); return }

    const itens = servicos.map(s => ({
      os_id: os.id,
      servico_id: s.servico_id,
      preco_cobrado: s.preco_cobrado,
      observacoes: s.observacoes
    }))

    await supabase.from('os_servicos').insert(itens)

    if (tipo === 'aberta' && kmEntrada) {
      await supabase.from('km_registros').insert([{
        veiculo_id: veiculoId,
        os_id: os.id,
        km: parseInt(kmEntrada),
        origem: 'entrada_os'
      }])
    }

    navigate('/os')
  }

  const totalOS = servicos.reduce((acc, s) => acc + s.preco_cobrado, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/os')}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Nova OS</h1>
      </div>

      {/* Tipo */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <Label className="mb-2 block">Tipo</Label>
        <div className="flex gap-3">
          <button
            onClick={() => setTipo('aberta')}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${tipo === 'aberta' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            OS Direta
          </button>
          <button
            onClick={() => setTipo('orcamento')}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${tipo === 'orcamento' ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Orçamento
          </button>
        </div>
      </div>

      {/* Cliente */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <Label className="mb-2 block">Cliente</Label>
        <div className="relative">
          <Input
            value={busca}
            onChange={e => buscarClientes(e.target.value)}
            placeholder="Digite o nome do cliente..."
          />
          {clientes.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
              {clientes.map(c => (
                <button
                  key={c.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  onClick={() => selecionarCliente(c)}
                >
                  <span className="font-medium">{c.nome_completo}</span>
                  <span className="text-gray-400 ml-2">{c.telefone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {clienteSelecionado && veiculos.length > 0 && (
          <div className="mt-3">
            <Label className="mb-2 block">Veículo</Label>
            <Select value={veiculoId} onValueChange={setVeiculoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.modelos?.marcas?.nome} {v.modelos?.nome} — {v.placa} ({v.ano_modelo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {clienteSelecionado && veiculos.length === 0 && (
          <p className="text-sm text-amber-500 mt-2">Este cliente não tem veículos cadastrados.</p>
        )}
      </div>

      {/* KM — só para OS direta */}
      {tipo === 'aberta' && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <Label className="mb-2 block">KM de Entrada</Label>
          <Input
            type="number"
            value={kmEntrada}
            onChange={e => setKmEntrada(e.target.value)}
            placeholder="Ex: 52000"
          />
        </div>
      )}

      {/* Serviços */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <Label>Serviços</Label>
          <NovoServicoModal onSalvo={svc => {
            setServicosDisponiveis(sv => [...sv, svc])
            setServicoId(svc.id)
          }} />
        </div>

        <div className="flex gap-2 mb-3">
          <Select value={servicoId} onValueChange={setServicoId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {servicosDisponiveis.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            placeholder="R$ preço"
            className="w-32"
          />
          <Button onClick={adicionarServico}>Adicionar</Button>
        </div>

        {servicoId && (
          <div className="mb-3">
            <Input
              value={obsServico}
              onChange={e => setObsServico(e.target.value)}
              placeholder="Observação do serviço (opcional)"
            />
          </div>
        )}

        {servicos.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-2">Serviço</th>
                <th className="p-2">Obs</th>
                <th className="p-2 text-right">Preço</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {servicos.map(s => (
                <tr key={s.servico_id} className="border-t">
                  <td className="p-2">{s.nome}</td>
                  <td className="p-2 text-gray-400">{s.observacoes || '—'}</td>
                  <td className="p-2 text-right">R$ {s.preco_cobrado.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    <button onClick={() => removerServico(s.servico_id)} className="text-red-400 hover:text-red-600 text-xs">remover</button>
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td colSpan={2} className="p-2">Total</td>
                <td className="p-2 text-right">R$ {totalOS.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">Nenhum serviço adicionado</p>
        )}
      </div>

      {/* Observações */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <Label className="mb-2 block">Observações</Label>
        <Input value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/os')}>Cancelar</Button>
        <Button onClick={handleSalvar}>
          {tipo === 'aberta' ? 'Abrir OS' : 'Salvar Orçamento'}
        </Button>
      </div>
    </div>
  )
}