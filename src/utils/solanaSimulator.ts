import { SolanaWallet, OnChainCounterAccount, TransactionLog } from "../types";

// Helper to generate a realistic Solana Base58 public key format
export function generateSolanaPubkey(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Pseudo-random deterministic PDA Derivation based on seeds and authority pubkey
export function deriveCounterPda(authorityPubkey: string, programId: string): { pdaAddress: string; bump: number } {
  // Simple deterministic hash simulation for PDA
  let hash = 0;
  const seedString = `counter:${authorityPubkey}:${programId}`;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let pda = "PDA_";
  const absHash = Math.abs(hash);
  for (let i = 0; i < 40; i++) {
    pda += chars[(absHash + i * 13) % chars.length];
  }
  // Canonical bump seed search (255 down)
  const bump = 255 - (absHash % 10);
  return { pdaAddress: pda.slice(0, 44), bump };
}

export function createInitialWallet(): SolanaWallet {
  const pubkey = "7xKXtg2CW87d97TXJSDpbD5jBkP29zFJ2d1bYg8N41kR";
  return {
    publicKey: pubkey,
    secretKeyDisplay: "[214, 45, 12, 98, 204, 11, 87, 43, 99, 102, 33, 88, 12, 45, 90, ...]",
    balanceSol: 5.0,
    isConnected: true,
  };
}

export function createInitialCounterAccount(pdaAddress: string, authority: string, bump: number): OnChainCounterAccount {
  return {
    isInitialized: false,
    pdaAddress,
    authority,
    count: 0,
    bump,
    rentExemptReserveSol: 0.0012384,
    dataLengthBytes: 49,
  };
}

export function generateTxHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let hash = "";
  for (let i = 0; i < 88; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}
