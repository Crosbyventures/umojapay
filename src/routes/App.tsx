import { Routes, Route, Navigate, Link } from "react-router-dom"
import Create from "./Create"
import Pay from "./Pay"
import MerchantHome from "./MerchantHome"

export default function App() {
  return (
    <div className="umoja-app">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: 18 }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="umoja-title">UMOJA PayLinks</div>
            <div className="umoja-subtitle">
              Supported tokens: USDT • USDC (BSC · Ethereum · Base)
            </div>
          </div>
          <Link to="/" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>
            Create
          </Link>
        </div>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Create />} />
          <Route path="/pay/:encoded" element={<Pay />} />
          <Route path="/merchant" element={<MerchantHome />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}