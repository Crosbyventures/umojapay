import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { bsc } from "wagmi/chains";

import { erc20Abi, isAddress, parseUnits, formatUnits } from "viem";

import { USDT_ADDRESS, USDT_DECIMALS, TREASURY_WALLET, FEE_BPS } from "./config";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Pay() {
  const query = useQuery();
  const location = useLocation();

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [merchant, setMerchant] = useState<string>(query.get("to") || "");
  const [amountStr, setAmountStr] = useState<string>(query.get("a") || "2");

  const [status, setStatus] = useState<string>("");
  const [tx1, setTx1] = useState<string>("");
  const [tx2, setTx2] = useState<string>("");

  // keep inputs synced with URL when opening a prefilled link
  useEffect(() => {
    const to = query.get("to");
    const a = query.get("a");
    if (to) setMerchant(to);
    if (a) setAmountStr(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const amountNum = Number(amountStr || "0");
  const feeNum = amountNum > 0 ? (amountNum * (FEE_BPS / 10000)) : 0;
  const netNum = amountNum > 0 ? (amountNum - feeNum) : 0;

  const merchantOk = isAddress(merchant || "");
  const amountOk = Number.isFinite(amountNum) && amountNum > 0;

  const feeUnits = useMemo(() => {
    try {
      return parseUnits(feeNum.toFixed(USDT_DECIMALS), USDT_DECIMALS);
    } catch {
      return 0n;
    }
  }, [feeNum]);

  const netUnits = useMemo(() => {
    try {
      return parseUnits(netNum.toFixed(USDT_DECIMALS), USDT_DECIMALS);
    } catch {
      return 0n;
    }
  }, [netNum]);

  const normalLink = useMemo(() => {
    const base = `${window.location.origin}/pay`;
    const u = new URL(base);
    if (merchantOk) u.searchParams.set("to", merchant);
    if (amountOk) u.searchParams.set("a", String(amountNum));
    return u.toString();
  }, [merchant, merchantOk, amountNum, amountOk]);

  // ✅ This is the IMPORTANT part: QR opens the dApp inside MetaMask browser
  const metaMaskDeepLink = useMemo(() => {
    // metamask wants: https://metamask.app.link/dapp/<domain>/<path>?query
    const dappPath = `${window.location.host}${new URL(normalLink).pathname}${new URL(normalLink).search}`;
    return `https://metamask.app.link/dapp/${dappPath}`;
  }, [normalLink]);

  async function ensureBsc() {
    if (chainId === bsc.id) return;
    setStatus("Switching to BSC...");
    await switchChainAsync({ chainId: bsc.id });
  }

  async function onPay() {
    setStatus("");
    setTx1("");
    setTx2("");

    if (!merchantOk) return setStatus("Enter a valid BSC wallet address.");
    if (!amountOk) return setStatus("Enter a valid amount > 0.");
    if (!isConnected) return setStatus("Connect your wallet first.");
    if (!walletClient) return setStatus("Wallet client not ready. Try reconnecting.");

    try {
      await ensureBsc();

      setStatus("Sending fee to treasury...");
      const hashFee = await walletClient.writeContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [TREASURY_WALLET as `0x${string}`, feeUnits],
      });
      setTx1(hashFee);

      setStatus("Sending net amount to merchant...");
      const hashNet = await walletClient.writeContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [merchant as `0x${string}`, netUnits],
      });
      setTx2(hashNet);

      setStatus("✅ Done. Payment sent.");
    } catch (e: any) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || "Transaction failed.");
    }
  }

  const connectedShort = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>UMOJA Pay (BSC • USDT)</h1>
          <div className="muted">Scan → open in MetaMask → connect wallet → pay USDT on BSC</div>
        </div>

        <div className="pill">
          {isConnected ? `Connected: ${connectedShort}` : "Not connected"}
        </div>
      </div>

      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        {isConnected ? (
          <button className="btn" onClick={() => disconnect()}>Disconnect</button>
        ) : (
          <button
            className="btn"
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}

        <div className="pill">
          {chainId === bsc.id ? "BSC Ready ✅" : "Wrong network ❌"}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label className="label">Merchant Wallet (BSC)</label>
        <input
          className="input"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value.trim())}
          placeholder="0x..."
        />
        <div className="muted" style={{ marginTop: 6 }}>
          Paste receiver wallet → QR updates instantly.
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label className="label">Amount (USDT)</label>
        <input
          className="input"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          inputMode="decimal"
          placeholder="2"
        />
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700 }}>Fee ({(FEE_BPS / 100).toFixed(2)}%) → Treasury</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>Merchant receives</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800 }}>
              {formatUnits(feeUnits, USDT_DECIMALS)} USDT
            </div>
            <div style={{ fontWeight: 800, marginTop: 6 }}>
              {formatUnits(netUnits, USDT_DECIMALS)} USDT
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, textAlign: "center" }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Scan to Pay (opens in MetaMask)</div>
        <div style={{ display: "inline-block", padding: 12, background: "#fff", borderRadius: 16 }}>
          <QRCodeCanvas value={metaMaskDeepLink} size={260} includeMargin />
        </div>
        <div className="muted" style={{ marginTop: 10 }}>
          BSC • USDT • Treasury fee: {(FEE_BPS / 100).toFixed(2)}%
        </div>
      </div>

      <button
        className="btn primary"
        style={{ marginTop: 18, width: "100%" }}
        onClick={onPay}
        disabled={!merchantOk || !amountOk || isConnecting || isSwitching}
      >
        Pay Now
      </button>

      <div style={{ marginTop: 14 }}>
        <div className="label">Share link (normal):</div>
        <a href={normalLink} target="_blank" rel="noreferrer">{normalLink}</a>

        <div className="label" style={{ marginTop: 10 }}>Share link (MetaMask deep link):</div>
        <a href={metaMaskDeepLink} target="_blank" rel="noreferrer">{metaMaskDeepLink}</a>
      </div>

      {status && (
        <div className="notice" style={{ marginTop: 14 }}>
          {status}
        </div>
      )}

      {(tx1 || tx2) && (
        <div style={{ marginTop: 10 }} className="muted">
          {tx1 && (
            <div>
              Fee TX:{" "}
              <a
                href={`https://bscscan.com/tx/${tx1}`}
                target="_blank"
                rel="noreferrer"
              >
                {tx1}
              </a>
            </div>
          )}
          {tx2 && (
            <div>
              Merchant TX:{" "}
              <a
                href={`https://bscscan.com/tx/${tx2}`}
                target="_blank"
                rel="noreferrer"
              >
                {tx2}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}