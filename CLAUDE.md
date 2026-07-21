# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Documentação do projeto Auto Almeida para uso com IA assistente.
> Atualizado em: junho/2026

---

## 0. Comandos

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # build de produção em dist/
npm run preview   # serve o build de produção localmente
npm run lint      # ESLint sobre todo o projeto
netlify deploy --prod   # deploy manual de fallback (normalmente é automático — ver §7)
```

- Não há suíte de testes — `lint` é o único gate automatizado.
- ESLint usa `no-unused-vars` com `varsIgnorePattern: '^[A-Z_]'` (nomes começando com maiúscula ou `_` são ignorados).
- Alias de import `@/` aponta para `src/` (configurado em `vite.config.js` e `jsconfig.json`).

---

## 1. Visão Geral

Sistema web de gestão para oficina mecânica **Auto Almeida** — digitaliza o fluxo desde o cadastro do cliente até o encerramento da OS. MVP em produção no Netlify.

**Stack:** React + Vite, Supabase (PostgreSQL), Netlify, SheetJS para exportação Excel.

**APIs externas:**
- ViaCEP — preenchimento automático de endereço por CEP
- `fipe.parallelum.com.br/api/v2` — catálogo de marcas e modelos de veículos

---

## 2. Estilização

**Padrão de estilo usado em todas as páginas:** objeto `S` com inline styles via variáveis CSS, **não** classes Tailwind no JSX.

```jsx
// Padrão correto — inline styles com CSS vars
const S = {
  btnPrimary: { background: 'var(--accent)', color: '#fff', ... },
  input: { background: 'var(--bg-card)', border: '1px solid var(--border)', ... },
}
<button style={S.btnPrimary}>Salvar</button>
```

`cn()` e classes Tailwind estão disponíveis (`src/lib/utils.js`, `components/ui/`) mas **não são usados nas páginas** — mantidos como fallback dos componentes shadcn legados.

**Fontes:** `Syne` (títulos/labels) e `DM Sans` (corpo/inputs), carregadas via Google Fonts.

**Variáveis CSS de tema** (definidas em `index.css`, alternadas via `data-theme` no `<html>`):

| variável | light | dark |
|---|---|---|
| `--bg` | #f7f6f3 | #141412 |
| `--bg-card` | #ffffff | #1e1d1b |
| `--bg-subtle` | #f0ede8 | #252320 |
| `--border` | #e2ddd7 | #2e2c28 |
| `--text` | #1a1917 | #f0ede8 |
| `--text-muted` | #6b6560 | #9a9289 |
| `--accent` | #c17f24 | #d4922e |
| `--success` | #2d7a4f | #3d9e68 |
| `--danger` | #c0392b | #e05545 |
| `--nav-bg` | #1a1917 | #0f0e0d |

Toggle dark/light persiste via `localStorage` key `tema`.

---

## 3. Roteamento

Definido em `App.jsx` com React Router. A `<Navbar>` é global e inclui o botão "↓ Exportar" (chama `exportarPlanilha()` de `src/lib/exportar.js`).

| rota | página |
|---|---|
| `/` | Clientes |
| `/servicos` | Servicos |
| `/estoque` | Estoque |
| `/fornecedores` | Fornecedores |
| `/os` | OrdemServico (listagem) |
| `/os/nova` | NovaOS |
| `/historico` | Historico |
| `/agenda` | Agenda |
| `/dashboard` | Dashboard |
| `/configuracoes` | Configuracoes |

---

## 4. Banco de Dados (Supabase)

Credenciais hardcoded em `src/lib/supabase.js:3-4`. Migrar para `.env` (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) antes de tornar o repositório público.

### Diagrama de relacionamentos

```
configuracoes (isolada)

marcas → modelos → veiculos → km_registros
                            → ordens_servico → os_servicos → servicos
                                                           → fornecedores (nullable, só peças)
clientes → veiculos

agendamentos → clientes (opcional)
             → ordens_servico (opcional)
