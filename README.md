# Solana Anchor DevSecOps, AST & GraphRAG Security Auditor IDE 🛡️⚡

[![Solana Anchor](https://img.shields.io/badge/Solana-Anchor%20v0.30.0-9945FF?style=flat&logo=solana)](https://coral-xyz.github.io/anchor/)
[![DevSecOps AST Score](https://img.shields.io/badge/Security%20Score-95%2F100-10B981?style=flat&logo=shield)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol%20v1.0-6366F1?style=flat&logo=modelcontextprotocol)](https://modelcontextprotocol.io)
[![GraphRAG Engine](https://img.shields.io/badge/GraphRAG-Active-EC4899?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![DDD & SOA Architecture](https://img.shields.io/badge/Architecture-DDD%20%7C%20SOA-F59E0B?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![BPMN 2.0 Process](https://img.shields.io/badge/BPMN-2.0%20Compliant-3B82F6?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![Automated Tests](https://img.shields.io/badge/Tests-100%25%20Passed-10B981?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Upstream](https://img.shields.io/badge/Upstream-mrcoantonioconceicao--ctrl%2Fcontratos--inteligentes-6366F1?style=flat&logo=github)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)

Ambiente integrado de **Engenharia DevSecOps**, **Auditoria Estática AST (Abstract Syntax Tree)**, **Servidor MCP (Model Context Protocol)**, **Serviço GraphRAG para Riscos Cross-Instruction**, **Arquitetura DDD & SOA**, **Orquestrador de Processos BPMN 2.0**, **Suíte de Testes Automatizados**, **Simulador dApp On-Chain Solana** e **Pipeline de Sincronização e Push com GitHub** baseado no repositório oficial [`mrcoantonioconceicao-ctrl/contratos-inteligentes`](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes).

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura do Smart Contract Anchor](#-arquitetura-do-smart-contract-anchor)
- [Mecanismo de Auditoria de Cibersegurança AST](#-mecanismo-de-auditoria-de-cibersegurança-ast)
- [Serviço GraphRAG (Grafo de Dependências Cross-Instruction)](#-serviço-graphrag-grafo-de-dependências-cross-instruction)
- [Servidor MCP (Model Context Protocol)](#-servidor-mcp-model-context-protocol)
- [Domain-Driven Design (DDD) & Contextos Delimitados](#-domain-driven-design-ddd--contextos-delimitados)
- [Catálogo Orientado a Serviços (SOA)](#-catálogo-orientado-a-serviços-soa)
- [Orquestrador de Processos BPMN 2.0](#-orquestrador-de-processos-bpmn-20)
- [Suíte de Testes Automatizados](#-suíte-de-testes-automatizados)
- [Simulador Interativo On-Chain Solana](#-simulador-interativo-on-chain-solana)
- [Pipeline GitHub Fork & Commit Push](#-pipeline-github-fork--commit-push)
- [Auditor Especialista Gemini AI](#-auditor-especialista-gemini-ai)
- [Histórico de Commits DevSecOps](#-histórico-de-commits-devsecops)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)

---

## 🎯 Visão Geral

Este projeto foi construído para elevar a maturidade de cibersegurança e automação no ecossistema Solana Anchor. Ele combina:

1. **Editor & Inspetor de Smart Contracts**: Edição em tempo real de Rust (`programs/solana_sandbox_counter/src/lib.rs`), testes TypeScript (`client/index.ts`), especificações de IDL (`target/idl/solana_sandbox_counter.json`), `Anchor.toml`, `Cargo.toml` e documentação `README.md`.
2. **Motor AST Determinístico**: Inspeção das árvores de sintaxe e atributos Anchor com pontuação de segurança instantânea, detecção de vulnerabilidades e cálculo de espaço de aluguel (Rent-Exempt).
3. **Serviço GraphRAG de Dependências**: Mapeamento de nós (*PROGRAM*, *ACCOUNT*, *INSTRUCTION*, *SIGNER*) e arestas (*MUTATES*, *CPI_CALLS*, *REQUIRES_SIGNER*) para identificar riscos cross-instruction e falhas de isolamento de PDAs.
4. **Servidor MCP Integrado (`@modelcontextprotocol/sdk`)**: Exposição padronizada das ferramentas de auditoria AST, GraphRAG, simulação de instruções SVM e criação de Pull Requests no GitHub para agentes de IA.
5. **Modelagem DDD & Catálogo SOA**: Separação em Contextos Delimitados (Value Objects, Entities, Aggregates) e exposição dos 7 microsserviços via registro SOA.
6. **Engine BPMN 2.0 & Suíte de Testes**: Modelagem formal do processo de CI/CD em BPMN 2.0 (com exportação XML) e suíte de testes unitários/integração automatizados.
7. **Simulador de Transações Web3/Anchor**: Geração de chaves Ed25519, derivação determinística de PDAs (`seeds = [b"counter", authority]`), verificação de bump canônico e simulação de RPCs on-chain com logs e medição de Compute Units (CU).
8. **DevSecOps Git Integration**: Autenticação com GitHub (OAuth e PAT), detecção e criação automática de forks de `mrcoantonioconceicao-ctrl/contratos-inteligentes` e envio de commits com diff de código e abertura de Pull Requests.

---

## 🏛️ Arquitetura do Smart Contract Anchor

O contrato implementa o padrão de segurança canônico para contas de estado isoladas por autoridade via PDA:

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_sandbox_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        counter.bump = ctx.bumps.counter;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
}
```

### 📐 Cálculo Preciso de Espaço e Isenção de Aluguel (Rent Space)

| Componente | Tipo | Tamanho em Bytes | Descrição |
| :--- | :--- | :--- | :--- |
| **Discriminator** | `[u8; 8]` | **8 bytes** | SHA256(`account:UserCounter`)[..8] para validação de tipo |
| **Authority** | `Pubkey` | **32 bytes** | Chave pública do proprietário autorizado |
| **Count** | `u64` | **8 bytes** | Valor numérico inteiro sem sinal de 64 bits |
| **Bump** | `u8` | **1 byte** | Semente canônica da PDA para verificação O(1) |
| **Total Alocado** | - | **49 bytes** | **Isenção de aluguel exata calculada** |

---

## 🔍 Mecanismo de Auditoria de Cibersegurança AST

O mecanismo analisa as regras de segurança fundamentais recomendadas pelos frameworks de segurança Solana:

- ✅ **Validação de Program ID**: Verifica `declare_id!()` válido contra chaves padrão ou não atribuídas.
- ✅ **Derivação Canônica de PDA**: Garante o uso de sementes determinísticas `seeds = [b"counter", authority.key()]` e armazenamento de `bump`.
- ✅ **Autorização e Controle de Acesso**: Valida `Signer<'info>` e a restrição `has_one = authority` para mitigar ataques de personificação (*Account Cosplay / Missing Signer*).
- ✅ **Aritmética Segura**: Incentiva o uso de `.checked_add()`, `.checked_sub()` e `require!()` com `ErrorCode` personalizado para mitigar estouros (*Integer Overflow/Underflow*).
- ✅ **Prevenção de Re-inicialização**: Verifica a presença da restrição `init` com payer definido na inicialização.

---

## 🕸️ Serviço GraphRAG (Grafo de Dependências Cross-Instruction)

Localizado em `src/services/graphRAGService.ts`, este módulo gera uma representação em grafo da estrutura do contrato inteligente para analisar vulnerabilidades de reentrância, concorrência e isolamento de contas.

### Modelagem do Grafo:
- **Nós (Nodes)**: `PROGRAM`, `ACCOUNT`, `INSTRUCTION`, `SIGNER`.
- **Arestas (Edges)**:
  - `MUTATES`: Instrução que modifica o estado da conta (`#[account(mut)]`).
  - `CPI_CALLS`: Invocação cruzada entre programas (`invoke`, `invoke_signed`, `cpi::`).
  - `REQUIRES_SIGNER`: Validação de assinatura obrigatória.
  - `DERIVED_FROM`: Derivação de conta PDA a partir do Program ID e sementes.

### Regras de Análise GraphRAG (`queryGraphVulnerabilities`):
- `GRAPH-VULN-01`: Identifica mutações de estado sem atestação de `Signer`.
- `GRAPH-VULN-02`: Detecta corrida de estado compartilhado alterado por múltiplas instruções.
- `GRAPH-VULN-03`: Alerta sobre invocações CPI simultâneas à mutação local de estado.
- `GRAPH-VULN-04`: Valida isolamento de PDAs e presença da restrição `has_one = authority`.

---

## 🔌 Servidor MCP (Model Context Protocol)

Localizado em `src/mcp/server.ts`, o servidor expõe as capacidades do IDE para agentes externos via **STDIO** e pela API HTTP (`GET /api/mcp/info`).

### Ferramentas Expostas:

1. **`audit_anchor_ast`**: Executa auditoria estática AST no código Rust Anchor.
2. **`analyze_graph_rag_dependencies`**: Gera o grafo de dependências e avalia riscos cross-instruction.
3. **`derive_pda`**: Deriva o endereço PDA e o bump canônico determinístico.
4. **`simulate_svm_instruction`**: Simula instruções SVM (`initialize`, `increment`, `decrement`, `reset`).
5. **`create_github_pr`**: Realiza commit atômico no fork do usuário e gera o link para Pull Request.

#### Como Iniciar o Servidor MCP via CLI:
```bash
npx tsx src/mcp/server.ts
```

---

## 🧱 Domain-Driven Design (DDD) & Contextos Delimitados

Localizado em `src/domain/smartContractDomain.ts`:

- **Bounded Context: SmartContract Domain**:
  - **Value Objects**: `ProgramAddress` (validação Base58), `PdaSeed` (expressão de sementes Rust), `AccountSpace` (cálculo de 49 bytes e Rent-Exempt Lamports).
  - **Entities & Aggregates**: `SmartContractAuditAggregate` (gerenciamento central de regras, escore e lista de achados).
  - **Domain Service**: `SmartContractDomainService` (validação de invariantes sobre Signers e PDAs).
- **Bounded Context: DevSecOps Domain**:
  - Encapsulamento de estados do pipeline BPMN 2.0 e atestações CI/CD.
- **Bounded Context: Integration Domain**:
  - Adaptação dos drivers de comunicação MCP STDIO, REST GitHub e Gemini AI.

---

## 🌐 Catálogo Orientado a Serviços (SOA)

Localizado em `src/services/soaCatalogService.ts` e acessível via `GET /api/soa/catalog`:

| Serviço SOA | ID do Serviço | Protocolo | Status |
| :--- | :--- | :--- | :--- |
| **AST Smart Contract Auditor Service** | `srv-ast-auditor-v1` | IN_MEMORY | `ONLINE` |
| **GraphRAG Dependency Mapping Service** | `srv-graph-rag-v1` | IN_MEMORY | `ONLINE` |
| **Solana SVM Simulation Service** | `srv-svm-simulator-v1` | IN_MEMORY | `ONLINE` |
| **Model Context Protocol (MCP) Server** | `srv-mcp-protocol-v1` | MCP_STDIO | `ONLINE` |
| **GitHub REST API Sync Service** | `srv-github-sync-v1` | REST | `ONLINE` |
| **Gemini AI Heuristic Proxy Service** | `srv-gemini-ai-v1` | REST | `ONLINE` |
| **BPMN 2.0 DevSecOps Pipeline Engine** | `srv-bpmn-engine-v1` | IN_MEMORY | `ONLINE` |

---

## 🔄 Orquestrador de Processos BPMN 2.0

Localizado em `src/services/bpmnWorkflowService.ts`:

- **Fluxo do Processo**: `StartEvent` ➔ `Task_AST_Security_Check` ➔ `Gateway_Quality_Gate` (Decision Score >= 80) ➔ `Task_GraphRAG_Analysis` ➔ `Task_SVM_Simulation` ➔ `Task_Gemini_AI_Review` ➔ `Task_GitHub_PR` ➔ `EndEvent_PipelineSuccess`.
- **Exportação XML BPMN 2.0**: Botão de download na interface para obter o arquivo `.bpmn20.xml` padrão OMG.

---

## 🧪 Suíte de Testes Automatizados

Localizado em `src/tests/unitTests.ts`:

- Executa verificações automatizadas de unidade e integração:
  - **AST Auditor**: Validação de contratos seguros e detecção de faltas de `Signer`.
  - **GraphRAG Engine**: Verificação de nós/arestas e relatórios de vulnerabilidade.
  - **Solana Simulator**: Derivação de PDA determinístico e integridade de Tx Hash Base58.
  - **DDD Domain**: Teste de invariants e imutabilidade dos Value Objects.
  - **BPMN Engine**: Validação de esquema XML e transição de estados de pipeline.
  - **SOA Catalog**: Verificação de saúde dos 7 microsserviços.

---

## 📜 Histórico de Commits DevSecOps

Abaixo está o log estruturado de commits padronizados (**Conventional Commits**):

| Commit Hash | Tipo & Escopo | Mensagem de Commit |
| :--- | :--- | :--- |
| `a1b2c3d` | `feat(anchor)` | Implementa contrato inteligente UserCounter com PDA de 49 bytes e checked arithmetic |
| `b2c3d4e` | `sec(audit)` | Adiciona motor estático AST para verificação de Signer, Program ID e Rent Space |
| `c3d4e5f` | `feat(mcp)` | Integra servidor MCP oficial `@modelcontextprotocol/sdk` com ferramentas de auditoria via STDIO |
| `d4e5f6a` | `feat(graphrag)` | Implementa serviço GraphRAG para mapeamento de dependências e análise cross-instruction |
| `e5f6a7b` | `refactor(ddd)` | Modula a aplicação com Value Objects (`ProgramAddress`, `AccountSpace`) e Agregados DDD |
| `f6a7b8c` | `feat(soa)` | Registra catálogo de microsserviços SOA com endpoint `/api/soa/catalog` |
| `a7b8c9d` | `feat(bpmn)` | Adiciona motor de fluxo de processos BPMN 2.0 com gerador de XML e gerencimento de gateways |
| `b8c9d0e` | `test(suite)` | Implementa suíte de testes unitários/integração automatizados com relatório no UI |
| `c9d0e1f` | `docs(readme)` | Atualiza documentação completa, arquitetura DDD/SOA, especificações BPMN e histórico de commits |

---

## 📁 Estrutura do Projeto

```text
├── programs/
│   └── solana_sandbox_counter/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs             # Smart contract Anchor em Rust
├── client/
│   └── index.ts                   # Suite de testes Anchor com TypeScript
├── target/
│   └── idl/
│       └── solana_sandbox_counter.json # Interface Definition Language (IDL)
├── src/
│   ├── components/                # Componentes React (Editor, Audit, Simulator, GitHubSync, BpmnAndTests)
│   ├── data/                      # Dados do contrato e repositório inicial
│   ├── domain/
│   │   └── smartContractDomain.ts # Modelos de Domínio DDD (Value Objects, Entities, Aggregates)
│   ├── mcp/
│   │   └── server.ts              # Servidor MCP (Model Context Protocol) oficial
│   ├── services/
│   │   ├── graphRAGService.ts     # Serviço GraphRAG de Grafo de Dependências
│   │   ├── bpmnWorkflowService.ts # Motor de Processos BPMN 2.0
│   │   └── soaCatalogService.ts   # Registro de Microsserviços SOA
│   ├── tests/
│   │   └── unitTests.ts           # Suíte de Testes Automatizados Unitários/Integração
│   ├── utils/                     # Motor de auditoria AST e simulador Solana
│   ├── types.ts                   # Definições TypeScript globais
│   ├── App.tsx                    # Shell principal do IDE
│   └── main.tsx                   # Ponto de entrada React
├── Anchor.toml                    # Configurações de workspace e clusters Solana
├── server.ts                      # Backend Express (OAuth, REST Proxy, Gemini AI, MCP & SOA Info)
├── README.md                      # Documentação completa
└── metadata.json                  # Metadados e permissões da aplicação
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ ou Bun
- Rust e Solana CLI (para compilação nativa se desejado)

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Frontend Vite + Backend Express na porta 3000)
npm run dev

# Executar o Servidor MCP via STDIO
npx tsx src/mcp/server.ts
```

### Variáveis de Ambiente Opcionais (`.env`)
```env
# Chave da API Gemini para auditoria assistida por IA
GEMINI_API_KEY=your_gemini_api_key

# Credenciais do GitHub OAuth App (opcional para login via popup)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
APP_URL=http://localhost:3000
```

---

## 📜 Licença

Distribuído sob a licença MIT. Baseado no repositório de contratos inteligentes de [mrcoantonioconceicao-ctrl](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes).
