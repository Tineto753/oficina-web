# 0006 — Autenticação, papéis (admin/cliente) e RLS

- **Status:** Aceita (execução em 2 fases)
- **Data:** 2026-06-17
- **Foco:** ④ multiusuário + RLS (segurança)

## Contexto

- **Single-tenant**: uma oficina só, com **login por usuário** (não é multi-tenant).
- Papéis no momento: **admin** (a oficina, vê tudo) e **cliente** (cliente final, vê só o que é dele). O **portal do cliente é futuro** — por ora só admin loga; o papel `cliente` já fica modelado.
- **Problema de segurança atual:** o RLS está **desligado**; a chave anon (que vai no bundle) lê/grava tudo, inclusive `clientes` com CPF/CNPJ. Exposição total dos dados.
- **Restrição crítica (banco compartilhado):** o **site antigo** depende do anon aberto (não tem login). Ligar RLS restritivo **quebra o site antigo**.

## Decisão

### Auth e papéis

- **Supabase Auth** para login (usuários em `auth.users`).
- Tabela **`profiles`** ligando usuário → papel:
  ```
  profiles
    id (= auth.users.id) PK/FK · papel (admin|cliente) · cliente_id FK→clientes (só p/ papel=cliente)
  ```
  `cliente_id` amarra o login do cliente final à sua linha em `clientes`.
- `papel` validado por `CHECK` (princípio da [0004](0004-integridade-dominios-e-identidade.md)).

### RLS

- Funções auxiliares SQL: `is_admin()` e `current_cliente_id()` (leem `profiles` por `auth.uid()`), usadas nas policies.
- **admin** → acesso total.
- **cliente** → só as próprias linhas: `clientes` (a dele), `veiculos`/`ordens_servico` (`cliente_id = current_cliente_id()`), `pagamentos`/`notas_fiscais` (via a OS dele).
- Catálogo/`marcas`/`modelos`: leitura para qualquer autenticado (revisável).

## Consequências

**A correção de segurança depende de aposentar o site antigo.** Não há como fechar o buraco in-place sem quebrá-lo. Por isso:

- **Fase 1 — agora:**
  - Criar `profiles`, funções `is_admin()`/`current_cliente_id()` e as policies para o papel `authenticated` (admin agora; `cliente` modelado, portal depois).
  - O app novo passa a logar via Supabase Auth.
  - ⚠️ O acesso **anon continua aberto** (pro site antigo) → **o vazamento persiste** nesta fase.
- **Fase 2 — ao aposentar o site antigo:**
  - Revogar o acesso anon e **ligar o RLS estrito** em todas as tabelas. **Só então o buraco fecha.**

**Recomendação:** tratar a **aposentadoria do site antigo** como prioridade — ela destrava não só a segurança (este ADR) mas também todos os `DROP`s de Fase 2 das ADRs anteriores (colunas/views/tabelas legadas). Candidata a ADR/plano próprio.

**Positivas:** modelo de auth pronto para admin e cliente; RLS desenhado por papel; base para o portal do cliente futuro.

**Negativas / a aceitar:** segurança real só na Fase 2 (gated pelo site antigo); enquanto isso, exposição via anon continua — risco conhecido e assumido temporariamente.

## Relacionada

- [0005](0005-emissao-nfe-nfse.md): a Edge Function usa `service_role` server-side (bypassa RLS); o RLS protege o acesso client.
- **Todas as ADRs**: a Fase 2 de cada uma (drops/strict RLS) está acoplada à aposentadoria do site antigo.
