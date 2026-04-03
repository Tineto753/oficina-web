import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export default function Historico() {
  const [busca, setBusca] = useState('')
  const [veiculo, setVeiculo] = useState(null)
  const [os, setOs] = useState([])
  const [kms, setKms] = useState([])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleBuscar() {
    if (!busca) return
    setLoading(true)
    setNotFound(false)
    setVeiculo(null)
    setOs([])
    setKms([])

    const placa = busca.toUpperCase().replace(/[^A-Z0-9]/g, '')

    const { data: v } = await supabase
      .from('veiculos')
      .select('*, modelos(nome, marcas(nome)), clientes(nome_completo, telefone)')
      .eq('placa', placa)
      .single()

    if (!v) { setNotFound(true); setLoading(false); return }
    setVeiculo(v)

    const { data: ordens } = await supabase
      .from('ordens_servico')
      .select('*, os_servicos(preco_cobrado, observacoes, servicos(nome))')
      .eq('veiculo_id', v.id)
      .in('status', ['concluida', 'aberta', 'orcamento', 'cancelado'])
      .order('created_at', { ascending: false })
    setOs(ordens || [])

    const { data: kmData } = await supabase
      .from('km_registros')
      .select('*')
      .eq('veiculo_id', v.id)
      .order('registrado_em', { ascending: false })
    setKms(kmData || [])

    setLoading(false)
  }

  const statusLabel = {
    aberta: { label: 'Aberta', color: 'default' },
    concluida: { label: 'Concluída', color: 'default' },
    orcamento: { label: 'Orçamento', color: 'outline' },
    cancelado: { label: 'Cancelado', color: 'destructive' }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Histórico do Veículo</h1>

      <div className="flex gap-2 mb-6">
        <Input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBuscar()}
          placeholder="Digite a placa... Ex: ABC1234"
          className="max-w-sm"
        />
        <Button onClick={handleBuscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {notFound && (
        <p className="text-center text-gray-400 py-8">Nenhum veículo encontrado com essa placa.</p>
      )}

      {veiculo && (
        <>
          {/* Dados do veículo */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">
                  {veiculo.modelos?.marcas?.nome} {veiculo.modelos?.nome}
                </h2>
                <p className="text-gray-500 text-sm">{veiculo.ano_fabricacao}/{veiculo.ano_modelo} — {veiculo.cor}</p>
                {veiculo.chassi && <p className="text-gray-400 text-xs mt-1">Chassi: {veiculo.chassi}</p>}
              </div>
              <span className="font-mono text-lg font-bold text-gray-700">{veiculo.placa}</span>
            </div>
            <div className="border-t mt-3 pt-3 text-sm text-gray-600">
              <p><b>Proprietário:</b> {veiculo.clientes?.nome_completo}</p>
              <p><b>Telefone:</b> {veiculo.clientes?.telefone}</p>
            </div>
            {kms.length > 0 && (
              <div className="border-t mt-3 pt-3 text-sm">
                <p className="text-gray-500">Último KM registrado: <span className="font-semibold text-gray-800">{kms[0].km.toLocaleString()} km</span></p>
              </div>
            )}
          </div>

          {/* Histórico de OS */}
          <h3 className="font-semibold mb-3">Histórico de Ordens de Serviço</h3>
          {os.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Nenhuma OS encontrada.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {os.map(o => (
                <div key={o.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm text-gray-400">
                        {new Date(o.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {o.km_entrada && (
                        <span className="text-xs text-gray-400 ml-3">KM: {o.km_entrada.toLocaleString()}</span>
                      )}
                    </div>
                    <Badge variant={statusLabel[o.status]?.color}>
                      {statusLabel[o.status]?.label}
                    </Badge>
                  </div>

                  <table className="w-full text-sm mb-2">
                    <tbody>
                      {o.os_servicos?.map((s, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-1">{s.servicos?.nome}</td>
                          {s.observacoes && <td className="py-1 text-gray-400 text-xs">{s.observacoes}</td>}
                          <td className="py-1 text-right">R$ {parseFloat(s.preco_cobrado).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t font-semibold">
                        <td className="py-1">Total</td>
                        <td></td>
                        <td className="py-1 text-right text-green-600">R$ {parseFloat(o.valor_total || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {o.forma_pagamento && (
                    <p className="text-xs text-gray-400">Pagamento: {o.forma_pagamento}</p>
                  )}
                  {o.observacoes && (
                    <p className="text-xs text-gray-400">Obs: {o.observacoes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
