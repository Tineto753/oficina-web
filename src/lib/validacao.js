// Sanitização leniente de preenchimento: limpa erros comuns de digitação
// SEM forçar campos obrigatórios (dados incompletos são permitidos).

/** Trim + colapsa espaços internos. '  joão   silva ' -> 'joão silva' */
export function limpar(s) {
  return (s ?? '').toString().trim().replace(/\s+/g, ' ')
}

/** Só dígitos. '(11) 99999-8888' -> '11999998888' */
export function soDigitos(s) {
  return (s ?? '').toString().replace(/\D/g, '')
}

/** Valida email só quando preenchido (vazio é válido = opcional). */
export function emailValido(s) {
  const v = limpar(s)
  if (!v) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

/** Texto -> número, ou null se vazio/ inválido (evita NaN no banco). */
export function numeroOuNull(s) {
  const v = (s ?? '').toString().trim()
  if (v === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Número >= 0, ou null se vazio. Negativo vira 0. */
export function naoNegativoOuNull(s) {
  const n = numeroOuNull(s)
  if (n === null) return null
  return n < 0 ? 0 : n
}

/** Limpa o objeto de cliente (campos opcionais; só sanitiza o que vier). */
export function sanitizarCliente(form) {
  return {
    ...form,
    nome_completo: limpar(form.nome_completo),
    cpf_cnpj: limpar(form.cpf_cnpj),
    telefone: limpar(form.telefone),
    email: limpar(form.email).toLowerCase(),
    cep: limpar(form.cep),
    logradouro: limpar(form.logradouro),
    numero: limpar(form.numero),
    complemento: limpar(form.complemento),
    bairro: limpar(form.bairro),
    cidade: limpar(form.cidade),
    uf: limpar(form.uf).toUpperCase().slice(0, 2),
  }
}
