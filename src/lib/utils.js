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
