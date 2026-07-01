export default function Spinner({ size = 'md', text = '' }) {
  const dim  = { sm: 52, md: 72, lg: 100 }[size];
  const ring = dim + 20;

  return (
    <div className="flex flex-col justify-center items-center py-10 gap-3 select-none">
      <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>
        {/* Spinning arc */}
        <svg className="animate-spin absolute inset-0" viewBox="0 0 100 100"
          style={{ width: ring, height: ring, animationDuration: '1.1s' }}>
          <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="6" fill="none" />
          <circle cx="50" cy="50" r="45" stroke="#2d7a2d" strokeWidth="6" fill="none"
            strokeDasharray="80 202" strokeLinecap="round" strokeDashoffset="20" />
        </svg>

        {/* Clay kallu pot SVG in centre */}
        <svg viewBox="0 0 80 95" style={{ width: dim * 0.62, height: dim * 0.62 }}>
          {/* Pot body */}
          <path d="M14 48 Q9 63 14 74 Q20 90 40 92 Q60 90 66 74 Q71 63 66 48 Q57 32 40 30 Q23 32 14 48Z"
            fill="#C4652D" />
          {/* Shoulder blend */}
          <ellipse cx="40" cy="48" rx="26" ry="10" fill="#D97530" />
          {/* Neck */}
          <rect x="28" y="22" width="24" height="14" rx="3" fill="#C4652D" />
          {/* Rim */}
          <ellipse cx="40" cy="22" rx="16" ry="5.5" fill="#E08040" />
          {/* Mouth opening */}
          <ellipse cx="40" cy="21" rx="11" ry="3.5" fill="#8B3A18" />
          {/* Toddy liquid (golden amber) */}
          <ellipse cx="40" cy="23" rx="9" ry="2.8" fill="#E8A820" opacity="0.95" />
          {/* Handle */}
          <path d="M66 52 Q80 60 80 72 Q80 82 66 77"
            stroke="#A84A1A" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          {/* Highlight shine */}
          <path d="M21 55 Q19 67 23 77"
            stroke="rgba(255,255,255,0.18)" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Base ring */}
          <ellipse cx="40" cy="90" rx="21" ry="4.5" fill="#8B3A18" />
          {/* Toddy drops above rim */}
          <circle cx="40" cy="12" r="2.5" fill="#E8A820" opacity="0.85">
            <animate attributeName="cy" values="12;3" dur="1.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;0" dur="1.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="9" r="2" fill="#E8A820" opacity="0.7">
            <animate attributeName="cy" values="9;0" dur="1.1s" begin="0.35s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="1.1s" begin="0.35s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <p className="text-sm text-gray-400 font-medium">{text || 'Loading...'}</p>
    </div>
  );
}
