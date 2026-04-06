# CLAUDE.md — Auto Almeida
> Documentação completa do projeto para uso com IA assistente.
> Atualizado em: abril/2026

---

## 1. Visão Geral do Projeto

Sistema web de gestão para oficina mecânica **Auto Almeida**, construído como projeto solo low-code. O objetivo é digitalizar o fluxo de atendimento da oficina — desde o cadastro do cliente até o encerramento da ordem de serviço — com interface limpa, dark mode e exportação de dados.

**Status atual:** MVP em produção no Netlify.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Estilização | Tailwind CSS v4 + shadcn/ui (Radix, preset Nova) + CSS variables custom |
| Banco de dados | Supabase (PostgreSQL) |
| Storage | Supabase Storage (fotos de veículos — planejado) |
| Deploy | Netlify (via CLI) |
| Exportação | xlsx (SheetJS) |
| CEP | ViaCEP API |
| Tabela FIPE | fipe.parallelum.com.br/api/v2 |

---

## 3. Estrutura de Arquivos

```
oficina-web/
  src/
    pages/
      Clientes.jsx        → cadastro, listagem, edição de clientes + modal de veículos
      Servicos.jsx        → catálogo de serviços com categorias
      OrdemServico.jsx    → listagem de OS abertas e orçamentos em cards
      NovaOS.jsx          → criação de OS direta ou orçamento
      Historico.jsx       → busca por placa, histórico completo do veículo
      Configuracoes.jsx   → configurações do sistema (validade do orçamento)
    lib/
      supabase.js         → client Supabase (URL + anon key)
      exportar.js         → geração de planilha Excel com 3 abas
    components/
      ui/                 → componentes shadcn (não usados nas páginas novas, mantidos como fallback)
    App.jsx               → rotas React Router + Navbar + toggle dark/light mode
    index.css             → variáveis CSS de tema (light/dark), fontes, reset global
  public/
    _redirects            → regra Netlify: /* /index.html 200 (obrigatório para SPA)
  index.html
  vite.config.js          → Vite + Tailwind plugin + alias @/
  jsconfig.json           → alias de imports (@/ → src/)
  package.json
```

---

## 4. Banco de Dados (Supabase)

### Diagrama de relacionamentos

```
configuracoes (isolada)

marcas
  └── modelos
        └── veiculos
              └── veiculo_fotos (planejado)
              └── km_registros
              └── ordens_servico
                    └── os_servicos
                          └── servicos

clientes
  └── veiculos
```

### Tabelas

#### `configuracoes`
Tabela isolada de configurações do sistema. Sem FK.
| coluna | tipo | descrição |
|---|---|---|
| id | uuid PK | |
| chave | varchar(100) unique | ex: `validade_orcamento_dias` |
| valor | text | ex: `30` |
| descricao | text | |

Seed padrão já inserido:
```sql
insert into configuracoes (chave, valor, descricao)
values ('validade_orcamento_dias', '30', 'Validade padrão dos orçamentos em dias');
```

#### `clientes`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| nome_completo | text not null | |
| tipo_pessoa | varchar(2) | PF ou PJ |
| cpf_cnpj | varchar(18) unique | |
| telefone | varchar(20) not null | |
| email | varchar(255) | |
| cep | varchar(9) | preenchido via ViaCEP |
| logradouro | text | |
| numero | varchar(10) | |
| complemento | text | |
| bairro | varchar(100) | |
| cidade | varchar(100) | |
| uf | varchar(2) | |
| observacoes | text | |
| ativo | boolean default true | soft delete |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger automático |

#### `marcas`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| nome | varchar(100) unique | |
| codigo_fipe | varchar(10) | código da API FIPE parallelum |
| ativo | boolean default true | |

Populada automaticamente via `GET https://fipe.parallelum.com.br/api/v2/cars/brands` na primeira abertura do modal de veículo.

#### `modelos`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| marca_id | uuid FK marcas | |
| nome | varchar(100) | |
| ativo | boolean default true | |
| unique | (marca_id, nome) | evita duplicatas |

Populado automaticamente via `GET /api/v2/cars/brands/{codigo_fipe}/models` ao selecionar a marca.

#### `veiculos`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| cliente_id | uuid FK clientes | |
| modelo_id | uuid FK modelos | |
| placa | varchar(7) unique | normalizado: uppercase, sem traço. Ex: ABC1234 ou ABC1D23 |
| ano_fabricacao | smallint | |
| ano_modelo | smallint | |
| cor | varchar(50) | |
| chassi | varchar(17) | opcional — adicionado via alter table |
| observacoes | text | |
| ativo | boolean default true | soft delete |
| created_at / updated_at | timestamptz | |

#### `km_registros`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| veiculo_id | uuid FK veiculos | |
| os_id | uuid FK ordens_servico nullable | null se registro manual |
| km | integer not null | |
| origem | varchar(50) | `entrada_os` ou `manual` |
| registrado_em | timestamptz | |

#### `servicos`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| nome | varchar(150) unique | |
| descricao | text | |
| categoria | varchar(100) | campo livre, sugestão via datalist |
| ativo | boolean default true | soft delete |
| created_at / updated_at | timestamptz | |

