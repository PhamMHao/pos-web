import React from 'react';

interface GiaPhucLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  isPrint?: boolean;
}

export const GiaPhucLogo: React.FC<GiaPhucLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor,
  subtextColor,
  isPrint = false,
}) => {
  const sizeMap = {
    xs: { width: 90, height: 32, iconSize: 28 },
    sm: { width: 130, height: 44, iconSize: 38 },
    md: { width: 170, height: 56, iconSize: 48 },
    lg: { width: 220, height: 72, iconSize: 62 },
    xl: { width: 280, height: 92, iconSize: 80 },
    custom: { width: 180, height: 60, iconSize: 50 },
  };

  const currentSize = sizeMap[size];

  // Official Gia Phúc colors matching the branding
  const blueColor = '#0b66b3';
  const darkBlueColor = '#07477c';
  const orangeColor = '#d97d25';
  const goldColor = '#b88126';

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
      {/* Exact Stylized SVG Monogram G & P */}
      <svg
        viewBox="0 0 100 100"
        className="shrink-0"
        style={{
          width: currentSize.iconSize,
          height: currentSize.iconSize,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamic Blue Stylized 'G' Crescent Swoop */}
        <path
          d="M12 75 C 8 50, 20 28, 48 10 C 72 -4, 96 12, 94 36 C 93 48, 82 52, 70 52 C 58 52, 45 42, 44 32 C 43 24, 49 18, 56 16 C 36 24, 25 42, 28 62 C 30 74, 42 84, 58 84 C 76 84, 88 72, 90 60 L 96 66 C 92 84, 76 96, 52 96 C 26 96, 14 88, 12 75 Z"
          fill="url(#gpBlueGradient)"
        />

        {/* Orange/Amber Stylized 'P' Monogram */}
        <path
          d="M48 20 C 58 16, 78 16, 88 28 C 96 38, 92 56, 78 64 C 68 70, 56 70, 48 66 L 48 88 C 48 90, 45 92, 42 92 C 39 92, 36 90, 36 88 L 36 28 C 36 24, 40 22, 48 20 Z M 48 30 L 48 56 C 54 58, 66 58, 74 52 C 82 46, 84 36, 78 30 C 72 24, 58 24, 48 30 Z"
          fill="url(#gpOrangeGradient)"
        />

        {/* Inner swoosh accent line */}
        <path
          d="M18 78 Q 48 45 92 24"
          stroke="#e0862d"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="gpBlueGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0072bc" />
            <stop offset="70%" stopColor="#0a85ea" />
            <stop offset="100%" stopColor="#005b9f" />
          </linearGradient>
          <linearGradient id="gpOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e88e28" />
            <stop offset="60%" stopColor="#d9741e" />
            <stop offset="100%" stopColor="#ba5d10" />
          </linearGradient>
        </defs>
      </svg>

      {/* Typography Brand Name */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-serif font-black tracking-wider uppercase text-nowrap"
            style={{
              color: textColor || (isPrint ? darkBlueColor : '#0284c7'),
              fontSize: size === 'xs' ? '12px' : size === 'sm' ? '14px' : size === 'md' ? '17px' : size === 'lg' ? '22px' : '26px',
              letterSpacing: '0.04em',
              textShadow: isPrint ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            GIA PHÚC
          </span>
          <span
            className="font-serif font-semibold italic text-nowrap mt-0.5"
            style={{
              color: subtextColor || (isPrint ? goldColor : '#d97d25'),
              fontSize: size === 'xs' ? '8px' : size === 'sm' ? '9px' : size === 'md' ? '11px' : size === 'lg' ? '13px' : '15px',
              letterSpacing: '0.02em',
            }}
          >
            Computer®
          </span>
        </div>
      )}
    </div>
  );
};

// Pure base64 data URI representation for export and <img> tags
export const GIA_PHUC_LOGO_SVG_DATA_URI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 85" width="260" height="85"><g fill="none"><path d="M12 65 C 8 42, 20 22, 46 8 C 68 -4, 90 8, 88 28 C 87 38, 76 42, 65 42 C 54 42, 42 34, 41 26 C 40 19, 46 14, 52 12 C 34 18, 24 34, 26 52 C 28 62, 38 72, 54 72 C 70 72, 80 62, 82 50 L 88 56 C 84 72, 70 82, 48 82 C 24 82, 14 75, 12 65 Z" fill="%230072bc"/><path d="M46 16 C 54 12, 72 12, 82 22 C 89 30, 85 46, 73 53 C 64 58, 53 58, 46 54 L 46 76 C 46 78, 43 80, 40 80 C 37 80, 34 78, 34 76 L 34 22 C 34 19, 38 17, 46 16 Z M 46 24 L 46 47 C 51 49, 62 49, 69 44 C 76 39, 78 30, 73 25 C 68 20, 55 20, 46 24 Z" fill="%23d97d25"/><path d="M16 68 Q 44 38 86 20" stroke="%23e0862d" stroke-width="3" stroke-linecap="round"/><text x="100" y="44" font-family="Georgia, serif" font-weight="900" font-size="22" fill="%230b4d8c" letter-spacing="1">GIA PHÚC</text><text x="102" y="66" font-family="Georgia, serif" font-style="italic" font-weight="600" font-size="14" fill="%23b88126">Computer®</text></g></svg>`;
