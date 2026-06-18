-- Estoque — colunas aditivas (seguras). Rodar no SQL Editor do Supabase.

-- Catálogo (peças): saldo, custo, mínimo e flag de controle.
alter table servicos add column if not exists controla_estoque boolean not null default false;
alter table servicos add column if not exists estoque          numeric not null default 0;
alter table servicos add column if not exists custo            numeric;
alter table servicos add column if not exists estoque_minimo   numeric not null default 0;

-- "Auto Almeida" = fornecedor especial que representa o ESTOQUE interno.
-- Quando uma peça da OS tem esse fornecedor, ela saiu do estoque (baixa na conclusão).
alter table fornecedores add column if not exists eh_estoque boolean not null default false;

-- garante o fornecedor "Auto Almeida" marcado como estoque (idempotente).
insert into fornecedores (nome, eh_estoque, ativo)
select 'Auto Almeida', true, true
where not exists (select 1 from fornecedores where eh_estoque = true);
