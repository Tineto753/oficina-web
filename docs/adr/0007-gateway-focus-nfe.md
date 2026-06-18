# 0007 — Gateway fiscal: Focus NFe

- **Status:** Aceita
- **Data:** 2026-06-17
- **Foco:** emissão de nota fiscal (complementa a 0005)

## Contexto

A [ADR 0005](0005-emissao-nfe-nfse.md) decidiu emitir NF-e + NFS-e via gateway, mas deixou a escolha do fornecedor em aberto. Emissão direta contra prefeituras/SEFAZ é inviável (NFS-e varia por município); um gateway abstrai isso.

## Decisão

**Focus NFe** como gateway, para NF-e (modelo 55) e NFS-e.

Motivos: API REST com boa documentação, ambiente de **homologação** acessível, suporte aos dois modelos numa API só, upload de certificado A1 no painel.

O código continua isolando o gateway atrás da camada de emissão (Edge Function), então a troca futura é possível — mas a implementação concreta mira a Focus.

## Consequências

- A Edge Function de emissão (Fase 2 da 0005) será escrita contra a API da Focus NFe; tokens (homologação/produção) ficam nos *secrets* da função.
- ⚠️ **Verificar cedo se o município da oficina é suportado pela Focus para NFS-e** — a cobertura de NFS-e varia por cidade e é um possível bloqueio (ver `docs/fiscal-checklist.md`, Fase D).
- Desenvolvimento começa em **homologação**; produção só após certificado A1 + inscrições + habilitações.

## Relacionada

- [0005](0005-emissao-nfe-nfse.md) — modelo de emissão (agnóstico); esta crava o fornecedor.
- `docs/fiscal-checklist.md` — pré-requisitos para ligar a Focus.
