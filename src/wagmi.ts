import { http, createConfig } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { WALLETCONNECT_PROJECT_ID } from './config'

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org')
  }
})
