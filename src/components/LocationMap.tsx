import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Geographic map of the Marmara / İzmit Gulf region.
 * Verde Ulaşlı at center, destinations with travel times.
 * Stylized SVG — VERDE brand palette, luxury aesthetic.
 */

interface Dest {
  labelKey: string;
  time: string;
  x: number;
  y: number;
  align?: "left" | "right";
}

const DESTINATIONS: Dest[] = [
  { labelKey: "map.istanbul",  time: "70'",  x: 115, y: 128, align: "left" },
  { labelKey: "map.airport",   time: "50'",  x: 270, y: 140, align: "left" },
  { labelKey: "map.izmit",     time: "30'",  x: 620, y: 248, align: "right" },
  { labelKey: "map.dining",    time: "20'",  x: 555, y: 275, align: "right" },
  { labelKey: "map.kartepe",   time: "1h",   x: 735, y: 255, align: "right" },
  { labelKey: "map.marmara",   time: "30'",  x: 320, y: 340, align: "left" },
  { labelKey: "map.iznik",     time: "45'",  x: 530, y: 490, align: "right" },
  { labelKey: "map.bursa",     time: "70'",  x: 185, y: 510, align: "left" },
  { labelKey: "map.uludag",    time: "2h",   x: 260, y: 560, align: "left" },
  { labelKey: "map.blacksea",  time: "1h",   x: 680, y: 68,  align: "right" },
];

// Verde location
const VX = 500, VY = 320;

export default function LocationMap() {
  const { t } = useLanguage();

  return (
    <div className="loc-map">
      <svg viewBox="0 0 900 650" className="loc-map__svg" aria-label="Verde Ulaşlı location map">
        <defs>
          <radialGradient id="verde-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C3A564" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C3A564" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="water-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a2a3a" />
            <stop offset="100%" stopColor="#0d1f2d" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background — land */}
        <rect width="900" height="650" fill="#0E1A16" rx="16" />

        {/* ── Water bodies ── */}

        {/* Black Sea — top strip hint */}
        <path d="M0,0 L900,0 L900,55 Q750,75 600,50 Q400,30 200,60 Q100,70 0,45 Z" fill="url(#water-grad)" opacity="0.6" />
        <text x="450" y="30" textAnchor="middle" fill="rgba(195,165,100,0.2)" fontSize="9" fontFamily="Inter,sans-serif" letterSpacing="4" textTransform="uppercase">BLACK SEA</text>

        {/* Marmara Sea — left/west */}
        <path d="M0,200 Q60,180 120,210 Q200,240 280,250 L300,280 Q250,310 200,340 Q150,360 100,370 Q50,380 0,360 Z" fill="url(#water-grad)" opacity="0.7" />
        <text x="100" y="300" textAnchor="middle" fill="rgba(195,165,100,0.18)" fontSize="10" fontFamily="Inter,sans-serif" letterSpacing="3">MARMARA</text>

        {/* İzmit Gulf — narrow body east-west */}
        <path d="M280,250 Q320,242 380,248 Q440,252 500,258 Q560,262 620,260 Q660,258 700,262 L700,278 Q660,282 620,280 Q560,284 500,282 Q440,278 380,275 Q320,272 280,278 Z" fill="url(#water-grad)" opacity="0.8" />
        <text x="490" y="272" textAnchor="middle" fill="rgba(195,165,100,0.15)" fontSize="7" fontFamily="Inter,sans-serif" letterSpacing="4">İZMİT GULF</text>

        {/* İznik Lake */}
        <ellipse cx="530" cy="495" rx="80" ry="35" fill="url(#water-grad)" opacity="0.6" />
        <text x="530" y="500" textAnchor="middle" fill="rgba(195,165,100,0.15)" fontSize="7" fontFamily="Inter,sans-serif" letterSpacing="2">İZNİK LAKE</text>

        {/* Sapanca Lake hint */}
        <ellipse cx="720" cy="300" rx="30" ry="12" fill="url(#water-grad)" opacity="0.5" />

        {/* ── Connection lines from Verde to destinations ── */}
        {DESTINATIONS.map((d) => (
          <line
            key={d.labelKey + "-line"}
            x1={VX} y1={VY} x2={d.x} y2={d.y}
            stroke="rgba(195,165,100,0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* ── Destination markers ── */}
        {DESTINATIONS.map((d) => {
          const isLeft = d.align === "left";
          const tx = isLeft ? d.x - 12 : d.x + 12;
          const anchor = isLeft ? "end" : "start";
          return (
            <g key={d.labelKey}>
              {/* Dot */}
              <circle cx={d.x} cy={d.y} r="3.5" fill="#EBE8E1" opacity="0.7" />
              <circle cx={d.x} cy={d.y} r="6" fill="none" stroke="rgba(235,232,225,0.2)" strokeWidth="0.8" />
              {/* Label */}
              <text x={tx} y={d.y - 3} textAnchor={anchor} fill="#EBE8E1" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="500" opacity="0.85">
                {t(d.labelKey)}
              </text>
              {/* Time */}
              <text x={tx} y={d.y + 10} textAnchor={anchor} fill="#C3A564" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="0.5">
                {d.time}
              </text>
            </g>
          );
        })}

        {/* ── VERDE marker — the star ── */}
        <circle cx={VX} cy={VY} r="50" fill="url(#verde-glow)" />
        <circle cx={VX} cy={VY} r="16" fill="#2D5040" filter="url(#glow)" />
        <circle cx={VX} cy={VY} r="19" fill="none" stroke="#C3A564" strokeWidth="1.2" />
        <circle cx={VX} cy={VY} r="24" fill="none" stroke="rgba(195,165,100,0.15)" strokeWidth="0.8" strokeDasharray="2 3" />
        <text x={VX} y={VY + 38} textAnchor="middle" fill="#C3A564" fontSize="11" fontFamily="Playfair Display,Georgia,serif" fontWeight="600" letterSpacing="3">
          VERDE
        </text>
        <text x={VX} y={VY + 50} textAnchor="middle" fill="rgba(195,165,100,0.5)" fontSize="7" fontFamily="Inter,sans-serif" letterSpacing="2">
          ULAŞLI
        </text>

        {/* ── Osmangazi Bridge indicator ── */}
        <line x1="290" y1="270" x2="290" y2="290" stroke="#C3A564" strokeWidth="1.5" opacity="0.4" />
        <text x="290" y="303" textAnchor="middle" fill="rgba(195,165,100,0.3)" fontSize="6" fontFamily="Inter,sans-serif" letterSpacing="1">OSMANGAZI</text>
        <text x="290" y="312" textAnchor="middle" fill="rgba(195,165,100,0.3)" fontSize="6" fontFamily="Inter,sans-serif" letterSpacing="1">BRIDGE</text>

        {/* ── Legend ── */}
        <text x="30" y="620" fill="rgba(235,232,225,0.25)" fontSize="7" fontFamily="Inter,sans-serif" letterSpacing="1.5">
          TRAVEL TIMES BY CAR
        </text>
        <line x1="30" y1="630" x2="60" y2="630" stroke="rgba(195,165,100,0.3)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="68" y="633" fill="rgba(235,232,225,0.2)" fontSize="7" fontFamily="Inter,sans-serif">driving route</text>

        {/* Compass */}
        <g transform="translate(850, 600)">
          <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(195,165,100,0.2)" strokeWidth="0.8" />
          <text x="0" y="-4" textAnchor="middle" fill="rgba(195,165,100,0.4)" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">N</text>
          <line x1="0" y1="2" x2="0" y2="8" stroke="rgba(195,165,100,0.2)" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}
