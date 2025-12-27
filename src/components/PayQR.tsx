import React from "react";
import QRCode from "react-qr-code";

export default function PayQR({ value }: { value: string }) {
  if (!value) return null;

  return (
    <div style={{ display: "grid", gap: 10, justifyItems: "center", padding: 12 }}>
      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        <QRCode value={value} size={220} />
      </div>

      <button
        onClick={() => window.print()}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.10)",
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
          width: 220,
        }}
      >
        Print QR
      </button>
    </div>
  );
}