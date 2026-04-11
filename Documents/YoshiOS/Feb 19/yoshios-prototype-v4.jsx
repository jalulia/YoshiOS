import { useState, useEffect, useCallback } from "react";

// ─── Design tokens (matching Illustrator exports) ───
const AMBER = "#f0ad3b";
const AMBER_DIM = "#6B5510";
const AMBER_BRIGHT = "#f7c96a";
const BG = "#1C1A0E";
const BG_FILL = "#3a3328";
const W = 832;
const H = 300;

// ─── Layout constants ───
const LEFT_PANEL_W = 280;
const GROUND_Y = 197;
const AUDIO_Y = 220;
const REAR_VAN_CX = 405;
const SIDE_VAN_CX = 660;

// ─── SVG stroke presets ───
const S_VAN = { fill: "none", stroke: AMBER, strokeMiterlimit: 10, strokeWidth: 2 };
const S_VAN3 = { fill: "none", stroke: AMBER, strokeMiterlimit: 10, strokeWidth: 3 };
const S_FILL = { fill: BG_FILL, stroke: AMBER, strokeMiterlimit: 10, strokeWidth: 2 };
const S_SOLID = { fill: AMBER };

// ─── Hooks ───
const useSimData = (sub) => {
  const [d, setD] = useState({
    time: "10:37", date: "August 23, 2025",
    batPct: 75, solPct: 86, chAh: 23, totAh: 34,
    solW: 240, loadW: -144,
    oilPct: 48, oilL: 3.2, engF: 102, hum: 54,
    roll: 6.9, pitch: -4.2, hdg: "N", hdgDeg: 4, ambF: 72,
    artist: "Spiral", track: "The Vernon Spring", src: "Spotify",
    pos: 32, dur: 165, vol: 28, playing: true,
  });
  useEffect(() => {
    const iv = setInterval(() => setD(p => {
      const now = new Date();
      return {
        ...p,
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        pos: p.playing && sub.spotify ? (p.pos + 1) % p.dur : p.pos,
        roll: sub.sensors ? +(Math.sin(Date.now() / 4000) * 8).toFixed(1) : 0,
        pitch: sub.sensors ? +(Math.sin(Date.now() / 5000 + 1) * 5).toFixed(1) : 0,
        hdgDeg: sub.sensors ? (Date.now() / 80) % 360 : 0,
        hdg: sub.sensors ? ["N","NE","E","SE","S","SW","W","NW"][Math.floor(((Date.now()/80)%360)/45)] : "--",
        batPct: sub.victron ? 75 + Math.round(Math.sin(Date.now() / 10000) * 3) : null,
        solPct: sub.victron ? 86 + Math.round(Math.sin(Date.now() / 12000) * 4) : null,
        solW: sub.victron ? 240 + Math.round(Math.sin(Date.now() / 8000) * 20) : null,
        loadW: sub.victron ? -144 + Math.round(Math.sin(Date.now() / 9000) * 10) : null,
      };
    }), 1000);
    return () => clearInterval(iv);
  }, [sub.spotify, sub.victron, sub.sensors]);
  return d;
};

const useWaveform = (on) => {
  const [pts, setPts] = useState([]);
  useEffect(() => {
    if (!on) { setPts([]); return; }
    const iv = setInterval(() => {
      const a = [], t = Date.now() / 200;
      for (let i = 0; i < 80; i++) a.push({
        x: i,
        y: Math.sin((i + t) * 0.3) * 8 + Math.sin((i + t) * 0.7) * 4 +
           Math.sin((i + t) * 1.3) * 2 + (Math.random() - 0.5) * 3
      });
      setPts(a);
    }, 80);
    return () => clearInterval(iv);
  }, [on]);
  return pts;
};

const useFeedback = () => {
  const [flash, setFlash] = useState(null);
  const [volP, setVolP] = useState(false);
  const [srcF, setSrcF] = useState(null);
  const trigger = useCallback((t, v) => {
    if (t === "screen") { setFlash(v); setTimeout(() => setFlash(null), 500); }
    if (t === "volume") { setVolP(true); setTimeout(() => setVolP(false), 400); }
    if (t === "source") { setSrcF(v); setTimeout(() => setSrcF(null), 600); }
  }, []);
  return { flash, volP, srcF, trigger };
};

