// Segrega `modelos.nome` da FIPE em atributos (ADR 0012).
// Fonte única da regra: usado no import lazy (Clientes.jsx) e no
// scripts/segregar_fipe.mjs. Alterar aqui muda os dois.

const cap = s => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s)

// Tecnologia de motor. Vocabulário medido sobre os 4087 nomes reais — não
// chute. "Total Flex"/"Hi-Flex" vêm antes de Flex sozinho na ordem da regex.
const TECNOLOGIA = /\b(Total\s?Flex|FlexPower|Hi-?Torque|Hi-?Flex|Pure\s?Tech|MPFI|MPI|SPI|EVO|Fire|Mi)\b/i

const TEC_CANON = {
  totalflex: 'Total Flex', flexpower: 'FlexPower', hitorque: 'Hi-Torque',
  hiflex: 'Hi-Flex', puretech: 'Pure Tech', mpfi: 'MPFI', mpi: 'MPI',
  spi: 'SPI', evo: 'EVO', fire: 'Fire', mi: 'Mi',
}
const normTec = s => TEC_CANON[s.toLowerCase().replace(/[\s-]/g, '')] || s

// Modelos cujo nome tem mais de uma palavra. Sem esta lista, "C4 Lounge" vira
// modelo "C4" + versão "Lounge", que está errado. Não há como derivar isto do
// nome FIPE — só uma lista de referência resolve. Adicionar conforme aparecer.
const COMPOSTOS = [
  'Grand Santa Fé', 'Santa Fé', 'C4 Lounge', 'C4 Cactus', 'C4 Pallas', 'C4 Picasso',
  'Grand Siena', 'Grand Cherokee', 'Land Cruiser', 'Range Rover', 'Pick-Up Corsa',
  'Gran Turismo', 'New Beetle', 'Golf Sportsvan', 'Up!', 'Fiat 500',
  // Volvo escreve a linha XC com espaço ("XC 60"); sem isto vira base "XC".
  'XC 40', 'XC 60', 'XC 90', 'NX 2000',
]
// Mais palavras primeiro: "Grand Santa Fé" tem de ser testado antes de "Santa Fé".
const COMPOSTOS_ORD = [...COMPOSTOS].sort((a, b) => b.split(' ').length - a.split(' ').length)

