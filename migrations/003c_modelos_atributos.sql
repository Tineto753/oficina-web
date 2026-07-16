-- Segregação completa dos atributos de `modelos` (estende ADR 0012). Aditivo.
-- Rodar no SQL Editor. Motivo: identificar o carro certo no cadastro — a busca
-- precisa distinguir linhas que só diferem em portas/câmbio, não só casar peça.
--
-- `nome` NÃO é tocado: continua sendo a string crua da FIPE (a fonte), no mesmo
-- padrão do `raw` em peca_aplicacoes (003b). Nada aqui é irreversível.

-- Atributos que o parser já reconhecia mas o ADR 0012 deixou fora ("porta aberta").
alter table modelos add column if not exists cambio      text;   -- Automático | Manual   (39,3%)
alter table modelos add column if not exists portas      text;   -- 2p..5p                (42,2%)
alter table modelos add column if not exists carroceria  text;   -- Sedan|CD|Pick-Up|…    (19,3%)
alter table modelos add column if not exists tracao      text;   -- 4x4|4x2|AWD           (11,2%)
alter table modelos add column if not exists cilindros   text;   -- V6|V8                 (4,0%)

-- Novos: nunca extraídos até aqui.
alter table modelos add column if not exists cv          int;    -- potência              (8,9%)
alter table modelos add column if not exists tecnologia  text;   -- Fire|mpi|MPFI|EVO|…
alter table modelos add column if not exists versao      text;   -- ELX|Tendance|… (texto livre: 1684 distintos)

-- Busca do cadastro: modelo_base limpo + atributos.
create index if not exists idx_modelos_modelo_base on modelos (lower(modelo_base));
create index if not exists idx_modelos_motor       on modelos (motor);
