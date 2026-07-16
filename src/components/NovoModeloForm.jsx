import { useMemo, useState } from 'react'
import { parseModelo, montarNome, camposDoFormulario, OPCOES } from '../lib/fipe-parse'

// Cadastro manual de modelo quando a FIPE não tem o carro.
// Premissa: o funcionário está no balcão, com pressa, e às vezes só sabe o
// nome. Só "Modelo" é obrigatório — o resto entra se ele souber.

const S = {
  wrap: { border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', background: 'var(--bg-subtle)' },
  linha: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  campo: { flex: '1 1 120px', minWidth: 0 },
  campoLargo: { flex: '2 1 200px', minWidth: 0 },
  rotulo: {
    display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--text-faint)',
    fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px',
  },
  input: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px',
    padding: '7px 10px', fontSize: '13px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%',
  },
  previa: {
    marginTop: '4px', marginBottom: '10px', padding: '9px 11px', borderRadius: '6px',
    background: 'var(--bg-card)', border: '1px dashed var(--border)',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text)',
  },
  previaLabel: { fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' },
  aviso: {
    marginBottom: '10px', padding: '9px 11px', borderRadius: '6px',
    background: 'var(--accent-subtle)', border: '1px solid var(--accent)',
    fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--text)',
  },
  maisBtn: {
    background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
    fontSize: '12px', fontFamily: 'DM Sans, sans-serif', padding: '2px 0', marginBottom: '8px',
  },
  acoes: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  btnPrimary: {
    background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontSize: '13px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer',
  },
  btnSecondary: {
    background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)',
    borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
  },
}

const chave = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// O que define "é o mesmo modelo". `nome` fica de fora de propósito — a ordem
// das palavras varia entre a FIPE e o nome montado aqui.
const ATRIBUTOS = [
  'modelo_base', 'versao', 'motor', 'valvulas', 'combustivel',
  'tecnologia', 'cambio', 'portas', 'carroceria', 'tracao', 'cv',
]

