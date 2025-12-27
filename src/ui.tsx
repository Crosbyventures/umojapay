import React from 'react'

export function Card({ title, children }: { title?: string, children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 14,
      padding: 16,
      background: 'rgba(0,0,0,0.25)',
      backdropFilter: 'blur(8px)'
    }}>
      {title && <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>{title}</div>}
      {children}
    </div>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>{children}</div>
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '12px 12px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(0,0,0,0.35)',
        color: 'white',
        outline: 'none'
      }}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        padding: '12px 12px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(0,0,0,0.35)',
        color: 'white',
        outline: 'none',
        minHeight: 84,
        resize: 'vertical'
      }}
    />
  )
}

export function Button({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.10)',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      {children}
    </button>
  )
}
