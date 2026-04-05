import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/client'

function NavItem({ index, label, sub, to, disabled }) {
  const [hovered, setHovered] = useState(false)
  const [magnetPos, setMagnetPos] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setMagnetPos({
      x: (e.clientX - cx) * 0.12,
      y: (e.clientY - cy) * 0.12,
    })
  }
  function handleMouseLeave() {
    setHovered(false)
    setMagnetPos({ x: 0, y: 0 })
  }

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${magnetPos.x}px, ${magnetPos.y}px)`, transition: 'transform 0.15s ease' }}
      className={`group flex items-center justify-between py-6 border-b border-white/10 px-2
        transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/[0.025] cursor-pointer'}`}
    >
      <div>
        <p className="font-mono text-[0.55rem] text-white/25 tracking-[0.2em] mb-1">
          {String(index).padStart(2, '0')} /{' '}
          {disabled ? 'LOCKED' : 'ENTER'}
        </p>
        <p className={`font-serif text-2xl transition-colors ${hovered && !disabled ? 'text-[#e63946]' : 'text-white'}`}>
          {label}
        </p>
        <p className="font-mono text-[0.6rem] text-white/25 mt-1">{sub}</p>
      </div>
      <div style={{ transition: 'transform 0.2s ease', transform: hovered && !disabled ? 'translateX(6px)' : 'translateX(0)' }}>
        <span className="font-mono text-white/20 text-xl">{disabled ? '···' : '→'}</span>
      </div>
    </div>
  )

  return disabled ? inner : <Link to={to} className="block no-underline">{inner}</Link>
}

export default function PortalPage() {
  const containerRef = useRef(null)
  const glowRef = useRef(null)
  const parallaxRef = useRef(null)
  const coordXRef = useRef(null)
  const coordYRef = useRef(null)
  const [time, setTime] = useState('')
  const [dbStatus, setDbStatus] = useState('CHECKING')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko-KR', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    supabase.from('roles').select('id').limit(1)
      .then(({ error }) => setDbStatus(error ? 'OFFLINE' : 'CONNECTED'))
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={e => {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (glowRef.current) {
          glowRef.current.style.left = `${x - 200}px`
          glowRef.current.style.top  = `${y - 200}px`
        }

        if (parallaxRef.current) {
          const w = containerRef.current.offsetWidth
          const h = containerRef.current.offsetHeight
          const tx = (x / w - 0.5) * -24
          const ty = (y / h - 0.5) * -24
          parallaxRef.current.style.transform = `translate(${tx}px, ${ty}px)`
        }

        if (coordXRef.current)
          coordXRef.current.textContent = Math.round(x).toString().padStart(4, '0')
        if (coordYRef.current)
          coordYRef.current.textContent = Math.round(y).toString().padStart(4, '0')
      }}
      className="relative h-screen flex flex-col overflow-hidden select-none"
      style={{
        background: '#0d0d0d',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    >
      <style>{`
        @keyframes glitch {
          0%   { transform: translate(0); opacity: 1; }
          20%  { transform: translate(-4px, 1px); clip-path: inset(30% 0 50% 0); }
          40%  { transform: translate(4px, -1px); clip-path: inset(60% 0 10% 0); }
          60%  { transform: translate(-2px, 2px); clip-path: inset(10% 0 70% 0); }
          80%  { transform: translate(2px, -2px); opacity: 0.8; }
          100% { transform: translate(0); opacity: 1; clip-path: none; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-8px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .glitch-hover:hover {
          animation: glitch 0.4s steps(2) forwards;
          color: #e63946;
        }
        .blink { animation: blink 1.4s ease-in-out infinite; }
        .scanline {
          position: fixed; top: 0; left: 0; right: 0;
          height: 8px;
          background: linear-gradient(transparent, rgba(230,57,70,0.06), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none; z-index: 0;
        }
        .fade-up-1 { animation: fadeSlideUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeSlideUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeSlideUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeSlideUp 0.7s 0.45s ease both; }
      `}</style>

      {/* Mouse glow */}
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          left: -200,
          top: -200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(230,57,70,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Scanline */}
      <div className="scanline" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center border-b border-white/10 px-8 py-4 flex-shrink-0">
        <div className="flex items-center">
          <span className="font-serif text-sm font-black tracking-[0.35em] text-white fade-up-1">
            MULTIVERSE
          </span>
          <span className="font-mono text-[0.6rem] text-white/25 ml-4 fade-up-1">
            TIME-GRID / v2.0
          </span>
        </div>
        <span className="font-mono text-[0.6rem] text-white/25 fade-up-1 tracking-widest">
          SYS.PORTAL — {new Date().getFullYear()}
        </span>
      </header>

      {/* Main */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-white/10 flex flex-col justify-between px-16 py-16">
          {/* Title */}
          <div className="fade-up-2">
            <p className="font-mono text-[0.6rem] text-[#e63946] tracking-[0.3em] mb-8">
              ENTROPY_ZERO.SYSTEM
            </p>
            <h1
              className="font-serif font-black text-white leading-[0.9] glitch-hover cursor-default"
              style={{ fontSize: 'clamp(4rem, 8vw, 7rem)' }}
            >
              ENTROPY<br />ZERO.
            </h1>
            <p className="font-mono text-xs text-white/20 mt-6 leading-relaxed max-w-xs">
              A structured operating system for time, roles, and purpose.
            </p>
          </div>

          {/* Navigation */}
          <div className="fade-up-3">
            <NavItem index={1} label="Time-Grid" sub="주간 타임테이블 및 역할 관리" to="/grid" />
            <NavItem index={2} label="Learning Report" sub="학습 이론 리포트 아카이브" disabled />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex items-center justify-center overflow-hidden">
          <div
            ref={parallaxRef}
            className="fade-up-4 relative"
            style={{ transition: 'transform 0.06s linear' }}
          >
            <p
              className="font-serif font-black text-white/[0.04] leading-none pointer-events-none"
              style={{ fontSize: 'clamp(10rem, 22vw, 20rem)' }}
            >
              ∞
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-[0.55rem] text-white/15 tracking-widest">
                  X: <span ref={coordXRef}>0000</span>
                </p>
                <p className="font-mono text-[0.55rem] text-white/15 tracking-widest">
                  Y: <span ref={coordYRef}>0000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative z-10 border-t border-white/10 px-8 py-3 flex justify-between items-center font-mono text-[0.55rem] text-white/25 tracking-widest flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="blink"
            style={{ color: dbStatus === 'CONNECTED' ? 'rgba(74,222,128,0.6)' : 'rgba(230,57,70,0.6)' }}
          >●</span>
          <span>SUPABASE — {dbStatus}</span>
        </div>
        <span>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
        </span>
        <span>{time}</span>
      </div>
    </div>
  )
}
