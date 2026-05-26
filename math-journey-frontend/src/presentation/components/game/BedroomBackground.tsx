export function BedroomBackground() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1400 520"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full opacity-[0.17] dark:opacity-[0.11]"
        style={{ height: 'clamp(260px, 55vh, 480px)' }}
      >
        <style>{`
          .r-wall      { fill: #F5EFE4; }
          .r-floor     { fill: #C8966A; }
          .r-plank     { stroke: #A87848; fill: none; }
          .r-base      { fill: #D4A87A; }
          .r-wd        { fill: #5C3A1E; }
          .r-wm        { fill: #8B6040; }
          .r-wl        { fill: #C4936A; }
          .r-bed       { fill: #8BB5B0; }
          .r-pillow    { fill: #EDE8DC; }
          .r-shade     { fill: #E8C050; }
          .r-glow      { fill: #FFD860; }
          .r-sky       { fill: #C0D8EC; }
          .r-curtain   { fill: #D4B896; }
          .r-gold      { fill: #C09030; }
          .r-gold2     { fill: #8B6A1A; }
          .r-page      { fill: #FFFBF0; }
          .r-line      { stroke: #C8B898; fill: none; }
          .r-mug       { fill: #8B7CC4; }
          .r-steam     { stroke: #C4B4A0; fill: none; }
          .r-pencil    { fill: #F0B429; }
          .r-eraser    { fill: #E8A0A0; }
          .r-b1        { fill: #D4845A; }
          .r-b2        { fill: #6B9E7A; }
          .r-b3        { fill: #8B7CC4; }
          .r-b4        { fill: #E8A030; }
          .r-b5        { fill: #D07070; }
          .r-b6        { fill: #5090C4; }
          .r-plant     { fill: #6B9E7A; }
          .r-plant2    { fill: #4A7A5A; }
          .r-rug       { fill: #C07858; }

          html.dark .r-wall    { fill: #1C1612; }
          html.dark .r-floor   { fill: #3A2210; }
          html.dark .r-plank   { stroke: #28180A; }
          html.dark .r-base    { fill: #4A2E14; }
          html.dark .r-wd      { fill: #28140A; }
          html.dark .r-wm      { fill: #3A2010; }
          html.dark .r-wl      { fill: #502A14; }
          html.dark .r-bed     { fill: #1E3C38; }
          html.dark .r-pillow  { fill: #241E16; }
          html.dark .r-shade   { fill: #6B4808; }
          html.dark .r-glow    { fill: #FF8818; }
          html.dark .r-sky     { fill: #060C18; }
          html.dark .r-curtain { fill: #3A2818; }
          html.dark .r-gold    { fill: #6A4A08; }
          html.dark .r-gold2   { fill: #4A3406; }
          html.dark .r-page    { fill: #26201A; }
          html.dark .r-line    { stroke: #3A3028; }
          html.dark .r-mug     { fill: #3A2E50; }
          html.dark .r-steam   { stroke: #3A3028; }
          html.dark .r-b1      { fill: #7A3C20; }
          html.dark .r-b2      { fill: #2C4E30; }
          html.dark .r-b3      { fill: #3A2E58; }
          html.dark .r-b4      { fill: #7A5010; }
          html.dark .r-b5      { fill: #7A2E2E; }
          html.dark .r-b6      { fill: #1E4060; }
          html.dark .r-plant   { fill: #2A4A2C; }
          html.dark .r-plant2  { fill: #1E3820; }
          html.dark .r-rug     { fill: #4A2A18; }
        `}</style>

        {/* ── WALL ──────────────────────────────── */}
        <rect x="0" y="0" width="1400" height="452" className="r-wall" />

        {/* ── FLOOR ──────────────────────────────── */}
        <rect x="0" y="452" width="1400" height="68" className="r-floor" />
        <line x1="0" y1="468" x2="1400" y2="468" className="r-plank" strokeWidth="1.2" opacity=".55" />
        <line x1="0" y1="485" x2="1400" y2="485" className="r-plank" strokeWidth="1" opacity=".38" />
        <line x1="0" y1="502" x2="1400" y2="502" className="r-plank" strokeWidth="1" opacity=".28" />
        {[180,380,580,780,980,1180].map(x => (
          <line key={x} x1={x} y1="452" x2={x} y2="520" className="r-plank" strokeWidth="1" opacity=".35" />
        ))}

        {/* Baseboard */}
        <rect x="0" y="441" width="1400" height="13" className="r-base" />

        {/* Rug */}
        <ellipse cx="700" cy="453" rx="490" ry="16" className="r-rug" opacity=".55" />
        <ellipse cx="700" cy="453" rx="476" ry="12" fill="none" stroke="#A06040" strokeWidth="3" opacity=".4" />
        <ellipse cx="700" cy="453" rx="458" ry="8"  fill="none" stroke="#A06040" strokeWidth="2" opacity=".28" />

        {/* ════════════ WARDROBE ════════════ */}
        <rect x="32"  y="100" width="188" height="353" className="r-wm" rx="4" />
        <rect x="24"  y="92"  width="204" height="18"  className="r-wd" rx="4" />
        <rect x="24"  y="442" width="204" height="12"  className="r-wd" rx="3" />
        {/* Doors */}
        <rect x="44"  y="120" width="78"  height="318" className="r-wl" rx="2" />
        <rect x="130" y="120" width="78"  height="318" className="r-wl" rx="2" />
        <rect x="119" y="120" width="14"  height="318" className="r-wm" />
        {/* Door panels */}
        {[52, 137].map(x => [134, 237, 342].map(y => (
          <rect key={`${x}-${y}`} x={x} y={y} width="58" height="88" fill="none" stroke="#5C3A1E" strokeWidth="1.5" rx="2" opacity=".45" />
        )))}
        {/* Handles */}
        <rect x="113" y="270" width="9"  height="22" className="r-gold" rx="3" />
        <rect x="132" y="270" width="9"  height="22" className="r-gold" rx="3" />

        {/* ════════════ BED ════════════ */}
        {/* Legs */}
        <rect x="253" y="428" width="15" height="25" className="r-wd" rx="2" />
        <rect x="518" y="428" width="15" height="25" className="r-wd" rx="2" />
        {/* Headboard */}
        <rect x="238" y="228" width="312" height="70" className="r-wd" rx="10" />
        <ellipse cx="394" cy="228" rx="95" ry="18" className="r-wm" opacity=".35" />
        {/* Frame sides */}
        <rect x="230" y="242" width="16" height="200" className="r-wd" rx="3" />
        <rect x="540" y="242" width="16" height="200" className="r-wd" rx="3" />
        {/* Footboard */}
        <rect x="238" y="427" width="312" height="16" className="r-wd" rx="4" />
        {/* Mattress */}
        <rect x="246" y="296" width="294" height="132" className="r-pillow" rx="5" />
        {/* Blanket */}
        <rect x="246" y="342" width="294" height="86"  className="r-bed"   rx="5" />
        {/* Fold */}
        <rect x="246" y="342" width="294" height="18"  className="r-pillow" rx="3" opacity=".55" />
        {/* Pillows */}
        {[260, 416].map(x => (
          <g key={x}>
            <rect x={x} y="302" width="108" height="40" className="r-pillow" rx="11" />
            <rect x={x+4} y="306" width="100" height="32" fill="none" stroke="white" strokeWidth="1.2" rx="8" opacity=".35" />
          </g>
        ))}

        {/* ════════════ NIGHTSTAND ════════════ */}
        <rect x="558" y="322" width="88" height="130" className="r-wm" rx="5" />
        <rect x="550" y="316" width="104" height="11" className="r-wd" rx="3" />
        <rect x="567" y="340" width="70"  height="28"  className="r-wl" rx="3" />
        <rect x="593" y="350" width="18"  height="5"   className="r-gold" rx="2" />
        <rect x="562" y="444" width="13"  height="10"  className="r-wd"  rx="2" />
        <rect x="625" y="444" width="13"  height="10"  className="r-wd"  rx="2" />

        {/* ════════════ LAMP ════════════ */}
        {/* Glow halos */}
        <ellipse cx="604" cy="278" rx="90" ry="70" className="r-glow" opacity=".18" />
        <ellipse cx="604" cy="292" rx="58" ry="46" className="r-glow" opacity=".13" />
        {/* Shade */}
        <path d="M 568 272 L 640 272 L 626 322 L 582 322 Z" className="r-shade" />
        <rect x="568" y="265" width="72" height="10" className="r-gold2" rx="2" />
        <line x1="576" y1="290" x2="634" y2="290" stroke="white" strokeWidth="1" opacity=".25" />
        {/* Stem + base */}
        <rect x="599" y="322" width="8" height="8" className="r-gold2" rx="1" />
        <ellipse cx="603" cy="330" rx="24" ry="6"  className="r-gold2" />
        <ellipse cx="603" cy="328" rx="19" ry="4"  className="r-gold"  />

        {/* ════════════ WINDOW ════════════ */}
        {/* Curtain rod */}
        <rect x="650" y="72" width="248" height="9" className="r-gold" rx="4" />
        <circle cx="650" cy="76" r="9" className="r-gold" />
        <circle cx="898" cy="76" r="9" className="r-gold" />
        {/* Left curtain */}
        <path d="M 650 81 Q 678 140 668 215 Q 678 300 662 346 L 698 346 L 698 81 Z" className="r-curtain" />
        <path d="M 678 81 Q 673 140 668 215 Q 673 300 672 346 L 680 346 L 698 81 Z" className="r-curtain" opacity=".28" />
        {/* Right curtain */}
        <path d="M 898 81 Q 870 140 880 215 Q 870 300 886 346 L 850 346 L 850 81 Z" className="r-curtain" />
        <path d="M 870 81 Q 875 140 880 215 Q 875 300 876 346 L 868 346 L 850 81 Z" className="r-curtain" opacity=".28" />
        {/* Outer frame */}
        <rect x="698" y="82" width="152" height="262" className="r-wd" rx="5" />
        {/* Glass panes */}
        <rect x="706" y="90"  width="62" height="112" className="r-sky" rx="2" />
        <rect x="776" y="90"  width="62" height="112" className="r-sky" rx="2" />
        <rect x="706" y="210" width="62" height="112" className="r-sky" rx="2" />
        <rect x="776" y="210" width="62" height="112" className="r-sky" rx="2" />
        {/* Cross bars */}
        <rect x="698" y="200" width="152" height="12" className="r-wd" />
        <rect x="766" y="82"  width="12"  height="262" className="r-wd" />
        {/* Reflection highlight */}
        <rect x="709" y="93" width="20" height="7" fill="white" rx="2" opacity=".28" />
        <rect x="779" y="93" width="20" height="7" fill="white" rx="2" opacity=".28" />
        {/* Stars / sky details */}
        {[[724,128],[748,112],[733,158],[800,122],[814,148],[756,178],[793,168]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%2===0?1.5:1} fill="white" opacity={.22+i*.02} />
        ))}

        {/* ════════════ DESK ════════════ */}
        <rect x="870" y="282" width="288" height="22" className="r-wd" rx="5" />
        <rect x="870" y="282" width="288" height="5"  className="r-wl" rx="4" opacity=".4" />
        {/* Legs */}
        <rect x="886"  y="304" width="18" height="148" className="r-wd" rx="3" />
        <rect x="1122" y="304" width="18" height="148" className="r-wd" rx="3" />
        {/* Cross bar */}
        <rect x="886" y="396" width="254" height="10" className="r-wm" rx="3" />

        {/* Open notebook */}
        {/* Cover bottom */}
        <rect x="920" y="254" width="192" height="30" className="r-wm" rx="3" opacity=".5" />
        {/* Pages */}
        <rect x="922" y="248" width="90" height="36" className="r-page" rx="2" />
        <rect x="1012" y="248" width="90" height="36" className="r-page" rx="2" />
        <rect x="1010" y="247" width="6"  height="38" className="r-wd"  rx="1" opacity=".25" />
        {/* Lines */}
        {[258,265,272,279].map(y => (
          <g key={y}>
            <line x1="930"  y1={y} x2="1007" y2={y} className="r-line" strokeWidth="1" opacity=".5" />
            <line x1="1018" y1={y} x2="1095" y2={y} className="r-line" strokeWidth="1" opacity=".5" />
          </g>
        ))}
        {/* Formula hint */}
        <text x="932" y="261" fontSize="5.5" fill="#8B6040" opacity=".38" fontFamily="serif" fontStyle="italic">y = ax² + bx + c</text>

        {/* Pencil */}
        <g transform="rotate(-22 898 268)">
          <rect x="882" y="254" width="5.5" height="38" className="r-pencil" rx="2" />
          <polygon points="879.5,292 887.5,292 883.5,302" className="r-eraser" />
          <rect x="881" y="251" width="5.5" height="6" className="r-wd" rx="1" opacity=".5" />
        </g>

        {/* Coffee mug */}
        <rect x="1148" y="256" width="28" height="28" className="r-mug" rx="5" />
        <ellipse cx="1162" cy="256" rx="14" ry="4" className="r-mug" opacity=".65" />
        <ellipse cx="1162" cy="258" rx="11" ry="3" fill="#2A100A" opacity=".55" />
        <path d="M 1176 263 Q 1188 270 1176 277" className="r-mug" stroke="#8B7CC4" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        {[1152,1162,1172].map((x,i)=>(
          <path key={x} d={`M ${x} 253 Q ${x+4} 244 ${x} 235`} className="r-steam" strokeWidth="2.5" strokeLinecap="round" opacity={.38-i*.05} />
        ))}

        {/* ════════════ BOOKSHELF ════════════ */}
        <rect x="1202" y="132" width="182" height="318" className="r-wm" rx="5" />
        {/* Shelves */}
        {[125, 228, 324, 420].map(y => (
          <rect key={y} x="1194" y={y} width="198" height="13" className="r-wd" rx="3" />
        ))}
        {/* Sides */}
        <rect x="1194" y="125" width="14" height="308" className="r-wd" rx="3" />
        <rect x="1378" y="125" width="14" height="308" className="r-wd" rx="3" />

        {/* Row 1 */}
        {[
          [1208,148,22,72,'r-b1'],[1232,155,18,65,'r-b2'],[1252,143,26,79,'r-b3'],
          [1280,150,20,72,'r-b5'],[1302,157,17,65,'r-b4'],[1321,144,23,78,'r-b6'],
          [1346,151,20,71,'r-b1'],[1368,146,10,76,'r-b3'],
        ].map(([x,y,w,h,c],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} className={c as string} rx="2" />
        ))}

        {/* Row 2 */}
        {[
          [1208,242,21,74,'r-b4'],[1231,250,24,66,'r-b2'],[1257,240,19,76,'r-b5'],
          [1278,247,23,69,'r-b6'],[1303,243,20,73,'r-b1'],
        ].map(([x,y,w,h,c],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} className={c as string} rx="2" />
        ))}
        {/* Bookend figurine */}
        <rect x="1328" y="287" width="16" height="29" className="r-gold2" rx="4" />
        <circle cx="1336" cy="284" r="9" className="r-gold2" />
        <rect x="1348" y="252" width="18" height="64" className="r-b3" rx="2" />
        <rect x="1368" y="258" width="10" height="58" className="r-b4" rx="2" />

        {/* Row 3 + plant */}
        {[
          [1208,337,26,75,'r-b6'],[1236,345,18,67,'r-b5'],[1256,336,23,76,'r-b2'],
        ].map(([x,y,w,h,c],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} className={c as string} rx="2" />
        ))}
        {/* Plant pot */}
        <rect x="1285" y="370" width="24" height="22" className="r-wd" rx="3" />
        <circle cx="1297" cy="361" r="17" className="r-plant" opacity=".85" />
        <circle cx="1286" cy="367" r="11" className="r-plant2" opacity=".75" />
        <circle cx="1308" cy="364" r="13" className="r-plant" opacity=".7" />
        <rect x="1315" y="344" width="20" height="68" className="r-b1" rx="2" />
        <rect x="1337" y="340" width="23" height="72" className="r-b3" rx="2" />
        <rect x="1362" y="349" width="16" height="63" className="r-b4" rx="2" />
      </svg>
    </div>
  )
}
