# UMOJA PayLinks (MVP) — USDT-only, Non-custodial

**What this is**
- Create a PayLink + QR that requests **USDT (BEP-20)** on BSC.
- Payer connects wallet and sends **two transfers** in one click:
  1) protocol fee (USDT) to treasury wallet
  2) net amount (USDT) to receiver wallet
- **No custody**: funds go wallet-to-wallet.

## Quick start
1. Install Node.js 18+
2. In this folder:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

## Configure (IMPORTANT)
Edit `src/config.ts`:
- `TREASURY_WALLET` — where protocol fees go
- `FEE_BPS_DEFAULT` — fee in basis points (100 = 1%)
- `WALLETCONNECT_PROJECT_ID` — create one at WalletConnect Cloud

## USDT address (BSC)
This MVP uses USDT BEP-20 on BSC:
`0x55d398326f99059fF775485246999027B3197955`

## Notes
- This MVP does not store links in a database. The PayLink **encodes all params in the URL**.
- For production: add analytics + rate limiting + a minimal backend (optional).
