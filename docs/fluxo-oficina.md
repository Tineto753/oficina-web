# Fluxo da oficina — mapa de tudo que acontece (e cobertura)

> Mapa vivo do que acontece na operação, cruzado com o que já foi decidido.
> Legenda: ✅ decidido (ADR/app) · 🟡 parcial / existe mas incompleto · 🔴 acontece mas **sem decisão ainda**.

## 1. Antes do serviço
- 🔴 **Agendamento** (cliente marca horário) — tabela `agendamentos` existe (66 reg), sem tela no app novo.
- ✅ Cadastro de cliente (PF/PJ) — app + [0004](adr/0004-integridade-dominios-e-identidade.md)
- ✅ Cadastro de veículo (FIPE, placa) — app
- 🟡 **Recepção/entrada**: km de entrada ✅; queixa do cliente, `data_solicitada`, `previsao_entrega` existem no banco, fora do front.

## 2. Orçamento → aprovação
- ✅ Montar orçamento: peça/serviço/terceirizado + preço — [0002](adr/0002-catalogo-itens-e-itens-da-os.md)
- ✅ Validade do orçamento (config) — config
- ✅ Aprovar → vira OS aberta — app

## 3. Execução
- ✅ Peça **revenda** (entra caixa) × **externalizada** (cliente paga direto) — [0009](adr/0009-item-faturado-oficina-vs-externalizado.md)
- ✅ Fornecedor por item · terceirizado — [0002](adr/0002-catalogo-itens-e-itens-da-os.md)
- 🔴 **Estoque / custo de peça** — ADR futura
- 🟡 **Devolução de peça** — `devolvido`/`devolvido_em` no banco; sem fluxo no front.

## 4. Conclusão → pagamento
- ✅ Fechar OS (valor, km) — app
- ✅ Pagamento: split, formas, crediário/parcelas, entrada — [0003](adr/0003-pagamentos-e-parcelas.md)
- ✅ Contas a **receber** (parcelas em aberto) — [0003](adr/0003-pagamentos-e-parcelas.md)
- 🟡 **Entrega/retirada** do veículo — só `concluida_em`; sem evento "entregue".

## 5. Fiscal  ← principal foco
- ✅ NF-e (peça oficina) + NFS-e (serviço) — [0005](adr/0005-emissao-nfe-nfse.md)/[0007](adr/0007-gateway-focus-nfe.md) *(execução depende da papelada — `fiscal-checklist.md`)*
- ✅ Só item faturado pela oficina gera nota — [0009](adr/0009-item-faturado-oficina-vs-externalizado.md)
- ✅ Imposto estimado por OS — [0008](adr/0008-imposto-estimado.md)
- 🟡 **Relatório de faturamento mensal** (p/ DAS) — decidido como entregável, sem ADR; fácil.
- 🔴 **Faixa variável (RBT12)** — pendente (só 3 meses de histórico; precisa de seed).
- 🔴 **Venda rápida / balcão** (capturar 100% do faturamento) — pendente ADR.

## 6. Pós-venda / histórico
- ✅ Histórico do veículo por placa — app
- ✅ Histórico de km (derivado da OS) — [0001](adr/0001-remover-km-registros.md)
- 🔴 **Garantia** de serviço/peça — não modelado.
- 🔴 **Manutenção preventiva por km** (lembrete) — ideia.

## 7. Gestão / transversal
- ✅ Catálogo de itens — [0002](adr/0002-catalogo-itens-e-itens-da-os.md)
- 🟡 **Fornecedores** — existe; CRUD no front?
- 🔴 **Contas a pagar** (fornecedores) — não modelado.
- ✅ Configurações (validade, alíquotas) — config / [0008](adr/0008-imposto-estimado.md)
- ✅ Usuários admin / cliente(futuro) + RLS — [0006](adr/0006-autenticacao-papeis-e-rls.md)
- 🔴 **Dashboard gerencial** — não modelado.

## Buracos abertos (🔴) — para priorizar
1. Agenda/agendamento (tem dados, falta tela)
2. **Venda rápida / balcão** (fiscal)
3. Estoque + custo de peça
4. **Faixa variável RBT12** (fiscal)
5. Garantia
6. Contas a pagar
7. Manutenção preventiva por km
8. Devolução de peça (fluxo)
9. Recepção (queixa + previsão de entrega)
10. Dashboard gerencial
