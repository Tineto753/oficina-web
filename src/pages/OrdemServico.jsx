import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select'

function OSModal({ os, onAtualizado }) {
  const [open, setOpen] = useState(false)
  const [itens, setItens] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [kmEntrada, setKmEntrada] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchItens()
  }, [open])

  async function fetchItens() {
    const { data } = await supabase
      .from('os_servicos')
      .select('*, servicos(nome)')
      .eq('os_id', os.id)
    setItens(data || [])
    setValorTotal(os.valor_total || '')
  }

  async function handleConcluir() {
    if (!formaPagamento) { alert('Informe a forma de pagamento'); return }
    setLoading(true)
    const agora = new Date().toISOString()
    const { error } = await supabase
      .from('ordens_servico')
      .update({
        status: 'concluida',
        forma_pagamento: formaPagamento,
        valor_total: parseFloat(valorTotal),
        pago_em: agora,
        concluida_em: agora
      })
      .eq('id', os.id)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }
    setOpen(false)
    onAtualizado()
  }

  async function handleConverterOrcamento() {
    if (!kmEntrada) { alert('Informe o KM de entrada'); return }
    setLoading(true)
    const agora = new Date().toISOString()
    const { error } = await supabase
      .from('ordens_servico')
      .update({
        status: 'aberta',
        km_entrada: parseInt(kmEntrada),
        aberta_em: agora,
        orcamento_convertido_em: agora
      })
      .eq('id', os.id)
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

  async function handleCancelar() {
    if (!confirm('Cancelar esta OS?')) return
    await supabase.from('ordens_servico').update({ status: 'cancelado' }).eq('id', os.id)
    setOpen(false)
    onAtualizado()
  }

  const isOrcamento = os.status === 'orcamento'

  return (
    <>
      <div onClick={() => setOpen(true)} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-gray-800">{os.clientes?.nome_completo}</span>
          <Badge variant={isOrcamento ? 'outline' : 'default'}>
            {isOrcamento ? 'Orcamento' : 'Aberta'}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          <p>{os.veiculos?.modelos?.marcas?.nome} {os.veiculos?.modelos?.nome}</p>
          <p className="font-mono">{os.veiculos?.placa}</p>
        </div>
        {os.km_entrada && (
          <p className="text-xs text-gray-400 mt-1">KM: {os.km_entrada.toLocaleString()}</p>
        )}
        {os.valor_total && (
          <p className="text-sm font-semibold text-green-600 mt-2">R$ {parseFloat(os.valor_total).toFixed(2)}</p>
        )}
        {isOrcamento && os.validade_orcamento && (
          <p className="text-xs text-amber-500 mt-1">
            Valido ate {new Date(os.validade_orcamento).toLocaleDateString('pt-BR')}
          </p>
        )}
        <p className="text-xs text-gray-300 mt-2">
          {new Date(os.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isOrcamento ? 'Orcamento' : 'OS Aberta'} - {os.clientes?.nome_completo}
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-600 mb-4 grid grid-cols-2 gap-2">
            <span><b>Veiculo:</b> {os.veiculos?.modelos?.marcas?.nome} {os.veiculos?.modelos?.nome}</span>
            <span><b>Placa:</b> {os.veiculos?.placa}</span>
            {os.km_entrada && <span><b>KM:</b> {os.km_entrada.toLocaleString()}</span>}
            {os.aberta_em && <span><b>Aberta em:</b> {new Date(os.aberta_em).toLocaleDateString('pt-BR')}</span>}
            {isOrcamento && os.validade_orcamento && (
              <span className="text-amber-500"><b>Valido ate:</b> {new Date(os.validade_orcamento).toLocaleDateString('pt-BR')}</span>
            )}
          </div>

          <div className="mb-4">
            <p className="font-semibold text-sm mb-2">Servicos</p>
            <table className="w-full text-sm">
              <tbody>
                {itens.map(i => (
                  <tr key={i.id} className="border-t">
                    <td className="py-1">{i.servicos?.nome}</td>
                    <td className="py-1 text-right font-medium">R$ {parseFloat(i.preco_cobrado).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td className="py-1">Total</td>
                  <td className="py-1 text-right text-green-600">R$ {parseFloat(os.valor_total || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {os.observacoes && (
            <p className="text-sm text-gray-500 mb-4"><b>Obs:</b> {os.observacoes}</p>
          )}

          {isOrcamento && (
            <div className="border-t pt-4">
              <p className="font-semibold text-sm mb-2">Converter em OS</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={kmEntrada}
                  onChange={e => setKmEntrada(e.target.value)}
                  placeholder="KM de entrada"
                />
                <Button onClick={handleConverterOrcamento} disabled={loading}>
                  Converter
                </Button>
              </div>
            </div>
          )}

          {!isOrcamento && (
            <div className="border-t pt-4">
              <p className="font-semibold text-sm mb-2">Concluir OS</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="cartao">Cartao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input
                    type="number"
                    value={valorTotal}
                    onChange={e => setValorTotal(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleConcluir} disabled={loading}>
                Concluir OS
              </Button>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <Button variant="ghost" className="text-red-400 hover:text-red-600 text-xs" onClick={handleCancelar}>
              Cancelar OS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ordens de Servico</h1>
        <Button onClick={() => navigate('/os/nova')}>+ Nova OS</Button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setAba('abertas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === 'abertas' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
        >
          OS Abertas
        </button>
        <button
          onClick={() => setAba('orcamentos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === 'orcamentos' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
        >
          Orcamentos
        </button>
      </div>

      {os.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          {aba === 'abertas' ? 'Nenhuma OS aberta' : 'Nenhum orcamento pendente'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {os.map(o => (
            <OSModal key={o.id} os={o} onAtualizado={fetchOS} />
          ))}
        </div>
      )}
    </div>
  )
}
