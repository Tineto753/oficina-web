// PILOTO: valida o TecDoc (Apify) só com os códigos da planilha.
// Uso:  APIFY_TOKEN=xxxx node scripts/pilot_tecdoc.mjs
// (opcional) passar 1 código:  APIFY_TOKEN=xxx node scripts/pilot_tecdoc.mjs "ART6098"
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const XLSX = require('xlsx')
const CACHE = new URL('./tecdoc_cache/', import.meta.url)
mkdirSync(CACHE, { recursive: true })

const TOKEN = process.env.APIFY_TOKEN
if (!TOKEN) { console.error('Faltou APIFY_TOKEN. Ex: APIFY_TOKEN=apify_xxx node scripts/pilot_tecdoc.mjs'); process.exit(1) }

const XLSX_PATH = '/home/argo/Área de trabalho/Estoque Auto Almeida.xlsx'
const ACTOR = 'making-data-meaningful~tecdoc'

// 1) coleta códigos distintos da planilha (coluna "Cod.")
function codigosDaPlanilha() {
  const wb = XLSX.readFile(XLSX_PATH)
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Planilha1'], { defval: '' })
  const set = new Map()
  for (const r of rows) {
    const cod = String(r['Cod.'] || '').trim()
    if (cod) set.set(cod, { codigo: cod, nome: String(r['Nome'] || '').trim(), marca: String(r['Marca da peça'] || '').trim() })
  }
  return [...set.values()]
}

async function tecdocByArticle(articleNo) {
  const input = {
    endpoint_partsCompatibleVehiclesByArticleNo: true,
    parts_typeId_20: 1,
    parts_articleNo_20: articleNo,
    parts_langId_20: 4,        // ajustar p/ PT se houver
    parts_countryFilterId_20: 63,
  }
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${TOKEN}`
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  if (!r.ok) return { erro: `${r.status} ${(await r.text()).slice(0, 200)}` }
  const data = await r.json()
  return { items: Array.isArray(data) ? data : [data] }
}

const arg = process.argv[2]
const lista = arg ? [{ codigo: arg, nome: '(arg)', marca: '' }] : codigosDaPlanilha()
console.log(`Códigos a testar: ${lista.length}\n`)

for (const p of lista) {
  process.stdout.write(`• ${p.codigo}  (${p.nome} / ${p.marca}) ... `)
  const res = await tecdocByArticle(p.codigo)
  if (res.erro) { console.log(`ERRO: ${res.erro}`); continue }
  const n = res.items.length
  const file = new URL(`./tecdoc_cache/${p.codigo.replace(/[^\w.-]+/g, '_')}.json`, import.meta.url)
  writeFileSync(file, JSON.stringify(res.items, null, 2))
  console.log(`${n} resultado(s)  -> salvo`)
  if (n) console.log('   amostra:', JSON.stringify(res.items[0]).slice(0, 400))
}
console.log('\n(piloto: mostra estrutura/cobertura. Sem gravar no banco.)')
