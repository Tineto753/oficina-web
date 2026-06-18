# Simples Nacional — faixas e config do imposto estimado

> Referência para alimentar o **imposto estimado** ([ADR 0008](adr/0008-imposto-estimado.md)) e revisar quando a oficina mudar de faixa.
> ⚠️ Assume regime **Simples Nacional** *(confirmar — vs Lucro Presumido)*. Valores efetivos dependem da faixa atual.

## Configuração atual (valores para a config)

Situação em **2026-06-17**: RBT12 ≈ **R$600.000/ano** → **faixa 3**.

| Config (`configuracoes`) | Valor | Origem |
|---|---|---|
| `aliquota_servico` | **10,56%** | Anexo III, faixa 3, @600k |
| `aliquota_peca` | **7,19%** | Anexo I, faixa 3, @600k |
| `aliquota_peca_st` | **~4,8%** *(confirmar)* | Anexo I menos fatia de ICMS |
| `buffer_imposto` | a definir (ex.: +1 ponto) | margem de segurança |
| `referencia_fiscal` | "faixa 3 · RBT12 ~600k · 2026-06-17" | rótulo da estimativa |

**Atualizar quando:** mudar de faixa (olhar 1x/ano) ou mudar de regime. Recalcular a efetiva pela fórmula abaixo.

## Como calcular a efetiva

```
efetiva = (RBT12 × alíquota_nominal − dedução) ÷ RBT12
```
`RBT12` = faturamento bruto dos últimos 12 meses. A efetiva **cresce dentro da própria faixa** (no começo da faixa é menor; no teto, maior).

## As 6 faixas (iguais para todos os anexos)

| Faixa | Faturamento acumulado (12 meses) |
|---|---|
| 1 | até R$ 180.000 |
| 2 | R$ 180.000,01 – 360.000 |
| **3** | **R$ 360.000,01 – 720.000** ← atual (~600k) |
| 4 | R$ 720.000,01 – 1.800.000 |
| 5 | R$ 1.800.000,01 – 3.600.000 |
| 6 | R$ 3.600.000,01 – 4.800.000 |

Para oficina interessam só **Anexo I** (peça/comércio) e **Anexo III** (serviço) — dos 5 anexos.

## Anexo I — Peças (comércio)

| Faixa | Nominal | Dedução | Efetiva (no teto) |
|---|---|---|---|
| 1 | 4,00% | — | 4,00% |
| 2 | 7,30% | 5.940 | 5,65% |
| **3** | **9,50%** | **13.860** | **7,58%** (@600k: **7,19%**) |
| 4 | 10,70% | 22.500 | 9,45% |
| 5 | 14,30% | 87.300 | 11,88% |
| 6 | 19,00% | 378.000 | *(confirmar)* |

## Anexo III — Serviços

| Faixa | Nominal | Dedução | Efetiva (no teto) |
|---|---|---|---|
| 1 | 6,00% | — | 6,00% |
| 2 | 11,20% | 9.360 | 8,60% |
| **3** | **13,50%** | **17.640** | **11,05%** (@600k: **10,56%**) |
| 4 | 16,00% | 35.640 | 14,02% |
| 5 | 21,00% | 125.640 | 17,51% |
| 6 | 33,00% | 648.000 | *(confirmar)* |

*(Efetiva da 6ª faixa não verificada — não afeta a situação atual. Faixas 1–5 conferidas.)*

## Mix atual e DAS estimada

Faturamento ~R$600k/ano: **~R$360k peças** + **~R$240k mão de obra**.

| | Base | Alíquota | Imposto/ano |
|---|---|---|---|
| Peças (não-ST) | 360k | 7,19% | ~R$25.900 |
| Peças (se ST) | 360k | ~4,8% | ~R$17.300 |
| Mão de obra | 240k | 10,56% | ~R$25.300 |
| **Total** | | | **~R$51k** (ou ~R$43k se peça ST) |

≈ R$4,3 mil/mês de DAS (ou ~R$3,6 mil se peças ST).

**Implicações** (ver ADR 0008):
- Imposto incide sobre o **faturamento bruto** (600k), não sobre a margem que sobra (~240k).
- Peça revendida no custo paga ~7,2% do próprio bolso → **margem na peça é obrigatória** (preço mínimo sugerido).
- Marcar **ST** corretamente por item vale ~R$9k/ano de diferença → justifica a flag `icms_st`.