> ⚠️ **Mudança planejada:** adicionar coluna `tipo_servico` com enum `servico`, `peca`, `terceirizado`. A coluna `categoria` passa a ser subcategoria livre dentro de cada tipo. Ver roadmap.

#### `ordens_servico`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| cliente_id | uuid FK clientes | |
| veiculo_id | uuid FK veiculos | |
| status | varchar(20) | `orcamento`, `aberta`, `concluida`, `expirado`, `cancelado` |
| validade_orcamento | timestamptz nullable | null se OS direta |
| orcamento_convertido_em | timestamptz nullable | preenchido ao converter orçamento |
| km_entrada | integer nullable | opcional |
| forma_pagamento | varchar(20) | `dinheiro`, `pix`, `debito`, `credito`, `parcelado`, `entrada_parcelado` |
| valor_total | decimal(10,2) | soma dos os_servicos, desnormalizado |
| pago_em | timestamptz | |
| observacoes | text | |
| aberta_em | timestamptz | |
| concluida_em | timestamptz | |
| created_at / updated_at | timestamptz | |

> ⚠️ **Mudança planejada:** adicionar colunas `parcelas integer` e `valor_entrada decimal(10,2)` para suporte a pagamento parcelado e entrada + parcelamento. Ver roadmap.

#### `os_servicos`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| os_id | uuid FK ordens_servico | |
| servico_id | uuid FK servicos | |
| preco_cobrado | decimal(10,2) not null | valor definido na hora pelo dono |
| observacoes | text | |
| unique | (os_id, servico_id) | um serviço por OS |

---

## 5. Tema Visual

**Direção:** Industrial refinado. Empresarial com personalidade.

**Fontes:**
- Display/títulos: `Syne` (Google Fonts)
- Corpo/inputs: `DM Sans` (Google Fonts)

**Paleta (variáveis CSS em `index.css`):**

| variável | light | dark |
|---|---|---|
| `--bg` | #f7f6f3 | #141412 |
| `--bg-card` | #ffffff | #1e1d1b |
| `--bg-subtle` | #f0ede8 | #252320 |
| `--border` | #e2ddd7 | #2e2c28 |
| `--text` | #1a1917 | #f0ede8 |
| `--text-muted` | #6b6560 | #9a9289 |
| `--text-faint` | #b0a99f | #4a4540 |
| `--accent` | #c17f24 | #d4922e |
| `--success` | #2d7a4f | #3d9e68 |
| `--danger` | #c0392b | #e05545 |
| `--nav-bg` | #1a1917 | #0f0e0d |

**Toggle dark/light:** botão 🌙/☀️ na navbar, persiste via `localStorage`.

---

## 6. Fluxos Principais

### Cadastro de cliente
1. Botão "+ Novo Cliente" → modal
2. Preenche dados → ao sair do campo CEP, ViaCEP preenche endereço automaticamente
3. Salvar → aparece na tabela
4. Clicar na linha → modal de detalhes com botão "✏️ Editar"
5. Dentro do modal → "+ Cadastrar Carro" → modal de veículo

### Cadastro de veículo
1. Na primeira vez: marcas carregadas da FIPE automaticamente
2. Selecionar marca → modelos carregados da FIPE automaticamente
3. Botão "+ Nova marca" / "+ Novo modelo" para casos não cobertos pela FIPE
4. Placa normalizada: uppercase, sem traço, 7 chars

### Abertura de OS
1. `/os/nova` → escolher tipo: OS Direta ou Orçamento
2. Buscar cliente por nome (autocomplete)
3. Selecionar veículo do cliente
4. KM de entrada (opcional)
5. Adicionar serviços com preço + botão "+ Novo Serviço" inline
6. Salvar → cria OS + os_servicos + km_registros (se KM informado)

### Conclusão de OS
1. Clicar no card da OS na tela `/os`
2. Modal com detalhes + serviços
3. Informar forma de pagamento + valor total (editável)
4. "Concluir OS" → status = `concluida`

### Conversão de orçamento
1. Clicar no card na aba "Orçamentos"
2. Informar KM de entrada
3. "Converter" → status = `aberta`, registra KM

### Histórico
1. `/historico` → digitar placa + Enter ou botão Buscar
2. Exibe dados do veículo + proprietário + último KM
3. Lista todas as OS do veículo em ordem cronológica

### Exportação
- Botão "↓ Exportar" na navbar
- Gera arquivo `oficina_DD-MM-AAAA.xlsx` com 3 abas:
  - **Clientes** — todos os clientes ativos
  - **Veículos** — todos os veículos ativos com proprietário
  - **OS Concluídas** — histórico de OS encerradas

---

## 7. Deploy

**Plataforma:** Netlify via CLI

```bash
# Build e deploy manual
cd ~/oficina-web
npm run build
netlify deploy --prod
```

**Atenção:** o arquivo `public/_redirects` é obrigatório para o React Router funcionar em produção:
```
/* /index.html 200
```

**Variáveis de ambiente:** atualmente hardcoded em `src/lib/supabase.js`. Migrar para `.env` antes de tornar o repositório público.

