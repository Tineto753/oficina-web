# 0009 — Item da OS: faturado pela oficina × externalizado

- **Status:** Aceita
- **Data:** 2026-06-17
- **Foco:** faturamento / itens (complementa 0002; refina 0005 e 0008)

## Contexto

Peça numa OS pode entrar por **dois fluxos** diferentes:

- **Revenda da oficina:** a oficina compra e cobra a peça; **o dinheiro entra no caixa** → é faturamento → gera NF-e → conta na DAS.
- **Externalizada:** o **cliente paga direto na autopeça** (o fornecedor fatura no nome do cliente); **o dinheiro não passa pela oficina** → **não** é faturamento da oficina.

Hoje o sistema não distingue os dois → o faturamento registrado fica **incorreto** (infla com peças que não entraram no caixa). O dono quer registrar a peça externalizada **para histórico** (qual peça, qual fornecedor), mas marcando que **não entrou dinheiro**.

Legitimidade: isso só é válido enquanto for **verdade** — o dinheiro realmente não passou pela oficina e o fornecedor faturou no cliente. O marcador reflete o que ocorreu; não é mecanismo para tirar do faturamento algo que entrou no caixa (isso seria sonegação).

## Decisão

Campo **`faturado_por`** em `itens_ordem_servico`:

```
faturado_por (enum via CHECK — princípio da 0004):
  • oficina         (default) → entra no faturamento · gera NF-e · conta na DAS · imposto estimado
  • cliente_direto            → registra peça + fornecedor SÓ p/ histórico;
                                NÃO entra no faturamento · NÃO gera NF-e da oficina · NÃO conta na DAS
```

- `fornecedor_id` (já existe) é usado nos dois casos.
- Item `cliente_direto` pode guardar `valor` (opcional, p/ histórico/orçamento ao cliente), mas ele é **excluído** de qualquer soma de faturamento.

## Consequências

- **Aditivo** (1 coluna + CHECK) → seguro no banco compartilhado.
- **Derivações passam a filtrar por `faturado_por='oficina'`:**
  - `faturamento_oficina(OS)` = Σ itens da oficina (corrige a base).
  - **NF-e** (0005): inclui só peças da oficina.
  - **Imposto estimado** (0008): incide só sobre itens da oficina.
  - **Relatório de faturamento (DAS):** soma só o que entrou → declaração correta (nem a mais, nem a menos).
- **Histórico do veículo** continua completo (mostra peça + fornecedor, inclusive externalizada).
- **UI:** ao adicionar item, opção "cliente pagou direto no fornecedor".

## Relacionada

- [0002](0002-catalogo-itens-e-itens-da-os.md): o item ganha `faturado_por` junto dos campos fiscais.
- [0005](0005-emissao-nfe-nfse.md): só item `oficina` gera NF-e.
- [0008](0008-imposto-estimado.md): imposto só sobre itens `oficina`.
- **Pendente (outra direção):** captura de venda rápida/avulsa (serviço de caixa que não vira OS) para o faturamento não ficar subestimado — tema de ADR própria.
