import { useState, useEffect, useCallback, useRef } from "react";

const AMBER = "#D4A017";
const AMBER_DIM = "#8A6A10";
const BG = "#1C1A0E";
const SCREEN_W = 832;
const SCREEN_H = 300;

// Simulated data
const useSimData = () => {
  const [data, setData] = useState({
    time: "10:37",
    date: "August 23, 2025",
    batteryPct: 75,
    solarPct: 86,
    chargeAh: 23,
    totalAh: 34,
    solarW: 240,
    loadW: -144,
    oilPct: 48,
    oilL: 3.2,
    tempF: 102,
    humidity: 54,
    roll: 6.9,
    pitch: -4.2,
    heading: "N",
    headingDeg: 0,
    ambientF: 72,
    artist: "Spiral",
    track: "The Vernon Spring",
    source: "Spotify",
    trackPos: 32,
    trackDur: 165,
    volume: 28,
    playing: true,
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setData((d) => {
        const newPos = d.playing ? (d.trackPos + 1) % d.trackDur : d.trackPos;
        return {
          ...d,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          trackPos: newPos,
          roll: +(Math.sin(Date.now() / 4000) * 8).toFixed(1),
          pitch: +(Math.sin(Date.now() / 5000 + 1) * 5).toFixed(1),
          headingDeg: (Date.now() / 100) % 360,
          batteryPct: 75 + Math.round(Math.sin(Date.now() / 10000) * 3),
          solarW: 240 + Math.round(Math.sin(Date.now() / 8000) * 20),
        };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return data;
};

// Waveform generator
const useWaveform = (playing) => {
  const [points, setPoints] = useState([]);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      const pts = [];
      const t = Date.now() / 200;
      for (let i = 0; i < 80; i++) {
        const x = i;
        const y =
          Math.sin((i + t) * 0.3) * 8 +
          Math.sin((i + t) * 0.7) * 4 +
          Math.sin((i + t) * 1.3) * 2 +
          (Math.random() - 0.5) * 3;
        pts.push({ x, y });
      }
      setPoints(pts);
    }, 80);
    return () => clearInterval(iv);
  }, [playing]);
  return points;
};

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Bar gauge component
const BarGauge = ({ value, max = 100, x, y, w = 20, h = 80, label }) => {
  const segments = 10;
  const filled = Math.round((value / max) * segments);
  return (
    <g>
      {Array.from({ length: segments }, (_, i) => {
        const segY = y + (segments - 1 - i) * (h / segments);
        const isFilled = i < filled;
        return (
          <rect
            key={i}
            x={x}
            y={segY}
            width={w}
            height={h / segments - 2}
            fill={isFilled ? AMBER : "none"}
            stroke={isFilled ? AMBER : AMBER_DIM}
            strokeWidth={0.5}
          />
        );
      })}
      {label && (
        <text x={x + w / 2} y={y + h + 12} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">
          {value}%
        </text>
      )}
    </g>
  );
};

// Simple van rear SVG
const VanRear = ({ roll, heading, headingDeg }) => {
  const cx = 0, cy = 0;
  return (
    <g transform={`rotate(${roll}, ${cx}, ${cy})`}>
      {/* Body */}
      <rect x={-40} y={-50} width={80} height={65} fill="none" stroke={AMBER} strokeWidth={1.2} rx={3} />
      {/* Roof rack */}
      <line x1={-35} y1={-50} x2={-35} y2={-55} stroke={AMBER} strokeWidth={1} />
      <line x1={35} y1={-50} x2={35} y2={-55} stroke={AMBER} strokeWidth={1} />
      <line x1={-35} y1={-55} x2={35} y2={-55} stroke={AMBER} strokeWidth={1} />
      {/* Rear window */}
      <rect x={-28} y={-45} width={56} height={25} fill="none" stroke={AMBER} strokeWidth={0.8} rx={2} />
      {/* Compass circle */}
      <circle cx={0} cy={-32} r={14} fill="none" stroke={AMBER} strokeWidth={0.8} />
      <text x={0} y={-37} fill={AMBER} fontSize="7" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">{heading}</text>
      {/* Compass needle */}
      <line
        x1={0} y1={-32}
        x2={Math.sin((headingDeg * Math.PI) / 180) * 9}
        y2={-32 - Math.cos((headingDeg * Math.PI) / 180) * 9}
        stroke={AMBER} strokeWidth={1.5}
      />
      {/* Bumper */}
      <rect x={-38} y={15} width={76} height={6} fill="none" stroke={AMBER} strokeWidth={0.8} rx={1} />
      {/* Wheels */}
      <ellipse cx={-35} cy={20} rx={8} ry={6} fill="none" stroke={AMBER} strokeWidth={1} />
      <ellipse cx={35} cy={20} rx={8} ry={6} fill="none" stroke={AMBER} strokeWidth={1} />
      {/* Taillights */}
      <rect x={-40} y={-5} width={4} height={8} fill={AMBER} />
      <rect x={36} y={-5} width={4} height={8} fill={AMBER} />
    </g>
  );
};

