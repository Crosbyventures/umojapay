// src/Pay.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { bsc } from "wagmi/chains";
import { isAddress, parseUnits, formatUnits } from "viem";

// =====================
// CONFIG (BSC ONLY)
// =====================
const TREASURY_WALLET = "0x1e2ba4212d9a0dd87f8d28c9137371ad7b7b2dbf" as const;

// BSC USDT (BEP-20) — commonly used address
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955" as const;

// BSC USDT uses 18 decimals on BSC
const USDT_DECIMALS = 18;

// 1% fee
const FEE_BPS = 100; // 100 bps = 1.00%
const BPS_DENOM = 10_000;

const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

function shortAddr(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function clampAmountInput(v: string) {
  // allow digits + dot
  return v.replace(/[^\d.]/g, "");
}

export default function Pay() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Prefill from URL
  const urlTo = searchParams.get("to") ?? "";
  const urlA = searchParams.get("a") ?? "";

  const [to, setTo] = useState<string>(urlTo);
  const [amount, setAmount] = useState<string>(urlA);

  // QR / share link
  const [qrValue, setQrValue] = useState<string>("");

  // wagmi
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // status
  const [status, setStatus] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [txFeeHash, setTxFeeHash] = useState<string>("");
  const [txMerchantHash, setTxMerchantHash] = useState<string>("");

  // keep URL synced (nice for sharing)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (to) next.set("to", to);
    else next.delete("to");

    if (amount) next.set("a", amount);
    else next.delete("a");

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, amount]);

  // Auto-generate QR as soon as receiver wallet looks valid
  useEffect(() => {
    if (isAddress(to)) {
      const base = `${window.location.origin}/pay`;
      const url =
        base + `?to=${to}` + (amount ? `&a=${encodeURIComponent(amount)}` : "");
      setQrValue(url);
    } else {
      setQrValue("");
    }
  }, [to, amount]);

  const bscReady = chainId === bsc.id;

  const parsed = useMemo(() => {
    const validTo = isAddress(to);
    const validAmt =
      amount !== "" && !Number.isNaN(Number(amount)) && Number(amount) > 0;

    let total = 0n;
    let fee = 0n;
    let merchant = 0n;

    try {
      if (validAmt) {
        total = parseUnits(amount, USDT_DECIMALS);
        fee = (total * BigInt(FEE_BPS)) / BigInt(BPS_DENOM);
        merchant = total - fee;
      }
    } catch {
      // ignore
    }

    return { validTo, validAmt, total, fee, merchant };
  }, [to, amount]);

  const feeDisplay = useMemo(() => {
    return parsed.validAmt ? Number(formatUnits(parsed.fee, USDT_DECIMALS)).toFixed(6) : "0.000000";
  }, [parsed]);

  const merchantDisplay = useMemo(() => {
    return parsed.validAmt
      ? Number(formatUnits(parsed.merchant, USDT_DECIMALS)).toFixed(6)
      : "0.000000";
  }, [parsed]);

  async function ensureBsc() {
    if (chainId === bsc.id) return;
    setStatus("Switching to BSC...");
    await switchChainAsync({ chainId: bsc.id });
  }

  async function connectWallet() {
    setErr("");
    setStatus("Connecting...");
    // pick injected first, fallback walletconnect if present
    const injected = connectors.find((c: any) => c.id === "injected");
    const wc = connectors.find(
      (c: any) =>
        c.id === "walletConnect" ||
        (typeof c.name === "string" && c.name.toLowerCase().includes("walletconnect"))
    );

    const picked = injected ?? wc ?? connectors[0];
    if (!picked) throw new Error("No wallet connector found.");

    await connectAsync({ connector: picked });
    setStatus("Connected.");
  }

  async function payNow() {
    setErr("");
    setStatus("");
    setTxFeeHash("");
    setTxMerchantHash("");

    if (!isConnected || !address) {
      setErr("Connect your wallet first.");
      return;
    }

    if (!parsed.validTo) {
      setErr("Paste a valid BSC wallet address (0x...).");
      return;
    }

    if (!parsed.validAmt) {
      setErr("Enter a valid USDT amount.");
      return;
    }

    if (!isAddress(TREASURY_WALLET)) {
      setErr("Treasury wallet is invalid.");
      return;
    }

    try {
      await ensureBsc();

      // 1) Pay fee to treasury
      setStatus("Sending 1% fee to treasury...");
      const feeHash = await writeContractAsync({
        abi: ERC20_ABI,
        address: USDT_BSC,
        functionName: "transfer",
        args: [TREASURY_WALLET, parsed.fee],
      });
      setTxFeeHash(String(feeHash));

      // 2) Pay merchant (net)
      setStatus("Sending payment to merchant...");
      const merchantHash = await writeContractAsync({
        abi: ERC20_ABI,
        address: USDT_BSC,
        functionName: "transfer",
        args: [to as `0x${string}`, parsed.merchant],
      });
      setTxMerchantHash(String(merchantHash));

      setStatus("Done ✅ Payment sent.");
    } catch (e: any) {
      console.error(e);
      setErr(e?.shortMessage || e?.message || "Payment failed.");
      setStatus("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(780px, 100%)",
          borderRadius: 18,
          padding: 22,
          background: "rgba(10, 16, 20, 0.82)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 0.2 }}>
              UMOJA Pay (BSC • USDT)
            </div>
            <div style={{ opacity: 0.85, marginTop: 6 }}>
              Simple scan → connect wallet → pay USDT on BNB Chain (BSC)
            </div>
          </div>

          <div
            style={{
              alignSelf: "start",
              padding: "8px 12px",
              borderRadius: 999,
              background: isConnected ? "rgba(0,255,150,0.10)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              fontWeight: 700,
            }}
          >
            {isConnected ? `Connected: ${shortAddr(address)}` : "Not connected"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {!isConnected ? (
            <button
              onClick={connectWallet}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0, 180, 120, 0.20)",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={() => disconnect()}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Disconnect
            </button>
          )}

          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: bscReady ? "rgba(0,255,150,0.12)" : "rgba(255,200,0,0.12)",
              color: "white",
              fontWeight: 800,
            }}
          >
            {bscReady ? "BSC Ready ✅" : "Not on BSC"}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Merchant Wallet (BSC)</div>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value.trim())}
            placeholder="0x..."
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
              fontSize: 16,
            }}
          />
          <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
            Paste the receiver wallet → QR shows instantly.
          </div>

          <div style={{ fontWeight: 800, marginTop: 16, marginBottom: 8 }}>Amount (USDT)</div>
          <input
            value={amount}
            onChange={(e) => setAmount(clampAmountInput(e.target.value))}
            placeholder="e.g. 10"
            inputMode="decimal"
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
              fontSize: 16,
            }}
          />

          {/* Fee breakdown */}
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>Fee (1%) → Treasury</div>
              <div style={{ fontWeight: 900 }}>{feeDisplay} USDT</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>Merchant receives</div>
              <div style={{ fontWeight: 900 }}>{merchantDisplay} USDT</div>
            </div>
          </div>

          {/* QR */}
          {qrValue && (
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Scan to Pay</div>
              <div
                style={{
                  display: "inline-block",
                  padding: 14,
                  borderRadius: 14,
                  background: "white",
                }}
              >
                <QRCodeCanvas value={qrValue} size={220} />
              </div>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                BSC · USDT · Treasury fee: 1%
              </div>
            </div>
          )}

          {/* Pay */}
          <button
            onClick={payNow}
            disabled={!isConnected || !parsed.validTo || !parsed.validAmt}
            style={{
              width: "100%",
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                !isConnected || !parsed.validTo || !parsed.validAmt
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(0, 200, 120, 0.28)",
              color: "white",
              cursor:
                !isConnected || !parsed.validTo || !parsed.validAmt ? "not-allowed" : "pointer",
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            Pay Now
          </button>

          {/* Share link */}
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Share link (prefilled):</div>
            <a
              href={qrValue || "#"}
              style={{ color: "rgba(150,255,210,0.95)", wordBreak: "break-all" }}
              onClick={(e) => {
                if (!qrValue) e.preventDefault();
              }}
            >
              {qrValue || `${window.location.origin}/pay`}
            </a>
          </div>

          {/* Status / errors */}
          {(status || err) && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: err ? "rgba(255,80,80,0.12)" : "rgba(0,255,150,0.10)",
              }}
            >
              {status && <div style={{ fontWeight: 900 }}>{status}</div>}
              {err && <div style={{ fontWeight: 900 }}>{err}</div>}
            </div>
          )}

          {/* Tx hashes */}
          {(txFeeHash || txMerchantHash) && (
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.9 }}>
              {txFeeHash && (
                <div style={{ marginBottom: 6 }}>
                  Fee TX:{" "}
                  <a
                    href={`https://bscscan.com/tx/${txFeeHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "rgba(150,255,210,0.95)" }}
                  >
                    {txFeeHash}
                  </a>
                </div>
              )}
              {txMerchantHash && (
                <div>
                  Merchant TX:{" "}
                  <a
                    href={`https://bscscan.com/tx/${txMerchantHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "rgba(150,255,210,0.95)" }}
                  >
                    {txMerchantHash}
                  </a>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 14, opacity: 0.75, fontSize: 12 }}>
            Network: BNB Chain (BSC) • Token: USDT • Treasury fee: 1.00%
          </div>
        </div>
      </div>
    </div>
  );
}