const fmtT = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ═══════════════════════════════════════════════════
// Van Rear (Van-04) — body only, ground lines removed
// Original viewBox: 0 0 273 334.72
// Wheel contact ≈ y=280, center ≈ x=135
// ═══════════════════════════════════════════════════
const VanRear = ({ off }) => {
  const c = off ? AMBER_DIM : AMBER;
  const s = { fill: "none", stroke: c, strokeMiterlimit: 10, strokeWidth: 2 };
  const s3 = { ...s, strokeWidth: 3 };
  return <g>
    {/* Bumpers / fenders */}
    <rect {...s} x="21.79" y="180.55" width="44.03" height="16.58" />
    <path {...s} d="M45.24,230.88v46.89c0,1.58-1.28,2.86-2.86,2.86h-20.02c-1.58,0-2.86-1.28-2.86-2.86v-49.18" />
    <path {...s} d="M225.36,230.88v46.89c0,1.58,1.28,2.86,2.86,2.86h20.02c1.58,0,2.86-1.28,2.86-2.86v-49.18" />
    <rect {...s} x="113.29" y="180.55" width="44.03" height="21.16" />
    <rect {...s} x="204.78" y="180.55" width="44.03" height="16.58" />
    {/* Rear window frame */}
    <path {...s} d="M224.67,117.65H45.94c-2.74,0-4.81-2.49-4.3-5.18l10.94-55.3c.39-2.07,2.2-3.57,4.3-3.57h156.86c2.1,0,3.91,1.5,4.3,3.57l10.94,55.3c.51,2.69-1.56,5.18-4.3,5.18Z" />
    {/* Body left half */}
    <path {...s} d="M135.87,39.32c-18.01,0-63.19-.01-79.2,1.7-16.01,1.72-17.73,10.29-18.87,13.15s-20.59,76.63-20.59,76.63l1.14,4v10.86l-2.29,2.29v32.59s-1.72,7.44-1.72,12.02,2.86,16.58,2.86,16.58l-2.29,1.7v11.45s.57,6.29,5.15,6.29h9.95l42.09,6.29h63.47" />
    {/* Body right half */}
    <path {...s} d="M135.3,39.32c18.01,0,63.19-.01,79.2,1.7,16.01,1.72,17.73,10.29,18.87,13.15,1.14,2.86,20.59,76.63,20.59,76.63l-1.14,4v10.86s2.29,2.29,2.29,2.29v32.59s1.72,7.44,1.72,12.02-2.86,16.58-2.86,16.58l2.29,1.72v11.44s-.57,6.29-5.15,6.29c-4.57,0-9.95,0-9.95,0l-42.09,6.29h-63.47" />
    {/* Horizontal body lines */}
    <line {...s} x1="17.22" y1="209.15" x2="253.96" y2="209.15" />
    <line {...s} x1="18.36" y1="134.81" x2="252.81" y2="134.81" />
    <line {...s} x1="252.81" y1="145.67" x2="18.36" y2="145.67" />
    {/* Inner panel lines */}
    <path {...s} d="M135.59,205.71H21.22l.57-60.61v-10.86l24.02-85.2s2.29-5.15,6.09-7.21" />
    <path {...s} d="M135.02,205.71h114.37l-.57-60.61v-10.86l-23.98-85.2s-2.29-5.15-6.09-7.21" />
    <line {...s} x1="21.79" y1="180.55" x2="249.38" y2="180.55" />
    <line {...s} x1="25.22" y1="173.69" x2="245.95" y2="173.69" />
    <line {...s} x1="25.22" y1="228.59" x2="245.95" y2="228.59" />
    <line {...s} x1="21.79" y1="201.71" x2="249.38" y2="201.71" />
    <line {...s} x1="25.22" y1="167.97" x2="245.95" y2="167.97" />
    {/* Roof rack */}
    <polyline {...s} points="135.59 19.87 48.67 19.87 41.56 47.09" />
    <polyline {...s} points="135.59 19.87 222.51 19.87 229.61 47.09" />
    <rect {...s} x="47.53" y="9.01" width="174.98" height="8.01" />
    <path {...s} d="M182.48,9.01h-94.92v-1.35c0-3.67,2.98-6.65,6.65-6.65h81.62c3.67,0,6.65,2.98,6.65,6.65v1.35Z" />
  </g>;
};

