-- Segregação FIPE (ADR 0012): núcleo + turbo. Aditivo. Rodar no SQL Editor.
alter table modelos add column if not exists modelo_base  text;
alter table modelos add column if not exists modelo_curto text;
alter table modelos add column if not exists motor        text;
alter table modelos add column if not exists valvulas     text;
alter table modelos add column if not exists combustivel  text;
alter table modelos add column if not exists turbo        boolean not null default false;

create index if not exists idx_modelos_modelo_curto on modelos (lower(modelo_curto));
