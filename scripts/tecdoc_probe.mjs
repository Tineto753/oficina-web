// PROBE TecDoc: suppliers + countries (chamadas decisivas de cobertura).
// Uso: APIFY_TOKEN=xxx node scripts/tecdoc_probe.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
const TOKEN = process.env.APIFY_TOKEN
if (!TOKEN) { console.error('faltou APIFY_TOKEN'); process.exit(1) }
const ACTOR = 'making-data-meaningful~tecdoc'
const CACHE = new URL('./tecdoc_cache/', import.meta.url); mkdirSync(CACHE, { recursive: true })

async function call(input, name) {
  const r = await fetch(`https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${TOKEN}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  const data = await r.json()
  writeFileSync(new URL(`./tecdoc_cache/${name}.json`, import.meta.url), JSON.stringify(data, null, 2))
  return data
}

// 1) SUPPLIERS
console.log('== suppliers ==')
const sup = await call({ endpoint_partsListAllSuppliers: true }, 'suppliers')
// normaliza: pode vir [{suppliers:[...]}] ou [...]
let lista = Array.isArray(sup) ? sup : [sup]
if (lista[0] && lista[0].suppliers) lista = lista[0].suppliers
const arr = Array.isArray(lista) ? lista : []
console.log('total suppliers:', arr.length)
const alvo = /tecfil|wega|vox|fte|continental|contitech|mahle|fram|bosch|nakata/i
const achados = arr.filter(s => alvo.test(JSON.stringify(s)))
console.log('marcas de interesse encontradas:')
for (const s of achados) console.log('  ', JSON.stringify(s).slice(0, 120))
if (!achados.length) console.log('  (nenhuma das marcas-alvo na lista de suppliers)')

// 2) COUNTRIES (achar Brasil)
console.log('\n== countries (Brasil) ==')
const co = await call({ endpoint_langGetAllCountries: true }, 'countries')
let cl = Array.isArray(co) ? co : [co]
if (cl[0] && cl[0].countries) cl = cl[0].countries
const carr = Array.isArray(cl) ? cl : []
console.log('total countries:', carr.length)
for (const c of carr.filter(c => /bra[sz]il/i.test(JSON.stringify(c)))) console.log('  BR:', JSON.stringify(c).slice(0, 120))

console.log('\n(salvo em scripts/tecdoc_cache/. Próximo: buscar artigo por código+supplierId.)')
