import { Address } from 'viem'

export const APP_NAME = 'UMOJA PayLinks'

// ===== CHAINS =====
export const CHAIN_ID = 56 // BSC mainnet

// ===== TOKENS =====

// USDT (BEP-20) on BSC
export const USDT_ADDRESS: Address =
  '0x55d398326f99059fF775485246999027B3197955'

// USDC (BEP-20) on BSC
export const USDC_ADDRESS: Address =
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'

// ===== TREASURY (FEES GO HERE) =====
// 🔥 THIS IS THE ONLY PLACE YOU EVER CHANGE IT
export const TREASURY_WALLET: Address =
  '0x1e2ba4212d9a0dd87f8d28c9137371ad7b7b2dbf' // <-- your real wallet

// ===== FEES =====
export const FEE_BPS_DEFAULT = 100 // 100 = 1%

// ===== WALLETCONNECT =====
export const WALLETCONNECT_PROJECT_ID = 'YOUR_WALLETCONNECT_PROJECT_ID'