import { useEffect, useMemo, useRef, useState } from 'react'

// Select com busca por digitação. Nasceu para marca/modelo no cadastro de
// veículo, onde a lista chega a ~600 itens (Fiat) e o <select> nativo vira
// rolagem cega. Busca por tokens: "gol 1.6" casa "Gol 1.6 Flex 8V".

const S = {
  // flex:1 + minWidth:0 para não espremer o botão "+ Novo" ao lado (S.row é flex).
  wrap: { position: 'relative', width: '100%', flex: 1, minWidth: 0 },
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
  },
  lista: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    boxShadow: 'var(--shadow)',
    maxHeight: '260px',
    overflowY: 'auto',
    padding: '4px',
  },
  item: {
    padding: '8px 11px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--text)',
    borderRadius: '5px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  vazio: {
    padding: '10px 11px',
    fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--text-muted)',
  },
  contador: {
    padding: '6px 11px',
    fontSize: '11px',
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--text-faint)',
    borderTop: '1px solid var(--border)',
  },
}

const TETO = 80 // itens renderizados por vez; o resto exige refinar a busca

const norm = s => (s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

function filtrar(options, busca) {
  const tokens = norm(busca).split(/\s+/).filter(Boolean)
  if (!tokens.length) return options
  return options.filter(o => {
    const n = norm(o.nome)
    return tokens.every(t => n.includes(t))
  })
}

export default function Combobox({
  options = [],
  value = '',
  onChange,
  onBuscaChange,      // reporta o texto digitado: quem abre "+ Novo" pré-preenche com ele
  placeholder = 'Selecione',
  disabled = false,
}) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(0)
  const wrapRef = useRef(null)
  const listaRef = useRef(null)

  const selecionado = options.find(o => o.id === value) || null
  const filtrados = useMemo(() => filtrar(options, busca), [options, busca])
  const visiveis = filtrados.slice(0, TETO)

  function fechar() {
    setAberto(false)
    setBusca('')
  }

  // Clique fora fecha e descarta a busca não confirmada.
  useEffect(() => {
    if (!aberto) return
    const fora = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [aberto])

  // Mantém o item ativo visível durante navegação por teclado.
  useEffect(() => {
    const el = listaRef.current?.children[ativo]
    if (el?.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
  }, [ativo, aberto])

  function escolher(o) {
    onChange?.(o.id)
    fechar()
  }

  function onKeyDown(e) {
    if (!aberto && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setAberto(true)
      return
    }
    if (!aberto) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo(i => Math.min(i + 1, visiveis.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (visiveis[ativo]) escolher(visiveis[ativo]) }
    else if (e.key === 'Escape') { e.preventDefault(); fechar() }
  }

  return (
    <div style={S.wrap} ref={wrapRef}>
      <input
        style={{ ...S.input, cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.6 : 1 }}
        value={aberto ? busca : (selecionado?.nome || '')}
        placeholder={selecionado ? selecionado.nome : placeholder}
        disabled={disabled}
        onChange={e => { setBusca(e.target.value); onBuscaChange?.(e.target.value); setAtivo(0); setAberto(true) }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; setAberto(true) }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        onKeyDown={onKeyDown}
      />
      {aberto && !disabled && (
        <div style={S.lista}>
          <div ref={listaRef}>
            {visiveis.map((o, i) => (
              <div
                key={o.id}
                style={{
                  ...S.item,
                  background: i === ativo ? 'var(--bg-subtle)' : 'transparent',
                  color: o.id === value ? 'var(--accent)' : 'var(--text)',
                }}
                onMouseEnter={() => setAtivo(i)}
                onMouseDown={e => e.preventDefault()}
                onClick={() => escolher(o)}
              >
                {o.nome}
              </div>
            ))}
          </div>
          {!filtrados.length && <div style={S.vazio}>Nenhum resultado</div>}
          {filtrados.length > TETO && (
            <div style={S.contador}>
              mostrando {TETO} de {filtrados.length} — refine a busca
            </div>
          )}
        </div>
      )}
    </div>
  )
}
