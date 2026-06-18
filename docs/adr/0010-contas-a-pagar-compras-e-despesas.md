# 0010 — Contas a pagar: compras e despesas (separadas)

- **Status:** Aceita
- **Data:** 2026-06-17
- **Foco:** financeiro — saídas

## Contexto

Para "todo o financeiro em ordem" falta o **lado das saídas** (hoje não modelado). São duas naturezas distintas, que o dono quer **separadas**:

- **Compras** — **peças para revenda**, adquiridas de **fornecedores** (notas de entrada). Têm fornecedor e, no futuro, viram **custo da peça** (ADR de estoque).
- **Despesas** — **todo o resto de saída** que não é peça de revenda: fixas (aluguel, salário, luz, água, internet) **e** variáveis/avulsas (**ferramentas/equipamento**, **comida/alimentação da equipe**, material de limpeza…). Têm **categoria** e podem ser **recorrentes** (mensais) ou avulsas.

Ambas compartilham a natureza "conta a pagar" (valor + vencimento + baixa) e alimentam o **fluxo de caixa** (0011).

Não existe venda de balcão — toda **receita** é OS (ver correção em `fluxo-oficina.md`); aqui é só o lado das saídas.

## Decisão

Duas tabelas separadas:

**`compras`**
```
id · fornecedor_id🔗 · descricao · valor · data_compra · vencimento · pago_em
numero_nota (opcional) · observacoes
```
- Itens/custo unitário da peça **ficam para a ADR de estoque** — aqui a compra é registro financeiro (a saída).

**`despesas`**
```
id · categoria · descricao · valor · vencimento · pago_em
recorrente (bool) · dia_vencimento (p/ recorrente) · observacoes
```
- **Categoria**: lista **configurável** (tabela leve `categorias_despesa` ou config) — não enum rígido, para relatório consistente sem travar novos tipos. Ex.: aluguel, salário, luz, água, internet, **ferramentas**, **alimentação**, limpeza.
- **Recorrência**: `recorrente=true` = fixa mensal (aluguel, salário) com `dia_vencimento`, o app gera/lembra a ocorrência do mês; `recorrente=false` = avulsa (uma ferramenta, um almoço).

**Comuns às duas:**
- **Status** = derivado de `pago_em` (`NULL` = a pagar; preenchido = pago). Sem coluna de status redundante.
- **Integridade** (princípio 0004): `valor > 0` (CHECK); categoria validada pela lista.
- **Contas a pagar** = view derivada: `compras ∪ despesas` com `pago_em IS NULL`, ordenado por `vencimento`.
- **RLS** (0006): financeiro é **admin-only** — papel `cliente` nunca vê.

## Consequências

- Aditivo (tabelas novas) → seguro no banco compartilhado.
- Alimenta o **fluxo de caixa** (0011): saídas efetivas = registros com `pago_em` (por data).
- **Contas a pagar** vira uma visão única (compras + despesas a vencer) com alerta de vencimento.
- Base para **custo/margem real**: quando a ADR de estoque ligar compra→peça, dá pra cruzar custo (compras) com receita (itens da OS).
- UI: lançamento de compra (escolhe fornecedor) e de despesa (escolhe categoria, marca recorrente); tela de contas a pagar por vencimento.

## Relacionada

- [0003](0003-pagamentos-e-parcelas.md): contas a **receber** (o espelho deste, no lado das entradas).
- [0006](0006-autenticacao-papeis-e-rls.md): financeiro admin-only.
- **0011 (próxima)**: fluxo de caixa + dashboard consolida entradas − saídas.
- **ADR de estoque (futura)**: liga `compras` → itens/custo de peça.