// ═══════════════════════════════════════════════════
// Van Side (Van-03) — body only, ground lines removed
// Original viewBox: 0 0 652 337.19
// Wheel contact ≈ y=280, center ≈ x=310
// ═══════════════════════════════════════════════════
const VanSide = ({ off }) => {
  const c = off ? AMBER_DIM : AMBER;
  const s = { fill: "none", stroke: c, strokeMiterlimit: 10, strokeWidth: 2 };
  const sf = { fill: off ? "none" : BG_FILL, stroke: c, strokeMiterlimit: 10, strokeWidth: 2 };
  const fl = { fill: off ? AMBER_DIM : AMBER };
  return <g>
    {/* Main body outline */}
    <path {...s} d="M81.26,18.15h43.66l5.52,5.15h105.5v-5.15h18.3v5.15h147.98l3.04-5.15h114.6l23.44,20.01v4.03l54.9,69.16h7.49l20.25,23.73-2.57,45.75h-18.53c-3.21,0-6.17,1.74-7.74,4.54l-8.33,14.9h30.31l-.57,4.86h14.01v12.01s-.57,4.57-2.86,5.72-32.59,6.29-32.59,6.29h-8.01l.29-4.86-60.33,8.29-17.14-36.09c-2.63-5.55-8.22-9.08-14.36-9.08h-35.12c-1.99,0-11.7,1.97-14.92,4.86-10.79,9.67-17.25,23.28-18.22,37.74l-.6,8.86h-228.45l-5.44-22.78c-2.47-10.33-8.56-19.51-17.33-25.51-2.79-1.91-10-3.18-11.83-3.18h-38.51c-2.05,0-5.26.96-8.62,2.42-7.72,3.38-13.54,10.03-15.97,18.1l-4.96,16.93h-46.32v1.72H18.64v-18.87h20.01l-11.72-63.76h1.72v-10.86h-2.29v-1.72L81.26,18.15Z" />
    {/* Roofline */}
    <line {...s} x1="543.29" y1="42.2" x2="70.11" y2="42.2" />
    {/* Front wheel */}
    <path {...s} d="M476.96,191.99c-24.32,0-44.03,19.71-44.03,44.03s19.71,44.03,44.03,44.03,44.03-19.71,44.03-44.03-19.71-44.03-44.03-44.03ZM476.96,262.9c-14.84,0-26.88-12.03-26.88-26.88s12.03-26.88,26.88-26.88,26.88,12.03,26.88,26.88-12.03,26.88-26.88,26.88Z" />
    {/* Rear wheel */}
    <path {...s} d="M147.02,191.99c-24.32,0-44.03,19.71-44.03,44.03s19.71,44.03,44.03,44.03,44.03-19.71,44.03-44.03-19.71-44.03-44.03-44.03ZM147.02,262.9c-14.84,0-26.88-12.03-26.88-26.88s12.03-26.88,26.88-26.88,26.88,12.03,26.88,26.88-12.03,26.88-26.88,26.88Z" />
    {/* Side mirror */}
    <path {...s} d="M625.62,139.42h-10.88s-4.26,1.79-4.26,5.44v19.86s0,4.11,4.72,4.11h9.01l1.41-29.42Z" />
    <path {...s} d="M616.39,139.42c2.39,5.18,2.81,11.32,2.81,14.24s-.42,9.18-2.42,15.17" />
    {/* Sliding door panel */}
    <polyline {...s} points="241.08 42.2 241.08 234.88 407.51 234.88 407.51 42.2" />
    {/* Side windows */}
    <rect {...s} x="249.95" y="53.04" width="146.39" height="55.47" rx="9.31" ry="9.31" />
    <path {...s} d="M228.04,108.5h-118.74c-3.71,0-6.36-3.58-5.29-7.13l10.94-44.42c.71-2.33,2.85-3.92,5.29-3.92h107.81c2.94,0,5.32,2.38,5.32,5.32v44.82c0,2.94-2.38,5.32-5.32,5.32Z" />
    {/* Quarter window */}
    <path {...s} d="M77.53,106.45c-.16.54-.66.91-1.23.91h-17.65c-.13,0-.23-.13-.19-.26l17.69-48.06c.32-.86,1.15-1.44,2.07-1.44h12.46c.72,0,1.24.7,1.03,1.39l-14.17,47.45Z" />
    {/* Windshield */}
    <path {...s} d="M562.28,108.5h-130.88c-2.94,0-5.32-2.38-5.32-5.32v-44.82c0-2.94,2.38-5.32,5.32-5.32h93.66c2.11,0,4.09,1.04,5.28,2.78l34.62,47.59c1.48,2.16-.06,5.1-2.68,5.1Z" />
    {/* Rear bumper detail */}
    <polyline {...s} points="619.35 205.14 591.33 205.14 589.33 224.3" />
    {/* Sill / running board lines */}
    <line {...s} x1="104.99" y1="200.05" x2="37.51" y2="200.05" />
    <line {...s} x1="619.63" y1="200.05" x2="518.99" y2="200.05" />
    <line {...s} x1="440.08" y1="200.05" x2="187.9" y2="200" />
    {/* Belt lines */}
    <line {...s} x1="581.32" y1="133.38" x2="28.93" y2="133.32" />
    <line {...s} x1="581.32" y1="144.24" x2="26.65" y2="144.19" />
    {/* B-pillar */}
    <line {...s} x1="516.42" y1="53.32" x2="516.42" y2="108.79" />
    <line {...s} x1="518.71" y1="53.32" x2="518.71" y2="108.79" />
    {/* Rear quarter + wheel arch */}
    <path {...s} d="M419.05,42.2v132.06l25.32,10.29h54.04c7.87,0,15.04,4.5,18.47,11.57l3.54,7.3,11.44,26.3,49.73-6.86v-107.06c0-4.39-1.31-8.68-3.77-12.32l-49.68-61.29" />
    {/* Front quarter structure */}
    <polyline {...s} points="111.56 42.17 88.12 115.94 80.11 120.51 80.11 224.87" />
    <polyline {...s} points="51.24 224.87 51.24 207.72 38.66 207.72" />
    {/* Roof rack post */}
    <rect {...s} x="428.93" y="18.15" width="5.03" height="24.05" />
    {/* Side marker / vent */}
    <path {...s} d="M527.86,108.74h3.29s5.86-2.53,5.86-11.68-5.72-12.58-5.72-12.58h-3.43v24.26Z" />
    <circle {...s} cx="426.66" cy="185.72" r="5.99" />
    <rect {...s} x="66.39" y="190.85" width="13.72" height="5.15" />
    {/* Roof rack */}
    <rect {...s} x="81.26" y="7.29" width="207" height="8.01" />
    <path {...s} d="M399.19,23.3h-107.5V1h85.2c12.32,0,22.3,9.98,22.3,22.3h0Z" />
    {/* Front turn signal */}
    <path {...s} d="M604.6,196.85h-5.47c-1.61,0-2.66-1.7-1.94-3.14l3.9-7.79c.85-1.71,2.6-2.79,4.51-2.79h3.67c1.2,0,2.08,1.13,1.79,2.29l-1.99,7.94c-.51,2.05-2.35,3.49-4.47,3.49Z" />
    <line {...s} x1="621.4" y1="180.84" x2="617.79" y2="200.28" />
    {/* Windshield rake lines */}
    <path {...s} d="M533.23,42.2l57.82,70.02s4,6.29,10.29,6.29h10.44" />
    <path {...s} d="M547.95,59.93l57.82,70.02s4,6.29,10.29,6.29h9.3" />
    <line {...s} x1="598.19" y1="111.36" x2="590.33" y2="111.36" />
    {/* Thermometer overlay (window-mounted) */}
    <rect {...sf} x="249.5" y="93.03" width="147" height="107" />
    <path {...s} d="M301.01,154.84v-43.25h-19.08v43.25c-3.86,2.9-6.36,7.52-6.36,12.72,0,8.78,7.12,15.9,15.9,15.9s15.9-7.12,15.9-15.9c0-5.2-2.5-9.82-6.36-12.72Z" />
    <rect {...fl} x="285.75" y="143.75" width="11.45" height="7.41" />
    <rect {...fl} x="285.75" y="153.16" width="11.45" height="7.41" />
    <rect {...fl} x="285.75" y="134.3" width="11.45" height="7.41" />
    <path {...fl} d="M295.2,126.85v3.41h-7.45v-3.41h7.45M297.2,124.85h-11.45v7.41h11.45v-7.41h0Z" />
    <path {...fl} d="M295.2,117.4v3.41h-7.45v-3.41h7.45M297.2,115.4h-11.45v7.41h11.45v-7.41h0Z" />
    <circle {...fl} cx="291.47" cy="167.56" r="12.09" />
  </g>;
};

