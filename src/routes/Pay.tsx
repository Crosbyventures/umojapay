// src/routes/Pay.tsx
import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { parseUnits, isAddress } from "viem"
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi"
import { Card, FieldLabel, Input, Textarea, Button } from "../ui"
import { decodePayLink } from "../paylink"
import { FEE_BPS_DEFAULT, TREASURY_WALLET } from "../config"
import { erc20Abi } from "../erc20Abi"
import PayQR from "../components/PayQR"
import { CHAINS, ChainKey, TokenKey } from "../registry"

export default function Pay() {
  // ✅ 4.3 Kiosk helper (top of Pay.tsx)
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "1"
  useEffect(() => {
    if (isKiosk) document.documentElement.classList.add("kiosk")
    else document.documentElement.classList.remove("kiosk")
    return () => document.documentElement.classList.remove("kiosk")
  }, [isKiosk])

  const { encoded } = useParams()
  const [openAmount, setOpenAmount] = useState("")
  const [status, setStatus] = useState<string>("")
  const [lastTx, setLastTx] = useState<string>("")

  const params = useMemo(() => {
    try {
      if (!encoded) return null
      return decodePayLink(encoded)
    } catch {
      return null
    }
  }, [encoded])

  if (!params) {
    return (
      <Card title="PayLink Error">
        <div>Invalid or corrupted PayLink.</div>
      </Card>
    )
  }

  const receiver = params.receiver || ""
  const memo = params.memo || ""
  const feeBps = params.feeBps ?? FEE_BPS_DEFAULT
  const treasury = (params.treasury as `0x${string}`) || TREASURY_WALLET
  const fixedAmount = params.amount || ""

  // ✅ IMPORTANT: force lowercase so registry lookup never fails
  const payChain = String(params.chain || "bsc").toLowerCase() as ChainKey
  const payToken = String(params.token || "usdt").toLowerCase() as TokenKey

  const chainMeta = CHAINS[payChain]
  const tokenMeta = chainMeta?.tokens?.[payToken]

  if (!chainMeta) {
    return (
      <Card title="Not supported">
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          Unknown chain: <b>{String(params.chain)}</b>
          <br />
          Fix it in <b>src/registry.ts</b>.
        </div>
      </Card>
    )
  }

  if (!tokenMeta) {
    return (
      <Card title="Not supported">
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          {chainMeta.name} does not support {String(params.token || "").toUpperCase()} yet.
          <br />
          Fix it in <b>src/registry.ts</b>.
        </div>
      </Card>
    )
  }

  const TOKEN_ADDRESS = tokenMeta.address
  const TOKEN_DECIMALS = tokenMeta.decimals

  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContractAsync, isPending: isWriting } = useWriteContract()

  const effectiveAmount = fixedAmount || openAmount

  const validationError = useMemo(() => {
    if (!isAddress(receiver)) return "Receiver address is invalid."
    if (!isAddress(treasury)) return "Treasury address is invalid."
    if (!effectiveAmount) return "Enter an amount."
    const n = Number(effectiveAmount)
    if (!Number.isFinite(n) || n <= 0) return "Amount must be a positive number."
    if (feeBps < 0 || feeBps > 500) return "Fee bps looks wrong (0–500 recommended)."
    return ""
  }, [receiver, treasury, effectiveAmount, feeBps])

  async function pay() {
    setStatus("")
    setLastTx("")

    if (validationError) {
      setStatus(validationError)
      return
    }
    if (!isConnected) {
      setStatus("Connect your wallet first.")
      return
    }
    if (chain?.id !== chainMeta.chainId) {
      setStatus(`Please switch your wallet network to ${chainMeta.name} (chainId ${chainMeta.chainId}).`)
      return
    }

    try {
      const amountUnits = parseUnits(effectiveAmount, TOKEN_DECIMALS)
      const feeUnits = (amountUnits * BigInt(feeBps)) / BigInt(10_000)
      const netUnits = amountUnits - feeUnits

      setStatus("Sending fee transfer...")
      await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [treasury, feeUnits],
      })

      setStatus("Sending main payment...")
      const payTx = await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [receiver as `0x${string}`, netUnits],
      })

      setLastTx(payTx)
      setStatus("✅ Payment sent. (Check explorer for confirmations)")
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || "Transaction failed.")
    }
  }

  // ✅ 4.4 Wrap UI for kiosk mode
  return (
    <div className={isKiosk ? "kiosk-wrap" : undefined} style={{ display: "grid", gap: 14 }}>
      <Card title="Scan to Pay">
        <div className={isKiosk ? "kiosk-qr" : undefined} style={{ display: "grid", gap: 12, justifyItems: "center" }}>
          <div style={{ transform: isKiosk ? "scale(1.18)" : "none", transformOrigin: "center" }}>
            <PayQR value={window.location.href} />
          </div>

          {!isKiosk && (
            <div style={{ fontSize: 12, opacity: 0.85, textAlign: "center" }}>
              {chainMeta.name} • {tokenMeta.symbol}
              {fixedAmount ? ` • ${fixedAmount} ${tokenMeta.symbol}` : ""}
            </div>
          )}

          {!isKiosk && memo ? (
            <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>
              Memo: {memo}
            </div>
          ) : null}

          {isKiosk ? (
            <div style={{ fontSize: 12, opacity: 0.75, textAlign: "center", lineHeight: 1.4 }}>
              Tablet Mode • Ask customer to scan and pay
            </div>
          ) : null}
        </div>
      </Card>

      <div className={isKiosk ? "kiosk-hide" : undefined}>
        <Card title={`Pay ${tokenMeta.symbol}`}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <FieldLabel>Receiver</FieldLabel>
              <Input value={receiver} readOnly />
            </div>

            <div>
              <FieldLabel>Memo</FieldLabel>
              <Textarea value={memo || "(none)"} readOnly />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <FieldLabel>Amount ({tokenMeta.symbol})</FieldLabel>
                {fixedAmount ? (
                  <Input value={fixedAmount} readOnly />
                ) : (
                  <Input value={openAmount} onChange={(e) => setOpenAmount(e.target.value)} placeholder="e.g. 25" />
                )}
              </div>
              <div>
                <FieldLabel>Protocol fee</FieldLabel>
                <Input value={`${feeBps / 100}% (${feeBps} bps)`} readOnly />
              </div>
            </div>

            {!isConnected ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Connect wallet to pay:</div>
                {connectors.map((c) => (
                  <button
                    key={c.uid}
                    onClick={() => connect({ connector: c })}
                    disabled={isConnecting}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "transparent",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.14)",
                      cursor: "pointer",
                    }}
                  >
                    Connect {c.name}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Connected: {address}</div>
                <button
                  onClick={() => disconnect()}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "transparent",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.14)",
                    cursor: "pointer",
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}

            <Button onClick={pay} disabled={!!validationError || isWriting}>
              {isWriting ? "Sending..." : "Pay Now"}
            </Button>

            {status && (
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.95,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {status}
              </div>
            )}

            {lastTx && (
              <div style={{ fontSize: 12, opacity: 0.9, wordBreak: "break-all" }}>
                Last tx hash: {lastTx}
                <div style={{ marginTop: 6 }}>
                  <a href={chainMeta.explorerTx(lastTx)} target="_blank" rel="noreferrer" style={{ color: "white", textDecoration: "underline" }}>
                    View on explorer
                  </a>
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
              Notes:
              <ul>
                <li>This page performs two transfers: fee → treasury, then net → receiver.</li>
                <li>Make sure your wallet has gas ({chainMeta.nativeSymbol}) to pay network fees.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}