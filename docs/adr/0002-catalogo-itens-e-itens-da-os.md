# 0002 — Catálogo de itens e itens da OS (peças × mão de obra)

- **Status:** Aceita (execução em 2 fases)
- **Data:** 2026-06-17
- **Foco:** ② peças × mão de obra

## Contexto

Os nomes `servicos` e `os_servicos` mentem sobre o conteúdo, e a separação peça × mão de obra **já existe nos dados de produção**, só não está modelada:

- `servicos` (338 linhas) não é catálogo de serviços, é catálogo de **itens**. O campo `tipo_servico` (string) já classifica:
  - `peca` → 232 · `servico` → 97 · `terceirizado` → 9
- Peças em `os_servicos` já vêm com `fornecedor_id` e `quantidade` preenchidos (bateria, fusível, correia...).
- `categoria` é redundante e bagunçada (253 nulos; valores repetem `tipo_servico`: 'Peça', 'Serviços'...).
- `os_servicos` (1083 linhas) é a junção N↔N entre OS e itens do catálogo, carregando os dados da venda (preço cobrado, quantidade, fornecedor, devolução).

Definições acordadas dos tipos:
- **`servico`** — mão de obra própria da oficina.
- **`peca`** — produto/peça (vem de fornecedor; tem custo; estoque é tema à parte).
- **`terceirizado`** — serviço que **a oficina não prestou**; executado por um terceiro (retífica, torneiro, borracheiro), a oficina intermedia/repassa.

Consideramos e **descartamos** guardar os itens como um array JSON na OS: nesta escala join indexado não é mais lento (JSON inclusive piora relatórios), e JSON custaria integridade referencial, agregações de negócio ("faturamento por peça", "peça mais vendida"), updates pontuais e tipagem. Ver discussão no histórico; relatório é o que mata o JSON aqui.

## Decisão

**Renomear e formalizar (sem quebrar em tabelas novas nem re-apontar FKs):**

1. `servicos` → **`catalogo_itens`** — o cardápio: cada serviço/peça/terceirizado definido uma vez.
2. `os_servicos` → **`itens_ordem_servico`** — o que foi usado em cada OS; mantém-se **tabela normalizada** (N↔N), não JSON. Carrega `preco_cobrado`, `quantidade`, `fornecedor_id`, `devolvido`, `devolvido_em`.
3. `tipo_servico` (string) → enum **`tipo`** com 3 valores: `servico | peca | terceirizado`.
4. **`categoria` aposentada** — `tipo` cumpre o papel.
5. `fornecedor_id` é semanticamente válido para `peca` e `terceirizado`, não para `servico` (mão de obra própria).
6. **Estoque/custo de peças fica fora desta ADR** — vira ADR própria.

## Consequências

**Execução em 2 fases** (banco compartilhado com o site antigo):

- **Fase 1 — agora (segura/aditiva):**
  - `ALTER TABLE servicos RENAME TO catalogo_itens;` + `CREATE VIEW servicos AS SELECT * FROM catalogo_itens;`
  - `ALTER TABLE os_servicos RENAME TO itens_ordem_servico;` + `CREATE VIEW os_servicos AS SELECT * FROM itens_ordem_servico;`
  - As views são simples (uma tabela só) → **atualizáveis automaticamente**; o site antigo continua lendo/gravando nos nomes velhos.
  - Criar o enum `tipo_item` e migrar `tipo_servico`. Para não quebrar o site antigo, manter coluna compatível (ex.: `tipo` nova + manter `tipo_servico` sincronizada via coluna gerada/trigger até Fase 2).
  - Front novo passa a usar `catalogo_itens` / `itens_ordem_servico` e o enum `tipo`.
- **Fase 2 — depois (destrutiva, site antigo aposentado):**
  - `DROP VIEW servicos, os_servicos;` · remover `tipo_servico` e `categoria`.

**Positivas:** nomes honestos; peça/serviço/terceirizado formalizado e validável; relatórios por tipo/fornecedor diretos; base pronta pra ADR de estoque.

**Negativas / a aceitar:** durante a Fase 1 convivem nome novo (tabela) e antigo (view) + `tipo`/`tipo_servico` em paralelo — complexidade temporária até o site antigo sair.

## Relacionada

- Estoque/custo de peças: **ADR futura** (depende desta).
- Integridade/enums (foco ①): o enum `tipo` é o primeiro caso; `status`/`forma_pagamento`/`tipo_pessoa` virão em ADR do foco ①.
