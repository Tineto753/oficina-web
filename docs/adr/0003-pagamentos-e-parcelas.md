# 0003 — Pagamentos e parcelas (com integridade)

- **Status:** Aceita (execução em 2 fases)
- **Data:** 2026-06-17
- **Foco:** ③ pagamentos (+ integridade, do foco ①)

## Contexto

Hoje o pagamento vive em colunas soltas na `ordens_servico`: `forma_pagamento` (string), `parcelas` (int), `valor_entrada`, `pago_em`. Os dados de produção mostram dois problemas:

- **`forma_pagamento` está sobrecarregado** — mistura *método* com *arranjo*:
  - métodos: `pix` 54 · `credito` 38 · `debito` 15 · `dinheiro` 10 · `cartao` 2 (legado)
  - arranjos: `parcelado` 38 · `entrada_parcelado` 4 ← não dizem o método; a informação se perde
  - `None` 27 (= as não concluídas)
- **Parcelamento é comum** (41 OSs, ~25%) e **entrada é rara** (4 OSs).

Necessidades confirmadas pelo dono:
- **Vários pagamentos por OS** (split: ex. parte pix, parte dinheiro).
- **Crediário próprio** com controle de parcelas (contas a receber) — além de cartão (onde o banco financia).
- **Travar entrada inválida** no banco (não aceitar pagamento mal preenchido).

JSON foi descartado em 0002 pelos mesmos motivos (integridade, relatórios) — pagamento é transacional e relatório-pesado, então é relacional.

## Decisão

Modelo **OS → pagamentos → parcelas**:

```
ordens_servico (cabeçalho, valor_total)
  └── pagamentos (N por OS)        forma · valor · pago_em · num_parcelas
        └── parcelas (só crediário) numero · valor · vencimento · pago_em
```

- **`pagamentos`** — cada forma usada na OS. `forma` enum (`dinheiro|pix|debito|credito|crediario`), `valor`, `pago_em` (quando quitado à vista; null em crediário), `num_parcelas` (informativo p/ cartão).
- **`parcelas`** — só quando `forma=crediario` (oficina financia). Uma linha por parcela com `vencimento` e `pago_em` (null = em aberto). Cartão parcelado **não** gera parcelas (o banco já pagou); `num_parcelas` é só informativo.
- **`parcela` liga-se ao `pagamento`** (o arranjo de crediário), não direto à OS.
- A **entrada deixa de ser campo especial** → vira só mais um `pagamento` (ex.: dinheiro, pago_em hoje). Resolve o caso "entrada + parcelado" sem coluna dedicada.
- Derivados: `valor_total` da OS = Σ `pagamentos.valor`; "a receber" = Σ `parcelas` com `pago_em IS NULL`.

### Integridade (travar entrada inválida)

Por linha (CHECK/enum no banco):
- `pagamentos.forma` ∈ enum · `pagamentos.valor > 0` · `num_parcelas >= 1`
- `parcelas.valor > 0` · `numero >= 1` · `UNIQUE(pagamento_id, numero)` · `vencimento` NOT NULL

Entre linhas (triggers deferíveis):
- Σ `pagamentos.valor` (por OS) = `ordens_servico.valor_total`
- Σ `parcelas.valor` (por pagamento) = `pagamentos.valor`
- `parcelas` só existem se o pagamento for `forma=crediario`

App valida antes (erro amigável); o banco é a rede de segurança final.

## Consequências

**Fase 1 — agora (aditiva, segura):**
- Criar `pagamentos`, `parcelas`, enum `forma_pagamento`, CHECKs e triggers (só nas tabelas novas → **não afetam o site antigo**).
- **Backfill** das 161 OSs concluídas: 1 `pagamento` por OS a partir de `forma_pagamento`/`valor_total`/`pago_em`. Os valores legados são sujos → exigem **de-para** definido no momento da migration:
  - `cartao` → `credito` (ou decidir caso a caso)
  - `parcelado` / `entrada_parcelado` → método real desconhecido; mapear p/ `crediario` ou marcar p/ revisão manual
- **Regra de convivência:** durante a Fase 1, **um único escritor** (só um site cria OS por vez) para `forma_pagamento` (antigo) e `pagamentos` (novo) não divergirem.
- Front novo passa a ler/gravar via `pagamentos`/`parcelas`.

**Fase 2 — depois (site antigo aposentado):**
- Dropar `forma_pagamento`, `parcelas` (int), `valor_entrada`, `pago_em` da `ordens_servico`; derivar tudo de `pagamentos`.

**Positivas:** split de pagamento, crediário com contas a receber, método e parcelamento separados e limpos, entrada sem caso especial, integridade garantida no banco, relatórios financeiros diretos.

**Negativas / a aceitar:** mais duas tabelas + triggers; backfill com mapeamento manual dos valores legados ambíguos; período de convivência exige disciplina de escritor único.

## Relacionada

- Integridade dos demais campos (`status`, `tipo_pessoa`): **ADR do foco ①** (esta cobre só os campos de pagamento).
- `valor_total` da OS depende dos itens (0002) e é a âncora da soma dos pagamentos.
