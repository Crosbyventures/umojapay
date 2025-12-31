// src/config.ts

export const APP_NAME = "UMOJA Pay (BSC • USDT)";

// BSC mainnet
export const BSC_CHAIN_ID = 56;

// USDT (BEP-20) on BSC mainnet
export const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;

// Your treasury wallet (1% fee goes here)
export const TREASURY_ADDRESS = "0x1e2ba4212d9a0dd87f8d28c9137371ad7b7b2dbf" as const;

// 1% = 100 bps
export const FEE_BPS = 100;

// USDT on BSC uses 18 decimals
export const USDT_DECIMALS = 18;

// Basic address check (frontend only)
export const isAddressLoose = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v);