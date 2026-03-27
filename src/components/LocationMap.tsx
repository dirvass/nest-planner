import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Radial distance map — Verde at center, destinations around it.
 * Pure SVG, VERDE brand palette, no external dependencies.
 */

interface Dest {
  labelKey: string;
  time: string;
  angle: number;   // degrees from top (12 o'clock)
  ring: 1 | 2 | 3; // distance ring (1=close, 2=mid, 3=far)
  icon: string;
}

const DESTINATIONS: Dest[] = [
  { labelKey: "map.dining",    time: "20'",  angle: 30,   ring: 1, icon: "🍽" },
  { labelKey: "map.marmara",   time: "30'",  angle: 75,   ring: 1, icon: "🏖" },
  { labelKey: "map.izmit",     time: "30'",  angle: 330,  ring: 1, icon: "🏙" },
  { labelKey: "map.airport",   time: "50'",  angle: 280,  ring: 2, icon: "✈" },
  { labelKey: "map.iznik",     time: "45'",  angle: 145,  ring: 2, icon: "🏛" },
  { labelKey: "map.kartepe",   time: "1h",   angle: 355,  ring: 2, icon: "⛷" },
  { labelKey: "map.blacksea",  time: "1h",   angle: 55,   ring: 2, icon: "🌊" },
  { labelKey: "map.istanbul",  time: "70'",  angle: 245,  ring: 3, icon: "🌉" },
  { labelKey: "map.bursa",     time: "70'",  angle: 175,  ring: 3, icon: "🕌" },
  { labelKey: "map.uludag",    time: "2h",   angle: 195,  ring: 3, icon: "🏔" },
];

const RING_RADII = { 1: 105, 2: 165, 3: 225 };
const CX = 300, CY = 300;

function polarToXY(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

export default function LocationMap() {
  const { t } = useLanguage();

  return (
    <div className="loc-map">
      <svg viewBox="0 0 600 600" className="loc-map__svg" aria-label="Verde Ulaşlı location map">
        {/* Background */}
        <rect width="600" height="600" fill="#0E1A16" rx="20" />

        {/* Distance rings */}
        {[1, 2, 3].map((ring) => (
          <circle
            key={ring}
            cx={CX} cy={CY}
            r={RING_RADII[ring as 1 | 2 | 3]}
            fill="none"
            stroke="rgba(195,165,100,0.12)"
            strokeWidth="1"
            strokeDasharray={ring === 1 ? "none" : "4 6"}
          />
        ))}

        {/* Ring labels */}
        <text x={CX + RING_RADII[1] + 4} y={CY - 4} fill="rgba(195,165,100,0.3)" fontSize="8" fontFamily="Inter, sans-serif">30 min</text>
        <text x={CX + RING_RADII[2] + 4} y={CY - 4} fill="rgba(195,165,100,0.25)" fontSize="8" fontFamily="Inter, sans-serif">1 hr</text>
        <text x={CX + RING_RADII[3] + 4} y={CY - 4} fill="rgba(195,165,100,0.2)" fontSize="8" fontFamily="Inter, sans-serif">2 hr</text>

        {/* Connection lines + destinations */}
        {DESTINATIONS.map((d) => {
          const r = RING_RADII[d.ring];
          const [dx, dy] = polarToXY(d.angle, r);
          const [lx, ly] = polarToXY(d.angle, r + 28);
          const label = t(d.labelKey);
          // Decide text-anchor based on angle
          const anchor = d.angle > 90 && d.angle < 270 ? "end" : d.angle === 0 || d.angle === 180 ? "middle" : "start";

          return (
            <g key={d.labelKey}>
              {/* Line from center to destination */}
              <line
                x1={CX} y1={CY} x2={dx} y2={dy}
                stroke="rgba(195,165,100,0.15)"
                strokeWidth="1"
              />
              {/* Destination dot */}
              <circle cx={dx} cy={dy} r="4" fill="#C3A564" />
              <circle cx={dx} cy={dy} r="8" fill="rgba(195,165,100,0.15)" />
              {/* Icon */}
              <text x={dx} y={dy - 14} textAnchor="middle" fontSize="14">{d.icon}</text>
              {/* Label */}
              <text
                x={lx} y={ly - 4}
                textAnchor={anchor}
                fill="#EBE8E1"
                fontSize="10"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                {label}
              </text>
              {/* Time badge */}
              <text
                x={lx} y={ly + 10}
                textAnchor={anchor}
                fill="#C3A564"
                fontSize="9"
                fontFamily="Inter, sans-serif"
                fontWeight="700"
                letterSpacing="0.5"
              >
                {d.time}
              </text>
            </g>
          );
        })}

        {/* Center — Verde */}
        <circle cx={CX} cy={CY} r="28" fill="#2D5040" />
        <circle cx={CX} cy={CY} r="32" fill="none" stroke="#C3A564" strokeWidth="1.5" />
        <text
          x={CX} y={CY - 4}
          textAnchor="middle"
          fill="#EBE8E1"
          fontSize="9"
          fontFamily="Playfair Display, Georgia, serif"
          fontWeight="600"
          letterSpacing="1.5"
        >
          VERDE
        </text>
        <text
          x={CX} y={CY + 9}
          textAnchor="middle"
          fill="rgba(235,232,225,0.6)"
          fontSize="7"
          fontFamily="Inter, sans-serif"
          letterSpacing="1"
        >
          ULAŞLI
        </text>

        {/* Compass indicator */}
        <text x={CX} y={40} textAnchor="middle" fill="rgba(195,165,100,0.3)" fontSize="9" fontFamily="Inter, sans-serif" letterSpacing="2">N</text>
        <line x1={CX} y1={46} x2={CX} y2={56} stroke="rgba(195,165,100,0.2)" strokeWidth="1" />
      </svg>
    </div>
  );
}
