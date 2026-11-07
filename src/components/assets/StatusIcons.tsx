import React from "react";
import type { WordStatus } from "@/lib/db";

export interface StatusIconProps {
  status: WordStatus;
  size?: number;
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 28,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      {status === "seed" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <ellipse cx="20" cy="30" rx="14" ry="4" fill="#6E472A" opacity="0.3" />
          <path
            d="M20 10C24 16 27 22 25 27C23 31 17 31 15 27C13 22 16 16 20 10Z"
            fill="#C49A6C"
            stroke="#8A5D3B"
            strokeWidth="2"
          />
          <path
            d="M18 16C19 14 20 13 21 13"
            stroke="#FBF8EE"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M20 28C21 32 23 33 24 35"
            stroke="#A8E6A3"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}

      {status === "sprout" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <ellipse cx="20" cy="32" rx="13" ry="3.5" fill="#4A3423" opacity="0.3" />
          <path
            d="M20 32C20 25 19 20 20 16"
            stroke="#4A7A45"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M20 18C13 18 8 13 11 8C17 7 20 14 20 18Z"
            fill="#8FCB8A"
            stroke="#3D6B39"
            strokeWidth="1.5"
          />
          <path
            d="M20 18C27 18 32 13 29 8C23 7 20 14 20 18Z"
            fill="#A8E6A3"
            stroke="#3D6B39"
            strokeWidth="1.5"
          />
        </svg>
      )}

      {status === "grown" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <ellipse cx="20" cy="34" rx="15" ry="3.5" fill="#4A3423" opacity="0.3" />
          <path
            d="M18 34L19 22C19 18 21 18 21 22L22 34H18Z"
            fill="#8A5D3B"
            stroke="#6E472A"
            strokeWidth="1.5"
          />
          <circle cx="15" cy="18" r="8" fill="#4A7A45" />
          <circle cx="25" cy="18" r="8" fill="#3D6B39" />
          <circle cx="20" cy="12" r="9" fill="#58A77E" />
          <circle cx="20" cy="14" r="7" fill="#8FCB8A" opacity="0.4" />
        </svg>
      )}

      {status === "bloom" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path
            d="M20 34C20 26 21 24 20 20"
            stroke="#4A7A45"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M20 26C15 26 13 22 14 20C17 20 19 24 20 26Z"
            fill="#8FCB8A"
          />
          <circle cx="20" cy="10" r="5.5" fill="#F08CAE" />
          <circle cx="20" cy="22" r="5.5" fill="#F08CAE" />
          <circle cx="14" cy="16" r="5.5" fill="#F08CAE" />
          <circle cx="26" cy="16" r="5.5" fill="#F08CAE" />
          <circle cx="16" cy="12" r="5.5" fill="#E87A9F" />
          <circle cx="24" cy="12" r="5.5" fill="#E87A9F" />
          <circle cx="16" cy="20" r="5.5" fill="#E87A9F" />
          <circle cx="24" cy="20" r="5.5" fill="#E87A9F" />
          <circle cx="20" cy="16" r="4.5" fill="#F3DD9F" stroke="#C97D1A" strokeWidth="1" />
          <circle cx="21" cy="15" r="1.5" fill="#FFFFFF" />
        </svg>
      )}
    </div>
  );
};
