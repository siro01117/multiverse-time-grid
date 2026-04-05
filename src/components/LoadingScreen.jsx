export default function LoadingScreen({ fadingOut = false }) {
  return (
    <div
      className="relative h-screen flex flex-col overflow-hidden"
      style={{
        animation: fadingOut ? 'loadFadeOut 0.6s ease forwards' : undefined,
        background: '#0d0d0d',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    >
      <style>{`
        @keyframes loadScanline {
          0%   { transform: translateY(-8px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes progressFill {
          0%   { width: 0%; }
          30%  { width: 35%; }
          60%  { width: 62%; }
          85%  { width: 81%; }
          100% { width: 95%; }
        }
        @keyframes lineAppear {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .load-scanline {
          position: absolute; top: 0; left: 0; right: 0; height: 8px;
          background: linear-gradient(transparent, rgba(230,57,70,0.08), transparent);
          animation: loadScanline 4s linear infinite;
          pointer-events: none;
        }
        .progress-bar { animation: progressFill 3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .log-line-1 { animation: lineAppear 0.4s 0.2s ease both; }
        .log-line-2 { animation: lineAppear 0.4s 0.7s ease both; }
        .log-line-3 { animation: lineAppear 0.4s 1.2s ease both; }
        .log-line-4 { animation: lineAppear 0.4s 1.7s ease both; }
        .cursor { animation: cursorBlink 1s step-end infinite; }
        @keyframes loadFadeOut {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes gridFadeIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="load-scanline" />

      {/* Header */}
      <header className="flex justify-between items-center border-b border-white/10 px-8 py-4 flex-shrink-0">
        <div className="flex items-center">
          <span className="font-serif text-sm font-black tracking-[0.35em] text-white">MULTIVERSE</span>
          <span className="font-mono text-[0.6rem] text-white/25 ml-4">TIME-GRID / v2.0</span>
        </div>
        <span className="font-mono text-[0.6rem] text-white/25 tracking-widest">MODULE.INIT</span>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center gap-16">
        {/* Title */}
        <div className="text-center">
          <p className="font-mono text-[0.6rem] text-[#e63946] tracking-[0.4em] mb-4">
            SYSTEM BOOT SEQUENCE
          </p>
          <h2
            className="font-serif font-black text-white leading-none"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
          >
            INITIALIZING.
          </h2>
        </div>

        {/* Boot log */}
        <div className="space-y-2" style={{ width: '400px' }}>
          {[
            'CONNECTING TO SUPABASE...',
            'LOADING ROLE MANIFESTS...',
            'SYNCING SCHEDULE DATA...',
            'MOUNTING GRID INTERFACE...',
          ].map((msg, i) => (
            <p key={i} className={`font-mono text-xs text-white/40 log-line-${i + 1}`}>
              <span className="text-[#e63946]/60 mr-2">›</span>{msg}
            </p>
          ))}
          <p className="font-mono text-xs text-white/40 log-line-4">
            <span className="cursor text-[#e63946]">█</span>
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '400px' }}>
          <div className="flex justify-between font-mono text-[0.55rem] text-white/25 mb-2">
            <span>PROGRESS</span>
            <span>PLEASE WAIT</span>
          </div>
          <div className="h-px bg-white/10 relative overflow-hidden">
            <div
              className="progress-bar absolute left-0 top-0 h-full"
              style={{ background: '#e63946' }}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-white/10 px-8 py-3 flex justify-between items-center font-mono text-[0.55rem] text-white/25 tracking-widest flex-shrink-0">
        <span>ENTROPY_ZERO.SYS</span>
        <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
      </div>
    </div>
  )
}
