# 0005 — Emissão fiscal (NF-e + NFS-e) via Edge Function e gateway

- **Status:** Aceita (execução em 2 fases)
- **Data:** 2026-06-17
- **Foco:** emissão de nota fiscal (novo)

## Contexto

Hoje a oficina não emite nota fiscal (informal / cupom-recibo). Quer passar a emitir **automaticamente**:

- **Escopo:** NFS-e (serviços/ISS, município) **e** NF-e modelo 55 (peças/ICMS, estado). `terceirizado` (serviço que a oficina não prestou) fica fora — é repasse.
- **Sem contador:** a responsabilidade pelos códigos fiscais (regime, IM/IE, código de serviço municipal, NCM, CFOP, alíquotas) é do operador. O sistema os **armazena**; o gateway **assiste** (regras/alíquotas); nenhum dos dois substitui a classificação correta.
  - ⚠️ **Risco aceito:** classificação fiscal sem contador pode gerar erro/multa. Recomendação: uma consulta avulsa para cravar regime + códigos uma vez.
- **Pré-requisitos administrativos** (responsabilidade do dono, fora do código): CNPJ + regime, Inscrição Municipal + credenciamento NFS-e, Inscrição Estadual (p/ NF-e), **certificado digital A1** (`.pfx`).

Restrição de arquitetura: emissão usa **segredos** (token do gateway, certificado A1) que **não podem** ir para o bundle do navegador. Hoje o app é SPA puro (navegador → Supabase com chave anon). Logo, emissão exige uma peça **server-side** — o primeiro backend do projeto.

## Decisão

### Arquitetura

- **Supabase Edge Function** como backend de emissão (default: já estamos no ecossistema Supabase, sem servidor próprio). Ela guarda os segredos (gateway token, senha do certificado) nos *secrets* da função — nunca no banco nem no bundle.
- **Agnóstico de gateway** (Focus NFe / PlugNotas / eNotas / NFe.io — escolha final adiada). O modelo não amarra num fornecedor.
- Emissão é **assíncrona**: a Edge Function chama o gateway; o resultado (autorizada/rejeitada + PDF/XML) volta por **webhook** para outra Function, que atualiza `notas_fiscais`.

### Modelo de dados

1. **`emitente`** — config da oficina (linha única). Razão social, CNPJ, IM, IE, regime, endereço. **Segredos não ficam aqui** (vão para os secrets da Function).
2. **`notas_fiscais`** — uma por nota:
   - `id` · `os_id`🔗 · `tipo` (`nfse`|`nfe`) · `status` (`rascunho`|`processando`|`autorizada`|`rejeitada`|`cancelada`)
   - `numero` · `serie` · `chave_acesso` · `protocolo` · `valor` · `data_emissao`
   - `pdf_url` · `xml_url` · `mensagem_erro` · `gateway_ref`
   - Uma OS pode gerar **2 notas**: NFS-e (Σ itens `tipo=servico`) + NF-e (Σ itens `tipo=peca`).
3. **Campos fiscais (aditivos)**:
   - `catalogo_itens`: `ncm` (peça), `codigo_servico_municipal` (serviço), `unidade` — casa com o `tipo` da [0002](0002-catalogo-itens-e-itens-da-os.md).
   - `clientes`: `inscricao_estadual`, endereço completo + `email` (a NF-e exige).
- `notas_fiscais.tipo`/`status` validados por `CHECK` (princípio da [0004](0004-integridade-dominios-e-identidade.md)).

## Consequências

**Fase 1 — agora (aditiva, não toca no site antigo):**
- Criar `emitente`, `notas_fiscais` e os campos fiscais em `catalogo_itens`/`clientes`.
- Schema pronto; ainda não emite nada.

**Fase 2 — quando os pré-requisitos existirem (certificado A1 + inscrições):**
- Construir a Edge Function de emissão + webhook de retorno; escolher e ligar o gateway.
- Preencher códigos fiscais por item (NCM / código de serviço) e os dados do `emitente`.

**Positivas:** emissão automática das duas notas; segredos isolados no servidor; modelo agnóstico de gateway; aproveita o split peça/serviço da 0002.

**Negativas / a aceitar:** primeiro backend do projeto (mais superfície); dependência de pré-requisitos administrativos e de classificação fiscal feita sem contador (risco assumido); status assíncrono exige tratar estados de processamento/erro na UI.

## Relacionada

- [0002](0002-catalogo-itens-e-itens-da-os.md): `tipo` do item decide qual nota e qual código fiscal.
- [0003](0003-pagamentos-e-parcelas.md): valor da nota vem do total/itens da OS.
- [0004](0004-integridade-dominios-e-identidade.md): `CHECK` para `tipo`/`status` da nota.
- Multiusuário + RLS (foco ④, próximo): a Edge Function usará `service_role` server-side; RLS protege os dados no client.
