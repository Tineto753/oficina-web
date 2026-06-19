import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { numeroOuNull } from '../lib/validacao'

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
    padding: '24px',
    boxShadow: 'var(--shadow)',
    maxWidth: '420px',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-faint)',
    marginTop: '6px',
    fontFamily: 'DM Sans, sans-serif',
  },
  success: {
    fontSize: '13px',
    color: 'var(--success)',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 600,
  },
}

export default function Configuracoes() {
  const [validade, setValidade] = useState('')
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'validade_orcamento_dias')
      .single()
      .then(({ data }) => { if (data) setValidade(data.valor) })
  }, [])

  async function handleSalvar() {
    const dias = numeroOuNull(validade)
    if (dias === null || dias < 1) { alert('Informe um número de dias válido (mínimo 1).'); return }
    await supabase
      .from('configuracoes')
      .update({ valor: String(Math.round(dias)) })
      .eq('chave', 'validade_orcamento_dias')
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div>
      <h1 style={S.h1}>Configurações</h1>
      <div style={S.card}>
        <div style={{ marginBottom: '20px' }}>
          <label style={S.label}>Validade padrão do orçamento (dias)</label>
          <input
            type="number"
            value={validade}
            onChange={e => setValidade(e.target.value)}
            style={{ ...S.input, maxWidth: '120px' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <p style={S.hint}>Prazo em dias antes do orçamento expirar automaticamente.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button style={S.btnPrimary} onClick={handleSalvar}>Salvar</button>
          {salvo && <span style={S.success}>✓ Salvo!</span>}
        </div>
      </div>
    </div>
  )
}
