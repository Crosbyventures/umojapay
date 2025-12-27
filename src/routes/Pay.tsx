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

export default function Pay() {
  // ✅ HARD LOCKED (never read from URL / never editable)
  const feeBps = FEE_BPS_DEFAULT // 100 = 1%
  const treasury = TREASURY_WALLET

  // UI state
  const [receiver, setReceiver] = useState<Address>('' as Address)
  const [amount, setAmount] = useState<string>('')
  const [memo, setMemo] = useState<string>('')

  // Token state is stored as Address to avoid "USDT/USDC" mismatch bugs
  const [tokenAddress, setTokenAddress] = useState<Address>(USDT_ADDRESS)

  // ✅ Read ONLY allowed params from URL (NO fee, NO treasury)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // chain (optional but we can validate)
    const chainParam = params.get('chain')
    if (chainParam && Number(chainParam) !== CHAIN_ID) {
      // ignore wrong chain; you can show a warning if you want
      console.warn('Wrong chain in URL. Expected', CHAIN_ID, 'got', chainParam)
    }

    // token address (optional)
    const tokenParam = safeAddress(params.get('token'))
    if (tokenParam) {
      if (
        tokenParam.toLowerCase() === USDT_ADDRESS.toLowerCase() ||
        tokenParam.toLowerCase() === USDC_ADDRESS.toLowerCase()
      ) {
        setTokenAddress(tokenParam)
      }
    }

    // receiver
    const toParam = safeAddress(params.get('to'))
    if (toParam) setReceiver(toParam)

    // amount + memo
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
    // ✅ FINAL BOSS: Always use locked feeBps + treasury from HERE
    // ✅ Never trust anything from UI for treasury/fee

    console.log('PAY (LOCKED)', {
      chainId: CHAIN_ID,
      tokenAddress,
      receiver,
      amount,
      memo,
      feeBps, // locked
      treasury, // locked
    })

    // TODO: plug your real transfer execution here.
    // It must use `treasury` + `feeBps` from this scope.
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

      {/* ✅ Fee + treasury are hidden completely */}
      <button onClick={onPay} style={{ width: '100%', padding: 12 }}>
        Pay Now
      </button>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Note: A 1% protocol fee is applied automatically.
      </div>
    </div>
  )
}