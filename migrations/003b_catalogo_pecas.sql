-- Catálogo de peças + compatibilidade (Fase 1). Aditivo. Rodar no SQL Editor.

-- Peça (servicos tipo_servico='peca'): campos de catálogo
alter table servicos add column if not exists codigo             text;
alter table servicos add column if not exists marca_peca         text;
alter table servicos add column if not exists valor              numeric;  -- preço de tabela (custo já existe)
alter table servicos add column if not exists tecdoc_supplier_id text;     -- desambiguar na API

-- Compatibilidade: 1 peça -> N veículos (texto, vem da planilha/TecDoc)
create table if not exists peca_aplicacoes (
  id          uuid primary key default gen_random_uuid(),
  servico_id  uuid not null references servicos(id) on delete cascade,
  marca_carro text,
  modelo      text,
  motor       text,
  ano_ini     int,
  ano_fim     int,
  raw         text,           -- string original
  fonte       text,           -- 'planilha' | 'tecdoc' | 'manual'
  created_at  timestamptz not null default now()
);
create index if not exists idx_peca_aplic_servico on peca_aplicacoes(servico_id);
create index if not exists idx_peca_aplic_marca   on peca_aplicacoes(lower(marca_carro));

-- Categorias controladas (aba config. da planilha)
create table if not exists categorias_peca (
  id uuid primary key default gen_random_uuid(),
  nome text unique not null,
  ativo boolean not null default true
);
insert into categorias_peca (nome) values
 ('Correia'),('Filtros'),('Sensor'),('Juntas'),('Retentores'),('Arrefecimento'),
 ('Injeção'),('Suspensão'),('Lâmpada'),('Utilidade geral'),('Embreagem'),('Motor')
on conflict (nome) do nothing;
