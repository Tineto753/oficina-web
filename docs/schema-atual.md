# Schema atual — oficina-web

> Snapshot do banco **de produção** (Supabase, projeto `vjtgrxflathoftctarxi`) capturado em 2026-06-17 via `supabase gen types` + contagens REST.
> Legenda: 🔑 PK · 🔗 FK · ✅ usado pelo front · 💤 existe no banco mas o front não usa · ⚠str campo livre (sem enum/CHECK)

## Diagrama de relacionamentos

```
                            ┌─────────────────────┐
                            │  marcas (107)        │
                            │  🔑 id               │
                            │     nome, codigo_fipe│
                            └──────────┬───────────┘
                                       │ 1
                                       │ N
                            ┌──────────┴───────────┐
                            │  modelos (3900)      │
                            │  🔑 id               │
                            │  🔗 marca_id         │
                            │     nome             │
                            └──────────┬───────────┘
                                       │ 1
                                       │ N
┌──────────────────────┐    ┌──────────┴───────────────────┐
│  clientes (133)       │1  N│  veiculos (155)              │
│  🔑 id                ├────┤  🔑 id                       │
│     nome_completo     │    │  🔗 cliente_id               │
│     tipo_pessoa  ⚠str │    │  🔗 modelo_id                │
│     cpf_cnpj          │    │     placa, chassi            │
│     telefone, email   │    │     ano_fabricacao/modelo    │
│     endereço(7 campos)│    │     cor, observacoes         │
│  💤 observacoes        │    └───┬──────────────────┬───────┘
│     ativo, timestamps │      1 │                  │ 1
└───────┬───────────┬───┘        │ N                │ N
      1 │         1 │            │                  │
        │ N         │ N          │                  │
        │   ┌───────┴────────────┴──────┐           │
        │   │  ordens_servico (188)      │           │
        │   │  🔑 id                     │           │
        │   │  💤 numero_os              │           │
        │   │  🔗 cliente_id  🔗 veiculo_id          │
        │   │     status        ⚠str    │           │
        │   │     valor_total            │           │
        │   │  💤 valor_entrada, parcelas│  ← pagamento embutido
        │   │     forma_pagamento ⚠str   │           │
        │   │     km_entrada             │           │
        │   │  💤 data_solicitada        │           │
        │   │  💤 previsao_entrega       │           │
        │   │     aberta/concluida/pago_em           │
        │   │     validade_orcamento     │           │
        │   └───┬──────────────┬─────────┘           │
        │     1 │            1 │                      │
        │       │ N            │ N                    │ N
        │  ┌────┴─────────┐  ┌─┴──────────────────────┴──┐
        │  │ os_servicos  │  │  km_registros (82)         │
        │  │   (1083)     │  │  🔑 id  🔗 veiculo_id 🔗 os_id│
        │  │ 🔑 id        │  │     km, origem             │
        │  │ 🔗 os_id     │  └────────────────────────────┘
        │  │ 🔗 servico_id│
        │  │ 🔗 fornec._id│──────┐  ← peças & mão de obra
        │  │   preco_cobr.│      │     MISTURADAS aqui
        │  │ 💤 quantidade│      │
        │  │ 💤 devolvido │      │ N
        │  │ 💤 devolv_em │      │ 1
        │  └──────┬───────┘  ┌───┴──────────────┐
        │       N │          │ fornecedores (4) │
        │       1 │          │ 🔑 id            │
        │  ┌──────┴───────┐  │   nome, telefone │
        │  │ servicos(338)│  └──────────────────┘
        │  │ 🔑 id        │
        │  │   nome       │
        │  │   categoria  │
        │  │💤 tipo_servico│ ← já tem hint de "tipo"
        │  └──────────────┘
        │ N
        │ 1
┌───────┴────────────────┐     ┌──────────────────────┐
│  agendamentos (66)  💤  │     │  configuracoes (1)   │
│  🔑 id                 │     │  🔑 id               │
│  🔗 cliente_id 🔗 os_id │     │     chave, valor     │
│     titulo, tipo, cor  │     │     descricao        │
│     data_inicio/fim    │     └──────────────────────┘
└────────────────────────┘
```

## Contagem de registros

| Tabela | Registros | Usada pelo front |
|---|---:|:--:|
| modelos | 3900 | ✅ |
| os_servicos | 1083 | ✅ |
| servicos | 338 | ✅ |
| ordens_servico | 188 | ✅ |
| veiculos | 155 | ✅ |
| clientes | 133 | ✅ |
| marcas | 107 | ✅ |
| km_registros | 82 | ✅ |
| agendamentos | 66 | 💤 |
| fornecedores | 4 | 💤 |
| configuracoes | 1 | ✅ |

## Pontos para o redesenho (os 4 focos)

1. **Integridade / enums** — `status`, `tipo_pessoa` e `forma_pagamento` são `string` livre, sem enum nem CHECK. Dá pra gravar valor inválido. `numero_os` existe mas (aparentemente) sem unicidade/sequência garantida.
2. **Peças x mão de obra** — `os_servicos` acumula dois papéis: item de serviço (`servico_id`) e item de peça (`quantidade`, `fornecedor_id`, `devolvido`, `devolvido_em`). Não há tabela de peças/produtos nem estoque.
3. **Pagamentos** — embutidos na OS (`forma_pagamento`, `parcelas`, `valor_entrada`, `pago_em`). Uma OS só comporta um pagamento; não há como registrar múltiplas formas ou parcelas reais.
4. **Multiusuário / oficina** — não existe `oficina_id`/`user_id` em nenhuma tabela. Combinado com **RLS aberto** (a chave anon, que vai no bundle, consegue ler todos os clientes com CPF/CNPJ), é um risco de privacidade.

> ⚠️ Banco compartilhado com o site antigo. Redesenho será **migration in-place retrocompatível**, preservando os dados existentes.
