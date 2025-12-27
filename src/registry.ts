// src/registry.ts
export type ChainKey = "bsc" | "ethereum" | "base"
export type TokenKey = "usdt" | "usdc"

type TokenMeta = {
  key: TokenKey
  symbol: string
  name: string
  decimals: number
  address: `0x${string}`
  icon: string // we will use /public/tokens/*.svg so no import errors
}

type ChainMeta = {
  key: ChainKey
  name: string
  chainId: number
  nativeSymbol: string
  explorerBase: string
  explorerTx: (hash: string) => string
  tokens: Record<TokenKey, TokenMeta | undefined>
}

export const CHAINS: Record<ChainKey, ChainMeta> = {
  bsc: {
    key: "bsc",
    name: "BNB Chain (BSC)",
    chainId: 56,
    nativeSymbol: "BNB",
    explorerBase: "https://bscscan.com",
    explorerTx: (hash) => `https://bscscan.com/tx/${hash}`,
    tokens: {
      // ✅ USDT (BEP-20) BSC
      usdt: {
        key: "usdt",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 18,
        address: "0x55d398326f99059fF775485246999027B3197955",
        icon: "/tokens/usdt.svg",
      },
      // ✅ USDC (BEP-20) BSC (most common address)
      usdc: {
        key: "usdc",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 18,
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        icon: "/tokens/usdc.svg",
      },
    },
  },

  ethereum: {
    key: "ethereum",
    name: "Ethereum",
    chainId: 1,
    nativeSymbol: "ETH",
    explorerBase: "https://etherscan.io",
    explorerTx: (hash) => `https://etherscan.io/tx/${hash}`,
    tokens: {
      // ✅ USDT (ERC-20)
      usdt: {
        key: "usdt",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        icon: "/tokens/usdt.svg",
      },
      // ✅ USDC (ERC-20)
      usdc: {
        key: "usdc",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        icon: "/tokens/usdc.svg",
      },
    },
  },

  base: {
    key: "base",
    name: "Base",
    chainId: 8453,
    nativeSymbol: "ETH",
    explorerBase: "https://basescan.org",
    explorerTx: (hash) => `https://basescan.org/tx/${hash}`,
    tokens: {
      // ❌ USDT on Base is not standard everywhere — leave undefined (so UI can auto-block)
      usdt: undefined,

      // ✅ USDC on Base (native USDC)
      usdc: {
        key: "usdc",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        icon: "/tokens/usdc.svg",
      },
    },
  },
}