# Architecture Decision Records (ADR)

Registro das decisões de arquitetura/modelagem do oficina-web. Cada ADR é imutável: uma vez aceita, não se reescreve — se mudar de ideia, cria-se uma nova ADR que **supera** (supersedes) a anterior.

Formato: [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html).
Status possíveis: `Proposta` · `Aceita` · `Superada por NNNN` · `Descartada`.

| # | Título | Status | Data |
|---|--------|--------|------|
| [0001](0001-remover-km-registros.md) | Remover `km_registros`; km vive na OS | Aceita (execução em 2 fases) | 2026-06-17 |
| [0002](0002-catalogo-itens-e-itens-da-os.md) | Catálogo de itens e itens da OS (peças × mão de obra) | Aceita (execução em 2 fases) | 2026-06-17 |
| [0003](0003-pagamentos-e-parcelas.md) | Pagamentos e parcelas (com integridade) | Aceita (execução em 2 fases) | 2026-06-17 |
| [0004](0004-integridade-dominios-e-identidade.md) | Integridade: domínios via CHECK, identidade uuid, numero_os exibição | Aceita (execução em 2 fases) | 2026-06-17 |
| [0005](0005-emissao-nfe-nfse.md) | Emissão fiscal (NF-e + NFS-e) via Edge Function e gateway | Aceita (execução em 2 fases) | 2026-06-17 |
| [0006](0006-autenticacao-papeis-e-rls.md) | Autenticação, papéis (admin/cliente) e RLS | Aceita (execução em 2 fases) | 2026-06-17 |
| [0007](0007-gateway-focus-nfe.md) | Gateway fiscal: Focus NFe | Aceita | 2026-06-17 |
| [0008](0008-imposto-estimado.md) | Imposto estimado por OS | Aceita | 2026-06-17 |
| [0009](0009-item-faturado-oficina-vs-externalizado.md) | Item da OS: faturado pela oficina × externalizado | Aceita | 2026-06-17 |
| [0010](0010-contas-a-pagar-compras-e-despesas.md) | Contas a pagar: compras e despesas (separadas) | Aceita | 2026-06-17 |
| [0011](0011-fluxo-de-caixa-e-dashboard.md) | Fluxo de caixa e dashboard | Aceita | 2026-06-17 |
| [0012](0012-segregacao-fipe-modelos.md) | Segregação dos modelos FIPE (núcleo + turbo) | Aceita (estendida pela 0013) | 2026-06-19 |
| [0013](0013-segregacao-completa-atributos-modelo.md) | Segregação completa dos atributos de modelo | Aceita | 2026-07-16 |

## Contexto geral

Redesenho do schema do oficina-web (Supabase de produção, **compartilhado com o site antigo**). Por isso as decisões priorizam **migrations in-place retrocompatíveis** — mudanças aditivas primeiro, remoções destrutivas só depois que o site antigo for aposentado. Ver `docs/schema-atual.md` / `docs/schema-atual.html` para o estado atual.

Focos do redesenho: ① integridade/enums · ② peças × mão de obra · ③ pagamentos · ④ multiusuário + RLS.
