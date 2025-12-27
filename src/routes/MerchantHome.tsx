import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../ui'

export default function MerchantHome() {
  const nav = useNavigate()

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card title="Merchant Home">
        <div style={{ display: 'grid', gap: 12 }}>
          <Button onClick={() => nav('/')}>Create PayLink</Button>
          <Button onClick={() => nav('/dashboard')}>Dashboard</Button>
          <Button onClick={() => nav('/verify')}>Verify</Button>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8, lineHeight: 1.5 }}>
          Tip: Put this on a tablet in the store. Create a link once, then use “Kiosk Mode” to show QR.
        </div>
      </Card>
    </div>
  )
}