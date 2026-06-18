# 0004 — Integridade: domínios via CHECK, identidade por uuid, numero_os é exibição

- **Status:** Aceita (execução em 2 fases)
- **Data:** 2026-06-17
- **Foco:** ① integridade / enums

## Contexto

Campos de domínio fechado hoje são `text` livre, sem validação. Dados de produção:

- `status` (ordens_servico): `concluida` 161 · `cancelado` 20 · `aberta` 7 (0 orçamentos no momento, mas é valor válido).
- `tipo_pessoa` (clientes): `PF` 131 · `PJ` 2.
- `numero_os`: 188 preenchidos · 0 nulos · 0 duplicados · min 1 · max 1165 (**esparso** — não é sequência densa). O front novo (refatorado) **não preenche** `numero_os`.

`forma_pagamento` (domínio) já é tratado na 0003; `tipo` do catálogo na 0002.

## Decisão

### 1. Domínios via `CHECK`, não enum nativo (princípio geral)

Na Fase 1, todo campo de domínio fechado vira `CHECK (col IN (...))` sobre a coluna `text` existente — **não** tipo `ENUM` nativo. Motivos: não exige converter a coluna (sem reescrita/cast), não quebra o site antigo (que grava `text`), e é fácil de alterar. Enum nativo fica como refinamento opcional de Fase 2.

> Este princípio **refina o mecanismo** citado como "enum" nas ADRs [0002](0002-catalogo-itens-e-itens-da-os.md) (`tipo`) e [0003](0003-pagamentos-e-parcelas.md) (`forma_pagamento`): na execução, ambos são `CHECK`, não enum nativo.

Domínios:
- `ordens_servico.status` ∈ `{aberta, orcamento, concluida, cancelado}`
- `clientes.tipo_pessoa` ∈ `{PF, PJ}`
- (`catalogo_itens.tipo` ∈ `{servico, peca, terceirizado}` — 0002)
- (`pagamentos.forma` ∈ `{dinheiro, pix, debito, credito, crediario}` — 0003)

### 2. Transições de status ficam no app

O banco garante só o **domínio** de valores (CHECK). A **ordem** das transições (orçamento→aberta→concluída) é regra de negócio na camada `api/ordens.ts`. Decisão consciente: o fluxo real **não é linear** — há erros e cancelamentos a qualquer momento — então uma máquina de estados rígida no banco atrapalharia (e brigaria com o site antigo).

### 3. Identidade sempre por `uuid`

A chave/identidade de toda tabela e toda FK é `id uuid` (já é o caso). Nada de usar número de exibição como chave.

### 4. `numero_os` é só exibição

`numero_os` serve **apenas para mostrar no front** ("OS #1165"), nunca como identificador nem FK. Mesmo assim, para a tela ficar consistente:
- auto-atribuído por uma `SEQUENCE` com `DEFAULT nextval(...)`, semeada acima do max atual (≥ 1166), para o front novo não gravar nulo;
- `NOT NULL` + `UNIQUE` (os dados já permitem) só para não repetir/faltar número na visualização.

## Consequências

**Fase 1 — agora (aditiva):**
- Adicionar os `CHECK` de `status` e `tipo_pessoa` (e os de 0002/0003 quando aquelas forem executadas).
- Criar a sequência de `numero_os`, `DEFAULT`, `NOT NULL`, `UNIQUE`.
- Os CHECK validam linhas novas; como os dados atuais já estão no domínio, não há linha a corrigir.

**Riscos / convivência (banco compartilhado):**
- Um `CHECK` passa a **rejeitar** qualquer escrita futura do site antigo fora do domínio. Como os valores observados já batem com o domínio, o risco é baixo — mas se o site antigo gravar um valor inesperado, ele falhará (é o comportamento desejado, mas precisa estar ciente).
- `numero_os`: se o site antigo também atribui número, precisa usar a **mesma** sequência, senão há risco de colisão de `UNIQUE`. Resolver no momento da migration (ex.: apontar o site antigo para a sequência, ou faixa separada).

**Fase 2 (opcional):** migrar os domínios `CHECK` → tipos `ENUM` nativos, se houver ganho.

## Relacionada

- [0002](0002-catalogo-itens-e-itens-da-os.md) e [0003](0003-pagamentos-e-parcelas.md): o mecanismo de domínio delas é `CHECK` (este ADR define o princípio).
- Multiusuário + RLS (foco ④): identidade/posse por `uuid` será a base das políticas RLS.
