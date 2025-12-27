import React, { useEffect, useRef } from "react"

type Node = { x: number; y: number; vx: number; vy: number }

export default function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    let raf = 0
    let w = 0
    let h = 0
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

    const GRID_X = 15
    const GRID_Y = 10
    const nodes: Node[] = []

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    function resize() {
      const parent = canvas.parentElement
      w = parent ? parent.clientWidth : window.innerWidth
      h = parent ? parent.clientHeight : window.innerHeight
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // initialize nodes on a grid
      nodes.length = 0
      for (let gy = 0; gy < GRID_Y; gy++) {
        for (let gx = 0; gx < GRID_X; gx++) {
          const x = (gx / (GRID_X - 1)) * w
          const y = (gy / (GRID_Y - 1)) * h
          nodes.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
          })
        }
      }
    }

    function draw(t: number) {
      // background fade
      ctx.clearRect(0, 0, w, h)

      // subtle haze
      const haze = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, Math.max(w, h))
      haze.addColorStop(0, "rgba(0,255,170,0.10)")
      haze.addColorStop(0.35, "rgba(110,160,255,0.07)")
      haze.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, w, h)

      // animate nodes slightly
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy

        // gentle spring back to grid “home”
        // (home positions are derived by projecting node index back to grid)
      }

      // draw mesh lines
      ctx.lineWidth = 1
      for (let gy = 0; gy < GRID_Y; gy++) {
        for (let gx = 0; gx < GRID_X; gx++) {
          const i = gy * GRID_X + gx
          const n = nodes[i]

          // “home” point
          const hx = (gx / (GRID_X - 1)) * w
          const hy = (gy / (GRID_Y - 1)) * h

          // spring
          n.vx += (hx - n.x) * 0.0008
          n.vy += (hy - n.y) * 0.0008

          // damping
          n.vx *= 0.985
          n.vy *= 0.985

          // neighbor lines
          const right = gx < GRID_X - 1 ? nodes[i + 1] : null
          const down = gy < GRID_Y - 1 ? nodes[i + GRID_X] : null

          const pulse = (Math.sin(t * 0.001 + (gx + gy) * 0.35) + 1) / 2
          const alpha = lerp(0.05, 0.18, pulse)

          ctx.strokeStyle = `rgba(255,255,255,${alpha})`
          ctx.shadowBlur = 10
          ctx.shadowColor = "rgba(0,255,170,0.10)"

          ctx.beginPath()
          if (right) {
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(right.x, right.y)
          }
          if (down) {
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(down.x, down.y)
          }
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      // glowing nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const wave = (Math.sin(t * 0.0012 + i * 0.12) + 1) / 2
        const r = lerp(1.2, 2.6, wave)
        const a = lerp(0.10, 0.35, wave)

        // gradient dot
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22)
        g.addColorStop(0, `rgba(0,255,170,${a})`)
        g.addColorStop(0.35, `rgba(110,160,255,${a * 0.75})`)
        g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g
        ctx.fillRect(n.x - 22, n.y - 22, 44, 44)

        ctx.fillStyle = `rgba(255,255,255,${a * 0.35})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const onResize = () => resize()
    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="umj-mesh"
      aria-hidden="true"
    />
  )
}