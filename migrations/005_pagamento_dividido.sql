-- 005_pagamento_dividido.sql
-- Pagamento dividido em duas formas numa mesma OS (ex.: parte no Pix, parte no crédito).
--
-- Semântica:
--   forma_pagamento   = 1ª forma (chave: dinheiro/pix/debito/credito/parcelado/entrada_parcelado)
--   forma_pagamento_2 = 2ª forma (mesma chave); NULL quando o pagamento é numa forma só
--   valor_forma1      = valor pago na 1ª forma; o restante (valor_total - valor_forma1) é a 2ª
--
-- Pagamento dividido é identificado por forma_pagamento_2 IS NOT NULL.
-- Registros antigos ficam com as duas colunas NULL => continuam sendo pagamento simples.

ALTER TABLE ordens_servico
  ADD COLUMN IF NOT EXISTS forma_pagamento_2 text,
  ADD COLUMN IF NOT EXISTS valor_forma1      numeric;
