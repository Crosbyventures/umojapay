import React, { useMemo, useState } from 'react'
import { Card, Button, Input } from '../ui'
import { clearLinks, loadLinks } from '../lib/storage'

export default function Dashboard() {
  const [q, setQ] = useState('')

  const links = useMemo(() => {
    const all = loadLinks()
    const s = q.trim().toLowerCase()
    if (!s) return all
    return all.filter(x =>
      (x.receiver || '').toLowerCase().includes(s) ||
      (x.memo || '').toLowerCase().includes(s) ||
      (x.url || '').toLowerCase().includes(s) ||
      (x.token || '').toLowerCase().includes(s) ||
      (x.chain || '').toLowerCase().includes(s)
    )
  }, [q])

  function wipe() {
    if (!confirm('Clear saved paylinks on this device?')) return
    clearLinks()
    window.location.reload()
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card title="Dashboard">
        <div style={{ display: 'grid', gap: 12 }}>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search receiver / memo / token / chain..." />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={wipe} style={{ padding: '10px 12px', borderRadius: 10, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer' }}>
              Clear saved links
            </button>
          </div>

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Saved on this device only (no signup yet).
          </div>
        </div>
      </Card>

      {links.map((x) => (
        <Card key={x.id} title={`${x.token} • ${x.chain}`}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Receiver</div>
            <div style={{ wordBreak: 'break-all' }}>{x.receiver}</div>

            {x.amount ? (
              <>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Amount</div>
                <div>{x.amount}</div>
              </>
            ) : null}

            {x.memo ? (
              <>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Memo</div>
                <div>{x.memo}</div>
              </>
            ) : null}

            <div style={{ fontSize: 12, opacity: 0.8 }}>PayLink</div>
            <div style={{ wordBreak: 'break-all' }}>{x.url}</div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigator.clipboard.writeText(x.url)}
                style={{ padding: '10px 12px', borderRadius: 10, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer' }}
              >
                Copy
              </button>
              <a
                href={x.url}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 12px', borderRadius: 10, color: 'white', border: '1px solid rgba(255,255,255,0.14)', textDecoration: 'none' }}
              >
                Open
              </a>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}