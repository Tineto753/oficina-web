// Combinador de catálogos: descobre os "veículos compatíveis" (aplicações) de
// cada peça buscando pelo CÓDIGO em VÁRIAS marcas, por trás de UMA função só.
// Cada marca é um adaptador dono do próprio protocolo (a realidade é heterogênea:
// Tecfil serve HTML SSR; WEGA só tem PDF/exe; outras a confirmar).
//
//   node scripts/aplicacoes_catalogo.mjs --probe Tecfil ART6098  -> testa 1 código, imprime as aplicações
//   node scripts/aplicacoes_catalogo.mjs                         -> DRY-RUN: roda todos os códigos do estoque (não grava)
//   node scripts/aplicacoes_catalogo.mjs --apply                 -> grava em peca_aplicacoes (EXIGE migration 003b)
//
// Estado dos adaptadores:
//   Tecfil      OK   — HTTP GET /search/<cod> (Next.js SSR), parser pronto
//   WEGA        PDF  — sem catálogo web; dados só em PDF/instalador .exe (parsear PDF à parte)
//   Continental pend — catálogo a sondar
//   FTE         pend — catálogo a sondar
//   VOX         pend — catálogo a sondar
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const XLSX_PATH = '/home/argo/Área de trabalho/Estoque Auto Almeida.xlsx'
const CACHE = new URL('./aplicacoes_cache/', import.meta.url)
mkdirSync(CACHE, { recursive: true })
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; AutoAlmeida-catalogo/1.0)' }

// Texto limpo de um trecho de HTML.
const unesc = s => String(s || '').replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim()

// Faixa de ano a partir de texto livre. fim=null => "em diante".
export function parseAnos(txt) {
  const s = String(txt || '')
  const anos = [...s.matchAll(/\b(19|20)\d{2}\b/g)].map(m => +m[0])
  if (!anos.length) return { ano_ini: null, ano_fim: null }
  const aberto = /\ba\s*\.\.\.|em diante|\ba\s+atual|>\s*$/i.test(s) || anos.length === 1
  return { ano_ini: anos[0], ano_fim: aberto ? null : anos[anos.length - 1] }
}

