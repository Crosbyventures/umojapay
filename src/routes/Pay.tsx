import { useMemo, useState } from 'react'
import { Address } from 'viem'
import {
  TREASURY_WALLET,
  FEE_BPS_DEFAULT,
  USDT_ADDRESS,
  USDC_ADDRESS,
  CHAIN_ID,
} from '../config'

export default function Pay() {
  const [receiver, setReceiver] = useState<Address>('' as Address)
  const [amount, setAmount] = useState<string>('')
  const [token, setToken] = useState<'USDT' | 'USDC'>('USDT')
  const [memo, setMemo] = useState<string>('')

  // ✅ HARD LOCKED (cannot be changed by UI or query params)
  const feeBps = FEE_BPS_DEFAULT
  const treasury = TREASURY_WALLET

  const tokenAddress = useMemo(() => {
    return token === 'USDT' ? USDT_ADDRESS : USDC_ADDRESS
  }, [token])

  const feePercent = (feeBps / 100).toFixed(2) + '%'

  async function onPay() {
    // ✅ This is where your real transfer function runs.
    // IMPORTANT: when you call it, pass `treasury` + `feeBps` from HERE (locked),
    // not from any user input.

    console.log('PAY', {
      CHAIN_ID,
      token,
      tokenAddress,
      receiver,
      amount,
      memo,
      feeBps,
      treasury,
    })

    alert('Pay triggered (wire your existing transfer code here).')
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 20 }}>
      <h2>UMOJA Pay</h2>

      <label>Token</label>
      <select
        value={token}
        onChange={(e) => setToken(e.target.value as 'USDT' | 'USDC')}
        style={{ width: '100%', marginBottom: 12 }}
      >
        <option value="USDT">USDT</option>
        <option value="USDC">USDC</option>
      </select>

      <label>Receiver wallet</label>
      <input
        value={receiver}
        onChange={(e) => setReceiver(e.target.value as Address)}
        placeholder="0x..."
        style={{ width: '100%', marginBottom: 12 }}
      />

      <label>Amount</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="e.g. 25"
        style={{ width: '100%', marginBottom: 12 }}
      />

      <label>Memo (optional)</label>
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="e.g. Rent / Donation"
        style={{ width: '100%', marginBottom: 12 }}
      />

      {/* ✅ Locked fee (not editable) */}
      <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, opacity: 0.9 }}>
        <div style={{ fontWeight: 700 }}>Protocol fee (locked)</div>
        <div>{feePercent} (BPS: {feeBps})</div>
        {/* ✅ Treasury is intentionally hidden */}
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          Fee receiver is secured (not editable)
        </div>
      </div>

      <button onClick={onPay} style={{ width: '100%', padding: 12 }}>
        Pay Now
      </button>
    </div>
  )
}