-- Backfill de ordens_servico.concluida_em em OS já concluídas.
-- Rodar no SQL Editor do Supabase.
--
-- Motivo: o Dashboard passou a reconhecer faturamento pela data de conclusão,
-- filtrando `concluida_em` no servidor (antes o filtro era client-side e caía
-- para aberta_em/created_at quando concluida_em era null). Registros legados
-- concluídos antes do campo existir ficariam fora de qualquer período.
--
-- Rode a PARTE 1 primeiro. Se o count for 0, nada a fazer — não rode a PARTE 2.
--
-- VERIFICADO EM 21/07/2026 (via REST, chave anon):
--   OS concluídas sem concluida_em ... 0
--   OS concluídas no total .......... 205
-- Ou seja: nenhum registro legado, a PARTE 2 é desnecessária neste banco.
-- O arquivo fica como diagnóstico para outros ambientes/restores.

-- ── PARTE 1: diagnóstico ──────────────────────────────────────────────────
-- Quantas OS concluídas estão sem data de conclusão, e de quando são.
select
  count(*)                                              as os_sem_concluida_em,
  count(*) filter (where aberta_em is not null)         as tem_aberta_em,
  count(*) filter (where aberta_em is null)             as so_tem_created_at,
  min(coalesce(aberta_em, created_at))                  as mais_antiga,
  max(coalesce(aberta_em, created_at))                  as mais_recente,
  sum(coalesce(valor_total, 0))                         as valor_total_afetado
from ordens_servico
where status = 'concluida'
  and concluida_em is null;

-- ── PARTE 2: correção ─────────────────────────────────────────────────────
-- Só execute se a PARTE 1 retornou os_sem_concluida_em > 0.
-- Usa a data de entrada da OS (ou o created_at) como aproximação da conclusão:
-- é a melhor informação disponível para esses registros.
--
-- begin;
--
-- update ordens_servico
--    set concluida_em = coalesce(aberta_em, created_at)
--  where status = 'concluida'
--    and concluida_em is null;
--
-- -- Confirme que zerou antes do commit:
-- select count(*) as restantes
--   from ordens_servico
--  where status = 'concluida' and concluida_em is null;
--
-- commit;

-- ── PARTE 3: verificação pós-correção ─────────────────────────────────────
-- O faturamento por mês agora deve bater com o Dashboard.
-- select date_trunc('month', concluida_em) as mes,
--        count(*) as os,
--        sum(coalesce(valor_total, 0)) as faturamento
--   from ordens_servico
--  where status = 'concluida'
--  group by 1
--  order by 1 desc
--  limit 12;
