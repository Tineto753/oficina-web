# 0013 — Segregação completa dos atributos de modelo (estende a 0012)

- **Status:** Aceita
- **Data:** 2026-07-16
- **Foco:** dados de veículo — identificação no cadastro
- **Relacionada:** estende [0012](./0012-segregacao-fipe-modelos.md)

## Contexto

A ADR 0012 persistiu só o núcleo que casa peça (`modelo_base`, `modelo_curto`, `motor`, `valvulas`, `combustivel`, `turbo`) e deixou **câmbio, portas, carroceria, tração e cilindros de fora**, com o argumento de que "raramente mudam a peça". O argumento estava certo — para o problema que a 0012 tinha em mãos.

Surgiu outro problema, que a 0012 não considerou: **identificar o carro certo na hora do cadastro**. O funcionário busca "Palio 1.0 Fire" e recebe dezenas de linhas que diferem apenas em `4p`/`5p` e `Aut.`/`Mec.`. Esses atributos não discriminam peça, mas discriminam **modelo na busca**. Sem eles em campo próprio, não há como filtrar.

Medições sobre os 4087 modelos reais (2026-07-16):

| Campo | Cobertura | Tinha coluna? |
|---|---|---|
| modelo_base | 100% | sim (sujo) |
| versao | 86,2% | não |
| portas | 42,2% | não |
| cambio | 39,3% | não |
| carroceria | 19,3% | não |
| tecnologia | 18,9% | não |
| tracao | 11,2% | não |
| cv | 8,9% | não |
| cilindros | 4,0% | não |

Além disso, `modelo_base` misturava nome do modelo + versão + tecnologia numa string só (`"C3 Tendance Pure Tech"`).

## Decisão

Persistir **todos** os atributos reconhecíveis (migration `003c_modelos_atributos.sql`), e limpar `modelo_base` para conter só o nome do modelo. `versao` e `tecnologia` ganham coluna própria.

**`nome` não é tocado.** Continua sendo a string crua da FIPE — a fonte de onde tudo é derivado. Mesmo padrão do `raw` em `peca_aplicacoes` (ADR 0012 / migration 003b). Consequência: nada aqui é irreversível; melhorar o parser e re-rodar `segregar_fipe.mjs --apply` recalcula tudo.

### Por que `versao` é texto livre

O resíduo dos nomes tem **1684 tokens distintos, 606 deles aparecendo uma única vez** (`ELX`, `Tendance`, `LARAMIE`, `Attractive`…). Não existe vocabulário controlado possível.

### Por que existe uma lista de compostos

Não há regra que separe "nome de modelo com várias palavras" de "nome + versão": `"C4 Lounge Origine"` é modelo `C4 Lounge` + versão `Origine`, mas `"C4 Tendance"` é modelo `C4` + versão `Tendance`. A FIPE não fornece essa fronteira. A lista `COMPOSTOS` em `src/lib/fipe-parse.js` é a fonte dessa verdade e cresce conforme aparecem casos. Sem ela, 61 Volvo viravam `modelo_base = "XC"` e `Santa Fe` virava `Santa`.

## Consequências

- `modelo_base` dos registros existentes foi **reescrito** (`"Palio Weekend ELX"` → `"Palio"`). Reversível via re-run, já que `nome` está intacto.
- O parser vive em `src/lib/fipe-parse.js`, importado pelo import lazy da FIPE (`Clientes.jsx`) e pelo script — fonte única (ver ADR sobre a deriva que isso corrigiu: 187 modelos não segregados).
- `cambio` habilita o casamento de **embreagem** (categoria já prevista na 003b), que depende de câmbio — benefício não previsto quando a decisão foi tomada.
- Atributos com baixa cobertura (`cilindros` 4%) ficam majoritariamente nulos. Esperado.
