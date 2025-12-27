export type SavedLink = {
  id: string
  createdAt: number
  url: string
  receiver: string
  token: string
  chain: string
  amount?: string
  memo?: string
}

const KEY = 'umoja_saved_paylinks_v1'

export function loadLinks(): SavedLink[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedLink[]
  } catch {
    return []
  }
}

export function saveLink(link: SavedLink) {
  const all = loadLinks()
  all.unshift(link)
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)))
}

export function clearLinks() {
  localStorage.removeItem(KEY)
}