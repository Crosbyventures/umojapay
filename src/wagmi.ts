// src/wagmi.ts
import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [bsc.id]: http(),
  },
});