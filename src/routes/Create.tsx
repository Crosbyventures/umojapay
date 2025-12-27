import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, FieldLabel, Input, Textarea, Button } from '../ui'
import { encodePayLink } from '../paylink'
import { FEE_BPS_DEFAULT, TREASURY_WALLET } from '../config'
import { CHAINS, type ChainKey } from '../registry'
import { TOKEN_META } from '../tokens'
type TokenKey = keyof typeof TOKEN_META

// registry no longer exports CHAIN_ORDER; derive it from CHAINS
const CHAIN_ORDER: ChainKey[] = Object.keys(CHAINS) as ChainKey[]

export default function Create() {
  const nav = useNavigate()

  const [chainKey, setChainKey] = useState<ChainKey>('bsc')
  const [token, setToken] = useState<TokenKey>('USDT')

  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('') // optional
  const [memo, setMemo] = useState('')
  const [feeBps, setFeeBps] = useState(String(FEE_BPS_DEFAULT))
  const [treasury, setTreasury] = useState(String(TREASURY_WALLET))

  // ✅ token availability by chain (Base = no USDT in your setup)
  const supportedTokens = useMemo<TokenKey[]>(() => {
    if (chainKey === 'base') return ['USDC']
    return ['USDT', 'USDC']
  }, [chainKey])

  // auto-fix token if user switches to a chain that doesn’t support it
  React.useEffect(() => {
    if (!supportedTokens.includes(token)) setToken(supportedTokens[0])
  }, [supportedTokens, token])

  const encoded = useMemo(() => {
    if (!receiver) return ''
    const nFee = Number(feeBps || FEE_BPS_DEFAULT)
    return encodePayLink({
      chainKey,
      token,
      receiver,
      amount,
      memo,
      feeBps: nFee,
      treasury,
    } as any)
  }, [chainKey, token, receiver, amount, memo, feeBps, treasury])

  const link = useMemo(() => {
    if (!encoded) return ''
    const origin = window.location.origin
    return `${origin}/pay/${encoded}`
  }, [encoded])

  function copy() {
    if (!link) return
    navigator.clipboard.writeText(link)
    alert('Copied PayLink')
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card title="Create a PayLink">
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Chain + Token */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel>Chain</FieldLabel>
              <select
                value={chainKey}
                onChange={(e) => setChainKey(e.target.value as ChainKey)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {CHAIN_ORDER.map((k: ChainKey) => (
                  <option key={k} value={k}>
                    {CHAINS[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Token</FieldLabel>

              {/* ✅ icon preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <img src={TOKEN_META[token as keyof typeof TOKEN_META].icon} alt={token} width={22} height={22} />
                <strong>{token}</strong>
              </div>

              <select
                value={token}
                onChange={(e) => setToken(e.target.value as TokenKey)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {supportedTokens.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {chainKey === 'base' && (
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                  Note: On Base, this MVP supports USDC (USDT not shown).
                </div>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Receiver wallet</FieldLabel>
            <Input value={receiver} onChange={(e) => setReceiver(e.target.value.trim())} placeholder="0x..." />
          </div>

          <div>
            <FieldLabel>Amount (optional — leave empty for open amount)</FieldLabel>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 25 or 100" />
          </div>

          <div>
            <FieldLabel>Memo (optional)</FieldLabel>
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="e.g. Rent, Deposit, Donation..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel>Fee (bps) — 100 = 1%</FieldLabel>
              <Input value={feeBps} onChange={(e) => setFeeBps(e.target.value)} placeholder="100" />
            </div>
            <div>
              <FieldLabel>Treasury wallet (fee recipient)</FieldLabel>
              <Input value={treasury} onChange={(e) => setTreasury(e.target.value.trim())} placeholder="0x..." />
            </div>
          </div>

          <Button disabled={!encoded} onClick={() => nav(`/pay/${encoded}`)}>
            Preview Pay Page
          </Button>

          <div style={{ fontSize: 12, opacity: 0.85 }}>
            PayLink:
            <div
              style={{
                wordBreak: 'break-all',
                marginTop: 6,
                padding: 10,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {link || 'Enter receiver wallet to generate link'}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={copy}
                disabled={!link}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.14)',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}