// ---------------------------------------------------------------------------
// Parser Tecfil: monta linhas {montadora, modelo, motor/versão, ano} do HTML SSR.
export function parseTecfil(html) {
  const marks = []
  for (const m of html.matchAll(/data-fabricante="([^"]+)"/g)) marks.push({ i: m.index, tipo: 'fab', val: m[1] })
  for (const m of html.matchAll(/DescricaoAplicacao">([\s\S]*?)<\/span>/g)) marks.push({ i: m.index, tipo: 'modelo', val: unesc(m[1]), end: m.index + m[0].length })
  marks.sort((a, b) => a.i - b.i)
  const out = []
  let montadora = ''
  for (let k = 0; k < marks.length; k++) {
    const mk = marks[k]
    if (mk.tipo === 'fab') { montadora = mk.val; continue }
    if (!mk.val) continue
    const prox = marks[k + 1]?.i ?? Math.min(mk.end + 1500, html.length)
    const comps = [...html.slice(mk.end, prox).matchAll(/ComplementoAplicacao3_[0-9]+[^>]*>([\s\S]*?)<\/span>/g)].map(c => unesc(c[1])).filter(Boolean)
    const raw = [montadora, mk.val, ...comps].filter(Boolean).join(' ')
    const { ano_ini, ano_fim } = parseAnos(comps.join(' '))
    // motor = primeiro complemento com jeito de cilindrada (1.6, 2.0, TDI, 8V…)
    const motor = comps.find(c => /\d\.\d|\d+\s?v\b|tdi|tsi|flex/i.test(c)) || ''
    out.push({ marca_carro: montadora, modelo: mk.val, motor, ano_ini, ano_fim, raw, fonte: 'tecfil' })
  }
  return out
}

// ---------------------------------------------------------------------------
// ADAPTADORES — cada um: async buscar(codigo) -> { status, aplicacoes[] }
const norm = s => String(s || '').trim().toUpperCase().replace(/\s+/g, '')

async function fetchCache(url, cacheKey) {
  const f = new URL(`./aplicacoes_cache/${cacheKey}.html`, import.meta.url)
  if (existsSync(f)) return readFileSync(f, 'utf8')
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`http-${r.status}`)
  const t = await r.text()
  writeFileSync(f, t)
  return t
}

const ADAPTADORES = {
  Tecfil: {
    async buscar(codigo) {
      let html
      try { html = await fetchCache(`https://catalogo.tecfil.com.br/search/${encodeURIComponent(codigo)}`, `TECFIL_${norm(codigo)}`) }
      catch (e) { return { status: String(e.message), aplicacoes: [] } }
      return { status: 'ok', aplicacoes: parseTecfil(html) }
    },
  },
  WEGA: { async buscar() { return { status: 'pdf-sem-api', aplicacoes: [] } } },       // dados só em PDF/instalador
  Continental: { async buscar() { return { status: 'pendente', aplicacoes: [] } } },
  FTE: { async buscar() { return { status: 'pendente', aplicacoes: [] } } },
  VOX: { async buscar() { return { status: 'pendente', aplicacoes: [] } } },
}

function adaptadorDe(marca) {
  const k = Object.keys(ADAPTADORES).find(x => norm(x) === norm(marca))
  return k ? { nome: k, ...ADAPTADORES[k] } : null
}

// FUNÇÃO UNIFICADA que combina todas as endpoints.
export async function buscarAplicacoes(codigo, marca) {
  const ad = adaptadorDe(marca)
  if (!ad) return { status: 'sem-adaptador', marca, aplicacoes: [] }
  const r = await ad.buscar(codigo)
  return { marca: ad.nome, ...r, aplicacoes: r.aplicacoes.map(a => ({ ...a, servico_codigo: codigo })) }
}

// ---------------------------------------------------------------------------
function codigosDoEstoque() {
  const wb = XLSX.read(readFileSync(XLSX_PATH), { type: 'buffer' })
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
  const seen = new Map()
  let cod = '', marca = '', nome = ''
  for (const r of rows) {
    const c = String(r['Cod.'] || '').trim()
    if (c) { cod = c; marca = String(r['Marca da peça'] || '').trim(); nome = String(r['Nome'] || '').trim() }
    if (cod && !seen.has(cod)) seen.set(cod, { codigo: cod, marca, nome })
  }
  return [...seen.values()]
}

// ---------------------------------------------------------------------------
const args = process.argv.slice(2)
if (args[0] === '--probe') {
  const [, marca, codigo] = args
  const r = await buscarAplicacoes(codigo, marca)
  console.log(`[${r.marca}] ${codigo} -> status=${r.status} | ${r.aplicacoes.length} aplicações`)
  for (const a of r.aplicacoes) console.log(`  ${(a.marca_carro||'').padEnd(12)} | ${(a.modelo||'').padEnd(16)} | ${(a.ano_ini||'?')+'-'+(a.ano_fim ?? '...')} | ${a.motor}`)
  process.exit(0)
}

const APPLY = args.includes('--apply')
const itens = codigosDoEstoque()
console.log(`\n===== APLICAÇÕES via catálogo — ${itens.length} peças (${APPLY ? 'APPLY' : 'DRY-RUN'}) =====`)
const porStatus = {}, todas = []
for (const it of itens) {
  const res = await buscarAplicacoes(it.codigo, it.marca)
  porStatus[res.status] = (porStatus[res.status] || 0) + 1
  if (res.aplicacoes.length) { todas.push(...res.aplicacoes); console.log(`  ${it.marca.padEnd(12)} ${it.codigo.padEnd(12)} -> ${res.aplicacoes.length} aplicações`) }
}
console.log('\n--- por status ---')
for (const [s, n] of Object.entries(porStatus)) console.log(`  ${s.padEnd(16)} ${n}`)
console.log(`total de aplicações: ${todas.length}`)

if (!APPLY) {
  console.log('\n(DRY-RUN — nada gravado. Sonde as marcas pendentes, depois --apply com a 003b aplicada.)')
} else {
  const src = readFileSync(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
  const URL_ = src.match(/supabaseUrl\s*=\s*'([^']+)'/)[1]
  const KEY = src.match(/supabaseKey\s*=\s*'([^']+)'/)[1]
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
  const servicos = await (await fetch(`${URL_}/rest/v1/servicos?select=id,codigo&tipo_servico=eq.peca`, { headers: H })).json()
  const idPorCod = new Map((servicos || []).filter(s => s.codigo).map(s => [norm(s.codigo), s.id]))
  let ok = 0, semServico = 0, err = 0
  for (const a of todas) {
    const servico_id = idPorCod.get(norm(a.servico_codigo))
    if (!servico_id) { semServico++; continue }
    const body = { servico_id, marca_carro: a.marca_carro, modelo: a.modelo, motor: a.motor, ano_ini: a.ano_ini, ano_fim: a.ano_fim, raw: a.raw, fonte: a.fonte }
    const r = await fetch(`${URL_}/rest/v1/peca_aplicacoes`, { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(body) })
    if (r.ok) ok++; else { err++; if (err <= 2) console.log('erro:', r.status, await r.text()) }
  }
  console.log(`\ngravados: ${ok} | sem servico casado (falta servicos.codigo/003b): ${semServico} | erros: ${err}`)
}
