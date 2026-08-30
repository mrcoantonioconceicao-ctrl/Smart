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