function Campo({ label, largo, children }) {
  return (
    <div style={largo ? S.campoLargo : S.campo}>
      <label style={S.rotulo}>{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, opcoes, vazio = '—' }) {
  return (
    <select style={{ ...S.input, cursor: 'pointer' }} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{vazio}</option>
      {opcoes.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function NovoModeloForm({ busca = '', modelosExistentes = [], onCancel, onConfirmar }) {
  // Aproveita o que ele já digitou na busca: "gol 1.6" abre com Gol + 1.6.
  const [form, setForm] = useState(() => {
    const p = busca.trim() ? parseModelo(busca) : {}
    return {
      modelo: p.modelo_base || busca.trim() || '',
      versao: p.versao || '', motor: p.motor || '', valvulas: p.valvulas || '',
      combustivel: p.combustivel || '', tecnologia: p.tecnologia || '', cambio: p.cambio || '',
      portas: p.portas || '', carroceria: p.carroceria || '', tracao: p.tracao || '',
      cilindros: p.cilindros || '', cv: p.cv || '', turbo: !!p.turbo,
    }
  })
  const [mais, setMais] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Motores que já existem nessa marca: escolher é melhor que digitar.
  const motoresDaMarca = useMemo(
    () => [...new Set(modelosExistentes.map(m => m.motor).filter(Boolean))].sort(),
    [modelosExistentes]
  )

  const nomeMontado = montarNome(form)
  // Duplicata é comparada por ATRIBUTO, não pela string montada: a FIPE escreve
  // "Palio 1.0 ECONOMY Fire" e o montarNome produz "Palio ECONOMY 1.0 Fire" —
  // mesmo carro, texto diferente. Comparar nome deixaria passar o repetido.
  const duplicata = useMemo(() => {
    if (!form.modelo.trim()) return null
    const alvo = camposDoFormulario(form)
    return modelosExistentes.find(m => ATRIBUTOS.every(k => chave(String(m[k] ?? '')) === chave(String(alvo[k] ?? '')))) || null
  }, [form, modelosExistentes])

  function confirmar() {
    if (!form.modelo.trim()) return
    // Duplicata exata reaproveita o registro em vez de criar outro igual.
    if (duplicata) return onConfirmar({ existente: duplicata })
    onConfirmar({ campos: camposDoFormulario(form) })
  }

  return (
    <div style={S.wrap}>
      <div style={S.linha}>
        <Campo label="Modelo *" largo>
          <input
            style={S.input}
            value={form.modelo}
            autoFocus
            placeholder="Gol"
            onChange={e => set('modelo', e.target.value)}
          />
        </Campo>
        <Campo label="Motor">
          <input
            style={S.input}
            value={form.motor}
            placeholder="1.6"
            list="motores-marca"
            onChange={e => set('motor', e.target.value)}
          />
          <datalist id="motores-marca">
            {motoresDaMarca.map(m => <option key={m} value={m} />)}
          </datalist>
        </Campo>
      </div>

      <div style={S.linha}>
        <Campo label="Versão" largo>
          <input style={S.input} value={form.versao} placeholder="ELX" onChange={e => set('versao', e.target.value)} />
        </Campo>
        <Campo label="Combustível">
          <Select value={form.combustivel} onChange={v => set('combustivel', v)} opcoes={OPCOES.combustivel} />
        </Campo>
        <Campo label="Válvulas">
          <Select value={form.valvulas} onChange={v => set('valvulas', v)} opcoes={OPCOES.valvulas} />
        </Campo>
      </div>

      <button style={S.maisBtn} onClick={() => setMais(m => !m)}>
        {mais ? '− menos detalhes' : '+ mais detalhes (câmbio, portas, HP…)'}
      </button>

      {mais && (
        <>
          <div style={S.linha}>
            <Campo label="Câmbio">
              <Select value={form.cambio} onChange={v => set('cambio', v)} opcoes={OPCOES.cambio} />
            </Campo>
            <Campo label="Portas">
              <Select value={form.portas} onChange={v => set('portas', v)} opcoes={OPCOES.portas} />
            </Campo>
            <Campo label="Tecnologia">
              <Select value={form.tecnologia} onChange={v => set('tecnologia', v)} opcoes={OPCOES.tecnologia} />
            </Campo>
          </div>
          <div style={S.linha}>
            <Campo label="HP (cv)">
              <input style={S.input} value={form.cv} placeholder="110" inputMode="numeric" onChange={e => set('cv', e.target.value.replace(/\D/g, ''))} />
            </Campo>
            <Campo label="Carroceria">
              <Select value={form.carroceria} onChange={v => set('carroceria', v)} opcoes={OPCOES.carroceria} />
            </Campo>
            <Campo label="Tração">
              <Select value={form.tracao} onChange={v => set('tracao', v)} opcoes={OPCOES.tracao} />
            </Campo>
            <Campo label="Cilindros">
              <Select value={form.cilindros} onChange={v => set('cilindros', v)} opcoes={OPCOES.cilindros} />
            </Campo>
          </div>
          <div style={{ ...S.linha, alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: 'var(--text)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.turbo} onChange={e => set('turbo', e.target.checked)} style={{ marginRight: '6px' }} />
              Turbo
            </label>
          </div>
        </>
      )}

      <div style={S.previaLabel}>Vai ficar assim</div>
      <div style={S.previa}>{nomeMontado || <span style={{ color: 'var(--text-faint)' }}>preencha o modelo</span>}</div>

      {duplicata && (
        <div style={S.aviso}>
          Esse modelo já existe: <strong>{duplicata.nome}</strong>. Salvar vai usar o que já está cadastrado, sem criar outro igual.
        </div>
      )}

      <div style={S.acoes}>
        <button style={S.btnSecondary} onClick={onCancel}>Cancelar</button>
        <button style={{ ...S.btnPrimary, opacity: form.modelo.trim() ? 1 : 0.5 }} onClick={confirmar} disabled={!form.modelo.trim()}>
          {duplicata ? 'Usar o existente' : 'Salvar modelo'}
        </button>
      </div>
    </div>
  )
}
