import { formatValor } from './utils'

const LABEL_PGTO = {
  dinheiro: 'Dinheiro', pix: 'Pix', debito: 'Débito', credito: 'Crédito',
  parcelado: 'Parcelado', entrada_parcelado: 'Entrada + Parcelado',
}
const GRUPOS = [
  { key: 'servico',      label: 'Serviços'      },
  { key: 'peca',         label: 'Peças'          },
  { key: 'terceirizado', label: 'Terceirizados'  },
]

/**
 * Gera o HTML completo para impressão de uma OS ou Orçamento.
 * @param {object} p
 * @param {boolean} p.isOrcamento
 * @param {{ nome: string, telefone?: string }} p.cliente
 * @param {{ marca?: string, modelo?: string, placa?: string }} p.veiculo
 * @param {string} p.data          - ISO: data de abertura
 * @param {string} [p.dataSolicitada]
 * @param {number} [p.kmEntrada]
 * @param {Array}  p.itens         - os_servicos com servicos(nome, tipo_servico)
 * @param {number|string} p.total
 * @param {string} [p.formaPagamento]
 * @param {number} [p.parcelas]
 * @param {number} [p.valorEntrada]
 * @param {string} [p.observacoes]
 * @param {string} [p.validadeOrcamento] - ISO
 */
