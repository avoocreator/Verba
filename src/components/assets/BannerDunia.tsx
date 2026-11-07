import React, { useMemo } from "react";
import { MascotPucuk } from "./MascotPucuk";

export interface BannerDuniaProps {
  worldId: string;
  level: number;
  mascotAccessory?: "none" | "hat" | "scarf" | "bag" | "cheer";
  className?: string;
}

export const BannerDunia: React.FC<BannerDuniaProps> = ({
  worldId,
  level,
  mascotAccessory = "none",
  className = "",
}) => {
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 16) return "noon";
    if (hour >= 16 && hour < 18) return "sunset";
    return "night";
  }, []);

  return (
    <div
      className={`relative w-full h-48 md:h-56 rounded-3xl overflow-hidden shadow-cozy select-none ${className}`}
    >
      <svg
        viewBox="0 0 800 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {timeOfDay === "morning" && (
            <linearGradient id="skyGrad" x1="400" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F9F6ED" />
              <stop offset="0.6" stopColor="#E8F2E8" />
              <stop offset="1" stopColor="#D5E6D5" />
            </linearGradient>
          )}
          {timeOfDay === "noon" && (
            <linearGradient id="skyGrad" x1="400" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EBF4FB" />
              <stop offset="0.7" stopColor="#E4F0E7" />
              <stop offset="1" stopColor="#D8E8DC" />
            </linearGradient>
          )}
          {timeOfDay === "sunset" && (
            <linearGradient id="skyGrad" x1="400" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBEBD6" />
              <stop offset="0.5" stopColor="#F5DCD0" />
              <stop offset="1" stopColor="#DECBD6" />
            </linearGradient>
          )}
          {timeOfDay === "night" && (
            <linearGradient id="skyGrad" x1="400" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#141E28" />
              <stop offset="0.7" stopColor="#1B2B28" />
              <stop offset="1" stopColor="#223630" />
            </linearGradient>
          )}

          <linearGradient id="hillBack" x1="400" y1="80" x2="400" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9BB899" stopOpacity="0.45" />
            <stop offset="1" stopColor="#5A7D58" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="hillMid" x1="400" y1="120" x2="400" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6C9A6A" />
            <stop offset="1" stopColor="#3F6B3B" />
          </linearGradient>
          <linearGradient id="hillFore" x1="400" y1="170" x2="400" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4A7A45" />
            <stop offset="1" stopColor="#2F532B" />
          </linearGradient>

          <linearGradient id="lakeWater" x1="400" y1="160" x2="400" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#68B0AB" />
            <stop offset="1" stopColor="#2E7979" />
          </linearGradient>
        </defs>

        <rect width="800" height="240" fill="url(#skyGrad)" />

        {timeOfDay === "night" ? (
          <g>
            <circle cx="680" cy="50" r="24" fill="#FDF7DC" opacity="0.9" />
            <circle cx="672" cy="46" r="21" fill="#141E28" />
            <circle cx="120" cy="35" r="1.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="280" cy="48" r="1.5" fill="#FFFFFF" opacity="0.6" />
            <circle cx="450" cy="30" r="2" fill="#FBF8EE" opacity="0.9" />
            <circle cx="560" cy="60" r="1.2" fill="#FFFFFF" opacity="0.7" />
          </g>
        ) : (
          <circle cx="680" cy="65" r="32" fill="#FDF1CA" opacity="0.85" />
        )}

        {/* Hutan */}
        {worldId === "forest" && (
          <g>
            <path d="M0 160C120 130 240 145 360 120C480 95 620 135 800 110V240H0Z" fill="url(#hillBack)" />
            <path d="M0 175C160 145 320 165 480 140C640 115 720 145 800 135V240H0Z" fill="url(#hillMid)" />
            <polygon points="120,130 110,165 130,165" fill="#2F532B" />
            <polygon points="150,120 138,160 162,160" fill="#2F532B" />
            <polygon points="175,128 165,162 185,162" fill="#2F532B" />
            <polygon points="490,122 478,155 502,155" fill="#2F532B" />
            <polygon points="520,115 508,152 532,152" fill="#2F532B" />
            <path d="M0 195C180 175 360 205 540 185C660 170 750 185 800 180V240H0Z" fill="url(#hillFore)" />
            <path d="M260 70C264 66 268 68 272 72C276 68 280 66 284 70" stroke="#3D5239" strokeWidth="2" strokeLinecap="round" />
            <path d="M285 85C288 82 291 83 294 86C297 83 300 82 303 85" stroke="#3D5239" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* Danau */}
        {worldId === "lake" && (
          <g>
            <path d="M0 130L140 85L300 140L480 80L660 135L800 100V240H0Z" fill="url(#hillBack)" />
            <path d="M0 165C200 150 400 170 600 155C700 150 750 160 800 155V240H0Z" fill="#E8D8BA" />
            <path d="M0 180C180 175 360 185 540 178C680 172 750 182 800 178V240H0Z" fill="url(#lakeWater)" />
            <path d="M120 198C150 196 170 199 200 198" stroke="#AEE4DE" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M280 215C320 213 350 216 390 214" stroke="#AEE4DE" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M500 202C540 200 570 203 610 201" stroke="#AEE4DE" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

            <g transform="translate(320, 186)">
              <ellipse cx="14" cy="10" rx="14" ry="7" fill="#FDF7DC" stroke="#C49A6C" strokeWidth="1.5" />
              <circle cx="24" cy="5" r="6" fill="#FDF7DC" stroke="#C49A6C" strokeWidth="1.5" />
              <polygon points="29,5 35,6 29,8" fill="#E09A3E" />
              <circle cx="26" cy="4" r="1" fill="#2F3A2C" />
            </g>
          </g>
        )}

        {/* Padang Bunga */}
        {worldId === "field" && (
          <g>
            <path d="M0 140C200 110 400 150 600 120C700 105 750 125 800 115V240H0Z" fill="url(#hillBack)" />
            <path d="M0 165C180 145 360 175 540 155C660 140 740 155 800 150V240H0Z" fill="#75A838" />
            <path d="M0 190C160 175 320 195 480 180C640 165 740 185 800 180V240H0Z" fill="#588B22" />

            <circle cx="100" cy="195" r="4" fill="#F08CAE" />
            <circle cx="140" cy="215" r="4.5" fill="#FDF1CA" />
            <circle cx="220" cy="205" r="4" fill="#E87A9F" />
            <circle cx="460" cy="200" r="4.5" fill="#FDF1CA" />
            <circle cx="580" cy="215" r="4" fill="#F08CAE" />
            <circle cx="700" cy="205" r="4" fill="#E87A9F" />

            <g transform="translate(240, 95)">
              <ellipse cx="6" cy="6" rx="6" ry="4" transform="rotate(-30 6 6)" fill="#F08CAE" />
              <ellipse cx="14" cy="6" rx="6" ry="4" transform="rotate(30 14 6)" fill="#F08CAE" />
              <line x1="10" y1="2" x2="10" y2="12" stroke="#2F3A2C" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>

      <div className="absolute right-5 bottom-2 sm:right-8 sm:bottom-3 z-10 drop-shadow-md">
        <MascotPucuk
          accessory={mascotAccessory}
          size={timeOfDay === "night" ? 85 : 95}
          animate={true}
        />
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-surface/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border shadow-cozy text-text">
        <span className="text-sm font-semibold tracking-wide">
          {worldId === "forest" ? "🌲 Hutan Pagi" : worldId === "lake" ? "🏞️ Tepi Danau" : "🌼 Padang Bunga"}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="text-xs font-bold text-accent font-tabular">Level {level}</span>
      </div>
    </div>
  );
};
