import usdt from './assets/tokens/usdt.png'
import usdc from './assets/tokens/usdc.png'

export type TokenKey = 'USDT' | 'USDC'

export const TOKEN_META: Record<
  TokenKey,
  {
    symbol: TokenKey
    name: string
    icon: string
  }
> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: usdt,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: usdc,
  },
}