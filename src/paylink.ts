// src/paylink.ts
import type { ChainKey, TokenKey } from "./registry"

export type PayLinkParams = {
  receiver: string
  amount: string // "" allowed for open amount
  memo: string
  feeBps?: number
  treasury?: string

  // NEW:
  chain?: ChainKey
  token?: TokenKey
}

// URL-safe base64 encoding
function b64urlEncode(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function b64urlDecode(str: string) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4))
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/")
  return decodeURIComponent(escape(atob(b64)))
}

export function encodePayLink(params: PayLinkParams) {
  const json = JSON.stringify(params)
  return b64urlEncode(json)
}

export function decodePayLink(encoded: string): PayLinkParams {
  const json = b64urlDecode(encoded)
  return JSON.parse(json)
}