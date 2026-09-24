import { FORMAS_PGTO, LABEL_PGTO, novaLinhaPgto, restantePgto, parseValor, formatValor } from '../lib/utils'

const S = {
  label: { display: 'block', fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' },
  campo: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 13px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' },
  linha: { display: 'grid', gridTemplateColumns: '1fr 1fr 34px', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  btnRemover: { background: 'none', border: '1px solid var(--border)', borderRadius: '7px', height: '38px', cursor: 'pointer', color: 'var(--danger)', fontSize: '16px' },
  btnAdd: { background: 'transparent', color: 'var(--accent)', border: '1px dashed var(--accent)', borderRadius: '7px', padding: '7px 14px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
}

/**
 * Lista de formas de pagamento da OS, cada uma com seu valor; "+" adiciona outra forma.
 * Com uma linha só, o valor é o total da OS (campo oculto).
 * @param {Array}    linhas   - [{ forma, valor, parcelas }] (texto)
 * @param {Function} onChange - recebe o novo array
 * @param {number}   total    - valor total da OS
 */
export default function PagamentosEditor({ linhas, onChange, total }) {
  const multi = linhas.length > 1
  const restante = restantePgto(linhas, total)

  function alterar(idx, campo, valor) {
    onChange(linhas.map((l, i) => i === idx ? { ...l, [campo]: valor, ...(campo === 'forma' && valor !== 'parcelado' ? { parcelas: '' } : {}) } : l))
  }

  function adicionar() {
    // Ao sair de uma forma só, a 1ª linha passa a mostrar o valor: começa com o total.
    const base = multi ? linhas : [{ ...linhas[0], valor: formatValor(total) }]
    const falta = restantePgto(base, total)
    onChange([...base, novaLinhaPgto('', falta > 0 ? formatValor(falta) : '')])
  }

  function remover(idx) {
    onChange(linhas.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={S.label}>Forma de Pagamento</label>
      {linhas.map((l, idx) => {
        const parc = parseInt(l.parcelas)
        const valorLinha = multi ? parseValor(l.valor) : total
        return (
          <div key={idx}>
            <div style={multi ? S.linha : { ...S.linha, gridTemplateColumns: '1fr' }}>
              <select style={{ ...S.campo, cursor: 'pointer' }} value={l.forma} onChange={e => alterar(idx, 'forma', e.target.value)}>
                <option value="">Selecione</option>
                {FORMAS_PGTO.map(f => <option key={f} value={f}>{LABEL_PGTO[f]}</option>)}
              </select>
              {multi && (
                <>
                  <input style={S.campo} type="text" inputMode="decimal" placeholder="R$ 0,00"
                    value={l.valor} onChange={e => alterar(idx, 'valor', e.target.value)}
                    onBlur={e => alterar(idx, 'valor', formatValor(e.target.value))} />
                  <button type="button" style={S.btnRemover} title="Remover forma" onClick={() => remover(idx)}>×</button>
                </>
              )}
            </div>
            {l.forma === 'parcelado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '-2px 0 10px' }}>
                <input style={{ ...S.campo, width: '130px' }} type="number" min="2" placeholder="Nº parcelas"
                  value={l.parcelas} onChange={e => alterar(idx, 'parcelas', e.target.value)} />
                {parc >= 2 && Number.isFinite(valorLinha) && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{parc}× de R$ {formatValor(valorLinha / parc)}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <button type="button" style={S.btnAdd} onClick={adicionar}>+ Adicionar forma</button>
        {multi && Math.abs(restante) >= 0.01 && (
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>
            {restante > 0 ? `Falta R$ ${formatValor(restante)}` : `Passou R$ ${formatValor(-restante)}`}
          </span>
        )}
        {multi && Math.abs(restante) < 0.01 && (
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>✓ Valores fecham com o total</span>
        )}
      </div>
    </div>
  )
}
