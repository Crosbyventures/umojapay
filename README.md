# UMOJA PayLinks (MVP)

UMOJA PayLinks is an open-source, non-custodial payment infrastructure that allows
merchants and individuals to request and receive stablecoin payments (USDT)
using simple PayLinks and QR codes.

The system enables direct wallet-to-wallet payments without custody,
bank dependencies, or intermediaries.

---

## What This Is

UMOJA PayLinks allows a merchant or individual to:

- Generate a PayLink + QR code requesting a specific USDT amount
- Accept payments directly from a payer’s wallet
- Split a transaction into:
  - a protocol fee (USDT) sent to a treasury wallet
  - a net payment (USDT) sent directly to the receiver
- Maintain full non-custodial flow (funds never touch a platform wallet)

This MVP currently supports **USDT (BEP-20) on BNB Smart Chain (BSC)**.

---

## Why This Matters

Many merchants face:
- High payment processing fees
- Settlement delays
- Bank account freezes or exclusions
- Limited access to global payments

UMOJA PayLinks provides:
- Low-fee stablecoin payments
- Instant settlement
- Censorship-resistant, wallet-based transfers
- Open-source, auditable payment logic

---

## Architecture (Non-Custodial by Design)

- Wallet-to-wallet transfers only
- No custody of user funds
- No database required for payment links
- All payment parameters encoded in the PayLink URL

---

## Current MVP Features

- USDT payment requests via PayLink + QR
- One-click wallet connection
- Automatic fee split (protocol + receiver)
- Configurable protocol fee (basis points)
- Fully client-side MVP

---

## Quick Start

1. Install Node.js 18+
2. Install dependencies:
3.  Run locally:
4.  Open:
http://localhost:5173
   

---

## Configuration

Edit `src/config.ts`:

- `TREASURY_WALLET`  
Wallet address that receives protocol fees

- `FEE_BPS_DEFAULT`  
Protocol fee in basis points (100 = 1%)

- `WALLETCONNECT_PROJECT_ID`  
Create one at https://cloud.walletconnect.com

---

## Stablecoin Configuration

This MVP uses **USDT (BEP-20) on BNB Smart Chain (BSC)**

USDT Contract Address:0x55d398326f99059fF775485246999027B3197955
---

## Open-Source Scope

The following components are intended to remain open-source:
- PayLink generation logic
- Fee-splitting transaction flow
- Wallet connection and signing logic
- Documentation and integration guides

---

## Roadmap (Next 90 Days)

- Improve UX for merchant onboarding
- Add analytics (non-invasive)
- Add optional minimal backend (rate limiting, monitoring)
- Security review and hardening
- Pilot deployment with real merchants

---

## Funding Use

Grant funding will be used for:
- Code hardening and refactoring
- Documentation and onboarding guides
- Security review
- Pilot deployment support

---

## Status

Working MVP.  
Seeking grant funding to harden, document, and deploy
open-source stablecoin payment infrastructure for merchants.
