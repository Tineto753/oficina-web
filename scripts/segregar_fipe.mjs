// Segrega/classifica modelos.nome (FIPE). DRY-RUN por padrão (só relatório).
//   node scripts/segregar_fipe.mjs           -> relatório (não grava)
//   node scripts/segregar_fipe.mjs --apply   -> grava (exige migration 003a)
import { readFileSync } from 'node:fs'
import { parseModelo as parse, camposModelo } from '../src/lib/fipe-parse.js'
const APPLY = process.argv.includes('--apply')

const src = readFileSync(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
const URL_ = src.match(/supabaseUrl\s*=\s*'([^']+)'/)[1]
const KEY = src.match(/supabaseKey\s*=\s*'([^']+)'/)[1]
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function getAll() {
  const out = []
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${URL_}/rest/v1/modelos?select=id,nome&order=id&limit=1000&offset=${off}`, { headers: H })
    const b = await r.json(); out.push(...b); if (b.length < 1000) break
  }
  return out
}

const modelos = await getAll()
const campos = ['motor', 'valvulas', 'cilindros', 'combustivel', 'turbo', 'cambio', 'portas', 'tracao', 'carroceria']
const cont = Object.fromEntries(campos.map(c => [c, 0]))
for (const m of modelos) {
  m._p = parse(m.nome)
  for (const c of campos) if (m._p[c]) cont[c]++
}
const pct = n => `${n} (${(n / modelos.length * 100).toFixed(0)}%)`
console.log(`\n===== CLASSIFICAÇÃO FIPE — ${modelos.length} modelos (DRY-RUN) =====`)
console.log('Cobertura por campo:')
for (const c of campos) console.log(`  ${c.padEnd(12)} ${pct(cont[c])}`)
console.log('\n--- 22 exemplos ---')
for (const m of modelos.slice(0, 22)) {
  const p = m._p
  console.log(`"${m.nome}"\n   curto=${p.modelo_curto} | motor=${p.motor||'-'} ${p.valvulas||''}${p.cilindros||''} | ${p.combustivel||'-'} | turbo=${p.turbo?'s':'-'} | ${p.cambio||'-'} | ${p.portas||'-'} | ${p.tracao||'-'} | ${p.carroceria||'-'}`)
}
if (!APPLY) {
  console.log('\n(DRY-RUN — nada gravado. Rode --apply após a migration 003a.)')
} else {
  console.log('\n>>> gravando núcleo + turbo...')
  let ok = 0, err = 0
  for (const m of modelos) {
    const body = camposModelo(m.nome)
    const r = await fetch(`${URL_}/rest/v1/modelos?id=eq.${m.id}`, {
      method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(body),
    })
    if (r.ok) ok++; else { err++; if (err <= 2) console.log('erro:', r.status, await r.text()) }
  }
  console.log(`gravados: ${ok}/${modelos.length} (erros: ${err})`)
}
