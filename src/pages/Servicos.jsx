import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog'

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({
    nome: '', descricao: '', categoria: ''
  })

  useEffect(() => { fetchServicos() }, [])

  async function fetchServicos() {
    const { data } = await supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    setServicos(data || [])
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSalvar() {
    if (!form.nome) { alert('Nome é obrigatório'); return }
    const { error } = await supabase.from('servicos').insert([form])
    if (error) { alert('Erro: ' + error.message); return }
    setOpen(false)
    setForm({ nome: '', descricao: '', categoria: '' })
    fetchServicos()
  }

  async function handleDesativar(id) {
    await supabase.from('servicos').update({ ativo: false }).eq('id', id)
    fetchServicos()
  }

  const servicosFiltrados = servicos.filter(s =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (s.categoria || '').toLowerCase().includes(busca.toLowerCase())
  )

  const categorias = [...new Set(servicos.map(s => s.categoria).filter(Boolean))]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Serviço</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label>Nome</Label>
                <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Troca de óleo" />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ex: Revisão, Elétrica, Freios" list="categorias-list" />
                <datalist id="categorias-list">
                  {categorias.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Detalhes opcionais" />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleSalvar}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar por nome ou categoria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <table className="w-full bg-white rounded-lg shadow text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Descrição</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {servicosFiltrados.map(s => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="p-3 font-medium">{s.nome}</td>
              <td className="p-3">
                {s.categoria
                  ? <Badge variant="outline">{s.categoria}</Badge>
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="p-3 text-gray-500">{s.descricao || '—'}</td>
              <td className="p-3 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => handleDesativar(s.id)}
                >
                  Remover
                </Button>
              </td>
            </tr>
          ))}
          {servicosFiltrados.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-400">
                Nenhum serviço cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}