import { Address } from 'viem'

export const APP_NAME = 'UMOJA PayLinks'

// ===== CHAINS =====
export const CHAIN_ID = 56 // BSC mainnet

// ===== TOKENS =====
export const USDT_ADDRESS: Address =
  '0x55d398326f99059fF775485246999027B3197955'

export const USDC_ADDRESS: Address =
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'

// ===== TREASURY (FEES GO HERE) =====
// LOCKED IN CODE (NOT EDITABLE IN UI)
export const TREASURY_WALLET: Address =
  '0x1e2ba4212d9a0dd87f8d28c9137371ad7b7b2dbf'

// ===== FEES =====
// 100 bps = 1% (LOCKED IN CODE)
export const FEE_BPS_DEFAULT = 100

// ===== WALLETCONNECT =====
// Put your real WalletConnect Project ID here
export const WALLETCONNECT_PROJECT_ID = 'YOUR_WALLETCONNECT_PROJECT_ID'