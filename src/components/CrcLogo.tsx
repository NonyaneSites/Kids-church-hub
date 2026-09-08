import React from 'react';

interface CrcLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
}

export const CrcLogo: React.FC<CrcLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    custom: '',
  };

  const dimClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex-shrink-0 ${dimClass} rounded-full shadow-[0_0_15px_rgba(245,158,11,0.35)] overflow-hidden`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="crcBgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="65%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <linearGradient id="crcRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>

          {/* Background Gradient Circle */}
          <circle cx="100" cy="100" r="96" fill="url(#crcBgGrad)" />

          {/* Subtle Concentric Rings */}
          <circle cx="100" cy="100" r="88" fill="none" stroke="#FEF3C7" strokeWidth="1.5" opacity="0.4" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.3" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="#FEF3C7" strokeWidth="1.5" opacity="0.35" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#FDE68A" strokeWidth="1.2" opacity="0.25" />

          {/* Bold White Outer Ring */}
          <circle cx="100" cy="100" r="84" fill="none" stroke="url(#crcRingGrad)" strokeWidth="8.5" />

          {/* Bold White CRC Letters */}
          <text
            x="100"
            y="122"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontSize="64"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="alphabetic"
          >
            CRC
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
            CRC KIDS CHURCH
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            Johannesburg Production Hub
          </span>
        </div>
      )}
    </div>
  );
};