// ─── Compass (rendered inside rear van's window area) ───
const Compass = ({ hdg, hdgDeg, off }) => {
  const c = off ? AMBER_DIM : AMBER;
  return <g>
    <circle cx="135.19" cy="144.27" r="41.19" fill={off ? "none" : BG_FILL} stroke={c} strokeMiterlimit={10} strokeWidth={2} />
    {!off && <g transform={`rotate(${hdgDeg}, 135.19, 144.27)`}>
      <polygon points="114.63 151.76 147.04 125.9 147.45 167.36 134.93 151.39 114.63 151.76"
        fill={BG_FILL} stroke={c} strokeMiterlimit={10} strokeWidth={2} />
    </g>}
    <text x="135.19" y="92" fill={c} fontSize="30" fontFamily="'Share Tech Mono', monospace"
      textAnchor="middle" fontWeight="bold">{off ? "--" : hdg}</text>
  </g>;
};

// ─── Small UI elements ───
const BarGauge = ({ val, x, y, w = 20, h = 90, off }) => {
  const segs = 10;
  const filled = val != null ? Math.round((val / 100) * segs) : 0;
  const segH = h / segs;
  return <g>{Array.from({ length: segs }, (_, i) => {
    const sy = y + (segs - 1 - i) * segH;
    const f = !off && i < filled;
    return <rect key={i} x={x} y={sy} width={w} height={segH - 2}
      fill={f ? AMBER : "none"} stroke={off ? AMBER_DIM : (f ? AMBER : AMBER_DIM)}
      strokeWidth={0.8} strokeDasharray={off ? "2 2" : "none"} />;
  })}</g>;
};

const BatteryIcon = ({ x, y }) => <g>
  <rect x={x} y={y} width={22} height={11} fill="none" stroke={AMBER} strokeWidth={1} rx={1} />
  <rect x={x + 22} y={y + 3} width={3} height={5} fill={AMBER} />
  <rect x={x + 3} y={y + 2.5} width={4} height={6} fill={AMBER} />
  <rect x={x + 8} y={y + 2.5} width={4} height={6} fill={AMBER} />
  <rect x={x + 13} y={y + 2.5} width={4} height={6} fill={AMBER} />
</g>;

const SunIcon = ({ x, y }) => <g>
  <circle cx={x + 8} cy={y + 8} r={3.5} fill="none" stroke={AMBER} strokeWidth={1} />
  {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
    const rad = a * Math.PI / 180;
    return <line key={a} x1={x + 8 + Math.cos(rad) * 5} y1={y + 8 + Math.sin(rad) * 5}
      x2={x + 8 + Math.cos(rad) * 7.5} y2={y + 8 + Math.sin(rad) * 7.5}
      stroke={AMBER} strokeWidth={1} />;
  })}
</g>;

const OilIcon = ({ x, y, s = 1 }) => <g transform={`translate(${x},${y}) scale(${s})`}>
  <rect x={0} y={0} width={16} height={20} fill="none" stroke={AMBER} strokeWidth={1} rx={1} />
  <path d="M8,3 Q8,7 5,10 Q3,11.5 3,13.5 Q3,17 8,17 Q13,17 13,13.5 Q13,11.5 11,10 Q8,7 8,3"
    fill="none" stroke={AMBER} strokeWidth={0.8} />
  <line x1={5} y1={12} x2={11} y2={12} stroke={AMBER} strokeWidth={0.5} />
  <line x1={4} y1={14} x2={12} y2={14} stroke={AMBER} strokeWidth={0.5} />
</g>;

const TempIcon = ({ x, y, s = 1 }) => <g transform={`translate(${x},${y}) scale(${s})`}>
  <rect x={0} y={0} width={16} height={24} fill="none" stroke={AMBER} strokeWidth={1} rx={1} />
  <rect x={5.5} y={3} width={5} height={12} rx={2.5} fill="none" stroke={AMBER} strokeWidth={0.8} />
  <circle cx={8} cy={18} r={3} fill="none" stroke={AMBER} strokeWidth={0.8} />
  <circle cx={8} cy={18} r={1.5} fill={AMBER} />
  <line x1={8} y1={16} x2={8} y2={6} stroke={AMBER} strokeWidth={1} />
</g>;

const SpeakerIcon = ({ x, y, vol }) => <g>
  <polygon points={`${x},${y + 4} ${x + 4},${y + 4} ${x + 8},${y} ${x + 8},${y + 10} ${x + 4},${y + 6} ${x},${y + 6}`} fill={AMBER} />
  {vol > 10 && <path d={`M${x + 10} ${y + 2} Q${x + 13} ${y + 5} ${x + 10} ${y + 8}`} fill="none" stroke={AMBER} strokeWidth={0.8} />}
  {vol > 40 && <path d={`M${x + 12} ${y} Q${x + 16} ${y + 5} ${x + 12} ${y + 10}`} fill="none" stroke={AMBER} strokeWidth={0.8} />}
</g>;