---

## 8. Git

**Branch principal:** `main`
**Convenção de commits:** Conventional Commits

```
feat(escopo): descrição
fix(escopo): descrição
style(escopo): descrição
refactor(escopo): descrição
chore: descrição
```

---

## 9. Roadmap — Futuras Funcionalidades

### 🔲 Impressão de OS e Orçamento
- Botão "🖨️ Imprimir" no modal da OS e do orçamento
- Usa `window.print()` com CSS de impressão — sem dependências externas
- Layout: cabeçalho Auto Almeida (endereço/telefone a definir), dados do cliente e veículo, tabela de serviços, total, forma de pagamento, rodapé com linha de assinatura para orçamentos
- Abre janela nova formatada → diálogo nativo do navegador → fecha após imprimir

### 🔲 Tipo de Serviço (Serviço / Peça / Terceirizado)
- Adicionar coluna `tipo_servico` na tabela `servicos` com enum: `servico`, `peca`, `terceirizado`
- A coluna `categoria` passa a ser subcategoria livre dentro de cada tipo
- Atualizar tela de Serviços com filtro por tipo
- Atualizar tela de OS para exibir o tipo de cada item
- SQL necessário:
```sql
alter table servicos add column tipo_servico varchar(20) default 'servico';
```

### 🔲 Busca de Veículo por Placa na Abertura de OS
- Na tela `/os/nova`, adicionar segunda opção de busca: por placa
- Ao encontrar o veículo pela placa, preenche automaticamente cliente e veículo
- Útil para agilizar o fluxo quando o atendente já sabe a placa

### 🔲 KM de Entrada Opcional
- Remover validação obrigatória de KM na abertura de OS direta
- Campo continua existindo mas não bloqueia o salvamento
- Já documentado na tabela `ordens_servico` como `nullable`

### 🔲 Formas de Pagamento Expandidas
- Novos valores: `debito`, `credito`, `parcelado`, `entrada_parcelado`
- Para `parcelado` e `entrada_parcelado`: campos condicionais na tela de conclusão
- SQL necessário:
```sql
alter table ordens_servico add column parcelas integer;
alter table ordens_servico add column valor_entrada decimal(10,2);
```

### 🔲 Fotos do Veículo
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

### 🔲 Dashboard
- KPIs: OS abertas hoje, faturamento do mês, ticket médio, total de clientes
- Gráfico de OS por período (semanal/mensal)
- Últimos clientes atendidos
- Acesso restrito por nível: PROP vê financeiro completo, ADM vê operacional

### 🔲 Autenticação e Níveis de Acesso
Três perfis planejados:

| Perfil | Permissões |
|---|---|
| **PROP** (Proprietário) | Vê, cria, edita e remove tudo. Acesso ao financeiro completo. |
| **ADM** (Administrador) | Vê, cria e edita. Sem acesso a remoção e dados financeiros sensíveis. |
| **CLIENTE** | Vê apenas suas próprias OS e histórico do veículo. |

> ⚠️ Permissões do ADM precisam de mais refinamento antes da implementação.

Implementar via **Supabase Auth + RLS (Row Level Security)**. O nível CLIENTE depende de vincular o `auth.uid()` ao `cliente_id`.

### 🔲 Navbar — Organização e Padronização
- Agrupar itens por contexto: Cadastros (Clientes, Serviços) | Operacional (OS, Histórico) | Admin (Configurações, Dashboard)
- Responsividade mobile com menu hamburguer
- Indicador de OS abertas em tempo real

### 🔲 Tabela de Peças e Estoque
- Catálogo de peças com código, descrição, unidade e preço de custo
- Vínculo com `os_servicos` (peças usadas em cada OS)
- Controle básico de estoque: entrada/saída, saldo atual
- **Nota:** estoque desativado temporariamente — retorna quando capital for reunido

### 🔲 Tabela de Fornecedores
- Cadastro de fornecedores de peças
- Vínculo com tabela de peças
- Histórico de compras por fornecedor

### 🔲 Integração com Autopeças
- Comunicação com sistemas de outras autopeças via API
- Consulta de disponibilidade e preço de peças em tempo real
- Possibilidade de pedido direto pelo sistema

### 🔲 Agenda — Google Calendar
- Integração via Google Calendar API
- Criar evento ao abrir OS ou orçamento aprovado
- **Dependência:** requer autenticação OAuth2 — implementar junto com o módulo de login

---

## 10. Observações Técnicas

- **Soft delete:** clientes, veículos e serviços nunca são deletados fisicamente — campo `ativo = false`
- **valor_total desnormalizado:** guardado na OS além de calculável pelos itens — evita inconsistência se preços mudarem
- **Triggers de updated_at:** automáticos via função PostgreSQL nas tabelas principais
- **FIPE lazy loading:** marcas só são populadas no primeiro uso, modelos só ao selecionar a marca — evita sobrecarga inicial
- **Placa normalizada:** sempre uppercase sem traço no banco, formatação feita na aplicação se necessário
- **Chassi:** coluna adicionada via `alter table` após criação inicial — lembrar de incluir em novos ambientes
