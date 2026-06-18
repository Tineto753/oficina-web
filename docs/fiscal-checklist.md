# Checklist fiscal — emissão de NF-e + NFS-e (Focus NFe)

> Caminho para a oficina conseguir emitir nota. Sem contador → você resolve, com este guia.
> ⚠️ Detalhes de **alíquota, CFOP, CST/CSOSN e código de serviço** variam por município/estado/regime. Onde estiver marcado **(confirmar)**, vale validar com uma **consulta avulsa paga a um contador** — errar classificação dá multa. É a única parte que eu não consigo cravar por você.

Legenda: `[ ]` a fazer · `[~]` em andamento · `[x]` feito.

---

## Fase A — Identidade da empresa (base de tudo)

- [ ] **Cartão CNPJ** em mãos (consulta gratuita no site da Receita). Confere razão social, endereço, situação ativa.
- [ ] **Regime tributário** confirmado (consulta no Portal do Simples Nacional). Provavelmente **Simples Nacional** → código de regime **CRT = 1**. **(confirmar)**
- [ ] **CNAEs corretos no CNPJ:**
  - [ ] serviço de oficina — ex.: `4520-0/01` (manutenção e reparação mecânica de veículos)
  - [ ] **comércio de peças** (só se for vender peça com NF-e) — ex.: `4530-7/03` (comércio a varejo de peças)
  - ⚠️ Se faltar o CNAE de comércio, a NF-e de peça fica irregular. Ajustar CNAE é na Junta/Receita.

## Fase B — Inscrições e habilitações

- [ ] **Inscrição Municipal (IM)** ativa (Prefeitura) — necessária p/ **NFS-e**.
- [ ] **Credenciamento de NFS-e na prefeitura** (habilitar emissão eletrônica no portal do município).
- [ ] **Inscrição Estadual (IE)** ativa (SEFAZ) — necessária p/ **NF-e** de peça.
- [ ] **Habilitação de NF-e na SEFAZ** (credenciamento para emitir; geralmente via portal estadual).

## Fase C — Certificado digital

- [ ] **Certificado A1 (e-CNPJ)** adquirido — arquivo `.pfx` + senha, validade 1 ano.
  - Comprar em Autoridade Certificadora (Serpro, Certisign, Serasa, etc.). Precisa ser **A1** (arquivo), não A3 (token).

## Fase D — Focus NFe

- [ ] Criar conta na **Focus NFe** e pegar os **tokens** (homologação **e** produção).
- [ ] ⚠️ **Verificar se o município da oficina é suportado pela Focus para NFS-e** (cobertura de NFS-e varia por cidade — este é um possível bloqueio; checar cedo).
- [ ] **Subir o certificado A1** (.pfx + senha) no painel da Focus.
- [ ] **Cadastrar a empresa** na Focus: CNPJ, razão social, endereço, **regime (CRT)**, **IM**, **IE**.
- [ ] Testar emissão em **homologação** (ambiente de teste — não vale como nota real) antes de produção.

## Fase E — Classificação dos itens (trabalho recorrente)

Cada item do catálogo precisa do código fiscal conforme o tipo (liga com a [ADR 0002](adr/0002-catalogo-itens-e-itens-da-os.md)):

- [ ] **Peças → NCM** (8 dígitos por peça).
  - 💡 Atalho: o **NCM vem na nota de compra do fornecedor**. Copie de lá.
- [ ] **Peças → CFOP** da operação — ex.: `5102` (venda de mercadoria de terceiros, dentro do estado). **(confirmar)**
- [ ] **Peças → CST/CSOSN** — no Simples usa **CSOSN** (ex.: `102`). **(confirmar)**
- [ ] **Serviços → código de serviço municipal** (lista da LC 116).
  - Oficina costuma cair em **item 14.01** (lubrificação, limpeza, revisão e conserto de veículos). Pegar o **código exato + alíquota de ISS** na sua prefeitura. **(confirmar)**
- [ ] Definir **unidade** dos itens (UN, PC, L, etc.).

## Fase F — Dados de cliente

- [ ] Garantir **endereço completo** dos clientes (a NF-e exige).
- [ ] **CNPJ + Inscrição Estadual** para clientes PJ contribuintes; consumidor final PF dispensa IE.
- [ ] **Email** do cliente (para enviar a nota).
- [ ] ⚠️ **(confirmar)** venda de peça para **consumidor final** pode exigir **NFC-e (modelo 65)** em vez de NF-e (55). Verificar a regra do seu estado.

---

## Ordem recomendada / o que pode travar

1. **A → B → C** são pré-requisitos legais (sem eles nada emite). Comece já.
2. **Possíveis bloqueios cedo:** município não suportado pela Focus p/ NFS-e (Fase D); CNAE de comércio faltando (Fase A).
3. **D** depois que A/B/C estiverem prontos.
4. **E/F** podem ser preenchidos em paralelo (e o sistema vai armazenar esses códigos — ver migrations a fazer).

## O que eu construo do lado do sistema (quando você mandar)

- Migrations aditivas: `emitente`, `notas_fiscais`, campos fiscais em `servicos`/`clientes` (escrevo o `.sql`, **não aplico**).
- Camada de dados + UI de emissão/status.
- Edge Function de emissão (Focus NFe) em homologação + webhook — quando a conta Focus + certificado existirem.

Ver [ADR 0005](adr/0005-emissao-nfe-nfse.md) (modelo) e [ADR 0007](adr/0007-gateway-focus-nfe.md) (gateway).