const Waveform = ({ pts, x, y, w, h }) => {
  if (!pts.length) return <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={AMBER_DIM} strokeWidth={0.5} />;
  const sx = w / 80;
  return <path d={pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x + p.x * sx} ${y + h / 2 + p.y * (h / 30)}`).join(" ")}
    fill="none" stroke={AMBER} strokeWidth={1.5} />;
};

// ─── Alert bar ───
const AlertBar = ({ sub }) => {
  const down = [];
  if (!sub.victron) down.push("PWR");
  if (!sub.gps) down.push("GPS");
  if (!sub.sensors) down.push("SENS");
  if (!sub.spotify) down.push("AUD");
  if (down.length < 2) return null;
  return <g>
    <rect x={250} y={2} width={332} height={13} fill={BG} stroke={AMBER} strokeWidth={0.5} />
    <text x={416} y={11} fill={AMBER} fontSize="7" fontFamily="monospace" textAnchor="middle">
      ⚠ {down.join(" + ")} OFFLINE
    </text>
  </g>;
};

// ─── Boot Screen ───
const BootScreen = ({ pcState }) => <g>
  <text x={W / 2} y={120} fill={AMBER} fontSize="22" fontFamily="'Share Tech Mono',monospace"
    textAnchor="middle" fontStyle="italic" fontWeight="bold">YoshiOS</text>
  <text x={W / 2} y={150} fill={AMBER_DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
    {pcState === "booting" ? "Connecting to PC..." : "Waiting for PC..."}
  </text>
  {pcState === "booting" && <g>
    <rect x={W / 2 - 60} y={165} width={120} height={4} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
    <rect x={W / 2 - 60} y={165} width={60} height={4} fill={AMBER}>
      <animate attributeName="width" values="20;100;20" dur="2s" repeatCount="indefinite" />
    </rect>
  </g>}
</g>;

// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
const Dashboard = ({ d, wf, sub, fb }) => {
  const vOff = !sub.victron, sOff = !sub.sensors, aOff = !sub.spotify;

  // Van scaling — wheels at GROUND_Y
  // Rear van: viewBox 273×335, wheel bottom ≈ y=280
  const rearScale = 0.52;
  const rearW = 273 * rearScale;   // ≈ 142
  const rearX = REAR_VAN_CX - rearW / 2; // center at 405
  const rearY = GROUND_Y - 280 * rearScale; // wheels touch ground

  // Side van: viewBox 652×337, wheel bottom ≈ y=280
  const sideScale = 0.39;
  const sideW = 652 * sideScale;   // ≈ 254
  const sideX = SIDE_VAN_CX - sideW / 2;  // center at 660
  const sideY = GROUND_Y - 280 * sideScale; // wheels touch ground

  return <g>
    <AlertBar sub={sub} />

    {/* ═══ HEADER ═══ */}
    <text x={15} y={22} fill={AMBER} fontSize="16" fontFamily="'Share Tech Mono',monospace"
      fontStyle="italic" fontWeight="bold">YoshiOS</text>
    <text x={W - 15} y={22} fill={AMBER} fontSize="12" fontFamily="'Share Tech Mono',monospace"
      textAnchor="end" fontStyle="italic">{d.time}{"  "}{d.date}</text>
    <line x1={10} y1={30} x2={LEFT_PANEL_W} y2={30} stroke={AMBER_DIM} strokeWidth={0.3} />

    {/* ═══ LEFT PANEL ═══ */}

    {/* Battery + Sun icons */}
    <BatteryIcon x={18} y={38} />
    <SunIcon x={62} y={36} />

    {/* Bar gauges — tall, dominant (Tier 1) */}
    <BarGauge val={d.batPct} x={18} y={56} w={22} h={95} off={vOff} />
    <BarGauge val={d.solPct} x={62} y={56} w={22} h={95} off={vOff} />

    {/* Percentages below gauges */}
    <text x={29} y={163} fill={vOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace" textAnchor="middle">
      {vOff ? "—" : d.batPct}%
    </text>
    <text x={73} y={163} fill={vOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace" textAnchor="middle">
      {vOff ? "—" : d.solPct}%
    </text>

    {/* Charge section */}
    <text x={100} y={52} fill={vOff ? AMBER_DIM : AMBER} fontSize="11" fontFamily="monospace" fontWeight="bold">Charge</text>
    <text x={100} y={66} fill={vOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">
      {vOff ? "— / — Ah" : `${d.chAh} / ${d.totAh} Ah`}
    </text>

    {/* Line / Load section */}
    <text x={100} y={88} fill={vOff ? AMBER_DIM : AMBER} fontSize="11" fontFamily="monospace" fontWeight="bold">Line / Load</text>
    <text x={100} y={102} fill={vOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">
      {vOff ? "+— W / −— W" : `${d.solW} W / ${d.loadW}W`}
    </text>

    {/* Oil reading */}
    <OilIcon x={100} y={115} />
    <text x={122} y={126} fill={sOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">
      {sOff ? "—%" : `${d.oilPct}%`}
    </text>
    <text x={122} y={139} fill={sOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">
      {sOff ? "—" : `${d.oilL} L`}
    </text>

    {/* Temp reading */}
    <TempIcon x={100} y={148} />
    <text x={122} y={160} fill={sOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">
      {sOff ? "—°" : `${d.engF}°`}
    </text>
    <text x={122} y={173} fill={sOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">
      {sOff ? "—%" : `${d.hum}%`}
    </text>

    {/* ═══ VAN AREA ═══ */}

    {/* Rear van — rotates around wheel contact point */}
    <g transform={`translate(${rearX}, ${rearY}) scale(${rearScale})`}>
      <g transform={`rotate(${sOff ? 0 : d.roll}, 135, 280)`}>
        <VanRear off={sOff} />
        <Compass hdg={d.hdg} hdgDeg={d.hdgDeg} off={sOff} />
      </g>
    </g>

    {/* Side van — rotates around wheel contact point */}
    <g transform={`translate(${sideX}, ${sideY}) scale(${sideScale})`}>
      <g transform={`rotate(${sOff ? 0 : d.pitch}, 310, 280)`}>
        <VanSide off={sOff} />
        {/* Temp readout on van window */}
        <text x="350" y="152" fill={sOff ? AMBER_DIM : AMBER} fontSize="34"
          fontFamily="'Share Tech Mono',monospace">
          {sOff ? "—°" : `${d.ambF}°`}
        </text>
      </g>
    </g>

    {/* ═══ GROUND PLANE ═══ */}

    {/* Solid ground line (static — the real ground) */}
    <line x1={LEFT_PANEL_W} y1={GROUND_Y} x2={W - 10} y2={GROUND_Y}
      stroke={AMBER} strokeWidth={2} />

    {/* Dashed tilt line — rear van (rotates with roll) */}
    <g transform={`rotate(${sOff ? 0 : -d.roll}, ${REAR_VAN_CX}, ${GROUND_Y + 8})`}>
      <line x1={REAR_VAN_CX - 90} y1={GROUND_Y + 8} x2={REAR_VAN_CX + 90} y2={GROUND_Y + 8}
        stroke={AMBER} strokeWidth={1.5} strokeDasharray="6 6" />
    </g>

    {/* Dashed tilt line — side van (rotates with pitch) */}
    <g transform={`rotate(${sOff ? 0 : -d.pitch}, ${SIDE_VAN_CX}, ${GROUND_Y + 8})`}>
      <line x1={SIDE_VAN_CX - 150} y1={GROUND_Y + 8} x2={SIDE_VAN_CX + 150} y2={GROUND_Y + 8}
        stroke={AMBER} strokeWidth={1.5} strokeDasharray="6 6" />
    </g>

    {/* Angle readouts near ground */}
    <text x={REAR_VAN_CX - 50} y={GROUND_Y + 18} fill={sOff ? AMBER_DIM : AMBER}
      fontSize="9" fontFamily="monospace">
      {sOff ? "—°" : `${d.roll}°`}
    </text>
    <text x={SIDE_VAN_CX + 100} y={GROUND_Y + 18} fill={sOff ? AMBER_DIM : AMBER}
      fontSize="9" fontFamily="monospace" textAnchor="end">
      {sOff ? "—°" : `${d.pitch}°`}
    </text>

    {/* ═══ AUDIO STRIP ═══ */}
    <line x1={10} y1={AUDIO_Y} x2={W - 10} y2={AUDIO_Y} stroke={AMBER_DIM} strokeWidth={0.3} />

    {/* Source */}
    <text x={15} y={AUDIO_Y + 18} fill={AMBER_DIM} fontSize="9" fontFamily="monospace" fontStyle="italic">Audio Source</text>
    <text x={15} y={AUDIO_Y + 32} fill={aOff ? AMBER_DIM : AMBER} fontSize="11" fontFamily="monospace" fontStyle="italic">
      {aOff ? "OFFLINE" : d.src}
    </text>

    {/* Artist / Track */}
    <text x={160} y={AUDIO_Y + 18} fill={aOff ? AMBER_DIM : AMBER} fontSize="11" fontFamily="monospace">
      Artist: {aOff ? "—" : d.artist}
    </text>
    <text x={160} y={AUDIO_Y + 34} fill={aOff ? AMBER_DIM : AMBER} fontSize="11" fontFamily="monospace">
      Track: {aOff ? "—" : d.track}
    </text>

    {/* Waveform */}
    <Waveform pts={aOff ? [] : wf} x={490} y={AUDIO_Y + 3} w={230} h={32} />

    {/* Progress bar */}
    <rect x={490} y={AUDIO_Y + 42} width={230} height={5} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
    {!aOff && <rect x={490} y={AUDIO_Y + 42} width={(d.pos / d.dur) * 230} height={5} fill={AMBER} />}

    {/* Time */}
    <text x={490} y={AUDIO_Y + 58} fill={aOff ? AMBER_DIM : AMBER} fontSize="8" fontFamily="monospace">
      {aOff ? "—:— / —:—" : `${fmtT(d.pos)}/ ${fmtT(d.dur)}`}
    </text>

    {/* Volume */}
    <g transform={`translate(${W - 60}, ${AUDIO_Y + 48})`}>
      <SpeakerIcon x={0} y={0} vol={d.vol} />
      <text x={20} y={8} fill={AMBER} fontSize={fb.volP ? "13" : "9"} fontFamily="monospace"
        style={{ transition: "font-size 0.2s ease-out" }}>{d.vol}</text>
    </g>
  </g>;
};

// ═══════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════
const MapScreen = ({ d, sub }) => {
  const [pan, setPan] = useState("auto");
  const [zm, setZm] = useState(14);
  const [zF, setZF] = useState(false);
  const noGps = !sub.gps;
  useEffect(() => {
    const h = e => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) setPan("manual");
      if (e.key === "+" || e.key === "=") { setZm(z => Math.min(z + 1, 18)); setZF(true); setTimeout(() => setZF(false), 1000); }
      if (e.key === "-") { setZm(z => Math.max(z - 1, 5)); setZF(true); setTimeout(() => setZF(false), 1000); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    if (pan !== "manual") return;
    const t = setTimeout(() => setPan("auto"), 10000);
    return () => clearTimeout(t);
  }, [pan]);
  return <g>
    {Array.from({ length: 22 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 14} x2={W} y2={i * 14} stroke={AMBER_DIM} strokeWidth={0.12} />)}
    {Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={i * 30} y1={0} x2={i * 30} y2={H} stroke={AMBER_DIM} strokeWidth={0.12} />)}
    <line x1={100} y1={80} x2={700} y2={80} stroke={AMBER} strokeWidth={1.5} />
    <line x1={100} y1={80} x2={100} y2={260} stroke={AMBER} strokeWidth={1} />
    <line x1={300} y1={0} x2={300} y2={H} stroke={AMBER} strokeWidth={1.5} />
    <line x1={500} y1={60} x2={500} y2={220} stroke={AMBER} strokeWidth={1} />
    <line x1={200} y1={160} x2={650} y2={160} stroke={AMBER} strokeWidth={1} />
    <text x={380} y={75} fill={AMBER_DIM} fontSize="6" fontFamily="monospace" textAnchor="middle">FLATBUSH AVE</text>
    <text x={310} y={140} fill={AMBER_DIM} fontSize="6" fontFamily="monospace" transform="rotate(-90,310,140)">OCEAN AVE</text>
    {!noGps && <g>
      <circle cx={300} cy={160} r={4} fill={AMBER} opacity={0.9}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={300} cy={160} r={7} fill="none" stroke={AMBER} strokeWidth={0.5} opacity={0.4}>
        <animate attributeName="r" values="7;12;7" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>}
    {noGps && <g>
      <rect x={W / 2 - 80} y={H / 2 - 15} width={160} height={30} fill={BG} fillOpacity={0.9} stroke={AMBER} strokeWidth={0.5} />
      <text x={W / 2} y={H / 2 + 5} fill={AMBER} fontSize="10" fontFamily="monospace" textAnchor="middle">NO GPS — ACQUIRING...</text>
    </g>}
    <rect x={0} y={0} width={W} height={24} fill={BG} fillOpacity={0.85} />
    <text x={15} y={16} fill={AMBER} fontSize="14" fontFamily="'Share Tech Mono',monospace" fontStyle="italic" fontWeight="bold">YoshiOS</text>
    {noGps ?
      <text x={W / 2} y={16} fill={AMBER} fontSize="9" fontFamily="monospace" textAnchor="middle">
        ⚠ NO GPS<animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" /></text> :
      <text x={W / 2} y={16} fill={AMBER} fontSize="9" fontFamily="monospace" textAnchor="middle">→ Flatbush Ave • 0.2 mi</text>}
    <text x={W - 15} y={16} fill={zF ? AMBER_BRIGHT : AMBER_DIM} fontSize="8" fontFamily="monospace" textAnchor="end"
      style={{ transition: "fill 0.3s" }}>Z{zm}</text>
    <text x={W - 55} y={16} fill={pan === "manual" ? AMBER : AMBER_DIM} fontSize="7" fontFamily="monospace" textAnchor="end">
      {pan === "manual" ? "◎ MANUAL" : "◎ AUTO"}
      {pan === "manual" && <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />}
    </text>
    <rect x={0} y={H - 24} width={W} height={24} fill={BG} fillOpacity={0.85} />
    <text x={15} y={H - 8} fill={AMBER} fontSize="9" fontFamily="monospace">{d.hdg} {String(Math.round(d.hdgDeg)).padStart(3, "0")}°</text>
    <text x={W / 2} y={H - 8} fill={AMBER} fontSize="9" fontFamily="monospace" textAnchor="middle">ETA 4:52 PM • 2.1 mi</text>
    <text x={W - 15} y={H - 8} fill={AMBER} fontSize="9" fontFamily="monospace" textAnchor="end">34 mph</text>
  </g>;
};

// ═══════════════════════════════════════════════════
// MUSIC
// ═══════════════════════════════════════════════════
const MusicScreen = ({ d, wf, sub, fb }) => {
  const aOff = !sub.spotify;
  const sources = ["Radio", "Cass", "BT 1", "BT 2", "AUX", "Spotify"];
  return <g>
    <text x={15} y={22} fill={AMBER} fontSize="16" fontFamily="'Share Tech Mono',monospace" fontStyle="italic" fontWeight="bold">YoshiOS</text>
    <text x={W - 15} y={22} fill={AMBER_DIM} fontSize="10" fontFamily="monospace" textAnchor="end">{d.time}</text>
    <line x1={10} y1={30} x2={W - 10} y2={30} stroke={AMBER_DIM} strokeWidth={0.3} />
    {fb.srcF && <g>
      <rect x={W / 2 - 60} y={38} width={120} height={22} fill={AMBER} rx={2} />
      <text x={W / 2} y={53} fill={BG} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{fb.srcF}</text>
    </g>}
    <Waveform pts={aOff ? [] : wf} x={30} y={40} w={460} h={85} />
    {aOff && <text x={260} y={88} fill={AMBER_DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">No audio connection</text>}
    <text x={520} y={62} fill={aOff ? AMBER_DIM : AMBER} fontSize="14" fontFamily="monospace" fontWeight="bold">{aOff ? "—" : d.artist}</text>
    <text x={520} y={82} fill={aOff ? AMBER_DIM : AMBER} fontSize="12" fontFamily="monospace">{aOff ? "—" : d.track}</text>
    <text x={520} y={104} fill={AMBER_DIM} fontSize="8" fontFamily="monospace">Source</text>
    <text x={520} y={118} fill={aOff ? AMBER_DIM : AMBER} fontSize="10" fontFamily="monospace">{aOff ? "OFFLINE" : d.src}</text>
    {!aOff && <g transform="translate(520,128)">
      {d.playing ?
        <g><rect x={0} y={0} width={4} height={10} fill={AMBER} /><rect x={7} y={0} width={4} height={10} fill={AMBER} />
          <text x={18} y={8} fill={AMBER} fontSize="7" fontFamily="monospace">PLAYING</text></g> :
        <g><polygon points="0,0 10,5 0,10" fill={AMBER} />
          <text x={18} y={8} fill={AMBER} fontSize="7" fontFamily="monospace">PAUSED</text></g>}
    </g>}
    <rect x={30} y={175} width={W - 60} height={6} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
    {!aOff && <rect x={30} y={175} width={(d.pos / d.dur) * (W - 60)} height={6} fill={AMBER} />}
    <text x={30} y={195} fill={aOff ? AMBER_DIM : AMBER} fontSize="8" fontFamily="monospace">{aOff ? "—:—" : fmtT(d.pos)}</text>
    <text x={W - 30} y={195} fill={aOff ? AMBER_DIM : AMBER} fontSize="8" fontFamily="monospace" textAnchor="end">{aOff ? "—:—" : fmtT(d.dur)}</text>
    <g transform="translate(30,210)">
      <SpeakerIcon x={0} y={0} vol={d.vol} />
      <text x={22} y={8} fill={AMBER} fontSize={fb.volP ? "13" : "10"} fontFamily="monospace"
        style={{ transition: "font-size 0.2s ease-out" }}>{d.vol}</text>
      <rect x={55} y={2} width={150} height={5} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
      <rect x={55} y={2} width={(d.vol / 100) * 150} height={5} fill={AMBER} />
    </g>
    <g transform="translate(30,245)">
      {sources.map((s, i) => {
        const act = d.src === s;
        return <g key={s} transform={`translate(${i * 80}, 0)`}>
          <rect x={0} y={0} width={74} height={16} fill={act ? AMBER : "none"} stroke={AMBER} strokeWidth={0.5} rx={2} />
          <text x={37} y={11} fill={act ? BG : AMBER} fontSize="7" fontFamily="monospace" textAnchor="middle">{s}</text>
        </g>;
      })}
    </g>
  </g>;
};

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function YoshiOS() {
  const [scr, setScr] = useState("boot");
  const [pc, setPc] = useState("off");
  const [sub, setSub] = useState({ victron: true, gps: true, sensors: true, spotify: true });
  const fb = useFeedback();
  const d = useSimData(sub);
  const wf = useWaveform(d.playing && sub.spotify);

  useEffect(() => {
    const t1 = setTimeout(() => setPc("booting"), 1500);
    const t2 = setTimeout(() => { setPc("running"); setScr("dashboard"); }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const sw = useCallback(s => {
    if (pc !== "running") return;
    fb.trigger("screen", { dashboard: "HOME", map: "NAV", music: "MUSIC" }[s]);
    setScr(s);
  }, [pc, fb]);

  useEffect(() => {
    const h = e => {
      if (e.key === "1") sw("dashboard");
      if (e.key === "2") sw("map");
      if (e.key === "3") sw("music");
      if (e.key === "v") setSub(s => ({ ...s, victron: !s.victron }));
      if (e.key === "g") setSub(s => ({ ...s, gps: !s.gps }));
      if (e.key === "s") setSub(s => ({ ...s, sensors: !s.sensors }));
      if (e.key === "a") setSub(s => ({ ...s, spotify: !s.spotify }));
      if (e.key === "w") fb.trigger("volume");
      if (e.key === "q") fb.trigger("source", "AUX");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [sw, fb]);

  return (
    <div style={{ background: "#0A0A06", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "monospace", padding: 20, userSelect: "none" }}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />

      <div style={{
        background: BG, borderRadius: 8, padding: 12, position: "relative", overflow: "hidden",
        boxShadow: `0 0 60px rgba(240,173,59,0.06), inset 0 0 100px rgba(0,0,0,0.3)`,
      }}>
        {/* CRT scanlines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)` }} />
        {/* CRT vignette */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 11,
          background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)` }} />

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block", fontFamily: "'Share Tech Mono', monospace" }}>
          <rect width={W} height={H} fill={BG} />

          {scr === "boot" && <BootScreen pcState={pc} />}
          {scr === "dashboard" && <Dashboard d={d} wf={wf} sub={sub} fb={fb} />}
          {scr === "map" && <MapScreen d={d} sub={sub} />}
          {scr === "music" && <MusicScreen d={d} wf={wf} sub={sub} fb={fb} />}

          {/* Mode flash overlay (GUC-030.3) */}
          {fb.flash && <g>
            <rect x={W / 2 - 40} y={H / 2 - 12} width={80} height={24} fill={BG} stroke={AMBER} strokeWidth={1} />
            <text x={W / 2} y={H / 2 + 5} fill={AMBER} fontSize="12" fontFamily="monospace"
              textAnchor="middle" fontWeight="bold">{fb.flash}</text>
          </g>}
        </svg>
      </div>

      {/* Control legend */}
      <div style={{ color: AMBER_DIM, fontSize: 11, marginTop: 16, fontFamily: "'Share Tech Mono', monospace", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ color: scr === "dashboard" ? AMBER : AMBER_DIM }}>[1] HOME</span>
          <span style={{ color: scr === "map" ? AMBER : AMBER_DIM }}>[2] NAV</span>
          <span style={{ color: scr === "music" ? AMBER : AMBER_DIM }}>[3] MUSIC</span>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 9 }}>
          <span style={{ color: sub.victron ? "#4a7" : "#a44" }}>[V] Victron {sub.victron ? "ON" : "OFF"}</span>
          <span style={{ color: sub.gps ? "#4a7" : "#a44" }}>[G] GPS {sub.gps ? "ON" : "OFF"}</span>
          <span style={{ color: sub.sensors ? "#4a7" : "#a44" }}>[S] Sensors {sub.sensors ? "ON" : "OFF"}</span>
          <span style={{ color: sub.spotify ? "#4a7" : "#a44" }}>[A] Audio {sub.spotify ? "ON" : "OFF"}</span>
        </div>
        <div style={{ fontSize: 9 }}>[W] Volume pulse • [Q] Source flash • [+/-] Map zoom • [Arrows] Map pan</div>
      </div>
    </div>
  );
}
