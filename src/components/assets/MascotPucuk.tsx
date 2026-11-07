import React from "react";

export interface MascotPucukProps {
  accessory?: "none" | "hat" | "scarf" | "bag" | "cheer";
  size?: number;
  className?: string;
  animate?: boolean;
}

export const MascotPucuk: React.FC<MascotPucukProps> = ({
  accessory = "none",
  size = 120,
  className = "",
  animate = true,
}) => {
  return (
    <div
      className={`inline-block relative select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? "transition-transform hover:scale-105 duration-300" : ""}`}
      >
        <defs>
          <linearGradient id="pucukBodyGrad" x1="100" y1="70" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8FCB8A" />
            <stop offset="1" stopColor="#4A7A45" />
          </linearGradient>
          <linearGradient id="pucukLeafGrad" x1="100" y1="10" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A8E6A3" />
            <stop offset="1" stopColor="#4A7A45" />
          </linearGradient>
          <linearGradient id="potGrad" x1="100" y1="140" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C49A6C" />
            <stop offset="1" stopColor="#8A5D3B" />
          </linearGradient>
          <filter id="cozyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2F3A2C" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter="url(#cozyGlow)">
          <path
            d="M58 146L68 184C69 188 73 190 77 190H123C127 190 131 188 132 184L142 146H58Z"
            fill="url(#potGrad)"
            stroke="#6E472A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect
            x="52"
            y="138"
            width="96"
            height="12"
            rx="6"
            fill="#D9B48F"
            stroke="#6E472A"
            strokeWidth="3"
          />
          <path
            d="M100 162C98 158 92 158 92 163C92 168 100 173 100 173C100 173 108 168 108 163C108 158 102 158 100 162Z"
            fill="#8A5D3B"
            opacity="0.6"
          />
        </g>

        <ellipse cx="100" cy="142" rx="42" ry="6" fill="#4A3423" />
        <ellipse cx="100" cy="110" rx="36" ry="38" fill="url(#pucukBodyGrad)" filter="url(#cozyGlow)" />

        <circle cx="88" cy="106" r="6.5" fill="#1C2B26" />
        <circle cx="112" cy="106" r="6.5" fill="#1C2B26" />
        <circle cx="90" cy="104" r="2.2" fill="#FFFFFF" />
        <circle cx="114" cy="104" r="2.2" fill="#FFFFFF" />

        <ellipse cx="78" cy="115" rx="5" ry="3" fill="#F08CAE" opacity="0.6" />
        <ellipse cx="122" cy="115" rx="5" ry="3" fill="#F08CAE" opacity="0.6" />

        <path
          d="M94 116C97 121 103 121 106 116"
          stroke="#1C2B26"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <g className={animate ? "animate-pulse origin-bottom" : ""}>
          <path d="M100 74C100 62 100 52 100 48" stroke="#4A7A45" strokeWidth="5" strokeLinecap="round" />
          <path
            d="M100 52C82 52 68 36 78 22C92 20 100 40 100 52Z"
            fill="url(#pucukLeafGrad)"
            stroke="#3D6B39"
            strokeWidth="2"
          />
          <path
            d="M100 52C118 52 132 36 122 22C108 20 100 40 100 52Z"
            fill="url(#pucukLeafGrad)"
            stroke="#3D6B39"
            strokeWidth="2"
          />
        </g>

        {accessory === "hat" && (
          <g transform="translate(0, -6)">
            <path
              d="M72 82C72 65 128 65 128 82H72Z"
              fill="#E8CA85"
              stroke="#8A5D3B"
              strokeWidth="2.5"
            />
            <ellipse cx="100" cy="82" rx="36" ry="6" fill="#F3DD9F" stroke="#8A5D3B" strokeWidth="2.5" />
            <path d="M96 74L104 74" stroke="#4A7A45" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {accessory === "scarf" && (
          <g transform="translate(0, 0)">
            <rect x="74" y="124" width="52" height="12" rx="6" fill="#C97D1A" stroke="#8F5A0E" strokeWidth="2" />
            <path
              d="M112 132L116 154C116 156 122 156 122 154L120 132H112Z"
              fill="#C97D1A"
              stroke="#8F5A0E"
              strokeWidth="2"
            />
          </g>
        )}

        {accessory === "bag" && (
          <g transform="translate(0, 0)">
            <path d="M78 98L126 138" stroke="#6E472A" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="120" y="128" width="20" height="18" rx="4" fill="#8A5D3B" stroke="#4A301D" strokeWidth="2" />
            <circle cx="130" cy="134" r="2" fill="#E8CA85" />
          </g>
        )}

        {accessory === "cheer" && (
          <g>
            <path d="M54 78L56 84L62 86L56 88L54 94L52 88L46 86L52 84L54 78Z" fill="#F3DD9F" />
            <path d="M148 72L150 78L156 80L150 82L148 88L146 82L140 80L146 78L148 72Z" fill="#F3DD9F" />
            <ellipse cx="62" cy="132" rx="4" ry="7" transform="rotate(30 62 132)" fill="#F08CAE" />
            <ellipse cx="140" cy="136" rx="4" ry="7" transform="rotate(-35 140 136)" fill="#F08CAE" />
          </g>
        )}
      </svg>
    </div>
  );
};