```

### Tabelas principais

**`clientes`** — soft delete via `ativo`. Endereço preenchido automaticamente por ViaCEP ao sair do campo CEP.

**`marcas` / `modelos`** — populadas lazy via API FIPE: marcas na primeira abertura do modal de veículo; modelos ao selecionar a marca. Suportam adição manual ("+ Nova marca" / "+ Novo modelo").

**`veiculos`** — `placa` sempre uppercase sem traço (7 chars). `chassi` foi adicionado via `ALTER TABLE` após criação inicial — incluir em novos ambientes.

**`ordens_servico`** — campo `status`: `orcamento`, `aberta`, `concluida`, `expirado`, `cancelado`. `valor_total` é desnormalizado (soma dos `os_servicos`) — recalculado na edição da OS e no toggle de devolução. `data_solicitada` = data/hora que o cliente pediu para entregar; é lida pela Agenda para montar entregas pendentes. `previsao_entrega` é legado ignorado pela aplicação atual — não usar.

**`os_servicos`** — `unique (os_id, servico_id)`. Campo `fornecedor_id` só aparece na UI quando `servicos.tipo_servico='peca'`. Campo `devolvido`: quando `true`, o item some de todas as visões exceto o Dashboard (onde aparece riscado/cinza com badge DEVOLVIDO e botão "↺ Desfazer"). O toggle de devolução recalcula `ordens_servico.valor_total`.

**`servicos`** — `tipo_servico`: `servico`, `peca`, ou `terceirizado`. Controla a visibilidade do campo fornecedor na UI. **Estoque (só peças):** `controla_estoque` (opt-in), `estoque` (saldo), `custo`, `estoque_minimo` (alerta). Gerenciados na edição da peça em Serviços e na aba **Estoque**.

**`fornecedores`** — `nome`, `telefone`, `ativo`. Flag `eh_estoque`: o fornecedor **"Auto Almeida"** (`eh_estoque=true`) representa o **estoque interno**. Quando uma peça da OS tem esse fornecedor, ela saiu do estoque → baixa automática na conclusão da OS (ver §5).

**`agendamentos`** — a aplicação só grava `tipo='agendamento_cliente'`. Registros legados com outros tipos (`entrega_servico`, `outro`) existem no banco mas são filtrados em `fetchEventos`. Entregas pendentes vêm de `ordens_servico.data_solicitada`, não desta tabela.

**`configuracoes`** — chave/valor. Seed: `validade_orcamento_dias = '30'`.

---

## 5. Padrões Arquiteturais Importantes

### Filtro de itens devolvidos
`devolvido=false` deve ser aplicado em **toda** tela que liste `os_servicos`. Atualmente aplicado:
- `OrdemServico.fetchItens` — server-side (filtro no select do Supabase)
- `Historico` e `exportar.js` — client-side (porque o select usa embed/join)

### Agenda: duas fontes de eventos
`Agenda.jsx:fetchEventos` monta a grade combinando:
1. `agendamentos` com `tipo='agendamento_cliente'` no período
2. `ordens_servico` com `data_solicitada` não-nula e status `aberta`/`orcamento` → "evento virtual" de entrega (renderizado em verde)

Click em entrega → navega para `/os` com `state.abrirOsId` + `state.abrirStatus`. `OrdemServico` lê esse state para abrir o modal direto.

### Comunicação entre páginas
Feita via React Router `state` (sem contexto global ou store). Exemplo: Agenda → OrdemServico via `navigate('/os', { state: { abrirOsId, abrirStatus } })`.

### Inline "+ criar" em formulários
Em `NovaOS.jsx` e na edição de OS em `OrdemServico.jsx`, há botões inline para criar serviço e fornecedor sem sair da tela. O modal pequeno insere o novo registro e já seleciona no campo.

### Edição de itens em OS aberta
No modo Editar de `OrdemServico.jsx` (botão "Editar" no modal da OS), cada item da tabela `itensEdit` tem `quantidade` e `preco_cobrado` editáveis inline — vale para os três tipos (`servico`, `peca`, `terceirizado`). `salvarEdicao()` faz três operações em `os_servicos`: `update` dos itens existentes (grava `quantidade`/`preco_cobrado`), `insert` dos novos e `delete` dos removidos; depois recalcula e grava `ordens_servico.valor_total`.

### Baixa de estoque por fornecedor "Auto Almeida"
O estoque só é usado quando **sinalizado por item**: a peça da OS cujo fornecedor é o "Auto Almeida" (`fornecedores.eh_estoque=true`) saiu do estoque interno. `OrdemServico.baixarEstoque()` roda na conclusão da OS (ambos os botões: Concluir e Concluir+Imprimir) e decrementa `servicos.estoque` pela `quantidade`, **ignorando itens `devolvido`**. Peças compradas de fornecedor normal ou externalizadas não dão baixa. Entradas/ajustes de saldo são manuais (aba Estoque ou edição da peça em Serviços).

---

## 6. Exportação

`src/lib/exportar.js` — gera `oficina_DD-MM-AAAA.xlsx` com 3 abas: Clientes (ativos), Veículos (ativos + proprietário), OS Concluídas (itens devolvidos filtrados client-side).

---

## 7. Git e Deploy

**Branches:** `main` é a **única branch e o default no GitHub** (o antigo `master`/"primeira versão" foi arquivado na tag `archive/primeira-versao`).

**Commits:** Conventional Commits — `feat(escopo):`, `fix(escopo):`, `style:`, `refactor:`, `chore:`.

**Deploy Netlify:** ⚠️ **AUTOMÁTICO no push para `main`** — `git push origin main` publica em produção na hora (`oficina-web.netlify.app`). **Garanta migrations de banco aplicadas no Supabase ANTES de pushar.** Build manual de fallback: `npm run build && netlify deploy --prod`.
`public/_redirects` com `/* /index.html 200` é obrigatório para o React Router funcionar em produção.

---

## 8. Roadmap

Lista completa de funcionalidades implementadas (✅) e planejadas (🔲) em [`ROADMAP.md`](./ROADMAP.md).