// Simple van side SVG
const VanSide = ({ pitch, tempF }) => {
  return (
    <g transform={`rotate(${pitch}, 0, 0)`}>
      {/* Body */}
      <rect x={-65} y={-40} width={130} height={55} fill="none" stroke={AMBER} strokeWidth={1.2} rx={3} />
      {/* Roof / pop top hint */}
      <line x1={-60} y1={-40} x2={-60} y2={-48} stroke={AMBER} strokeWidth={1} />
      <line x1={60} y1={-40} x2={60} y2={-48} stroke={AMBER} strokeWidth={1} />
      <line x1={-60} y1={-48} x2={60} y2={-48} stroke={AMBER} strokeWidth={1} />
      {/* Windshield */}
      <line x1={30} y1={-40} x2={55} y2={-25} stroke={AMBER} strokeWidth={0.8} />
      <line x1={55} y1={-40} x2={55} y2={-25} stroke={AMBER} strokeWidth={0.8} />
      {/* Windows */}
      <rect x={-50} y={-35} width={25} height={18} fill="none" stroke={AMBER} strokeWidth={0.7} />
      <rect x={-20} y={-35} width={25} height={18} fill="none" stroke={AMBER} strokeWidth={0.7} />
      <rect x={10} y={-35} width={18} height={18} fill="none" stroke={AMBER} strokeWidth={0.7} />
      {/* Door line */}
      <line x1={-20} y1={-17} x2={-20} y2={15} stroke={AMBER} strokeWidth={0.5} />
      <line x1={10} y1={-17} x2={10} y2={15} stroke={AMBER} strokeWidth={0.5} />
      {/* Wheels */}
      <circle cx={-40} cy={20} r={10} fill="none" stroke={AMBER} strokeWidth={1.2} />
      <circle cx={-40} cy={20} r={5} fill="none" stroke={AMBER} strokeWidth={0.5} />
      <circle cx={45} cy={20} r={10} fill="none" stroke={AMBER} strokeWidth={1.2} />
      <circle cx={45} cy={20} r={5} fill="none" stroke={AMBER} strokeWidth={0.5} />
      {/* Bumpers */}
      <rect x={-68} y={5} width={6} height={12} fill="none" stroke={AMBER} strokeWidth={0.8} rx={1} />
      <rect x={62} y={5} width={6} height={12} fill="none" stroke={AMBER} strokeWidth={0.8} rx={1} />
      {/* Thermometer icon */}
      <circle cx={0} cy={-10} r={12} fill="none" stroke={AMBER} strokeWidth={0.6} />
      <text x={0} y={-7} fill={AMBER} fontSize="7" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">{tempF}°</text>
    </g>
  );
};

// Ground line
const GroundLine = ({ angle, width = 120 }) => {
  const dashLen = 4;
  return (
    <g transform={`rotate(${angle})`}>
      <line x1={-width / 2} y1={0} x2={width / 2} y2={0} stroke={AMBER} strokeWidth={1} strokeDasharray={`${dashLen} ${dashLen}`} />
    </g>
  );
};