export function gerarHtmlOS(p) {
  const fmt    = (v) => formatValor(v || 0)
  const dataBR = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'

  const itensHtml = GRUPOS.map(g => {
    const gi = (p.itens || []).filter(i => (i.servicos?.tipo_servico || 'servico') === g.key)
    if (!gi.length) return ''
    const rows = gi.map(i => `
      <tr>
        <td>${i.servicos?.nome || ''}</td>
        <td style="text-align:center">${(i.quantidade || 1) > 1 ? `${i.quantidade}×` : ''}</td>
        <td style="text-align:right">R$ ${fmt((i.quantidade || 1) * parseFloat(i.preco_cobrado))}</td>
      </tr>`).join('')
    return `<tr class="grupo-label"><td colspan="3">${g.label}</td></tr>${rows}`
  }).join('')

  const parcNum      = parseInt(p.parcelas || 0)
  const entradaNum   = parseFloat(p.valorEntrada || 0)
  const totalNum     = parseFloat(p.total || 0)
  const valorParcela = parcNum > 0 ? (totalNum - entradaNum) / parcNum : 0

  const pgtoStr = p.formaPagamento
    ? `${LABEL_PGTO[p.formaPagamento] || p.formaPagamento}${p.valorEntrada ? ` · Entrada R$ ${fmt(p.valorEntrada)}` : ''}${parcNum ? ` · ${parcNum}× de R$ ${fmt(valorParcela)}` : ''}`
    : ''

  const rodapeHtml = (pgtoStr || p.observacoes) ? `
    <div class="rodape">
      ${pgtoStr ? `<div class="rodape-item"><div class="rodape-label">Pagamento</div>${pgtoStr}</div>` : ''}
      ${p.observacoes ? `<div class="rodape-item"><div class="rodape-label">Observações</div>${p.observacoes}</div>` : ''}
    </div>` : ''

  const kmStr      = p.kmEntrada ? ` · KM ${Number(p.kmEntrada).toLocaleString('pt-BR')}` : ''
  const dataSolStr = p.dataSolicitada ? `
    <div class="info-block">
      <div class="info-label">Entrega Solicitada</div>
      <div class="info-value">${dataBR(p.dataSolicitada)}</div>
    </div>` : ''
  const validadeStr = p.isOrcamento && p.validadeOrcamento
    ? `<p class="validade">Válido até: <b>${dataBR(p.validadeOrcamento)}</b></p>` : ''

  const nomeVeiculo = [p.veiculo?.marca, p.veiculo?.modelo].filter(Boolean).join(' ') || '—'

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<title>Auto Almeida</title>
<style>
  @page { size: A4; margin: 12mm 15mm 15mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #1a1917; }

  .aviso { background: #fffbe6; border: 1px solid #f0c040; border-radius: 6px; padding: 8px 14px; margin-bottom: 16px; font-size: 11px; color: #6b5000; }
  @media print { .aviso { display: none; } }

  .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; }
  .brand-name { font-family: 'Syne', Arial, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
  .brand-name span { color: #c17f24; }
  .brand-sub { font-size: 10px; color: #999; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
  .doc-badge { font-family: 'Syne', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; border: 2px solid #c17f24; color: #c17f24; padding: 6px 14px; text-transform: uppercase; }
  .divider { height: 3px; background: linear-gradient(to right, #c17f24 30%, #e8e3dd); margin-bottom: 20px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; }
  .info-label { font-family: 'Syne', Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #aaa; margin-bottom: 3px; }
  .info-value { font-size: 13px; font-weight: 500; }
  .info-sub { font-size: 11px; color: #666; margin-top: 1px; }

  .secao-titulo { font-family: 'Syne', Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #c17f24; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e8e3dd; }

  table.servicos { width: 100%; border-collapse: collapse; }
  table.servicos th { font-family: 'Syne', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #aaa; padding: 4px 6px; text-align: left; border-bottom: 1px solid #e8e3dd; }
  table.servicos td { padding: 7px 6px; border-bottom: 1px solid #f0ede8; vertical-align: top; }
  .grupo-label td { font-family: 'Syne', Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #c17f24; background: #fdf9f4; padding: 5px 6px; border-bottom: 1px solid #f0ede8 !important; }
  .total-row td { font-family: 'Syne', Arial, sans-serif; font-weight: 700; font-size: 15px; border-top: 2px solid #1a1917 !important; border-bottom: none !important; padding-top: 10px !important; }
  .total-row td:last-child { color: #c17f24; }

  .rodape { margin-top: 16px; padding-top: 12px; border-top: 1px solid #e8e3dd; display: flex; gap: 32px; flex-wrap: wrap; }
  .rodape-item { font-size: 11px; color: #444; }
  .rodape-label { font-family: 'Syne', Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #aaa; margin-bottom: 3px; }

  .validade { font-size: 11px; color: #888; margin-top: 12px; }

  .assinatura { display: flex; gap: 40px; margin-top: 64px; }
  .assinatura-item { flex: 1; border-top: 1px solid #bbb; padding-top: 8px; text-align: center; font-family: 'Syne', Arial, sans-serif; font-size: 10px; color: #888; letter-spacing: 0.04em; text-transform: uppercase; }
</style></head><body>

<div class="aviso">💡 Para melhor resultado: desmarque <b>"Cabeçalhos e rodapés"</b> no diálogo de impressão.</div>

<div class="header">
  <div>
    <div class="brand-name">AUTO<span>ALMEIDA</span></div>
    <div class="brand-sub">Oficina Mecânica</div>
  </div>
  <div class="doc-badge">${p.isOrcamento ? 'Orçamento' : 'Ordem de Serviço'}</div>
</div>
<div class="divider"></div>

<div class="info-grid">
  <div class="info-block">
    <div class="info-label">Cliente</div>
    <div class="info-value">${p.cliente?.nome || '—'}</div>
    ${p.cliente?.telefone ? `<div class="info-sub">${p.cliente.telefone}</div>` : ''}
  </div>
  <div class="info-block">
    <div class="info-label">Veículo</div>
    <div class="info-value">${nomeVeiculo}</div>
    <div class="info-sub">Placa ${p.veiculo?.placa || '—'}${kmStr}</div>
  </div>
  <div class="info-block">
    <div class="info-label">${p.isOrcamento ? 'Data' : 'Data de Entrada'}</div>
    <div class="info-value">${dataBR(p.data)}</div>
  </div>
  <div class="info-block">
    <div class="info-label">Data de Emissão</div>
    <div class="info-value">${dataBR(new Date().toISOString())}</div>
  </div>
  ${dataSolStr}
</div>

<div class="secao-titulo">Serviços e Peças</div>
<table class="servicos">
  <thead><tr>
    <th>Descrição</th>
    <th style="text-align:center;width:40px">Qtd</th>
    <th style="text-align:right;width:110px">Valor</th>
  </tr></thead>
  <tbody>
    ${itensHtml}
    <tr class="total-row">
      <td>Total</td><td></td>
      <td style="text-align:right">R$ ${fmt(p.total)}</td>
    </tr>
  </tbody>
</table>

${rodapeHtml}
${validadeStr}

<div class="assinatura">
  <div class="assinatura-item">Responsável — Auto Almeida</div>
  <div class="assinatura-item">${p.isOrcamento ? 'Aprovação do Cliente' : 'Recebimento do Cliente'}</div>
</div>

<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script>
</body></html>`
}
