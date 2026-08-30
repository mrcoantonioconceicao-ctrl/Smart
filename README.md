# Solana Anchor DevSecOps & AST Security Auditor IDE 🛡️⚡

[![Solana Anchor](https://img.shields.io/badge/Solana-Anchor%20v0.30.0-9945FF?style=flat&logo=solana)](https://coral-xyz.github.io/anchor/)
[![DevSecOps AST Score](https://img.shields.io/badge/Security%20Score-95%2F100-10B981?style=flat&logo=shield)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Upstream](https://img.shields.io/badge/Upstream-mrcoantonioconceicao--ctrl%2Fcontratos--inteligentes-6366F1?style=flat&logo=github)](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes)

Ambiente integrado de **Engenharia DevSecOps**, **Auditoria Estática AST (Abstract Syntax Tree)**, **Simulador dApp On-Chain Solana** e **Pipeline de Sincronização e Push com GitHub** baseado no repositório oficial [`mrcoantonioconceicao-ctrl/contratos-inteligentes`](https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes).

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura do Smart Contract Anchor](#-arquitetura-do-smart-contract-anchor)
- [Mecanismo de Auditoria de Cibersegurança AST](#-mecanismo-de-auditoria-de-cibersegurança-ast)
- [Simulador Interativo On-Chain Solana](#-simulador-interativo-on-chain-solana)
- [Pipeline GitHub Fork & Commit Push](#-pipeline-github-fork--commit-push)
- [Auditor Especialista Gemini AI](#-auditor-especialista-gemini-ai)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Convenções de Commit DevSecOps](#-convenções-de-commit-devsecops)
- [Como Executar Localmente](#-como-executar-localmente)

---

## 🎯 Visão Geral

Este projeto foi construído para elevar a maturidade de cibersegurança e automação no ecossistema Solana Anchor. Ele combina:

1. **Editor & Inspetor de Smart Contracts**: Edição em tempo real de Rust (`programs/solana_sandbox_counter/src/lib.rs`), testes TypeScript (`client/index.ts`), especificações de IDL (`target/idl/solana_sandbox_counter.json`), `Anchor.toml`, `Cargo.toml` e documentação `README.md`.
2. **Motor AST Determinístico**: Inspeção das árvores de sintaxe e atributos Anchor com pontuação de segurança instantânea, detecção de vulnerabilidades e cálculo de espaço de aluguel (Rent-Exempt).
3. **Simulador de Transações Web3/Anchor**: Geração de chaves Ed25519, derivação determinística de PDAs (`seeds = [b"counter", authority]`), verificação de bump canônico e simulação de RPCs on-chain com logs e medição de Compute Units (CU).
4. **DevSecOps Git Integration**: Autenticação com GitHub (OAuth e PAT), detecção e criação automática de forks de `mrcoantonioconceicao-ctrl/contratos-inteligentes` e envio de commits com diff de código e abertura de Pull Requests.

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

## ⚡ Simulador Interativo On-Chain Solana

O simulador emula fielmente o ambiente de execução Anchor e runtime Solana:

- **Carteira Authority**: Geração de chave pública `Ed25519` e airdrop simulado de SOL.
- **Calculadora de PDA**: Derivação em tempo real com `PublicKey.findProgramAddressSync([b"counter", authority], programId)`.
- **Invocação de Instruções Anchor**:
  - `initialize()`: Criação e alocação da PDA com 49 bytes.
  - `increment()`: Incremento protegido por verificação de autoridade.
  - `decrement()` / `reset()`: Instruções estendidas com validação de limites.
- **Terminal de Logs & Explorer**: Exibição da assinatura da transação (*Tx Hash*), slot, consumo de Compute Units (CU) e logs de runtime.

---

## 🔄 Pipeline GitHub Fork & Commit Push

Permite que qualquer desenvolvedor contribua de forma contínua para o ecossistema:

1. **Autenticação Segura**: Conexão via **GitHub OAuth Popup** ou **Personal Access Token (PAT)** com escopo `repo`.
2. **Detecção e Criação de Fork**: Consulta a existência do repositório `{username}/contratos-inteligentes` e cria o fork com um clique se necessário.
3. **Diff Inspector**: Inspeção visual das alterações em `lib.rs`, `client/index.ts`, `Anchor.toml`, `Cargo.toml` e `README.md`.
4. **Commit & Push**: Gravação via GitHub REST API com atualização atômica de SHA e link para abertura direta de **Pull Request** no repositório upstream oficial.

---

## 🤖 Auditor Especialista Gemini AI

Integrado através do backend Express (`/api/ai-analyze`), permitindo auditorias heurísticas com modelos Gemini para identificar vetores avançados de ataque:

- Vulnerabilidades de invocação entre programas (CPI)
- Falhas de reentrância ou manipulação de contas de aluguel
- Verificação de conformidade com as melhores práticas de auditoria Anchor v0.30+

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
│   ├── components/                # Componentes React (Editor, Audit, Simulator, GitHubSync)
│   ├── data/                      # Dados do contrato e repositório inicial
│   ├── utils/                     # Motor de auditoria AST e simulador Solana
│   ├── types.ts                   # Definições TypeScript globais
│   ├── App.tsx                    # Shell principal do IDE
│   └── main.tsx                   # Ponto de entrada React
├── Anchor.toml                    # Configurações de workspace e clusters Solana
├── server.ts                      # Backend Express (OAuth, GitHub REST Proxy, Gemini AI)
├── README.md                      # Documentação completa
└── metadata.json                  # Metadados e permissões da aplicação
```

---

## 📦 Convenções de Commit DevSecOps

Recomenda-se o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(anchor)`: Novas instruções de smart contract ou métodos cliente
- `sec(audit)`: Correções de segurança AST, proteção de overflow ou checagem de bump
- `docs(readme)`: Atualizações na documentação ou arquitetura de segurança
- `refactor(solana)`: Melhorias no código Rust sem alterar comportamento externo
- `ci(devsecops)`: Configurações de pipeline CI/CD, clippy ou solana-verify

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
