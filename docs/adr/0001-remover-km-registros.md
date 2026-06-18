# 0001 — Remover `km_registros`; o km vive na ordem de serviço

- **Status:** Aceita (execução em 2 fases)
- **Data:** 2026-06-17
- **Foco:** ① integridade / simplificação do modelo

## Contexto

`km_registros` foi pensada como histórico de leituras de hodômetro do veículo (campos `veiculo_id`, `os_id`, `km`, `origem`, `registrado_em`), genérico o bastante para aceitar leituras de várias origens.

Na prática, os dados de produção mostram que ela nunca foi usada como histórico independente:

- 188 ordens · 86 com `km_entrada` · **82 registros, todos `origem='entrada_os'`**.
- Todo registro é apenas um espelho do `km_entrada` de uma OS → **duplicação pura**.
- A duplicação ainda é **furada**: 86 OSs com km, só 82 registros (≈4 leituras perdidas).

Pergunta que decide o caso: *o km é registrado em algum momento que não seja a entrada de uma OS?* Resposta do dono: **não** — na oficina, ninguém anota km fora de uma OS.

Logo, `ordens_servico` já é o histórico de km. A tabela separada só se justificaria com leituras independentes da OS (manual, saída), que não existem no fluxo.

## Decisão

- **Fonte de verdade do km:** `ordens_servico.km_entrada`.
- **Histórico de km:** derivado das OSs do veículo — `SELECT km_entrada FROM ordens_servico WHERE veiculo_id = ? AND km_entrada IS NOT NULL ORDER BY aberta_em DESC`. "Último km" = o mais recente.
- **`km_registros` sai do modelo.**

## Consequências

**Execução em 2 fases** (banco compartilhado com o site antigo):

- **Fase 1 — agora (segura/aditiva):**
  - O front novo **para de usar** `km_registros`: remover a escrita em `api/ordens.ts` (`registrarKmEntrada`, chamada em `criarOS`/`converterOrcamento`) e a leitura em `api/historico.ts` (`kmDoVeiculo`) + o "Último KM" no `HistoricoPage`.
  - "Último km" e histórico passam a derivar das OSs do veículo.
  - A tabela **continua existindo** no banco (o site antigo pode escrever nela). Sem `DROP` ainda.
- **Fase 2 — depois (destrutiva):**
  - Confirmar que o site antigo não usa `km_registros` e então `DROP TABLE km_registros`.

**Positivas:** menos uma tabela e uma fonte de duplicação; menos código; histórico de km vira consulta trivial.

**Negativas / a aceitar:** perde-se a capacidade (não usada) de leituras de km fora da OS. Se um dia a oficina quiser isso (ex.: leitura na saída do serviço, telemetria), reabrir via nova ADR que supere esta.

> Nota: o `km_entrada` é a leitura de **entrada**. Se no futuro quisermos km de **saída**, isso vira um campo na própria OS (`km_saida`), não uma tabela à parte.
