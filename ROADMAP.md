# Roadmap — Auto Almeida

Funcionalidades já implementadas (✅) e planejadas (🔲).

---

## ✅ Correções de Busca e Fuso Horário (maio/2026)
- Busca de cliente sem acento e case-insensitive em todas as páginas (Clientes, NovaOS, Histórico, OrdemServico, Agenda)
- Busca por CPF/CNPJ e telefone ignora formatação — digitar só números encontra "123.456.789-00" e "(11) 99999-8888"
- Feedback "Nenhum cliente encontrado" na Agenda com link para cadastro
- Correção de fuso horário no modal da Agenda — horário exibido era UTC ao invés do horário local

---

## ✅ Erro de Arredondamento com Vírgula
- `parseValor()` e `formatValor()` em `src/lib/utils.js` tratam corretamente o formato pt-BR (`"R$ 1.234,56"` ↔ number)

---

## ✅ Aceitar Números no Serviço
- Campo de preço nos itens de OS aceita entrada numérica com vírgula decimal

---

## ✅ Impressão de OS e Orçamento
- Botão "🖨️ Imprimir" no modal da OS e do orçamento
- Usa `window.print()` com CSS de impressão — sem dependências externas
- Abre janela nova formatada → diálogo nativo do navegador → fecha após imprimir

## ✅ Tipo de Serviço (Serviço / Peça / Terceirizado)
- Coluna `tipo_servico` adicionada na tabela `servicos` com valores: `servico`, `peca`, `terceirizado`
- Tela de Serviços com filtro por tipo e badge colorido
- Tela de OS exibe o tipo de cada item agrupado

## ✅ Formas de Pagamento Expandidas
- Valores: `dinheiro`, `pix`, `debito`, `credito`, `parcelado`, `entrada_parcelado`
- Para `parcelado` e `entrada_parcelado`: campos condicionais na tela de conclusão
- Colunas `parcelas` e `valor_entrada` já existem na tabela `ordens_servico`

## 🔲 Busca de Veículo por Placa na Abertura de OS
- Na tela `/os/nova`, adicionar segunda opção de busca: por placa
- Ao encontrar o veículo pela placa, preenche automaticamente cliente e veículo
- Útil para agilizar o fluxo quando o atendente já sabe a placa

## 🔲 KM de Entrada Opcional
- Remover validação obrigatória de KM na abertura de OS direta
- Campo continua existindo mas não bloqueia o salvamento
- Já documentado na tabela `ordens_servico` como `nullable`

## 🔲 Fotos do Veículo
- Upload de múltiplas fotos por veículo (sugestão: máximo 5, máximo 2MB cada)
- Compressão no frontend antes do upload para economizar storage
- Armazenamento no Supabase Storage (bucket `veiculos`)
- Exibição no modal do cliente e no histórico do veículo
- Nova tabela necessária:
```sql
create table veiculo_fotos (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references veiculos(id),
  url text not null,
  nome_arquivo text,
  created_at timestamptz not null default now()
);
```
- **Storage:** plano gratuito Supabase tem 1GB. Monitorar uso. Plano Pro (100GB) por $25/mês quando necessário.

## ✅ Dashboard — Compras por Fornecedor
- Rota `/dashboard` mostra itens (peças) comprados, agrupados por fornecedor
- Filtros de período: Este mês (padrão), Mês anterior, Este ano, Personalizado (range de datas)
- Filtro por fornecedor (Todos / fornecedor específico)
- Considera apenas itens com `tipo_servico='peca'` e `fornecedor_id` em OS com status `aberta`/`concluida`
- Total por fornecedor + total geral (com contagem de itens e devolvidos)
- **Próxima evolução planejada:** KPIs gerais (OS abertas hoje, faturamento, ticket médio), gráfico de OS por período, acesso restrito por perfil (PROP/ADM)

