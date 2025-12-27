import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import { FEE_BPS_DEFAULT, TREASURY_WALLET } from '../config'

export default function Pay() {
  const [receiver, setReceiver] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  // Locked values (NOT editable)
  const feePercent = useMemo(() => (FEE_BPS_DEFAULT / 100).toFixed(2), [])

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 20 }}>
      <h2 style={{ marginBottom: 14 }}>UMOJA Pay</h2>

      {/* Receiver */}
      <label>Receiver</label>
      <input
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        placeholder="0x..."
        style={{ width: '100%', marginBottom: 12 }}
      />

      {/* Amount */}
      <label>Amount (USDT)</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="e.g. 25"
        style={{ width: '100%', marginBottom: 12 }}
      />

      {/* LOCKED FEE (not editable) */}
      <label>Protocol fee</label>
      <input
        value={`${feePercent}% (${FEE_BPS_DEFAULT} bps)`}
        disabled
        readOnly
        style={{ width: '100%', marginBottom: 12, opacity: 0.7 }}
      />

      {/* LOCKED TREASURY (not editable) */}
      <label>Treasury wallet (fee recipient)</label>
      <input
        value={TREASURY_WALLET}
        disabled
        readOnly
        style={{ width: '100%', marginBottom: 18, opacity: 0.7 }}
      />

      <button style={{ width: '100%', padding: 12 }}>
        Pay Now
      </button>
    </div>
  )
}