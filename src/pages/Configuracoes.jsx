import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function Configuracoes() {
  const [validade, setValidade] = useState('')
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'validade_orcamento_dias')
        .single()
      if (data) setValidade(data.valor)
    }
    fetchConfig()
  }, [])

  async function handleSalvar() {
    await supabase
      .from('configuracoes')
      .update({ valor: validade })
      .eq('chave', 'validade_orcamento_dias')
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <Label>Validade padrão do orçamento (dias)</Label>
          <Input
            type="number"
            value={validade}
            onChange={e => setValidade(e.target.value)}
            className="mt-1 max-w-xs"
          />
          <p className="text-xs text-gray-400 mt-1">Prazo em dias antes do orçamento expirar automaticamente.</p>
        </div>
        <Button onClick={handleSalvar}>
          {salvo ? '✓ Salvo!' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
