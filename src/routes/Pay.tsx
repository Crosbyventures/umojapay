import { useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import {
  TREASURY_WALLET,
  FEE_BPS_DEFAULT,
  USDT_ADDRESS,
  USDC_ADDRESS,
  CHAIN_ID,
} from '../config'

function safeAddress(v: string | null): Address | null {
  if (!v) return null
  const s = v.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(s)) return null
  return s as Address
}

// ✅ Reads query params from "#/pay?..." for GitHub Pages hash routing
function getHashSearchParams(): URLSearchParams {
  // examples:
  // "#/pay?to=0x..&token=0x.."
  // "#/pay"
  const hash = window.location.hash || ''
  const qIndex = hash.indexOf('?')
  if (qIndex === -1) return new URLSearchParams()
  return new URLSearchParams(hash.slice(qIndex + 1))
}

export default function Pay() {
  // ✅ HARD LOCKED (never read from URL / never editable)
  const feeBps = FEE_BPS_DEFAULT // 100 = 1%
  const treasury = TREASURY_WALLET

  // UI state
  const [receiver, setReceiver] = useState<Address>('' as Address)
  const [amount, setAmount] = useState<string>('')
  const [memo, setMemo] = useState<string>('')

  // Token address state (USDT/USDC)
  const [tokenAddress, setTokenAddress] = useState<Address>(USDT_ADDRESS)

  // ✅ Read ONLY allowed params from HASH (NO fee, NO treasury)
  useEffect(() => {
    const params = getHashSearchParams()

    const chainParam = params.get('chain')
    if (chainParam && Number(chainParam) !== CHAIN_ID) {
      console.warn('Wrong chain in URL. Expected', CHAIN_ID, 'got', chainParam)
    }

    const tokenParam = safeAddress(params.get('token'))
    if (tokenParam) {
      const t = tokenParam.toLowerCase()
      if (t === USDT_ADDRESS.toLowerCase() || t === USDC_ADDRESS.toLowerCase()) {
        setTokenAddress(tokenParam)
      }
    }

    const toParam = safeAddress(params.get('to'))
    if (toParam) setReceiver(toParam)

    const amountParam = params.get('amount')
    if (amountParam) setAmount(amountParam)

    const memoParam = params.get('memo')
    if (memoParam) setMemo(memoParam)
  }, [])

  const tokenLabel = useMemo(() => {
    return tokenAddress.toLowerCase() === USDC_ADDRESS.toLowerCase()
      ? 'USDC'
      : 'USDT'
  }, [tokenAddress])

  async function onPay() {
    console.log('PAY (LOCKED)', {
      chainId: CHAIN_ID,
      tokenAddress,
      receiver,
      amount,
      memo,
      feeBps,     // locked
      treasury,   // locked
    })

    alert('Pay triggered (connect your transfer logic here).')
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 20 }}>
      <h2>UMOJA Pay</h2>

      <label>Token</label>
      <select
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value as Address)}
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

      <label>Amount ({tokenLabel})</label>
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
        style={{ width: '100%', marginBottom: 16 }}
      />

      {/* ✅ Fee + treasury hidden */}
      <button onClick={onPay} style={{ width: '100%', padding: 12 }}>
        Pay Now
      </button>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Note: A 1% protocol fee is applied automatically.
      </div>
    </div>
  )
}