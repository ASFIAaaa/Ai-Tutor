import React from 'react';
import { DiagramComponentType, DiagramElement, DiagramStep, PacketAnimation } from '../../types';

interface DiagramRendererProps {
  step: DiagramStep;
  selectedElementId?: string | null;
  onElementClick?: (element: DiagramElement) => void;
  speed?: number;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  step,
  selectedElementId,
  onElementClick
}) => {
  const { elements, highlightElementIds, packet } = step;

  // Build a lookup map of elements by id for fast cable/packet resolution
  const elementMap = React.useMemo(() => {
    const map = new Map<string, DiagramElement>();
    elements.forEach(el => map.set(el.id, el));
    return map;
  }, [elements]);

  return (
    <svg
      viewBox="0 0 800 500"
      className="w-full h-full select-none"
      style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.03))' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="routerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>

        <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        <linearGradient id="clientGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="firewallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        <linearGradient id="packetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="highlightGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="packetGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F97316" floodOpacity="0.5" />
        </filter>

        {/* Cable Pattern / Dashes */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F1F5F9" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Subtle background tech grid */}
      <rect width="800" height="500" fill="url(#grid)" rx="16" />

      {/* LAYER 1: Cables & Connections */}
      <g id="cables-layer">
        {elements
          .filter(el => el.type === 'cable' || el.type === 'arrow')
          .map(el => {
            const from = el.fromId ? elementMap.get(el.fromId) : null;
            const to = el.toId ? elementMap.get(el.toId) : null;
            const x1 = from ? from.x : el.x;
            const y1 = from ? from.y : el.y;
            const x2 = to ? to.x : (el.width ? el.x + el.width : el.x + 100);
            const y2 = to ? to.y : (el.height ? el.y + el.height : el.y);

            const isHighlighted = highlightElementIds.includes(el.id);

            return (
              <g
                key={el.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onElementClick?.(el)}
              >
                {/* Thick background track */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isHighlighted ? '#CBD5E1' : '#E2E8F0'}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Active core line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isHighlighted ? '#0284C7' : '#94A3B8'}
                  strokeWidth="3"
                  strokeDasharray={isHighlighted ? '6 6' : undefined}
                  className={isHighlighted ? 'animate-pulse' : ''}
                />
                {/* Signal pulse particles along the cable */}
                {isHighlighted && (
                  <circle r="4" fill="#38BDF8">
                    <animateMotion
                      path={`M ${x1} ${y1} L ${x2} ${y2}`}
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
      </g>

      {/* LAYER 2: Hardware Nodes & Devices */}
      <g id="nodes-layer">
        {elements
          .filter(el => el.type !== 'cable' && el.type !== 'arrow' && el.type !== 'packet')
          .map(el => {
            const isHighlighted = highlightElementIds.includes(el.id);
            const isSelected = selectedElementId === el.id;

            return (
              <g
                key={el.id}
                transform={`translate(${el.x}, ${el.y})`}
                className="cursor-pointer group"
                onClick={() => onElementClick?.(el)}
              >
                {/* Highlight Halo */}
                {(isHighlighted || isSelected) && (
                  <rect
                    x="-55"
                    y="-50"
                    width="110"
                    height="100"
                    rx="16"
                    fill={isSelected ? 'rgba(2, 132, 199, 0.12)' : 'rgba(249, 115, 22, 0.12)'}
                    stroke={isSelected ? '#0284C7' : '#F97316'}
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="animate-spin-slow origin-center"
                  />
                )}

                {/* Render specific component SVG icon */}
                {renderComponentIcon(el.type, el.status)}

                {/* Primary Label */}
                {el.label && (
                  <text
                    x="0"
                    y="42"
                    textAnchor="middle"
                    className="text-[12px] font-semibold fill-slate-800 tracking-tight"
                    style={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {el.label}
                  </text>
                )}

                {/* Secondary Sublabel */}
                {el.sublabel && (
                  <text
                    x="0"
                    y="56"
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-500 font-medium"
                  >
                    {el.sublabel}
                  </text>
                )}
              </g>
            );
          })}
      </g>

      {/* LAYER 3: Data Packets (Always Orange #F97316) */}
      <g id="packets-layer">
        {/* Static Packet Elements defined in step */}
        {elements
          .filter(el => el.type === 'packet')
          .map(el => (
            <g
              key={el.id}
              transform={`translate(${el.x}, ${el.y})`}
              className="cursor-pointer"
              filter="url(#packetGlow)"
              onClick={() => onElementClick?.(el)}
            >
              <rect
                x="-28"
                y="-18"
                width="56"
                height="36"
                rx="8"
                fill="url(#packetGrad)"
                stroke="#C2410C"
                strokeWidth="1.5"
              />
              {/* Envelope flap mark */}
              <path
                d="M -22 -10 L 0 4 L 22 -10"
                fill="none"
                stroke="#FED7AA"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x="0"
                y="11"
                textAnchor="middle"
                className="text-[9px] font-bold fill-white tracking-wider uppercase font-mono"
              >
                {el.label || 'DATA'}
              </text>
            </g>
          ))}

        {/* Animated gliding packet moving between nodes */}
        {packet && renderGlidingPacket(packet, elementMap)}
      </g>
    </svg>
  );
};

function renderGlidingPacket(
  packet: PacketAnimation,
  elementMap: Map<string, DiagramElement>
) {
  const from = elementMap.get(packet.fromId);
  const to = elementMap.get(packet.toId);
  if (!from || !to) return null;

  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  return (
    <g filter="url(#packetGlow)">
      <animateMotion
        path={`M ${x1} ${y1} L ${x2} ${y2}`}
        dur="2.4s"
        repeatCount="indefinite"
      />
      {/* Orange Data Packet Envelope */}
      <rect
        x="-30"
        y="-20"
        width="60"
        height="40"
        rx="10"
        fill="url(#packetGrad)"
        stroke="#FFF"
        strokeWidth="2"
      />
      {/* Folded envelope lines */}
      <path
        d="M -24 -12 L 0 4 L 24 -12"
        fill="none"
        stroke="#FFEDD5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="0"
        y="12"
        textAnchor="middle"
        className="text-[9px] font-bold fill-white uppercase tracking-wider font-mono"
      >
        {packet.payload ? packet.payload.slice(0, 10) : 'PACKET'}
      </text>
      {/* Status icon badge */}
      {packet.status === 'inspected' && (
        <circle cx="24" cy="-14" r="7" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
      )}
      {packet.status === 'blocked' && (
        <circle cx="24" cy="-14" r="7" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
      )}
    </g>
  );
}

function renderComponentIcon(type: DiagramComponentType, status?: string) {
  switch (type) {
    case 'computer':
      return (
        <g>
          {/* Laptop monitor */}
          <rect
            x="-36"
            y="-30"
            width="72"
            height="46"
            rx="6"
            fill="#1E293B"
            stroke="#475569"
            strokeWidth="2"
          />
          <rect x="-30" y="-24" width="60" height="34" rx="3" fill="#0F172A" />
          {/* Glowing screen content */}
          <rect x="-24" y="-18" width="30" height="4" rx="2" fill="#38BDF8" />
          <rect x="-24" y="-10" width="44" height="3" rx="1.5" fill="#94A3B8" />
          <rect x="-24" y="-3" width="36" height="3" rx="1.5" fill="#94A3B8" />
          {/* Base / Keyboard */}
          <path
            d="M -44 16 L -36 16 L 36 16 L 44 16 C 44 20, -44 20, -44 16 Z"
            fill="#64748B"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <rect x="-10" y="16" width="20" height="2" rx="1" fill="#94A3B8" />
        </g>
      );

    case 'phone':
      return (
        <g>
          {/* Smartphone body */}
          <rect
            x="-20"
            y="-34"
            width="40"
            height="68"
            rx="10"
            fill="#0F172A"
            stroke="#475569"
            strokeWidth="2"
          />
          <rect x="-16" y="-26" width="32" height="50" rx="4" fill="#0284C7" opacity="0.9" />
          {/* Speaker notch */}
          <rect x="-6" y="-30" width="12" height="2" rx="1" fill="#94A3B8" />
          {/* Home indicator bar */}
          <rect x="-7" y="27" width="14" height="2" rx="1" fill="#E2E8F0" />
        </g>
      );

    case 'router':
      return (
        <g>
          {/* Antennas */}
          <line x1="-24" y1="-10" x2="-32" y2="-32" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
          <line x1="24" y1="-10" x2="32" y2="-32" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="-10" x2="0" y2="-36" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />

          {/* Wi-Fi wave arcs */}
          <path
            d="M -16 -24 A 20 20 0 0 1 16 -24"
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Router Chassis */}
          <rect
            x="-44"
            y="-10"
            width="88"
            height="32"
            rx="8"
            fill="url(#routerGrad)"
            stroke="#0F766E"
            strokeWidth="2"
          />

          {/* Blinking Activity LEDs */}
          <circle cx="-28" cy="6" r="3.5" fill="#34D399" className="animate-ping" />
          <circle cx="-28" cy="6" r="3" fill="#10B981" />
          <circle cx="-16" cy="6" r="3" fill="#34D399" />
          <circle cx="-4" cy="6" r="3" fill="#38BDF8" />
          <circle cx="8" cy="6" r="3" fill="#FBBF24" />
          <circle cx="26" cy="6" r="4" fill="#042F2E" />
        </g>
      );

    case 'switch':
      return (
        <g>
          {/* Switch rack mount chassis */}
          <rect
            x="-46"
            y="-14"
            width="92"
            height="28"
            rx="5"
            fill="#0F172A"
            stroke="#0891B2"
            strokeWidth="2"
          />
          {/* RJ-45 Ethernet Ports row */}
          {[-32, -18, -4, 10, 24, 38].map((portX, i) => (
            <g key={i}>
              <rect x={portX - 5} y="-4" width="10" height="12" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
              <circle cx={portX} cy="-8" r="2" fill={i % 2 === 0 ? '#10B981' : '#38BDF8'} className="animate-pulse" />
            </g>
          ))}
        </g>
      );

    case 'server':
      return (
        <g>
          {/* Server 2U Rack unit */}
          <rect
            x="-44"
            y="-32"
            width="88"
            height="64"
            rx="7"
            fill="url(#serverGrad)"
            stroke="#4C1D95"
            strokeWidth="2"
          />
          {/* Drive bay 1 */}
          <rect x="-38" y="-24" width="76" height="14" rx="3" fill="#1E1B4B" stroke="#6D28D9" strokeWidth="1" />
          <circle cx="28" cy="-17" r="2.5" fill="#34D399" className="animate-pulse" />
          <circle cx="20" cy="-17" r="2.5" fill="#38BDF8" />

          {/* Drive bay 2 */}
          <rect x="-38" y="-6" width="76" height="14" rx="3" fill="#1E1B4B" stroke="#6D28D9" strokeWidth="1" />
          <circle cx="28" cy="1" r="2.5" fill="#34D399" />
          <circle cx="20" cy="1" r="2.5" fill="#FBBF24" />

          {/* Drive bay 3 */}
          <rect x="-38" y="12" width="76" height="14" rx="3" fill="#1E1B4B" stroke="#6D28D9" strokeWidth="1" />
          <circle cx="28" cy="19" r="2.5" fill="#34D399" className="animate-pulse" />
        </g>
      );

    case 'cloud':
      return (
        <g>
          {/* Cloud vector paths */}
          <path
            d="M -35 15 C -45 15, -55 5, -50 -10 C -48 -20, -38 -28, -25 -28 C -20 -38, -5 -44, 10 -40 C 25 -44, 40 -35, 45 -22 C 55 -20, 62 -10, 58 5 C 55 15, 45 15, 35 15 Z"
            fill="url(#cloudGrad)"
            stroke="#0284C7"
            strokeWidth="2"
          />
          <text
            x="0"
            y="-4"
            textAnchor="middle"
            className="text-[11px] font-bold fill-white tracking-wide uppercase font-mono"
          >
            INTERNET
          </text>
        </g>
      );

    case 'firewall':
      return (
        <g>
          {/* Brick firewall shape */}
          <rect
            x="-20"
            y="-38"
            width="40"
            height="76"
            rx="6"
            fill="url(#firewallGrad)"
            stroke="#991B1B"
            strokeWidth="2"
          />
          {/* Brick masonry lines */}
          <line x1="-20" y1="-18" x2="20" y2="-18" stroke="#7F1D1D" strokeWidth="2" />
          <line x1="-20" y1="2" x2="20" y2="2" stroke="#7F1D1D" strokeWidth="2" />
          <line x1="-20" y1="22" x2="20" y2="22" stroke="#7F1D1D" strokeWidth="2" />

          <line x1="-4" y1="-38" x2="-4" y2="-18" stroke="#7F1D1D" strokeWidth="1.5" />
          <line x1="10" y1="-18" x2="10" y2="2" stroke="#7F1D1D" strokeWidth="1.5" />
          <line x1="-8" y1="2" x2="-8" y2="22" stroke="#7F1D1D" strokeWidth="1.5" />
          <line x1="8" y1="22" x2="8" y2="38" stroke="#7F1D1D" strokeWidth="1.5" />

          {/* Flame icon or shield badge */}
          <circle cx="0" cy="-6" r="11" fill="#FEF08A" stroke="#EA580C" strokeWidth="1.5" />
          <path d="M 0 -13 Q 5 -8, 2 -3 Q 6 1, 0 3 Q -6 1, -2 -3 Q -5 -8, 0 -13 Z" fill="#DC2626" />
        </g>
      );

    case 'label':
      return (
        <g>
          <rect
            x="-45"
            y="-16"
            width="90"
            height="32"
            rx="6"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
          />
          <text x="0" y="4" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            Node
          </text>
        </g>
      );

    default:
      return (
        <circle r="20" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
      );
  }
}