// Waveform display
const Waveform = ({ points, x, y, w, h }) => {
  if (!points.length) return null;
  const scaleX = w / 80;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x + p.x * scaleX} ${y + h / 2 + p.y * (h / 30)}`)
    .join(" ");
  return <path d={path} fill="none" stroke={AMBER} strokeWidth={1.2} />;
};

// Small icon components
const BatteryIcon = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width={16} height={9} fill="none" stroke={AMBER} strokeWidth={0.8} rx={1} />
    <rect x={x + 16} y={y + 2.5} width={2} height={4} fill={AMBER} />
    <rect x={x + 2} y={y + 2} width={3} height={5} fill={AMBER} />
    <rect x={x + 6} y={y + 2} width={3} height={5} fill={AMBER} />
    <rect x={x + 10} y={y + 2} width={3} height={5} fill={AMBER} />
  </g>
);

const SunIcon = ({ x, y }) => (
  <g>
    <circle cx={x + 8} cy={y + 8} r={4} fill="none" stroke={AMBER} strokeWidth={0.8} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const rad = (a * Math.PI) / 180;
      return (
        <line
          key={a}
          x1={x + 8 + Math.cos(rad) * 6}
          y1={y + 8 + Math.sin(rad) * 6}
          x2={x + 8 + Math.cos(rad) * 8}
          y2={y + 8 + Math.sin(rad) * 8}
          stroke={AMBER} strokeWidth={0.8}
        />
      );
    })}
  </g>
);

const OilIcon = ({ x, y }) => (
  <g>
    <circle cx={x + 6} cy={y + 4} r={3} fill="none" stroke={AMBER} strokeWidth={0.7} />
    <path d={`M${x + 3} ${y + 7} Q${x + 6} ${y + 14} ${x + 9} ${y + 7}`} fill="none" stroke={AMBER} strokeWidth={0.7} />
  </g>
);

const TempIcon = ({ x, y }) => (
  <g>
    <rect x={x + 3} y={y} width={4} height={10} fill="none" stroke={AMBER} strokeWidth={0.7} rx={2} />
    <circle cx={x + 5} cy={y + 12} r={3} fill="none" stroke={AMBER} strokeWidth={0.7} />
    <rect x={x + 4} y={y + 3} width={2} height={6} fill={AMBER} />
  </g>
);

const SpeakerIcon = ({ x, y, vol }) => (
  <g>
    <polygon points={`${x},${y + 4} ${x + 4},${y + 4} ${x + 8},${y} ${x + 8},${y + 10} ${x + 4},${y + 6} ${x},${y + 6}`} fill={AMBER} />
    {vol > 10 && <path d={`M${x + 10} ${y + 2} Q${x + 13} ${y + 5} ${x + 10} ${y + 8}`} fill="none" stroke={AMBER} strokeWidth={0.8} />}
    {vol > 20 && <path d={`M${x + 12} ${y} Q${x + 16} ${y + 5} ${x + 12} ${y + 10}`} fill="none" stroke={AMBER} strokeWidth={0.8} />}
  </g>
);

// Screens
const DashboardScreen = ({ data, waveform }) => (
  <g>
    {/* Header */}
    <text x={15} y={22} fill={AMBER} fontSize="14" fontFamily="'Share Tech Mono', monospace" fontStyle="italic" fontWeight="bold">
      YoshiOS
    </text>
    <text x={SCREEN_W - 15} y={22} fill={AMBER} fontSize="11" fontFamily="'Share Tech Mono', monospace" textAnchor="end" fontStyle="italic">
      {data.time} {data.date}
    </text>

    {/* Divider */}
    <line x1={10} y1={32} x2={SCREEN_W - 10} y2={32} stroke={AMBER_DIM} strokeWidth={0.3} />

    {/* Left column — Power section */}
    <BatteryIcon x={18} y={42} />
    <SunIcon x={50} y={42} />

    <BarGauge value={data.batteryPct} x={18} y={62} w={18} h={72} label />
    <BarGauge value={data.solarPct} x={50} y={62} w={18} h={72} label />

    {/* Metrics column */}
    <text x={82} y={52} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" fontWeight="bold">Charge</text>
    <text x={82} y={63} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.chargeAh} / {data.totalAh} ah</text>

    <text x={82} y={78} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" fontWeight="bold">Line / Load</text>
    <text x={82} y={89} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.solarW} w / {data.loadW}w</text>

    <g transform="translate(85, 100)">
      <OilIcon x={0} y={0} />
      <text x={16} y={5} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.oilPct}%</text>
      <text x={16} y={14} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.oilL}l</text>
    </g>

    <g transform="translate(85, 125)">
      <TempIcon x={0} y={0} />
      <text x={16} y={5} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.tempF}°</text>
      <text x={16} y={14} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.humidity}%</text>
    </g>

    {/* Center — Van rear with compass */}
    <g transform={`translate(330, 115)`}>
      <VanRear roll={data.roll} heading={data.heading} headingDeg={data.headingDeg} />
      <g transform={`translate(0, 38)`}>
        <GroundLine angle={data.roll} width={110} />
      </g>
      <text x={0} y={50} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">{data.roll}°</text>
    </g>

    {/* Right — Van side with temp */}
    <g transform={`translate(590, 110)`}>
      <VanSide pitch={data.pitch} tempF={data.ambientF} />
      <g transform={`translate(0, 38)`}>
        <GroundLine angle={data.pitch} width={160} />
      </g>
      <text x={50} y={50} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" textAnchor="end">{data.pitch}°</text>
    </g>

    {/* Bottom — Audio section */}
    <line x1={10} y1={210} x2={SCREEN_W - 10} y2={210} stroke={AMBER_DIM} strokeWidth={0.3} />

    <text x={15} y={228} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" fontWeight="bold">Audio Source</text>
    <text x={15} y={242} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.source}</text>

    <text x={170} y={228} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace">Artist: {data.artist}</text>
    <text x={170} y={242} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace">Track: {data.track}</text>

    {/* Waveform */}
    <Waveform points={waveform} x={530} y={215} w={200} h={30} />

    {/* Progress bar */}
    <rect x={530} y={255} width={200} height={6} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
    <rect x={530} y={255} width={(data.trackPos / data.trackDur) * 200} height={6} fill={AMBER} />

    <text x={530} y={275} fill={AMBER} fontSize="7" fontFamily="'Share Tech Mono', monospace">
      {fmtTime(data.trackPos)}/ {fmtTime(data.trackDur)}
    </text>

    <g transform="translate(760, 258)">
      <SpeakerIcon x={0} y={0} vol={data.volume} />
      <text x={22} y={8} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">{data.volume}</text>
    </g>
  </g>
);

const MapScreen = ({ data }) => (
  <g>
    {/* Header bar */}
    <rect x={0} y={0} width={SCREEN_W} height={28} fill={BG} fillOpacity={0.9} />
    <text x={15} y={18} fill={AMBER} fontSize="10" fontFamily="'Share Tech Mono', monospace" fontStyle="italic" fontWeight="bold">
      YoshiOS
    </text>
    <text x={SCREEN_W - 15} y={18} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" textAnchor="end">
      {data.time}
    </text>

    {/* Simulated map grid */}
    {Array.from({ length: 20 }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={30 + i * 14} x2={SCREEN_W} y2={30 + i * 14} stroke={AMBER_DIM} strokeWidth={0.15} />
    ))}
    {Array.from({ length: 30 }, (_, i) => (
      <line key={`v${i}`} x1={i * 30} y1={28} x2={i * 30} y2={SCREEN_H} stroke={AMBER_DIM} strokeWidth={0.15} />
    ))}

    {/* Simulated roads */}
    <line x1={100} y1={80} x2={700} y2={80} stroke={AMBER} strokeWidth={1.5} />
    <line x1={100} y1={80} x2={100} y2={260} stroke={AMBER} strokeWidth={1} />
    <line x1={300} y1={28} x2={300} y2={SCREEN_H} stroke={AMBER} strokeWidth={1.5} />
    <line x1={500} y1={60} x2={500} y2={220} stroke={AMBER} strokeWidth={1} />
    <line x1={200} y1={160} x2={650} y2={160} stroke={AMBER} strokeWidth={1} />
    <line x1={400} y1={120} x2={700} y2={200} stroke={AMBER} strokeWidth={0.8} />
    <line x1={150} y1={220} x2={600} y2={220} stroke={AMBER} strokeWidth={0.8} />

    {/* Road labels */}
    <text x={380} y={75} fill={AMBER} fontSize="6" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">FLATBUSH AVE</text>
    <text x={310} y={140} fill={AMBER} fontSize="6" fontFamily="'Share Tech Mono', monospace" transform="rotate(-90, 310, 140)">OCEAN AVE</text>
    <text x={420} y={155} fill={AMBER} fontSize="6" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">CHURCH AVE</text>

    {/* Position indicator */}
    <circle cx={300} cy={160} r={5} fill={AMBER} opacity={0.8}>
      <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx={300} cy={160} r={8} fill="none" stroke={AMBER} strokeWidth={0.5}>
      <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
    </circle>

    {/* Bottom bar */}
    <rect x={0} y={SCREEN_H - 28} width={SCREEN_W} height={28} fill={BG} fillOpacity={0.9} />
    <text x={15} y={SCREEN_H - 10} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace">
      {data.heading} • 0.3 mi → Flatbush Ave
    </text>
    <text x={SCREEN_W - 15} y={SCREEN_H - 10} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" textAnchor="end">
      ETA 4:52 PM • 2.1 mi
    </text>

    {/* Mode label */}
    <text x={SCREEN_W / 2} y={SCREEN_H / 2 - 30} fill={AMBER_DIM} fontSize="6" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">
      [MAP PROTOTYPE — MapLibre integration pending]
    </text>
  </g>
);

const MusicScreen = ({ data, waveform }) => (
  <g>
    {/* Header */}
    <text x={15} y={22} fill={AMBER} fontSize="14" fontFamily="'Share Tech Mono', monospace" fontStyle="italic" fontWeight="bold">
      YoshiOS
    </text>
    <text x={SCREEN_W - 15} y={22} fill={AMBER} fontSize="11" fontFamily="'Share Tech Mono', monospace" textAnchor="end" fontStyle="italic">
      {data.time}
    </text>
    <line x1={10} y1={32} x2={SCREEN_W - 10} y2={32} stroke={AMBER_DIM} strokeWidth={0.3} />

    {/* Large waveform */}
    <Waveform points={waveform} x={30} y={50} w={500} h={100} />

    {/* Track info — right side */}
    <text x={570} y={65} fill={AMBER} fontSize="12" fontFamily="'Share Tech Mono', monospace" fontWeight="bold">{data.artist}</text>
    <text x={570} y={85} fill={AMBER} fontSize="11" fontFamily="'Share Tech Mono', monospace">{data.track}</text>

    <text x={570} y={115} fill={AMBER_DIM} fontSize="9" fontFamily="'Share Tech Mono', monospace">Source</text>
    <text x={570} y={130} fill={AMBER} fontSize="10" fontFamily="'Share Tech Mono', monospace">{data.source}</text>

    {/* Play state */}
    {data.playing ? (
      <g transform="translate(570, 145)">
        <rect x={0} y={0} width={4} height={12} fill={AMBER} />
        <rect x={8} y={0} width={4} height={12} fill={AMBER} />
        <text x={20} y={10} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">PLAYING</text>
      </g>
    ) : (
      <g transform="translate(570, 145)">
        <polygon points="0,0 12,6 0,12" fill={AMBER} />
        <text x={20} y={10} fill={AMBER} fontSize="8" fontFamily="'Share Tech Mono', monospace">PAUSED</text>
      </g>
    )}

    {/* Large progress bar */}
    <rect x={30} y={195} width={SCREEN_W - 60} height={8} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
    <rect x={30} y={195} width={((data.trackPos / data.trackDur) * (SCREEN_W - 60))} height={8} fill={AMBER} />

    <text x={30} y={220} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace">
      {fmtTime(data.trackPos)}
    </text>
    <text x={SCREEN_W - 30} y={220} fill={AMBER} fontSize="9" fontFamily="'Share Tech Mono', monospace" textAnchor="end">
      {fmtTime(data.trackDur)}
    </text>

    {/* Volume */}
    <g transform={`translate(30, 240)`}>
      <SpeakerIcon x={0} y={0} vol={data.volume} />
      <text x={25} y={8} fill={AMBER} fontSize="10" fontFamily="'Share Tech Mono', monospace">{data.volume}</text>
      {/* Volume bar */}
      <rect x={55} y={2} width={150} height={6} fill="none" stroke={AMBER_DIM} strokeWidth={0.5} />
      <rect x={55} y={2} width={(data.volume / 100) * 150} height={6} fill={AMBER} />
    </g>

    {/* Source buttons indicator */}
    <g transform="translate(30, 270)">
      {["Radio", "Cass", "BT 1", "BT 2", "AUX", "Spotify"].map((s, i) => (
        <g key={s} transform={`translate(${i * 80}, 0)`}>
          <rect x={0} y={0} width={70} height={16} fill={data.source === s || (s === "Spotify" && data.source === "Spotify") ? AMBER : "none"} stroke={AMBER} strokeWidth={0.5} rx={2} />
          <text x={35} y={11} fill={data.source === s || (s === "Spotify" && data.source === "Spotify") ? BG : AMBER} fontSize="7" fontFamily="'Share Tech Mono', monospace" textAnchor="middle">{s}</text>
        </g>
      ))}
    </g>
  </g>
);

// Main app
export default function YoshiOS() {
  const [screen, setScreen] = useState("dashboard");
  const [flash, setFlash] = useState(null);
  const data = useSimData();
  const waveform = useWaveform(data.playing);

  const switchScreen = useCallback((s) => {
    const labels = { dashboard: "HOME", map: "NAV", music: "MUSIC" };
    setFlash(labels[s]);
    setScreen(s);
    setTimeout(() => setFlash(null), 600);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "1": switchScreen("dashboard"); break;
        case "2": switchScreen("map"); break;
        case "3": switchScreen("music"); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [switchScreen]);

  return (
    <div style={{ background: "#0A0A06", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Share Tech Mono', monospace", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />

      {/* CRT frame */}
      <div style={{
        background: BG,
        borderRadius: 8,
        padding: 12,
        boxShadow: `0 0 40px rgba(212,160,23,0.08), inset 0 0 80px rgba(0,0,0,0.3)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)`,
        }} />

        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 11,
          background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)`,
        }} />

        <svg
          width={SCREEN_W}
          height={SCREEN_H}
          viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
          style={{ display: "block" }}
        >
          <rect width={SCREEN_W} height={SCREEN_H} fill={BG} />

          {screen === "dashboard" && <DashboardScreen data={data} waveform={waveform} />}
          {screen === "map" && <MapScreen data={data} />}
          {screen === "music" && <MusicScreen data={data} waveform={waveform} />}

          {/* Flash label on transition */}
          {flash && (
            <g>
              <rect x={SCREEN_W / 2 - 40} y={SCREEN_H / 2 - 12} width={80} height={24} fill={BG} stroke={AMBER} strokeWidth={1} />
              <text x={SCREEN_W / 2} y={SCREEN_H / 2 + 5} fill={AMBER} fontSize="12" fontFamily="'Share Tech Mono', monospace" textAnchor="middle" fontWeight="bold">{flash}</text>
            </g>
          )}
        </svg>
      </div>

      {/* Controls legend */}
      <div style={{ color: AMBER_DIM, fontSize: 11, marginTop: 16, fontFamily: "'Share Tech Mono', monospace", display: "flex", gap: 24 }}>
        <span style={{ color: screen === "dashboard" ? AMBER : AMBER_DIM }}>[1] HOME</span>
        <span style={{ color: screen === "map" ? AMBER : AMBER_DIM }}>[2] NAV</span>
        <span style={{ color: screen === "music" ? AMBER : AMBER_DIM }}>[3] MUSIC</span>
      </div>
    </div>
  );
}
