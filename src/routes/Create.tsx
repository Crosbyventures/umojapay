import { useMemo, useState } from 'react'
import { Address } from 'viem'
import { USDT_ADDRESS, USDC_ADDRESS, CHAIN_ID } from '../config'

export default function Create() {
  const [chain] = useState<number>(CHAIN_ID)
  const [token, setToken] = useState<Address>(USDC_ADDRESS)
  const [receiver, setReceiver] = useState<Address>('' as Address)
  const [amount, setAmount] = useState<string>('')
  const [memo, setMemo] = useState<string>('')

  // ✅ Paylink only includes receiver/token/amount/memo.
  // ✅ Fee + Treasury are NOT in the link (and Pay.tsx must ignore them anyway).
  const payLink = useMemo(() => {
    if (!receiver) return ''
    const params = new URLSearchParams()
    params.set('chain', String(chain))
    params.set('token', token)
    params.set('to', receiver)
    if (amount) params.set('amount', amount)
    if (memo) params.set('memo', memo)
    return `${window.location.origin}/#/pay?${params.toString()}`
  }, [chain, token, receiver, amount, memo])

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 20 }}>
      <h2>UMOJA PayLinks</h2>

      <label>Chain</label>
      <input
        value="BNB Chain (BSC)"
        disabled
        style={{ width: '100%', marginBottom: 12, opacity: 0.7 }}
      />

      <label>Token</label>
      <select
        value={token}
        onChange={(e) => setToken(e.target.value as Address)}
        style={{ width: '100%', marginBottom: 12 }}
      >
        <option value={USDT_ADDRESS}>USDT</option>
        <option value={USDC_ADDRESS}>USDC</option>
      </select>

      <label>Receiver wallet</label>
      <input
        value={receiver}
        onChange={(e) => setReceiver(e.target.value as Address)}
        placeholder="0x..."
        style={{ width: '100%', marginBottom: 12 }}
      />

      <label>Amount (optional — leave empty for open amount)</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="e.g. 25 or 100"
        style={{ width: '100%', marginBottom: 12 }}
      />

      <label>Memo (optional)</label>
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="e.g. Rent, Deposit, Donation..."
        style={{ width: '100%', marginBottom: 12 }}
      />

      {/* ✅ Fee/Treasury are hidden. Optional safe display: */}
      <div style={{ margin: '8px 0 14px', fontSize: 12, opacity: 0.8 }}>
        Protocol fee: <b>1%</b>
      </div>

      <button
        onClick={() => {
          if (!payLink) return
          navigator.clipboard?.writeText(payLink)
          alert('PayLink copied!')
        }}
        style={{ width: '100%', padding: 12, fontWeight: 700 }}
      >
        Copy PayLink
      </button>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
        PayLink:
        <div
          style={{
            marginTop: 6,
            padding: 10,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            wordBreak: 'break-all',
          }}
        >
          {payLink || 'Enter receiver wallet to generate link'}
        </div>
      </div>
    </div>
  )
}