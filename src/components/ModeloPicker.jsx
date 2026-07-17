import { useMemo, useState } from 'react'
import Combobox from './Combobox'

// Busca de modelo por campos separados — mesmos cinco do cadastro:
// modelo, motor, versão, combustível, válvulas. O resto fica em "mais detalhes".
// As opções de cada filtro saem do que existe na marca escolhida: o funcionário
// só vê valor que leva a resultado, nunca filtra para o vazio.

const S = {
  linha: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' },
  campo: { flex: '1 1 110px', minWidth: 0 },
  campoLargo: { flex: '2 1 160px', minWidth: 0 },
  rotulo: {
    display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--text-faint)',
    fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px',
  },
  select: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px',
    padding: '7px 10px', fontSize: '13px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%', cursor: 'pointer',
  },
  maisBtn: {
    background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
    fontSize: '11px', fontFamily: 'DM Sans, sans-serif', padding: '0 0 6px 0',
  },
  contagem: {
    fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'DM Sans, sans-serif',
    marginBottom: '6px',
  },
  limpar: {
    background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
    fontSize: '11px', fontFamily: 'DM Sans, sans-serif', padding: 0, marginLeft: '8px',
  },
}

const PRINCIPAIS = [
  { k: 'modelo_base', label: 'Modelo', largo: true },
  { k: 'motor', label: 'Motor' },
  { k: 'versao', label: 'Versão' },
  { k: 'combustivel', label: 'Combustível' },
  { k: 'valvulas', label: 'Válvulas' },
]
const EXTRAS = [
  { k: 'cambio', label: 'Câmbio' },
  { k: 'portas', label: 'Portas' },
  { k: 'tecnologia', label: 'Tecnologia' },
  { k: 'carroceria', label: 'Carroceria' },
  { k: 'tracao', label: 'Tração' },
  { k: 'cv', label: 'HP' },
]
const VAZIO = { modelo_base: '', motor: '', versao: '', combustivel: '', valvulas: '', cambio: '', portas: '', tecnologia: '', carroceria: '', tracao: '', cv: '' }

// Um filtro só aparece se for capaz de separar o conjunto. Não basta contar
// opções: o Palio tem combustível "Flex" em 53 dos 101 e nulo nos outros 48 —
// uma opção só, mas escolher Flex ainda corta a lista pela metade.
// "__sem__" = o funcionário quer justamente os que não têm o dado preenchido.
const SEM = '__sem__'
const bate = (m, k, v) => v === SEM ? (m[k] == null || m[k] === '') : String(m[k] ?? '') === v

function util({ opcoes, temVazio }) {
  return opcoes.length >= 2 || (opcoes.length === 1 && temVazio)
}

function Filtro({ label, valor, onChange, info, largo }) {
  if (!util(info)) return null
  return (
    <div style={largo ? S.campoLargo : S.campo}>
      <label style={S.rotulo}>{label}</label>
      <select style={S.select} value={valor} onChange={e => onChange(e.target.value)}>
        <option value="">todos</option>
        {info.opcoes.map(o => <option key={o} value={o}>{o}</option>)}
        {info.temVazio && <option value="__sem__">sem informação</option>}
      </select>
    </div>
  )
}

export default function ModeloPicker({ modelos = [], value, onChange, onBuscaChange, disabled }) {
  const [f, setF] = useState(VAZIO)
  const [mais, setMais] = useState(false)

  const aplica = (filtros, m) => Object.entries(filtros).every(([k, v]) => !v || bate(m, k, v))

  function set(k, v) {
    const novos = { ...f, [k]: v }
    setF(novos)
    const restantes = modelos.filter(m => aplica(novos, m))
    // Sobrou um só: preenche sozinho. O funcionário já disse tudo que sabia do
    // carro — não faz sentido pedir que ele clique para confirmar o óbvio.
    if (restantes.length === 1) onChange?.(restantes[0].id)
    // O que estava escolhido saiu da peneira: limpa, senão fica selecionado um
    // modelo que nem aparece mais na lista.
    else if (value && !restantes.some(m => m.id === value)) onChange?.('')
  }

  // Opções de cada campo vêm dos modelos que sobrevivem aos OUTROS filtros —
  // assim as combinações oferecidas sempre têm resultado.
  const opcoesDe = useMemo(() => {
    const casa = (m, ignorar) =>
      Object.entries(f).every(([k, v]) => !v || k === ignorar || bate(m, k, v))
    const out = {}
    for (const { k } of [...PRINCIPAIS, ...EXTRAS]) {
      const elegiveis = modelos.filter(m => casa(m, k))
      const vals = elegiveis.map(m => m[k])
      out[k] = {
        opcoes: [...new Set(vals.filter(v => v != null && v !== '').map(String))]
          .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })),
        temVazio: vals.some(v => v == null || v === ''),
      }
    }
    return out
  }, [modelos, f])

  const filtrados = useMemo(() => modelos.filter(m => aplica(f, m)), [modelos, f])

  const ativos = Object.values(f).filter(Boolean).length

  return (
    <div>
      <div style={S.linha}>
        {PRINCIPAIS.map(({ k, label, largo }) => (
          <Filtro key={k} label={label} largo={largo} valor={f[k]} onChange={v => set(k, v)} info={opcoesDe[k]} />
        ))}
      </div>

      {EXTRAS.some(({ k }) => opcoesDe[k] && util(opcoesDe[k])) && (
        <button style={S.maisBtn} onClick={() => setMais(m => !m)}>
          {mais ? '− menos detalhes' : '+ mais detalhes (câmbio, portas, HP…)'}
        </button>
      )}
      {mais && (
        <div style={S.linha}>
          {EXTRAS.map(({ k, label }) => (
            <Filtro key={k} label={label} valor={f[k]} onChange={v => set(k, v)} info={opcoesDe[k]} />
          ))}
        </div>
      )}

      {ativos > 0 && (
        <div style={S.contagem}>
          {filtrados.length} {filtrados.length === 1 ? 'modelo' : 'modelos'}
          <button style={S.limpar} onClick={() => setF(VAZIO)}>limpar filtros</button>
        </div>
      )}

      <Combobox
        options={filtrados}
        value={value}
        onChange={onChange}
        onBuscaChange={onBuscaChange}
        placeholder={disabled ? 'Selecione a marca primeiro' : 'Buscar modelo…'}
        disabled={disabled}
      />
    </div>
  )
}
