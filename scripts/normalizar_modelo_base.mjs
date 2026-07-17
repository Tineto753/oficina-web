// Normaliza `modelos.modelo_base` (e `modelo_curto` derivado) para o Title Case
// canônico do app — o mesmo `tituloCase()` usado no cadastro manual e no parse
// da FIPE. Motivo: o ModeloPicker monta as opções por string exata
// (`[...new Set(...)]`), então "UNO" e "uno" viram dois filtros "Modelo"
// idênticos. Colapsando a caixa, duplicatas que só diferem em maiúsc/minúsc
// (UNO/uno, GOL/Gol, ...) somem.
//
//   node scripts/normalizar_modelo_base.mjs           -> relatório (não grava)
//   node scripts/normalizar_modelo_base.mjs --apply   -> grava as diferenças
//
// `nome` (string crua da FIPE) NUNCA é tocado — é a fonte, igual segregar_fipe.
import { readFileSync } from 'node:fs'
import { tituloCase } from '../src/lib/fipe-parse.js'
const APPLY = process.argv.includes('--apply')

const src = readFileSync(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
const URL_ = src.match(/supabaseUrl\s*=\s*'([^']+)'/)[1]
const KEY = src.match(/supabaseKey\s*=\s*'([^']+)'/)[1]
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function getAll() {
  const out = []
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${URL_}/rest/v1/modelos?select=id,modelo_base,modelo_curto&order=id&limit=1000&offset=${off}`, { headers: H })
    const b = await r.json(); out.push(...b); if (b.length < 1000) break
  }
  return out
}

const modelos = await getAll()

// Só interessam linhas em que o canônico difere do que está gravado.
const mudar = []
for (const m of modelos) {
  if (m.modelo_base == null || m.modelo_base === '') continue
  const base = tituloCase(m.modelo_base)
  const curto = base.split(' ')[0] || null
  if (base !== m.modelo_base || curto !== m.modelo_curto) {
    mudar.push({ id: m.id, de: m.modelo_base, para: base, curto })
  }
}

// Agrupa por valor canônico pra deixar visível quais grafias estão se fundindo.
const grupos = new Map()
for (const m of modelos) {
  if (m.modelo_base == null || m.modelo_base === '') continue
  const base = tituloCase(m.modelo_base)
  if (!grupos.has(base)) grupos.set(base, new Set())
  grupos.get(base).add(m.modelo_base)
}
const fusoes = [...grupos.entries()].filter(([, s]) => s.size > 1)

console.log(`\n===== NORMALIZAÇÃO modelo_base — ${modelos.length} modelos (${APPLY ? 'APPLY' : 'DRY-RUN'}) =====`)
console.log(`Linhas a atualizar: ${mudar.length}`)
console.log(`Grupos com grafias fundindo (>1 caixa p/ o mesmo canônico): ${fusoes.length}`)
for (const [canon, grafias] of fusoes.sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))) {
  console.log(`  ${canon.padEnd(20)} <= ${[...grafias].map(g => `"${g}"`).join(', ')}`)
}
if (mudar.length && !fusoes.length) {
  console.log('\n(Nenhuma fusão — só ajuste de caixa isolado. Primeiros 15:)')
  for (const m of mudar.slice(0, 15)) console.log(`  "${m.de}" -> "${m.para}"`)
}

if (!APPLY) {
  console.log('\n(DRY-RUN — nada gravado. Rode --apply para aplicar.)')
} else {
  console.log(`\n>>> gravando ${mudar.length} linhas...`)
  let ok = 0, err = 0
  for (const m of mudar) {
    const r = await fetch(`${URL_}/rest/v1/modelos?id=eq.${m.id}`, {
      method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify({ modelo_base: m.para, modelo_curto: m.curto }),
    })
    if (r.ok) ok++; else { err++; if (err <= 2) console.log('erro:', r.status, await r.text()) }
  }
  console.log(`gravados: ${ok}/${mudar.length} (erros: ${err})`)
}