## ✅ Devolução de Item
- Botão "✓ Devolver" em cada linha do Dashboard
- Toggle reversível (✓ Devolver / ↺ Desfazer) — colunas `os_servicos.devolvido` + `devolvido_em`
- Item devolvido: riscado/cinza no Dashboard com badge **DEVOLVIDO**
- Some de todas as outras visões (modal OS, edição, impressão, histórico, exportação)
- `ordens_servico.valor_total` recalculado automaticamente a cada toggle

## 🔲 Autenticação e Níveis de Acesso
Três perfis planejados:

| Perfil | Permissões |
|---|---|
| **PROP** (Proprietário) | Vê, cria, edita e remove tudo. Acesso ao financeiro completo. |
| **ADM** (Administrador) | Vê, cria e edita. Sem acesso a remoção e dados financeiros sensíveis. |
| **CLIENTE** | Vê apenas suas próprias OS e histórico do veículo. |

> ⚠️ Permissões do ADM precisam de mais refinamento antes da implementação.

Implementar via **Supabase Auth + RLS (Row Level Security)**. O nível CLIENTE depende de vincular o `auth.uid()` ao `cliente_id`.

## 🔲 Navbar — Organização e Padronização
- Agrupar itens por contexto: Cadastros (Clientes, Serviços) | Operacional (OS, Histórico) | Admin (Configurações, Dashboard)
- Responsividade mobile com menu hamburguer
- Indicador de OS abertas em tempo real

## 🔲 Tabela de Peças e Estoque
- Catálogo de peças com código, descrição, unidade e preço de custo
- Vínculo com `os_servicos` (peças usadas em cada OS)
- Controle básico de estoque: entrada/saída, saldo atual
- **Nota:** estoque desativado temporariamente — retorna quando capital for reunido

## ✅ Fornecedor por Peça

**Escopo:** vincular fornecedor às **peças** das OS (não se aplica a `servico` nem `terceirizado`).

**Cadastro de fornecedor** (nova aba na navbar, ex: `/fornecedores`):
- Campos: `nome`, `telefone`
- Tabela:
```sql
create table fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  telefone varchar(20),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Vínculo na OS:**
- Adicionar coluna `fornecedor_id uuid references fornecedores(id)` em `os_servicos` (nullable)
- Aplicável apenas quando o item tem `servicos.tipo_servico = 'peca'`
- Na criação/edição da OS (em `OrdemServico.jsx` e `NovaOS.jsx`): ao adicionar peça, botão para escolher fornecedor (com opção inline "+ Novo fornecedor", como existe hoje para serviços)
- Na **visualização** do modal da OS: peças agrupadas/separadas **por fornecedor** (subtítulo com nome do fornecedor + subtotal por fornecedor)

**Não muda:**
- Não aparece na impressão para o cliente (informação interna)
- Histórico do veículo continua mostrando peças sem fornecedor

## 🔲 OS em Andamento na Exportação
- A exportação atual (`↓ Exportar` na navbar) inclui apenas OS com status `concluida`
- Adicionar aba **"OS em Andamento"** no Excel com OS abertas e orçamentos ativos
- Campos sugeridos: número, cliente, veículo, placa, data abertura, data solicitada, valor total, status
- Itens devolvidos continuam filtrados

## 🔲 Criar Cadastro do Cliente (Portal)
- Área de acesso do cliente para visualizar suas próprias OS e histórico do veículo
- Dependência: módulo de Autenticação (perfil CLIENTE)
- Cliente acessa via link/e-mail, vinculado ao seu `cliente_id`

## 🔲 Migrar para queroti.com
- Trocar domínio do Netlify (`oficina-web.netlify.app`) para `queroti.com`
- Configurar DNS e domínio customizado nas configurações do Netlify
- Atualizar URLs internas se necessário

## 🔲 Integração com Autopeças
- Comunicação com sistemas de outras autopeças via API
- Consulta de disponibilidade e preço de peças em tempo real
- Possibilidade de pedido direto pelo sistema

## 🔲 Agenda — Google Calendar
- Integração via Google Calendar API
- Criar evento ao abrir OS ou orçamento aprovado
- **Dependência:** requer autenticação OAuth2 — implementar junto com o módulo de login
