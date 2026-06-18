# 0011 — Fluxo de caixa e dashboard

- **Status:** Aceita
- **Data:** 2026-06-17
- **Foco:** financeiro — consolidação

## Contexto

Com receita (OS + `faturado_por`, 0009), recebimentos/a receber (0003) e saídas (compras + despesas, 0010) modelados, falta **consolidar**: ver o caixa no tempo e os indicadores do negócio. É o fechamento do "financeiro em ordem".

## Decisão

**Fluxo de caixa derivado** das tabelas existentes — sem livro-caixa (ledger) separado, para não duplicar dado:

- **Entradas efetivas:** recebimentos (pagamentos/parcelas da 0003 com `pago_em`), só itens `faturado_por='oficina'` (0009).
- **Saídas efetivas:** `compras` + `despesas` (0010) com `pago_em`.
- **Fluxo de caixa** = entradas − saídas, agregadas por data/período.
- **Movimento avulso de caixa** (sangria, aporte, ajuste): retirada do dono = `despesa` (categoria pró-labore/retirada); se precisar de aporte/ajuste genérico, uma tabela leve `movimentos_caixa` pode entrar depois. Por ora, derivado basta.

### Duas visões
- **Realizado (caixa):** o que de fato entrou/saiu (`pago_em` preenchido).
- **Previsto:** contas a **receber** (parcelas em aberto, 0003) − contas a **pagar** (compras/despesas a vencer, 0010), por vencimento → projeção de saldo.

### Dashboard (indicadores)
- **Faturamento do mês** (receita da oficina) → base da DAS.
- **Imposto estimado** (0008).
- **Recebido × a receber** · **Pago × a pagar**.
- **Saldo de caixa** no período.
- **Ticket médio** (faturamento ÷ nº de OS).
- **Margem** (receita − custo de peças − despesas) — **aproximada** até a ADR de estoque ligar `compras`→custo da peça; antes disso, margem = receita − despesas.

## Consequências

- **Sem tabela nova** (a não ser o `movimentos_caixa` opcional, adiado) → leitura/agregação sobre o que já existe.
- **Admin-only** (0006): todo o financeiro/dashboard é restrito ao papel admin.
- **Margem real** fica completa só quando a ADR de estoque trouxer o custo da peça; até lá, é parcial (sem custo de peça).
- Performance trivial nesse volume; se crescer, cabe um resumo mensal materializado.

## Relacionada

- [0003](0003-pagamentos-e-parcelas.md) recebimentos · [0009](0009-item-faturado-oficina-vs-externalizado.md) o que é faturamento · [0010](0010-contas-a-pagar-compras-e-despesas.md) saídas · [0008](0008-imposto-estimado.md) imposto.
- **ADR de estoque (futura)**: destrava a margem real (custo da peça).
