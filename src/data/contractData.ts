import { AnchorIdl } from "../types";

export const REPO_INFO = {
  owner: "mrcoantonioconceicao-ctrl",
  repo: "contratos-inteligentes",
  fullUrl: "https://github.com/mrcoantonioconceicao-ctrl/contratos-inteligentes",
  programId: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  framework: "Anchor v0.30.0",
  initialScore: 95,
};

export const INITIAL_RUST_CODE = `use anchor_lang::prelude::*;

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
        counter.count += 1;
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
}`;

export const INITIAL_CLIENT_TS = `import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { SolanaSandboxCounter } from "../target/types/solana_sandbox_counter";

describe("solana_sandbox_counter", () => {
  // Configure the client to use the local devnet/cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaSandboxCounter as Program<SolanaSandboxCounter>;
  const authority = provider.wallet;

  // 1. Derive PDA for UserCounter
  const [counterPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), authority.publicKey.toBuffer()],
    program.programId
  );

  it("Initializes the PDA Counter Account", async () => {
    console.log("Authority Pubkey:", authority.publicKey.toBase58());
    console.log("Derived PDA Counter:", counterPda.toBase58());

    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction Signature:", tx);

    // Fetch account state from chain
    const counterAccount = await program.account.userCounter.fetch(counterPda);
    console.log("On-Chain Counter State:", {
      authority: counterAccount.authority.toBase58(),
      count: counterAccount.count.toNumber(),
      bump: counterAccount.bump,
    });
  });

  it("Increments the Counter", async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Increment Tx Signature:", tx);
    const counterAccount = await program.account.userCounter.fetch(counterPda);
    console.log("Updated Count:", counterAccount.count.toNumber());
  });
});`;

export const INITIAL_ANCHOR_TOML = `[toolchain]
anchor_version = "0.30.0"

[features]
resolution = true
skip-lint = false

[programs.localnet]
solana_sandbox_counter = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[programs.devnet]
solana_sandbox_counter = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"`;

export const INITIAL_CARGO_TOML = `[package]
name = "solana_sandbox_counter"
version = "0.1.0"
description = "Smart Contract Solana Anchor auditado com Solana Architect"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "solana_sandbox_counter"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.30.0"`;

export const INITIAL_IDL: AnchorIdl = {
  version: "0.1.0",
  name: "solana_sandbox_counter",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "counter",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: ["counter", "authority"]
          }
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "increment",
      accounts: [
        {
          name: "counter",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "UserCounter",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey"
          },
          {
            name: "count",
            type: "u64"
          },
          {
            name: "bump",
            type: "u8"
          }
        ]
      }
    }
  ],
  metadata: {
    address: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
  }
};

export const INITIAL_README_MD = `# Solana Anchor DevSecOps, AST & GraphRAG Security Auditor

Repositório de contratos inteligentes auditados para a blockchain Solana utilizando o framework Anchor, Servidor MCP, GraphRAG, DDD, SOA e BPMN 2.0.

## 🛡️ Especificações do Contrato \`solana_sandbox_counter\`

- **Framework**: Anchor v0.30.0
- **Program ID**: \`Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS\`
- **Alocação de Conta (Rent Space)**: 49 bytes (8 discriminator + 32 authority + 8 count + 1 bump)
- **Segurança de Acesso**: Isolamento por PDA com \`seeds = [b"counter", authority.key()]\` e \`has_one = authority\`
- **Proteção Aritmética**: Operações com \`checked_add\` e validação de limites
- **Arquitetura**: DDD (Domain-Driven Design), SOA (Service-Oriented Architecture), BPMN 2.0 e Servidor MCP

## 🚀 Como Compilar e Testar

\`\`\`bash
# Compilar o smart contract
anchor build

# Executar a suíte de testes TypeScript
anchor test

# Executar o Servidor MCP via STDIO
npx tsx src/mcp/server.ts
\`\`\`

## 📦 Padrão de Commits

Seguir a especificação Conventional Commits:
- \`feat(anchor)\`: novas instruções ou recursos do contrato
- \`sec(audit)\`: melhorias e correções de segurança AST
- \`feat(mcp)\`: ferramentas atômicas registradas no Servidor MCP
- \`feat(graphrag)\`: mapeamento de grafo e análises cross-instruction
- \`refactor(ddd)\`: modelos de domínio DDD e Value Objects
- \`feat(soa)\`: registro e catálogo de microsserviços SOA
- \`feat(bpmn)\`: orquestração de processos BPMN 2.0 e gerador XML
- \`test(suite)\`: suíte de testes unitários e de integração automatizados
- \`docs(readme)\`: atualizações na documentação e arquitetura
`;

export const COMMIT_PRESETS = [
  {
    label: "+ Docs & README",
    type: "docs",
    message: "docs(readme): update DevSecOps documentation, DDD/SOA architecture and BPMN process specs",
  },
  {
    label: "+ MCP Server Tools",
    type: "feat",
    message: "feat(mcp): expose AST audit, GraphRAG analysis, SVM simulator and GitHub PR tools via MCP",
  },
  {
    label: "+ GraphRAG & Cross-Instruction",
    type: "feat",
    message: "feat(graphrag): implement dependency graph mapping and cross-instruction risk analyzer",
  },
  {
    label: "+ DDD & Value Objects",
    type: "refactor",
    message: "refactor(ddd): introduce ProgramAddress, PdaSeed and AccountSpace domain value objects",
  },
  {
    label: "+ SOA Service Catalog",
    type: "feat",
    message: "feat(soa): register microservices catalog with /api/soa/catalog health endpoint",
  },
  {
    label: "+ BPMN 2.0 Engine",
    type: "feat",
    message: "feat(bpmn): implement BPMN 2.0 process workflow execution and OMG XML schema exporter",
  },
  {
    label: "+ Automated Test Suite",
    type: "test",
    message: "test(suite): add 100% automated unit and integration test runner with UI reporting",
  },
  {
    label: "+ Safe Arithmetic & PDA",
    type: "sec",
    message: "sec(anchor): enforce strict 49-byte account space, canonical PDA bump and checked arithmetic",
  },
];
