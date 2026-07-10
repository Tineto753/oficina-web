// Segrega/classifica modelos.nome (FIPE). DRY-RUN por padrão (só relatório).
//   node scripts/segregar_fipe.mjs           -> relatório (não grava)
//   node scripts/segregar_fipe.mjs --apply   -> grava (exige migration 003a)
import { readFileSync } from 'node:fs'
const APPLY = process.argv.includes('--apply')

const src = readFileSync(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
const URL_ = src.match(/supabaseUrl\s*=\s*'([^']+)'/)[1]
const KEY = src.match(/supabaseKey\s*=\s*'([^']+)'/)[1]
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const cap = s => s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s

function parse(nome) {
  const raw = (nome || '').trim().replace(/\s+/g, ' ')
  const motorM = raw.match(/(\d\.\d)/)                              // cilindrada (pega colado: URBANTECH1.6)
  const motor = motorM ? motorM[1] : null
  const valM = raw.match(/\b(8|10|12|16|20|24)\s?[vV]\b/)           // válvulas
  const valvulas = valM ? valM[1] + 'V' : null
  const cilM = raw.match(/\bV(6|8|10|12)\b/)                        // V6/V8...
  const cilindros = cilM ? 'V' + cilM[1] : null
  const fuelM = raw.match(/\b(Flex|Gasolina|Diesel|[ÁA]lcool|GNV|El[ée]trico|H[íi]brido)\b/i)
  const combustivel = fuelM ? cap(fuelM[1]) : null
  const turbo = /\b(Turbo|Bi-?TB|TSI|TFSI|TGDI|TDI)\b/i.test(raw) || /\bTB\b/.test(raw)
  let cambio = null
  if (/\b(Aut\.?|autom[aá]tic\w*|Tiptronic|CVT|Dualogic|Automatizad\w*|DCT|S-?tronic|Powershift|I-?Motion)\b/i.test(raw)) cambio = 'Automático'
  else if (/\b(Mec\.?|Manual)\b/i.test(raw)) cambio = 'Manual'
  const portasM = raw.match(/\b([2345])p\b/i)
  const portas = portasM ? portasM[1] + 'p' : null
  const tracM = raw.match(/\b(4x4|4x2|AWD|4WD)\b/i)
  const tracao = tracM ? tracM[1].toUpperCase() : null
  const carM = raw.match(/\b(Sedan|Sed\.|Hatch|Weekend|SW|Perua|Furg[ãa]o|Pick-?Up|CD|CE|Chassi|Coup[eé])\b/i)
  const carroceria = carM ? carM[1] : null
  const modelo_curto = raw.split(' ')[0]                            // heurística simples
  const modelo_base = motorM ? raw.slice(0, motorM.index).trim() : raw
  return { modelo_base, modelo_curto, motor, valvulas, cilindros, combustivel, turbo, cambio, portas, tracao, carroceria }
}

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
    const p = m._p
    const body = {
      modelo_base: p.modelo_base, modelo_curto: p.modelo_curto, motor: p.motor,
      valvulas: p.valvulas, combustivel: p.combustivel, turbo: p.turbo,
    }
    const r = await fetch(`${URL_}/rest/v1/modelos?id=eq.${m.id}`, {
      method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(body),
    })
    if (r.ok) ok++; else { err++; if (err <= 2) console.log('erro:', r.status, await r.text()) }
  }
  console.log(`gravados: ${ok}/${modelos.length} (erros: ${err})`)
}
