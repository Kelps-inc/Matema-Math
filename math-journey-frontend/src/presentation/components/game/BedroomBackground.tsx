export function BedroomBackground() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full opacity-[0.15] dark:opacity-[0.12]"
        style={{ height: 'clamp(260px, 55vh, 480px)' }}
      >
        <style>{`
          .bg-wall     { fill: #c7c8b2; }
          .bg-floor    { fill: #7b674f; }
          .bg-lamp-glow { fill: #cfe8a8; }
          .bg-bed      { fill: #5d744f; }
          .bg-bed-head { fill: #7b5f42; }
          .bg-pillow   { fill: #d8d5c6; }
          .bg-night    { fill: #7b5f42; }
          .bg-plant    { fill: #7ea85d; }
          .bg-wardrobe { fill: #8a6847; }
          .bg-wardrobe-line { stroke: #5a432d; }
          .bg-desk     { fill: #8a6847; }
          .bg-desk-leg { fill: #6a5038; }
          .bg-chair    { fill: #384148; }
          .bg-lamp     { fill: #3d4b40; }
          .bg-lamp-head { fill: #4e5f51; }
          .bg-mug      { fill: #6b8a58; }
          .bg-notebook { fill: #f2f0e6; }
          .bg-notebook-line { stroke: #b5b0a2; }
          .bg-pencil   { fill: #d0a233; }
          .bg-eraser   { fill: #d7d7d7; }
          .bg-rug      { fill: #5f7a5d; }

          html.dark .bg-wall     { fill: #4a4a42; }
          html.dark .bg-floor    { fill: #3a3028; }
          html.dark .bg-lamp-glow { fill: #8a8a6a; }
          html.dark .bg-bed      { fill: #2a3a2a; }
          html.dark .bg-bed-head { fill: #4a4038; }
          html.dark .bg-pillow   { fill: #5a5a4a; }
          html.dark .bg-night    { fill: #4a4038; }
          html.dark .bg-plant    { fill: #4a6a4a; }
          html.dark .bg-wardrobe { fill: #5a5042; }
          html.dark .bg-wardrobe-line { stroke: #3a3028; }
          html.dark .bg-desk     { fill: #5a5042; }
          html.dark .bg-desk-leg { fill: #3a3028; }
          html.dark .bg-chair    { fill: #2a3238; }
          html.dark .bg-lamp     { fill: #2a3a38; }
          html.dark .bg-lamp-head { fill: #3a4a42; }
          html.dark .bg-mug      { fill: #4a6a4a; }
          html.dark .bg-notebook { fill: #6a6a5a; }
          html.dark .bg-notebook-line { stroke: #4a4a3a; }
          html.dark .bg-pencil   { fill: #8a7a4a; }
          html.dark .bg-eraser   { fill: #7a7a6a; }
          html.dark .bg-rug      { fill: #3a5a3a; }
        `}</style>

        <defs>
          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cfe8a8" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#cfe8a8" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* ── WALL ──────────────────────────────── */}
        <rect width="1600" height="1000" className="bg-wall" />
        <rect y="700" width="1600" height="300" className="bg-floor" />

        {/* ── LAMP GLOWS ────────────────────────── */}
        <circle cx="620" cy="470" r="180" fill="url(#lampGlow)" opacity="0.6" />
        <circle cx="1280" cy="520" r="220" fill="url(#lampGlow)" opacity="0.5" />

        {/* ── BED ────────────────────────────────── */}
        <rect x="80" y="500" width="420" height="180" className="bg-bed" />
        <rect x="80" y="470" width="420" height="30" className="bg-bed-head" />
        <rect x="260" y="420" width="220" height="70" className="bg-bed-head" />
        <rect x="250" y="500" width="180" height="90" className="bg-pillow" />

        {/* ── NIGHTSTAND ────────────────────────── */}
        <rect x="520" y="520" width="120" height="140" className="bg-night" />
        <rect x="550" y="450" width="60" height="70" className="bg-plant" />

        {/* ── WARDROBE ────────────────────────────── */}
        <rect x="780" y="180" width="380" height="500" className="bg-wardrobe" />
        <line x1="970" y1="180" x2="970" y2="680" className="bg-wardrobe-line" strokeWidth="4" />

        {/* ── DESK ────────────────────────────────── */}
        <rect x="1100" y="520" width="420" height="220" className="bg-desk" />
        <rect x="1130" y="740" width="20" height="180" className="bg-desk-leg" />
        <rect x="1450" y="740" width="20" height="180" className="bg-desk-leg" />

        {/* ── CHAIR ────────────────────────────────── */}
        <rect x="1180" y="600" width="120" height="120" className="bg-chair" />
        <rect x="1210" y="720" width="60" height="120" className="bg-chair" />

        {/* ── DESK LAMP ────────────────────────────── */}
        <rect x="1220" y="430" width="12" height="100" className="bg-lamp" />
        <rect x="1210" y="420" width="60" height="30" className="bg-lamp-head" />

        {/* ── COFFEE MUG ────────────────────────────── */}
        <rect x="1180" y="580" width="40" height="40" className="bg-mug" />

        {/* ── NOTEBOOK ────────────────────────────── */}
        <rect x="1300" y="600" width="160" height="90" className="bg-notebook" />
        <line x1="1380" y1="600" x2="1380" y2="690" className="bg-notebook-line" />

        {/* ── PENCIL AND ERASER ────────────────────── */}
        <rect x="1470" y="650" width="40" height="8" className="bg-pencil" />
        <rect x="1510" y="645" width="20" height="18" className="bg-eraser" />

        {/* ── RUG ────────────────────────────────── */}
        <rect x="170" y="760" width="280" height="120" className="bg-rug" />
      </svg>
    </div>
  )
}
