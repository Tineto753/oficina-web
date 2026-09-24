-- 006_pagamentos_lista.sql
-- Pagamento em N formas numa mesma OS (botão "+" na conclusão), cada uma com seu valor.
-- Substitui o par fixo forma_pagamento_2/valor_forma1 da 005.
--
-- Semântica:
--   pagamentos = array JSON de { "forma": <chave>, "valor": <numeric>, "parcelas": <int|null> }
--                chave: dinheiro/pix/debito/credito/parcelado; parcelas só quando forma='parcelado'.
--                A soma dos valores = valor_total da OS.
--   forma_pagamento continua preenchida p/ compatibilidade: a forma da única linha,
--                ou 'misto' quando há mais de uma.
--   Registros antigos ficam com pagamentos NULL e são lidos pelas colunas legadas
--   (forma_pagamento / parcelas / valor_entrada).

ALTER TABLE ordens_servico
  ADD COLUMN IF NOT EXISTS pagamentos jsonb;

-- Migra OS que já usaram o pagamento dividido da 005.
UPDATE ordens_servico
SET pagamentos = jsonb_build_array(
      jsonb_build_object('forma', forma_pagamento,   'valor', valor_forma1,               'parcelas', null),
      jsonb_build_object('forma', forma_pagamento_2, 'valor', valor_total - valor_forma1, 'parcelas', null)
    ),
    forma_pagamento = 'misto'
WHERE forma_pagamento_2 IS NOT NULL AND pagamentos IS NULL;
