// src/wagmi.ts
import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected } from "wagmi/connectors";

import { getWalletClient } from "@wagmi/core";
import { erc20Abi } from "viem";

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

/**
 * Helper: get a walletClient + USDT contract config (for writes)
 */
export async function getUSDTContract(usdtAddress: `0x${string}`) {
  const walletClient = await getWalletClient(wagmiConfig);
  if (!walletClient) throw new Error("Wallet not connected");

  return {
    address: usdtAddress,
    abi: erc20Abi,
    walletClient,
  };
}