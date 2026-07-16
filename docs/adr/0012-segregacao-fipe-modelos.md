# 0012 — Segregação dos modelos FIPE (classificação para compatibilidade)

- **Status:** Aceita — **estendida pela [0013](./0013-segregacao-completa-atributos-modelo.md)** (2026-07-16)
- **Data:** 2026-06-19
- **Foco:** dados de veículo (base para compatibilidade de peças)

> **Atenção:** a decisão de deixar câmbio, portas, carroceria, tração e cilindros
> de fora (ver "Decisão") **não vale mais** — a ADR 0013 passou a persistir todos,
> por um motivo que esta ADR não considerou: identificação do carro no cadastro,
> não casamento de peça. `modelo_base` também mudou de significado: agora contém
> só o nome do modelo, com `versao` e `tecnologia` em colunas próprias.

## Contexto

A tabela `modelos` (importada da FIPE, ~3900 linhas) guarda tudo numa string só em `nome`, ex.: `"AIRCROSS Exclusive 1.6 Flex 16V 5p Aut."` — modelo + versão + motor + válvulas + combustível + portas + câmbio misturados. Isso impede cruzar peça↔carro (a aplicação de peça fala em "Gol 1.6 8V", não na string completa da FIPE).

Foi feito um parser (`scripts/segregar_fipe.mjs`, dry-run) que extrai vários atributos. Cobertura medida sobre os 3900:

| Campo | Cobertura |
|---|---|
| motor (1.6) | 95% |
| válvulas (8V/16V) | 61% |
| combustível | 53% |
| modelo_curto | 100% |
| câmbio | 40% |
| portas | 43% |
| carroceria | 20% |
| turbo | 17% |
| tração | 11% |
| cilindros (V6/V8) | 4% |

## Decisão

Persistir em `modelos` o **núcleo que casa peça + turbo**:

- `modelo_base` (texto antes do motor, ex.: "AIRCROSS Exclusive")
- `modelo_curto` (heurística: 1ª palavra, ex.: "AIRCROSS" / "Gol" / "Palio") — é o que casa com a aplicação da peça
- `motor` (cilindrada, ex.: "1.6")
- `valvulas` ("8V"/"16V") — discrimina muita peça de motor
- `combustivel` ("Flex"/"Diesel"/…)
- `turbo` (boolean)

Os demais atributos extraíveis (**câmbio, portas, carroceria, tração, cilindros V6/V8**) **ficam de fora por ora** — baixa cobertura e raramente mudam a peça. O parser já os reconhece; adicioná-los depois é só nova coluna + re-rodar o script. **Porta aberta** registrada aqui para incluí-los quando houver necessidade (ex.: peça que depende de câmbio/carroceria).

`modelo_curto` é heurístico (perde 2ª palavra: "Grand Santa Fé" → "Grand", "C4 Lounge" → "C4"); por isso mantém-se também `modelo_base` para casamento por `ilike`/fuzzy.

## Consequências

- Migration aditiva `migrations/003a_fipe_segregacao.sql` cria as 6 colunas; `scripts/segregar_fipe.mjs --apply` preenche (one-shot, re-rodável).
- Base pronta para a compatibilidade peça↔carro (ADR do catálogo de peças) e para "qual peça serve nesse carro", priorizando marca/modelo em uso.
- ~5% dos modelos sem motor no nome (antigos: "Silverado", "Kombi Furgão") ficam com `motor` nulo — aceitável.

## Relacionada
- Catálogo de peças + compatibilidade TecDoc (plano `golden-noodling-stardust`): consome `modelo_curto`/`motor`/`valvulas` para casar aplicações.
