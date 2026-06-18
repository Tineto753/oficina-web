# 0008 — Imposto estimado por OS

- **Status:** Aceita
- **Data:** 2026-06-17
- **Foco:** precificação / apoio fiscal (complementa 0002)

## Contexto

No Simples Nacional o imposto incide sobre o **faturamento** (não o lucro) e é **"por dentro"** (embutido no preço, não somado ao cliente). A oficina fatura ~R$80k/mês (RBT12 ≈ R$960k → **faixa 4**), com alíquotas efetivas atuais ~**8,36%** (peça, Anexo I) e ~**12,29%** (serviço, Anexo III). Vender peça a custo dá prejuízo (paga-se imposto sobre a receita).

O dono quer ver o **imposto estimado por OS** e precificar para cobri-lo. Como a [ADR 0002](0002-catalogo-itens-e-itens-da-os.md) separa peça/serviço, dá para estimar por tipo. Recurso **não depende** de certificado/inscrições/gateway → construível já.

## Decisão

**Estimar o imposto de cada OS** somando por tipo de item:

```
imposto_estimado = Σ(serviços)     × aliquota_servico
                 + Σ(peças não-ST) × aliquota_peca
                 + Σ(peças ST)     × aliquota_peca_st
```

1. **Alíquotas efetivas configuráveis** (não calculadas), em `configuracoes`: `aliquota_servico`, `aliquota_peca`, `aliquota_peca_st`. O operador preenche a efetiva atual (ex.: 12,29 / 8,36 / 5,6) e atualiza ao mudar de faixa.
   - **Agnóstico de regime:** funciona para Simples ou Lucro Presumido — basta pôr a % efetiva real. Remove a dependência de decidir o regime no sistema.
2. **ST por item:** `catalogo_itens.icms_st` (boolean) decide se a peça usa `aliquota_peca_st`.
3. **Cálculo no domínio** (helper em `api/`, ex. `estimarImposto(itens)`), sobre os itens da OS.
4. **Salvaguardas (é estimativa, não a DAS):**
   - rótulo explícito "imposto estimado" + a referência assumida (ex.: "faixa 4 / atualizado em mm/aaaa") visível.
   - **margem de segurança** configurável (`buffer_imposto`, ex. +1 ponto) para nunca subprecificar.
5. **Bônus — preço mínimo sugerido** ao adicionar peça: `preço_mín = (custo × (1 + margem)) ÷ (1 − alíquota)`.

## Consequências

- Aditivo e desbloqueado: 3 configs + 1 flag por item + cálculo/leitura. Sem pré-requisito fiscal.
- Aparece na tela da OS (imposto estimado, quebrado em peça/serviço) e ao adicionar peça (preço mínimo).
- **Precisão:** boa (~±1 ponto) **se** as alíquotas refletirem a faixa atual e o ST estiver correto. Erra feio se a faixa mudar e a config não, ou em casos de Anexo V/retenções. Por isso o rótulo + buffer + responsabilidade do operador de manter a config.
- A DAS real é mensal/agregada (faixa progressiva, deduções, retenções) — o estimado é **apoio de precificação**, não documento fiscal.

## Relacionada

- [0002](0002-catalogo-itens-e-itens-da-os.md): o `tipo` do item direciona a alíquota; `icms_st` entra junto dos campos fiscais.
- [0005](0005-emissao-nfe-nfse.md): independente — estimativa não emite nada; a nota real é outra coisa.
- `docs/simples-faixas.md`: tabelas de faixa (Anexo I/III) + os valores atuais da config (faixa 3).
