import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Aceita "1,50", "1.50", "R$ 1.234,56" → number. Retorna NaN se vazio/inválido.
export function parseValor(v) {
  if (v === null || v === undefined || v === '') return NaN
  const s = String(v).trim().replace(/[^\d,.-]/g, '')
  // Se há vírgula, ela é o decimal (pt-BR). Pontos viram separador de milhar e somem.
  const normalizado = s.includes(',')
    ? s.replace(/\./g, '').replace(',', '.')
    : s
  return parseFloat(normalizado)
}

// Formata número (ou string parseável) como "1.234,56". Vazio/NaN → ''.
export function formatValor(v) {
  const n = typeof v === 'number' ? v : parseValor(v)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Rótulos das formas de pagamento. Fonte única — usado na tela, no histórico,
// na impressão e na exportação.
export const LABEL_PGTO = {
  dinheiro:          'Dinheiro',
  pix:               'Pix',
  debito:            'Débito',
  credito:           'Crédito',
  cartao:            'Cartão',
  parcelado:         'Parcelado',
  entrada_parcelado: 'Entrada + Parcelado',
  misto:             'Misto',
}

// Formas oferecidas em cada linha do pagamento (entrada + parcelado = duas linhas).
export const FORMAS_PGTO = ['dinheiro', 'pix', 'debito', 'credito', 'parcelado']

// Linha de pagamento em edição: valor e parcelas como texto (inputs controlados).
export function novaLinhaPgto(forma = '', valor = '') {
  return { forma, valor, parcelas: '' }
}

// Converte a OS (row do banco) em linhas editáveis. Lê `pagamentos` (006) ou as colunas legadas.
export function linhasPgtoDaOS(o) {
  if (Array.isArray(o?.pagamentos) && o.pagamentos.length) {
    return o.pagamentos.map(p => ({ forma: p.forma || '', valor: formatValor(p.valor), parcelas: p.parcelas ? String(p.parcelas) : '' }))
  }
  if (!o?.forma_pagamento) return [novaLinhaPgto()]
  if (o.forma_pagamento_2) {
    const v1 = parseFloat(o.valor_forma1 || 0)
    return [novaLinhaPgto(o.forma_pagamento, formatValor(v1)), novaLinhaPgto(o.forma_pagamento_2, formatValor(parseFloat(o.valor_total || 0) - v1))]
  }
  if (o.forma_pagamento === 'entrada_parcelado') {
    const entrada = parseFloat(o.valor_entrada || 0)
    return [
      novaLinhaPgto('dinheiro', formatValor(entrada)),
      { forma: 'parcelado', valor: formatValor(parseFloat(o.valor_total || 0) - entrada), parcelas: o.parcelas ? String(o.parcelas) : '' },
    ]
  }
  return [{ forma: o.forma_pagamento, valor: '', parcelas: o.parcelas ? String(o.parcelas) : '' }]
}

// Valor efetivo de cada linha: com uma linha só, ela vale o total da OS.
function valoresLinhas(linhas, total) {
  return linhas.length === 1 ? [total] : linhas.map(l => parseValor(l.valor))
}

// Quanto falta distribuir entre as formas (negativo = passou do total).
export function restantePgto(linhas, total) {
  const soma = valoresLinhas(linhas, total).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0)
  return Math.round((total - soma) * 100) / 100
}

// Retorna a mensagem de erro, ou null se as linhas de pagamento são válidas.
export function validarPgto(linhas, total) {
  if (linhas.some(l => !l.forma)) return 'Informe a forma de pagamento'
  if (linhas.some(l => l.forma === 'parcelado' && !(parseInt(l.parcelas) >= 2))) return 'Informe o nº de parcelas (mínimo 2)'
  if (linhas.length > 1) {
    if (valoresLinhas(linhas, total).some(v => !Number.isFinite(v) || v <= 0)) return 'Informe o valor de cada forma de pagamento'
    const r = restantePgto(linhas, total)
    if (Math.abs(r) >= 0.01) return r > 0 ? `Falta distribuir R$ ${formatValor(r)}` : `A soma passou do total em R$ ${formatValor(-r)}`
  }
  return null
}

// Colunas de ordens_servico a gravar a partir das linhas (já validadas).
export function camposPgto(linhas, total) {
  const valores = valoresLinhas(linhas, total)
  const pagamentos = linhas.map((l, i) => ({
    forma: l.forma,
    valor: Math.round(valores[i] * 100) / 100,
    parcelas: l.forma === 'parcelado' ? parseInt(l.parcelas) : null,
  }))
  const unica = pagamentos.length === 1 ? pagamentos[0] : null
  return {
    pagamentos,
    forma_pagamento: unica ? unica.forma : 'misto',
    parcelas: unica?.parcelas ?? null,
    valor_entrada: null,
    forma_pagamento_2: null,
    valor_forma1: null,
  }
}

// Recebe uma OS (row do banco) e devolve a descrição legível do pagamento.
export function descricaoPagamento(o) {
  if (!o) return ''
  const nome = (k) => LABEL_PGTO[k] || k
  const total = parseFloat(o.valor_total || 0)

  // Formato atual: lista de formas
  if (Array.isArray(o.pagamentos) && o.pagamentos.length) {
    const parc = (p) => p.parcelas ? ` ${p.parcelas}× de R$ ${formatValor(p.valor / p.parcelas)}` : ''
    if (o.pagamentos.length === 1) return nome(o.pagamentos[0].forma) + parc(o.pagamentos[0])
    return o.pagamentos.map(p => `${nome(p.forma)} R$ ${formatValor(p.valor)}${p.parcelas ? ` (${p.parcelas}×)` : ''}`).join(' + ')
  }
  if (!o.forma_pagamento) return ''

  // Legado (005): dividido em duas formas
  if (o.forma_pagamento_2) {
    const v1 = parseFloat(o.valor_forma1 || 0)
    return `${nome(o.forma_pagamento)} R$ ${formatValor(v1)} + ${nome(o.forma_pagamento_2)} R$ ${formatValor(total - v1)}`
  }

  // Legado: parcelado / entrada + parcelado
  const entrada = parseFloat(o.valor_entrada || 0)
  const parc = parseInt(o.parcelas || 0)
  const valorParcela = parc > 0 ? (total - entrada) / parc : 0
  let s = nome(o.forma_pagamento)
  if (o.valor_entrada) s += ` · Entrada R$ ${formatValor(entrada)}`
  if (parc) s += ` · ${parc}× de R$ ${formatValor(valorParcela)}`
  return s
}