const semAcento = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Nome do modelo: 1ª palavra do texto antes da cilindrada, salvo composto conhecido.
function extrairModeloBase(texto) {
  const t = (texto || '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  // Casamento por token e sem acento: a FIPE escreve "Santa Fe" e "Santa Fé",
  // e \b não fecha depois de "é" (acento não é word char em ASCII).
  const palavras = t.split(' ')
  for (const c of COMPOSTOS_ORD) {
    const cw = c.split(' ')
    if (cw.length <= palavras.length && cw.every((w, i) => semAcento(w) === semAcento(palavras[i]))) return c
  }
  return palavras[0]
}

// Versão = o que sobra do nome INTEIRO depois de tirar o modelo e todo atributo
// que tem coluna própria. Não dá para olhar só o texto antes da cilindrada: a
// FIPE escreve versão depois do motor com frequência ("Palio 1.0 ECONOMY Fire"),
// e assim o "ECONOMY" se perdia.
function extrairVersao(raw, modelo_base, p) {
  let t = ' ' + raw + ' '
  const fora = s => { if (s) t = t.replace(new RegExp('\\s' + esc(s) + '(?=\\s)', 'i'), ' ') }

  // Multi-palavra primeiro, senão sobram pedaços soltos.
  if (p.tecnologia) t = t.replace(TECNOLOGIA, ' ')
  fora(modelo_base)
  fora(p.carroceria)
  fora(p.motor)
  fora(p.cilindros)
  if (p.valvulas) t = t.replace(/\s(8|10|12|16|20|24)\s?[vV](?=\s)/, ' ')
  if (p.cv) t = t.replace(/\s\d{2,3}\s?cv(?=\s)/i, ' ')
  fora(p.combustivel)
  fora(p.portas)
  fora(p.tracao)
  t = t.replace(/\s(Aut\.?|Mec\.?|Manual|autom[aá]tic\w*|Tiptronic|CVT|Dualogic|Automatizad\w*|DCT|S-?tronic|Powershift|I-?Motion)(?=\s)/gi, ' ')
  t = t.replace(/\s(Turbo|Bi-?TB|TSI|TFSI|TGDI|TDI|TB)(?=\s)/gi, ' ')

  const resto = t.replace(/\s+/g, ' ').trim()
  return resto || null
}

const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Extrai todos os atributos reconhecíveis do nome FIPE.
// Nem todos são persistidos — ver camposModelo() e o ADR 0012.
export function parseModelo(nome) {
  const raw = (nome || '').trim().replace(/\s+/g, ' ')
  const motorM = raw.match(/(\d\.\d)/)                              // cilindrada (pega colado: URBANTECH1.6)
  const motor = motorM ? motorM[1] : null
  const valM = raw.match(/\b(8|10|12|16|20|24)\s?[vV]\b/)           // válvulas
  const valvulas = valM ? valM[1] + 'V' : null
  const cilM = raw.match(/\bV(6|8|10|12)\b/)                        // V6/V8...
  const cilindros = cilM ? 'V' + cilM[1] : null
  const cvM = raw.match(/\b(\d{2,3})\s?cv\b/i)                      // potência (só ~9% dos nomes trazem)
  const cv = cvM ? parseInt(cvM[1], 10) : null
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
  const tecM = raw.match(TECNOLOGIA)
  const tecnologia = tecM ? normTec(tecM[1]) : null
  const modelo_curto = raw.split(' ')[0] || null                    // heurística simples
  // O nome do modelo vem do texto antes da cilindrada; a versão, do nome todo.
  const antesDoMotor = motorM ? raw.slice(0, motorM.index).trim() : raw
  const modelo_base = extrairModeloBase(antesDoMotor)
  const versao = extrairVersao(raw, modelo_base, { tecnologia, carroceria, motor, cilindros, valvulas, cv, combustivel, portas, tracao })
  return { modelo_base, versao, modelo_curto, motor, valvulas, cilindros, cv, combustivel, turbo, tecnologia, cambio, portas, tracao, carroceria }
}

// Tudo que é persistido em `modelos` (migrations 003a + 003c).
// `nome` fica de fora de propósito: é a string crua da FIPE, a fonte de tudo
// isto, e nunca é reescrita.
export function camposModelo(nome) {
  const p = parseModelo(nome)
  return {
    modelo_base: p.modelo_base,
    modelo_curto: p.modelo_curto,
    versao: p.versao,
    motor: p.motor,
    valvulas: p.valvulas,
    cilindros: p.cilindros,
    cv: p.cv,
    combustivel: p.combustivel,
    turbo: p.turbo,
    tecnologia: p.tecnologia,
    cambio: p.cambio,
    portas: p.portas,
    carroceria: p.carroceria,
    tracao: p.tracao,
  }
}

// ---- Entrada manual (cadastro pelo funcionário) ----
// A FIPE manda a string pronta e a gente parseia. Aqui é o contrário: o
// funcionário preenche campo a campo e a gente monta o `nome`. Siglas de
// motor (TSI, GTI, 4x4) não podem virar "Tsi", por isso a exceção abaixo.

const SIGLAS = /^(TSI|TFSI|TDI|TGDI|GTI|GTS|GT|RS|ST|SW|CD|CE|LX|EX|DX|GL|GLS|GLX|XL|XS|XE|SE|LS|LT|LTZ|MT|AT|CVT|4X4|4X2|AWD|4WD|V6|V8|V10|V12|ABS|GNV|TB)$/i

export function tituloCase(s) {
  return (s || '')
    .trim().replace(/\s+/g, ' ')
    .split(' ')
    .map(w => {
      if (SIGLAS.test(w)) return w.toUpperCase()
      if (/\d/.test(w)) return w.toUpperCase()          // 1.6, 16V, 5p, 110cv
      return w[0] ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w
    })
    .join(' ')
}

// Monta o `nome` canônico a partir dos campos preenchidos. Campo vazio some —
// o funcionário nem sempre tem todos, e cadastrar é sempre permitido.
// A ordem imita a da FIPE ("Palio Weekend ELX 1.6 mpi", "C3 Tendance Pure Tech
// 1.2 Flex 12V Mec.") pra o nome novo não destoar dos 4087 importados.
export function montarNome(f = {}) {
  return [
    tituloCase(f.modelo),
    f.carroceria || null,
    f.versao ? f.versao.trim().replace(/\s+/g, ' ') : null,   // sem Title Case: FIPE mistura ELX e Tendance
    f.motor || null,
    f.tecnologia || null,
    f.turbo ? 'Turbo' : null,
    f.combustivel || null,
    f.valvulas ? String(f.valvulas).toUpperCase() : null,
    f.cv ? `${f.cv}cv` : null,
    f.portas || null,
    f.tracao || null,
    f.cambio === 'Automático' ? 'Aut.' : f.cambio === 'Manual' ? 'Mec.' : null,
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

// Campos do formulário -> colunas de `modelos`. O que o funcionário escolheu
// vale mais que o regex: grava direto, sem re-parsear o nome montado.
export function camposDoFormulario(f = {}) {
  const modelo = tituloCase(f.modelo)
  return {
    nome: montarNome(f),
    modelo_base: modelo,
    modelo_curto: modelo.split(' ')[0] || null,
    versao: f.versao ? f.versao.trim().replace(/\s+/g, ' ') : null,
    motor: f.motor || null,
    valvulas: f.valvulas || null,
    cilindros: f.cilindros || null,
    cv: f.cv ? parseInt(f.cv, 10) : null,
    combustivel: f.combustivel || null,
    turbo: !!f.turbo,
    tecnologia: f.tecnologia || null,
    cambio: f.cambio || null,
    portas: f.portas || null,
    carroceria: f.carroceria || null,
    tracao: f.tracao || null,
  }
}

// Opções fixas dos selects do formulário (o resto vem do que já existe no banco).
export const OPCOES = {
  valvulas: ['8V', '10V', '12V', '16V', '20V', '24V'],
  combustivel: ['Flex', 'Gasolina', 'Diesel', 'Álcool', 'GNV', 'Elétrico', 'Híbrido'],
  cambio: ['Manual', 'Automático'],
  portas: ['2p', '3p', '4p', '5p'],
  tracao: ['4x2', '4x4', 'AWD'],
  cilindros: ['V6', 'V8', 'V10', 'V12'],
  tecnologia: Object.values(TEC_CANON),
  carroceria: ['Sedan', 'Hatch', 'Weekend', 'SW', 'Perua', 'Furgão', 'Pick-Up', 'CD', 'CE', 'Chassi', 'Coupé'],
}
