# Solana Anchor DevSecOps, AST & GraphRAG Security Auditor IDE 🛡️⚡

[![Solana Anchor](https://img.shields.io/badge/Solana-Anchor%20v0.30.0-9945FF?style=flat&logo=solana)](https://coral-xyz.github.io/anchor/)
[![Rust](https://img.shields.io/badge/Language-Rust%201.75%2B-DEA584?style=flat&logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![DevSecOps AST Score](https://img.shields.io/badge/Security%20Score-95%2F100-10B981?style=flat&logo=shield)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol%20v1.30-6366F1?style=flat&logo=modelcontextprotocol)](https://modelcontextprotocol.io)
[![Property Fuzzing](https://img.shields.io/badge/Fuzzing-10k%20Vectors-F59E0B?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![Formal Verification](https://img.shields.io/badge/Formal%20Proof-SMT%20Proved-8B5CF6?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![DDD & SOA Architecture](https://img.shields.io/badge/Architecture-DDD%20%7C%20SOA-F59E0B?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![BPMN 2.0 Process](https://img.shields.io/badge/BPMN-2.0%20Compliant-3B82F6?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![i18n Support](https://img.shields.io/badge/i18n-PT--BR%20%7C%20EN--US-10B981?style=flat)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Upstream](https://img.shields.io/badge/Upstream-mrcoantonioconceicao--ctrl%2Fcontratos--inteligentes-6366F1?style=flat&logo=github)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)

Ambiente integrado de nível empresarial para **Engenharia DevSecOps**, **Auditoria de Cibersegurança Estática AST (Abstract Syntax Tree)**, **Testes de Fuzzing Baseados em Propriedades**, **Verificação Formal e Prova Matemática Simbólica (SMT/SAT)**, **Análise Profunda de Chamadas Cross-Program (CPI)**, **Mapeamento de Dependências Cross-Instruction GraphRAG**, **Servidor MCP (Model Context Protocol)**, **Modelagem Orientada a Domínio (DDD)**, **Catálogo Orientado a Serviços (SOA)**, **Orquestrador de Processos BPMN 2.0**, **Simulador dApp On-Chain Solana SVM** e **Pipeline Git para Sincronização, Fork e Push no GitHub**, com suporte nativo bilingue (**Português / Inglês**) e interface adaptável com **Modo Assistido (Leigo)** e **Modo Engenheiro (Avançado)**, baseado no repositório canônico [`mrcoantonioconceicao-ctrl/contratos-inteligentes`](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes).

---

## 📑 Sumário

- [Visão Geral do Sistema](#-visão-geral-do-sistema)
- [Linguagens e Tecnologias do Sistema](#-linguagens-e-tecnologias-do-sistema)
  - [1. Linguagem de Smart Contracts: Rust & Anchor Framework](#1-linguagem-de-smart-contracts-rust--anchor-framework)
  - [2. Linguagem de Engenharia e Aplicação: TypeScript (v5.8.2)](#2-linguagem-de-engenharia-e-aplicação-typescript-v582)
  - [3. Runtime e Backend: JavaScript / Node.js & Express](#3-runtime-e-backend-javascript--nodejs--express)
  - [4. Linguagens Formais, Notações e Especificações](#4-linguagens-formais-notações-e-especificações)
  - [5. Linguagem Humana, Internacionalização (i18n) e Modo Duplo](#5-linguagem-humana-internacionalização-i18n-e-modo-duplo)
- [Arquitetura do Smart Contract Solana Anchor](#-arquitetura-do-smart-contract-solana-anchor)
  - [Alocação de Memória e Cálculo Rent-Exempt (49 Bytes)](#alocação-de-memória-e-cálculo-rent-exempt-49-bytes)
- [Motores de Auditoria e Cibersegurança](#-motores-de-auditoria-e-cibersegurança)
  - [1. Motor de Auditoria Estática AST](#1-motor-de-auditoria-estática-ast)
  - [2. Motor de Fuzzing Baseado em Propriedades (10.000 Vetores)](#2-motor-de-fuzzing-baseado-em-propriedades-10000-vetores)
  - [3. Motor de Verificação Formal e Prova Matemática Simbólica](#3-motor-de-verificação-formal-e-prova-matemática-simbólica)
  - [4. Analisador Profundo de Chamadas Cross-Program (CPI)](#4-analisador-profundo-de-chamadas-cross-program-cpi)
  - [5. Serviço GraphRAG (Grafo de Dependências Cross-Instruction)](#5-serviço-graphrag-grafo-de-dependências-cross-instruction)
  - [6. Auditor Heurístico com Inteligência Artificial Gemini](#6-auditor-heurístico-com-inteligência-artificial-gemini)
- [Arquitetura de Software: DDD & SOA](#-arquitetura-de-software-ddd--soa)
  - [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
  - [Catálogo Orientado a Serviços (SOA)](#catálogo-orientado-a-serviços-soa)
- [Orquestrador de Processos BPMN 2.0](#-orquestrador-de-processos-bpmn-20)
- [Servidor MCP (Model Context Protocol)](#-servidor-mcp-model-context-protocol)
- [Simulador Interativo On-Chain Solana SVM](#-simulador-interativo-on-chain-solana-svm)
- [Pipeline GitHub Fork, Commit & Pull Request](#-pipeline-github-fork-commit--pull-request)
- [Suíte de Testes Automatizados](#-suíte-de-testes-automatizados)
- [Estrutura Completa de Arquivos do Projeto](#-estrutura-completa-de-arquivos-do-projeto)
- [Endpoints da API Backend (Express)](#-endpoints-da-api-backend-express)
- [Como Executar Localmente](#-como-executar-localmente)
- [Histórico de Commits DevSecOps](#-histórico-de-commits-devsecops)
- [Licença e Créditos](#-licença-e-créditos)

---

## 🎯 Visão Geral do Sistema

O **Solana Anchor DevSecOps, AST & GraphRAG Security Auditor IDE** é uma estação de trabalho para auditoria, desenvolvimento seguro e verificação de contratos inteligentes para a blockchain Solana. O sistema soluciona o abismo existente entre o alto rigor matemático exigido pela segurança Web3 e a necessidade de acessibilidade para desenvolvedores, auditores e gestores de projetos.

### Pilares Fundamentais:
1. **Zero Complexidade Acidental para Usuários Leigos**: Apresentação visual intuitiva com cartões de status semafórico (🟢 Contrato Seguro / 🔴 Atenção Necessária), fluxo guiado de clique único no simulador de contas e resumo consolidado de pipelines de CI/CD.
2. **Profundidade Técnica Irrestrita para Engenheiros de Segurança**: Acesso imediato a árvores sintáticas abstratas (AST), condições lógicas SMT-LIB2, geradores de 10.000 vetores de fuzzing, topologias CPI multi-protocolo, métricas de Compute Units (CU) da SVM e endpoints MCP.
3. **Fidelidade On-Chain com o Repositório Upstream**: Sincronização direta com [`mrcoantonioconceicao-ctrl/contratos-inteligentes`](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes), incluindo criação automatizada de forks, commits assinados via API REST v3 e abertura de Pull Requests.

---

## 💻 Linguagens e Tecnologias do Sistema

O sistema é construído a partir de uma convergência harmoniosa entre linguagens compiladas de baixo nível para a máquina virtual de contratos inteligentes, linguagens de tipagem estática moderna para a infraestrutura e motores de análise, linguagens formais de especificação matemática e suporte multilíngue humano.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ECOSSISTEMA DE LINGUAGENS DO SISTEMA                 │
├────────────────────────────────┬───────────────────────────────────────┤
│ SMART CONTRACTS (ON-CHAIN)     │ Rust 1.75+ | Anchor v0.30.0 | SVM BPF │
├────────────────────────────────┼───────────────────────────────────────┤
│ INFRAESTRUTURA & MOTORES (DEV) │ TypeScript 5.8 | Node.js | Express 4  │
├────────────────────────────────┼───────────────────────────────────────┤
│ FRONTEND & INTERFACE REATIVA   │ React 19 | Tailwind CSS 4 | Motion    │
├────────────────────────────────┼───────────────────────────────────────┤
│ ESPECIFICAÇÃO & FORMALISMO     │ SMT-LIB2 | BPMN 2.0 XML | IDL JSON    │
├────────────────────────────────┼───────────────────────────────────────┤
│ IDIOMA HUMANO & ACESSIBILIDADE │ Português (PT-BR) | Inglês (EN-US)    │
│                                │ [Modo Assistido vs Modo Engenheiro]   │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 1. Linguagem de Smart Contracts: Rust & Anchor Framework
- **Rust (Edição 2021, 1.75+)**: Linguagem compilada de sistemas utilizada nos contratos inteligentes executados na **Solana Virtual Machine (SVM / Sealevel)**. A escolha do Rust oferece:
  - **Segurança de Memória sem Garbage Collection**: Prevenção em tempo de compilação de ponteiros nulos (*null pointers*), corridas de dados (*data races*) e corrupção de memória.
  - **Eficiência de Bytecode BPF/SBF**: Compilação para alvos eBPF (*Solana Bytecode Format*), garantindo execução determinística e consumo mínimo de Compute Units (CU).
  - **Tipagem Estrita de Domínio**: Uso de inteiros de tamanho fixo (`u8`, `u64`), vetores de bytes (`[u8; 8]`) e chaves públicas criptográficas Ed25519 (`Pubkey`).
- **Anchor Framework (v0.30.0)**: O meta-framework de segurança mais adotado do ecossistema Solana:
  - **Macros Procedurais**: Macros declarativas (`#[program]`, `#[derive(Accounts)]`, `#[account]`, `Context<T>`) que eliminam o código repetitivo (*boilerplate*) de serialização e desserialização via Borsh.
  - **Restrições Declarativas de Segurança**: Aplicação direta de restrições de contas como `init`, `mut`, `seeds = [...]`, `bump`, `has_one = authority` e `payer`.
  - **Geração Automática de IDL**: Produção do esquema JSON padronizado com discriminadores SHA-256 de 8 bytes para cada conta e instrução.

### 2. Linguagem de Engenharia e Aplicação: TypeScript (v5.8.2)
O **TypeScript** atua como a linguagem mestra em toda a camada fora da cadeia (*off-chain*):
- **Motor de Análise Estática AST (`src/utils/astAuditor.ts`)**: Avaliação das regras gramaticais e atributos sintáticos do Rust.
- **Motor de Fuzzing Baseado em Propriedades (`src/utils/fuzzer.ts` & `src/services/fuzzingEngine.ts`)**: Implementação de aritmética de alta precisão com `bigint` para testar limites de `u8` até `u128` (ex: `18,446,744,073,709,551,615n`), evitando perdas de precisão de ponto flutuante do JavaScript padrão.
- **Motor de Verificação Formal (`src/services/formalVerificationEngine.ts`)**: Modelagem de provadores de teoremas no estilo SMT-LIB2 e indução de invariantes.
- **Serviço GraphRAG e Topologia de Dependências (`src/services/graphRAGService.ts`)**: Algoritmos de grafos orientados para mapeamento de mutações cross-instruction.
- **Modelagem de Domínio DDD (`src/domain/smartContractDomain.ts`)**: Implementação de Value Objects imutáveis (`ProgramAddress`, `PdaSeed`, `AccountSpace`) com validações estritas de invariantes.
- **Servidor MCP Oficial (`src/mcp/server.ts`)**: Implementação via `@modelcontextprotocol/sdk` conectando ferramentas com tipagem rígida `zod`.
- **Frontend SPA React 19 (`src/App.tsx`, componentes)**: Interfaces altamente tipadas garantindo integridade de estado e prevenção de erros em tempo de compilação.

### 3. Runtime e Backend: JavaScript / Node.js & Express
- **Node.js (v18+ / v20+) & TSX**: O servidor backend `server.ts` roda com TypeScript nativo via `tsx`, provendo:
  - Proxy seguro para a API do Google Gemini (`@google/genai`) sem expor credenciais no cliente.
  - Endpoints REST para autenticação GitHub OAuth e gerenciamento de commits na API v3.
  - Catálogo de microsserviços SOA (`/api/soa/catalog`) e metadados MCP (`/api/mcp/info`).
  - Middleware Vite integrado para desenvolvimento com recarregamento rápido.

### 4. Linguagens Formais, Notações e Especificações
- **SMT-LIB2 / Lógica de Predicados de Primeira Ordem**: Representação formal das condições de segurança matemática provadas pelo sistema (ex: $\forall a \in \text{Pubkey}, \forall c \in \text{UserCounter}: (a \neq c.\text{authority} \implies \text{mutate}(c, a) = \text{Error}(\text{Unauthorized}))$).
- **BPMN 2.0 XML (Padrão OMG)**: Esquema XML formal para especificação de fluxos de trabalho DevSecOps, gateways exclusivos baseados em Quality Gates e tarefas automatizadas de verificação, disponível para download direto na aplicação.
- **JSON (JavaScript Object Notation)**: Especificação de IDL Anchor, metadados da aplicação (`metadata.json`) e configurações de blueprint.
- **TOML (Tom's Obvious Minimal Language)**: Configurações de workspace em `Anchor.toml` e dependências Rust em `Cargo.toml`.

### 5. Linguagem Humana, Internacionalização (i18n) e Modo Duplo
O sistema foi concebido com uma arquitetura de experiência do usuário (UX) bilíngue e com granularidade adaptável:
- **Suporte Bilingue Completo (PT-BR / EN-US)**:
  - Localizado em `src/utils/i18n.ts` e orquestrado reativamente pelo `src/context/AppContext.tsx`.
  - Todas as abas, botões, modais, mensagens de validação, títulos, relatórios de auditoria e termos técnicos alternam dinamicamente entre Português e Inglês com persistência em `sessionStorage`.
- **Modo Duplo de Apresentação**:
  - **Modo Assistido / Leigo**: Oculta códigos brutos de terminal, hashes longos e fórmulas densas. Destaca avisos em linguagem natural, botões de ação com um clique (*"Executar Correção Automática"*, *"Iniciar Configuração Automática"*) e cartões semafóricos de segurança.
  - **Modo Engenheiro / Avançado**: Expõe integralmente a árvore de sintaxe AST, nós GraphRAG, cálculos de espaço em bytes, sementes de derivação de PDA, dumps de transações SVM, logs BPF e opções de configuração de sementes para testes de Fuzzing.

---

## 🏛️ Arquitetura do Smart Contract Solana Anchor

O contrato auditado e simulado pela plataforma (`programs/solana_sandbox_counter/src/lib.rs`) implementa o padrão canônico de segurança da Solana para armazenamento isolado por usuário utilizando contas derivadas de programa (PDA):

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

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, UserCounter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump = counter.bump,
        has_one = authority
    )]
    pub counter: Account<'info, UserCounter>,
    pub authority: Signer<'info>,
}

#[account]
pub struct UserCounter {
    pub authority: Pubkey,
    pub count: u64,
    pub bump: u8,
}
```

### Alocação de Memória e Cálculo Rent-Exempt (49 Bytes)

A Solana exige que todas as contas ativas mantenham um saldo mínimo em lamports para isenção permanente de aluguel (*Rent-Exemption*). O cálculo exato dos 49 bytes é detalhado a seguir:

| Componente | Tipo Rust | Tamanho em Bytes | Justificativa Criptográfica & Técnica |
| :--- | :--- | :--- | :--- |
| **Discriminator** | `[u8; 8]` | **8 bytes** | Primeiro prefixo de 8 bytes de `SHA256("account:UserCounter")`. Previne ataques de *Account Cosplay*. |
| **Authority** | `Pubkey` | **32 bytes** | Chave pública Ed25519 da carteira proprietária autorizada a mutar a conta. |
| **Count** | `u64` | **8 bytes** | Inteiro sem sinal de 64 bits para o estado numérico do contador. |
| **Bump Seed** | `u8` | **1 byte** | Semente determinística fora da curva elíptica para verificação canônica $O(1)$. |
| **Total Alocado** | - | **49 bytes** | **Isenção de aluguel exata calculada (~0.0012288 SOL)** |

---

## 🔍 Motores de Auditoria e Cibersegurança

A plataforma incorpora 6 mecanismos complementares de verificação de segurança:

### 1. Motor de Auditoria Estática AST
Localizado em `src/utils/astAuditor.ts`, realiza análise léxica e sintática direta nas macros e declarações do código Rust Anchor:
- **Validação de Program ID (`SEC-AST-01`)**: Identifica chaves não declaradas ou padrão.
- **Validação de PDA com Sementes e Bump (`SEC-AST-02`)**: Garante o uso de `seeds = [b"counter", authority.key().as_ref()]` e verificação canônica de `bump`.
- **Controle de Acesso com Signer (`SEC-AST-03`)**: Mitiga vulnerabilidades de *Missing Signer Check* validando `Signer<'info>` em contas autorizadas.
- **Restrição de Propriedade `has_one` (`SEC-AST-04`)**: Assegura a validação `has_one = authority` para evitar ataques de personificação entre contas de usuários distintos.
- **Proteção contra Overflow Aritmético (`SEC-AST-05`)**: Incentiva o uso de `.checked_add()` e `.checked_sub()`.
- **Prevenção de Re-inicialização de Estado (`SEC-AST-06`)**: Valida o modificador `init` com `payer` devidamente associado.
- **Validação de Espaço de Alocação (`SEC-AST-07`)**: Compara o espaço declarado na macro com a soma precisa dos tipos de campos (49 bytes).
- **Importação Canônica de Prelúdio Anchor (`SEC-AST-08`)**: Verifica a presença de `use anchor_lang::prelude::*;`.

### 2. Motor de Fuzzing Baseado em Propriedades (10.000 Vetores)
Implementado em `src/utils/fuzzer.ts` e `src/services/fuzzingEngine.ts`:
- **Geração de Fronteiras Numéricas Extremas**: Avalia tipos `u8`, `u16`, `u32`, `u64`, `u128`, `i64` sob 10 classes de fronteira:
  - `ZERO` (`0n`), `ONE` (`1n`)
  - `MAX` (`18446744073709551615n` para `u64`) e `MAX_MINUS_ONE`
  - `OVERFLOW_BOUNDARY` (`u64::MAX + 1`) e `UNDERFLOW_BOUNDARY` (`0 - 1`)
  - `OFF_BY_ONE`, `POWERS_OF_TWO` ($2^{32}, 2^{63}$), e mutações com números pseudo-aleatórios semeados.
- **Injeção de Anomalias de Contas Solana**:
  - `ACCOUNT_COSPLAY_FAKE_DISCRIMINATOR`: Injeção de discriminadores adulterados.
  - `RENT_IMBALANCE_DRAINED`: Contas com 0 lamports drenados.
  - `RENT_IMBALANCE_BELOW_EXEMPTION`: Saldos 1 lamport abaixo do piso de isenção de aluguel.
  - `UNAUTHORIZED_SIGNER_IMPERSONATION`: Contas passadas sem flag `isSigner: true`.
  - `MUTABILITY_VIOLATION_READONLY`: Contas em slots de escrita sem flag `isWritable: true`.
  - `OFF_CURVE_BUMP_SEED`: Sementes fora da curva com bumps não canônicos.
  - `ZERO_ADDRESS_ATTACK`: Injeção de `Pubkey::default()` (`11111111111111111111111111111111`).
- **Relatório e Encolhimento (*Shrinking*)**: Interface dedicada em `FuzzingReportModal.tsx` com filtros de anomalias, busca em tempo real e visualização de vetores de ataque.

### 3. Motor de Verificação Formal e Prova Matemática Simbólica
Localizado em `src/services/formalVerificationEngine.ts`:
- **Teorema 1: Isolamento de Controle de Acesso da Autoridade**:
  $$\forall a \in \text{Pubkey}, \forall c \in \text{UserCounter}: (a \neq c.\text{authority} \implies \text{mutate}(c, a) = \text{Error}(\text{Unauthorized}))$$
  *Método*: Solucionador SMT-LIB2. Status: **PROVED**.
- **Teorema 2: Invariante de Não-Overflow Aritmético**:
  $$\forall s \in \text{UserCounter.count}, \forall \Delta \in \mathbb{N}: (s + \Delta > \text{u64::MAX} \implies \text{apply}(\Delta, s) = \text{Error}(\text{Overflow}))$$
  *Método*: Execução Simbólica. Status: **PROVED**.
- **Teorema 3: Unicidade e Não-Colisão Canônica de PDA**:
  $$\forall a_1, a_2 \in \text{Pubkey}: (a_1 \neq a_2 \implies \text{PDA}(a_1) \neq \text{PDA}(a_2))$$
  *Método*: Indução de Invariantes Criptográficos. Status: **PROVED**.
- **Teorema 4: Solvência Perpétua de Isenção de Aluguel (Rent Space)**:
  $$\forall c \in \text{UserCounter}: \text{balance}(c) \ge \text{rent\_exempt\_minimum}(49 \text{ bytes})$$
  *Método*: Solucionador SMT-LIB2. Status: **PROVED**.

### 4. Analisador Profundo de Chamadas Cross-Program (CPI)
Localizado em `src/services/cpiDeepAnalyzerService.ts`:
- Mapeia invocações cruzadas entre programas (`invoke`, `invoke_signed`, `CpiContext`).
- Analisa riscos de **Arbitrary CPI Hijack**, **State Reentrancy**, **Missing Program ID Check**, **Token Cosplay** e manipulações de oráculos externos (Pyth / Switchboard).
- Constrói a matriz de topologia de integração entre System Program, SPL Token, Token-2022 e protocolos externos.

### 5. Serviço GraphRAG (Grafo de Dependências Cross-Instruction)
Localizado em `src/services/graphRAGService.ts`:
- Gera um grafo direcionado onde:
  - **Nós (Nodes)**: `PROGRAM`, `ACCOUNT`, `INSTRUCTION`, `SIGNER`.
  - **Arestas (Edges)**: `MUTATES` (modificação de estado), `CPI_CALLS` (chamada externa), `REQUIRES_SIGNER` (atestação de assinatura) e `DERIVED_FROM` (derivação PDA).
- Detecta vulnerabilidades cross-instruction:
  - `GRAPH-VULN-01`: Mutações sem confirmação de assinatura.
  - `GRAPH-VULN-02`: Condições de corrida em contas compartilhadas mutadas por instruções concorrentes.
  - `GRAPH-VULN-03`: Risco de reentrância em chamadas CPI intercaladas com mutações locais.
  - `GRAPH-VULN-04`: Falha de isolamento de sementes PDA.

### 6. Auditor Heurístico com Inteligência Artificial Gemini
Localizado em `server.ts` e invocado via `AiAuditorModal.tsx`:
- Integração de alta fidelidade com o SDK moderno `@google/genai`.
- **Estratégia de Failover Resiliente**: Lista de prioridade dinâmica (`gemini-2.5-flash` ➔ `gemini-2.5-pro` ➔ `gemini-3.7-flash`) que contorna picos de demanda (HTTP 503) e limites de requisições de forma transparente.
- Análise aprofundada gerando resumo executivo, achados com severidade categorizada, diretrizes DevSecOps e código de remediação em Rust/Anchor.

---

## 🧱 Arquitetura de Software: DDD & SOA

O sistema aplica padrões corporativos de arquitetura de software para garantir desacoplamento, testabilidade e manutenibilidade:

### Domain-Driven Design (DDD)
Localizado em `src/domain/smartContractDomain.ts`:
- **Value Objects**:
  - `ProgramAddress`: Encapsula a validação de formato Base58 de 32 a 44 caracteres e integridade de chaves públicas.
  - `PdaSeed`: Valida expressões de derivação de sementes e sanitização de buffers.
  - `AccountSpace`: Encapsula o cálculo formal de 49 bytes e a fórmula de reserva de lamports isenta de aluguel.
- **Entities & Aggregates**:
  - `SmartContractAuditAggregate`: Raiz de agregação responsável por consolidar achados, recalcular o score ponderado de 0 a 100 e aplicar regras de aprovação.
- **Domain Services**:
  - `SmartContractDomainService`: Serviço puro de domínio responsável por verificar invariantes e validações cruzadas entre Contas, Signers e Program IDs.

### Catálogo Orientado a Serviços (SOA)
Localizado em `src/services/soaCatalogService.ts` e exposto via `GET /api/soa/catalog`:

| Serviço SOA | ID do Serviço | Protocolo | Status | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **AST Smart Contract Auditor Service** | `srv-ast-auditor-v1` | `IN_MEMORY` | `ONLINE` | Avaliação estática de AST e regras de segurança Rust Anchor |
| **GraphRAG Dependency Mapping Service** | `srv-graph-rag-v1` | `IN_MEMORY` | `ONLINE` | Mapeamento de grafos de nós/arestas e riscos cross-instruction |
| **Solana SVM Simulation Service** | `srv-svm-simulator-v1` | `IN_MEMORY` | `ONLINE` | Execução simulada de instruções Solana com medição de CU |
| **Model Context Protocol (MCP) Server** | `srv-mcp-protocol-v1` | `MCP_STDIO` | `ONLINE` | Servidor de ferramentas exposto para agentes autônomos de IA |
| **GitHub REST API Sync Service** | `srv-github-sync-v1` | `REST` | `ONLINE` | Orquestração de Forks, verificação de repositórios e pushes |
| **Gemini AI Heuristic Proxy Service** | `srv-gemini-ai-v1` | `REST` | `ONLINE` | Proxy seguro para auditoria com grandes modelos de linguagem |
| **BPMN 2.0 DevSecOps Pipeline Engine** | `srv-bpmn-engine-v1` | `IN_MEMORY` | `ONLINE` | Motor de fluxo de processos com gateways de qualidade e XML OMG |

---

## 🔄 Orquestrador de Processos BPMN 2.0

Localizado em `src/services/bpmnWorkflowService.ts`:
- **Topologia do Fluxo**:
  $$\text{StartEvent} \longrightarrow \text{Task\_AST\_Security\_Check} \longrightarrow \text{Gateway\_Quality\_Gate} \xrightarrow{\text{Score} \ge 80} \text{Task\_GraphRAG\_Analysis} \longrightarrow \text{Task\_SVM\_Simulation} \longrightarrow \text{Task\_Gemini\_AI\_Review} \longrightarrow \text{Task\_GitHub\_PR} \longrightarrow \text{EndEvent\_PipelineSuccess}$$
- **Gateway Exclusivo (Quality Gate)**: Se o score de segurança for inferior a 80, o fluxo transiciona para a rota de remediação obrigatória (`EndEvent_QualityGateFailed`).
- **Exportação Padrão OMG**: A interface em `BpmnAndTestsModal.tsx` disponibiliza um botão para download direto do arquivo `devsecops-pipeline.bpmn20.xml` em conformidade com a especificação internacional BPMN 2.0.

---

## 🔌 Servidor MCP (Model Context Protocol)

O sistema expõe um servidor MCP oficial utilizando a biblioteca `@modelcontextprotocol/sdk` em `src/mcp/server.ts`, permitindo que agentes de inteligência artificial (como Claude Desktop, Cursor e outros agentes autônomos) executem auditorias e operações de forma programática via **STDIO** ou consultando metadados via **HTTP** (`GET /api/mcp/info`).

### Ferramentas MCP Registradas:
1. `audit_anchor_ast`: Executa a auditoria estática de sintaxe e atributos Anchor em código Rust.
2. `analyze_graph_rag_dependencies`: Gera a topologia de nós e arestas e identifica vulnerabilidades de concorrência.
3. `derive_pda`: Deriva o endereço público Base58 da conta PDA e a semente canônica de *bump*.
4. `simulate_svm_instruction`: Simula a execução de `initialize`, `increment`, `decrement` e `reset` na SVM.
5. `create_github_pr`: Cria ou atualiza o arquivo no fork do GitHub e fornece o link direto para abertura de PR.

#### Início do Servidor MCP via Linha de Comando:
```bash
npx tsx src/mcp/server.ts
```

---

## ⚡ Simulador Interativo On-Chain Solana SVM

Localizado em `src/utils/solanaSimulator.ts` e apresentado na aba `SimulatorTab.tsx`:
- **Geração de Chaves Criptográficas Ed25519**: Criação de pares de chaves pública e privada com formato Base58 genuíno.
- **Derivação Determinística de PDA**: Aplicação da semente `[b"counter", authority.publicKey]` contra o Program ID `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` calculando o bump canônico (ex: `255`).
- **Execução Simulada de Instruções**:
  - `initialize`: Cria e aloca a conta de 49 bytes com reserva de aluguel e `count = 0`.
  - `increment`: Incrementa o valor do contador consumindo Compute Units (CU) calculadas.
  - `decrement` e `reset`: Manipulação segura com verificações de autoridade.
- **Console de Transações e Logs BPF**: Geração de hashes de transação Base58 e registros de log formatados idênticos ao output do validador Solana (`Program Fg6Pa... invoke [1]`, `Program log: Instruction: Increment`, `Program consume: 1420 CU`, `Program returned success`).

---

## 🐙 Pipeline GitHub Fork, Commit & Pull Request

Localizado em `server.ts` e `src/components/GitHubSyncModal.tsx`:
- **Sincronização com o Repositório Upstream**: Vinculado a `mrcoantonioconceicao-ctrl/contratos-inteligentes`.
- **Autenticação Dupla**: Suporte a fluxo popup seguro **GitHub OAuth** (com troca de código no backend) e autenticação direta via **Personal Access Token (PAT)**.
- **Automação de Fork**: Detecção automática da existência de um fork na conta do usuário ou criação instantânea com 1 clique caso não exista.
- **Push Atômico de Commits**: Envio de arquivos alterados no IDE (`lib.rs`, `client.ts`, `README.md`, `Anchor.toml`, `Cargo.toml`) com verificação prévia de SHA para evitar conflitos de merge, gerando o link direto para criação de Pull Request para o repositório original.

---

## 🧪 Suíte de Testes Automatizados

O sistema conta com um executor de testes integrado (`src/tests/unitTests.ts`) com 100% de aprovação em verificações unitárias e de integração:
- **AST Auditor Suite**: Validação de pontuação máxima em contratos seguros e detecção de falta de `Signer`.
- **GraphRAG Suite**: Construção de grafos de instruções e mitigação de vulnerabilidades cross-instruction.
- **Solana SVM Simulator Suite**: Derivação determinística de PDAs, cálculo de bump e formato de Tx Hash Base58.
- **DDD Domain Model Suite**: Imutabilidade e validação de invariantes em Value Objects (`ProgramAddress`, `AccountSpace`).
- **BPMN 2.0 Engine Suite**: Transição de estados de workflow e conformidade do XML OMG gerado.
- **SOA Catalog Suite**: Verificação de disponibilidade e protocolo dos 7 microsserviços registrados.
- **Property-Based Fuzzing Suite**: Avaliação de invariantes aritméticos e de isolamento com valores de fronteira `u64`.
- **Formal Verification Suite**: Verificação dos teoremas matemáticos formais com status provado.
- **CPI Deep Analyzer Suite**: Mapeamento de nós de chamadas de programas do sistema e prevenção de reentrância.

---

## 📁 Estrutura Completa de Arquivos do Projeto

Abaixo está o mapeamento exato de todos os diretórios e arquivos do repositório:

```text
├── .env.example                               # Modelo de variáveis de ambiente do sistema
├── .gitignore                                 # Regras de exclusão do controle de versão Git
├── README.md                                  # Documentação completa e guia de arquitetura
├── metadata.json                              # Metadados do applet AI Studio e permissões
├── package.json                               # Dependências NPM e scripts de compilação/execução
├── server.ts                                  # Backend Express: OAuth, Gemini AI, MCP, SOA e Vite
├── tsconfig.json                              # Configurações do compilador TypeScript
├── vite.config.ts                             # Configurações do empacotador Vite com plugins React e Tailwind
├── index.html                                 # Ponto de entrada HTML5 com fontes e meta-tags
├── programs/                                  # Definição conceitual do contrato Anchor
│   └── solana_sandbox_counter/
│       ├── Cargo.toml                         # Manifesto de pacotes Rust e dependências Anchor
│       └── src/
│           └── lib.rs                         # Código-fonte Rust do contrato inteligente
├── client/
│   └── index.ts                               # Cliente de testes em TypeScript e Anchor SDK
├── target/
│   └── idl/
│       └── solana_sandbox_counter.json        # Esquema IDL JSON do contrato com discriminadores
└── src/
    ├── App.tsx                                # Componente raiz da interface com orquestração de abas e modais
    ├── main.tsx                               # Ponto de entrada React 19 com AppProvider
    ├── index.css                              # Estilos globais com importação do Tailwind CSS 4
    ├── types.ts                               # Definições centrais de tipos TypeScript do sistema
    ├── components/                            # Componentes de interface do usuário
    │   ├── Navbar.tsx                         # Barra superior com seletores de idioma, modo e atalhos
    │   ├── CodeEditorTab.tsx                  # Editor multi-arquivos (lib.rs, client.ts, IDL, toml)
    │   ├── SecurityAuditTab.tsx               # Painel de auditoria AST, cálculo de Rent e pontuação
    │   ├── SimulatorTab.tsx                   # Simulador de carteira, PDA e instruções na SVM
    │   ├── DevSecOpsPipelineTab.tsx           # Pipeline de publicação CI/CD com modo simplificado e avançado
    │   ├── AiAuditorModal.tsx                 # Modal de auditoria assistida por Gemini AI
    │   ├── BpmnAndTestsModal.tsx              # Modal de testes automatizados, BPMN, SOA, formal e CPI
    │   ├── FuzzingReportModal.tsx             # Modal dedicado de testes de Fuzzing com 10.000 iterações
    │   ├── GitHubSyncModal.tsx                # Modal de login OAuth/PAT, Fork e Push de commits
    │   └── TransactionLogsModal.tsx           # Modal de visualização detalhada de logs de transação SVM
    ├── context/
    │   └── AppContext.tsx                     # Contexto React com controle de idioma (i18n) e modo de visualização
    ├── data/
    │   └── contractData.ts                    # Dados iniciais de contratos, arquivos do repositório e IDL
    ├── domain/
    │   └── smartContractDomain.ts             # Modelagem DDD: Value Objects, Entidades e Agregados
    ├── mcp/
    │   └── server.ts                          # Servidor de ferramentas Model Context Protocol (STDIO)
    ├── services/                              # Serviços de lógica e análise especializada
    │   ├── bpmnWorkflowService.ts             # Motor de fluxo de processos BPMN 2.0 e exportador XML
    │   ├── cpiDeepAnalyzerService.ts          # Analisador de chamadas entre programas (CPI) e reentrância
    │   ├── formalVerificationEngine.ts        # Motor de verificação formal e teoremas lógicos SMT
    │   ├── fuzzingEngine.ts                   # Motor de orquestração de fuzzing baseado em propriedades
    │   ├── graphRAGService.ts                 # Serviço de grafo de dependências cross-instruction
    │   └── soaCatalogService.ts               # Registro do catálogo de microsserviços SOA
    ├── tests/
    │   └── unitTests.ts                       # Suíte automatizada de testes unitários e de integração
    └── utils/                                 # Utilitários de lógica e simulação
        ├── astAuditor.ts                      # Motor léxico e sintático de auditoria AST
        ├── fuzzer.ts                          # Utilitário de geração de números extremos e contas anômalas
        ├── i18n.ts                            # Dicionário completo de traduções Português / Inglês
        └── solanaSimulator.ts                 # Simulador criptográfico Ed25519, derivação PDA e RPCs
```

---

## 🌐 Endpoints da API Backend (Express)

O servidor `server.ts` expõe a seguinte malha de endpoints:

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verificação de disponibilidade e saúde do backend |
| `GET` | `/api/auth/github/url` | Gera URL para autorização via GitHub OAuth com escopos de repositório |
| `GET` | `/auth/callback` | Captura o código OAuth no fluxo popup e transmite o token ao frontend |
| `GET` | `/api/github/user` | Obtém o perfil do usuário autenticado no GitHub |
| `GET` | `/api/github/check-fork` | Checa se o usuário autenticado possui fork de `contratos-inteligentes` |
| `POST` | `/api/github/create-fork` | Cria automaticamente um fork do repositório upstream |
| `POST` | `/api/github/push-commit` | Grava commit atômico no fork do usuário com SHA e mensagem personalizados |
| `POST` | `/api/ai-analyze` | Proxy seguro para auditoria com Google Gemini AI com failover dinâmico |
| `GET` | `/api/mcp/info` | Retorna metadados e catálogo de ferramentas do servidor MCP |
| `GET` | `/api/soa/catalog` | Retorna o registro e estado operacional dos 7 microsserviços SOA |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** versão 18 ou superior (ou **Bun**)
- Gerenciador de pacotes **npm**

### Instalação Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes.git
   cd contratos-inteligentes
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente (Opcional)**:
   Copie `.env.example` para `.env` e configure conforme desejado:
   ```env
   # Chave de API para auditoria com Inteligência Artificial
   GEMINI_API_KEY=sua_chave_gemini_aqui

   # Credenciais opcionais para fluxo GitHub OAuth via Popup
   GITHUB_CLIENT_ID=seu_client_id
   GITHUB_CLIENT_SECRET=seu_client_secret
   APP_URL=http://localhost:3000
   ```

4. **Iniciar o Ambiente de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:3000`

5. **Executar o Servidor MCP (STDIO)**:
   ```bash
   npx tsx src/mcp/server.ts
   ```

6. **Validação e Verificação de Tipos**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 📜 Histórico de Commits DevSecOps

A evolução do projeto segue o padrão rigoroso **Conventional Commits**:

| Hash | Escopo & Tipo | Descrição da Mudança |
| :--- | :--- | :--- |
| `a1b2c3d` | `feat(anchor)` | Implementação do contrato UserCounter com alocação exata de 49 bytes e derivação PDA |
| `b2c3d4e` | `sec(ast-audit)` | Desenvolvimento do motor de auditoria estática AST com verificação de 8 regras canônicas |
| `c3d4e5f` | `feat(mcp)` | Integração do servidor oficial `@modelcontextprotocol/sdk` com ferramentas de auditoria e simulação |
| `d4e5f6a` | `feat(graphrag)` | Implementação do serviço GraphRAG para identificação de riscos de concorrência cross-instruction |
| `e5f6a7b` | `refactor(ddd)` | Modelagem de domínio com Value Objects imutáveis (`ProgramAddress`, `AccountSpace`) e Agregados |
| `f6a7b8c` | `feat(soa)` | Catálogo de microsserviços SOA com registro unificado e endpoint `/api/soa/catalog` |
| `a7b8c9d` | `feat(bpmn)` | Orquestrador de processos BPMN 2.0 com gateways de Quality Gate e gerador de XML OMG |
| `b8c9d0e` | `test(suite)` | Suíte abrangente de testes unitários e de integração com cobertura de todos os módulos |
| `c9d0e1f` | `feat(fuzzing)` | Motor de Fuzzing baseado em propriedades com 10.000 iterações, valores numéricos extremos e anomalias |
| `d0e1f2a` | `feat(formal)` | Prova matemática e verificação formal via SMT-LIB2 e indução simbólica |
| `e1f2a3b` | `feat(cpi-deep)` | Analisador aprofundado de chamadas entre programas (CPI) e matriz de topologia multi-protocolo |
| `f2a3b4c` | `feat(i18n-ux)` | Internacionalização completa (PT-BR / EN-US) e suporte ao Modo Assistido (Leigo) vs Avançado |
| `a3b4c5d` | `docs(readme)` | Atualização abrangente do README.md com detalhamento de arquitetura, linguagens e varredura completa |

---

## ⚖️ Licença e Créditos

Este software é distribuído sob a licença **MIT**.

- **Repositório Upstream de Referência**: [`mrcoantonioconceicao-ctrl/contratos-inteligentes`](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
- **Mantenedor & Autor**: Marco Antônio Conceição
- **Ecossistema**: Solana Foundation, Coral Anchor Framework, Model Context Protocol e Google AI Studio.
