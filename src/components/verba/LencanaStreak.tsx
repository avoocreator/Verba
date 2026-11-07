import React from "react";
import type { WidgetStreakState } from "@/lib/streak";

export interface LencanaStreakProps {
  streak: number;
  freezes: number;
  state: WidgetStreakState;
  className?: string;
}

export const LencanaStreak: React.FC<LencanaStreakProps> = ({
  streak,
  freezes,
  state,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-surface px-3 py-1.5 rounded-2xl border border-border shadow-cozy select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {state === "completed_today" && (
          <span className="text-xl animate-bounce">🔥</span>
        )}
        {state === "threatened" && (
          <span className="text-xl animate-pulse">⚡</span>
        )}
        {state === "broken" && (
          <span className="text-xl opacity-40">💨</span>
        )}
        {state === "just_started" && (
          <span className="text-xl">🌱</span>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-bold text-text font-tabular leading-tight">
          {streak} Hari
        </span>
        <span className="text-[10px] text-text-muted leading-none">
          {state === "completed_today"
            ? "Aman"
            : state === "threatened"
            ? "Terancam!"
            : state === "broken"
            ? "Putus"
            : "Mulai"}
        </span>
      </div>

      {freezes > 0 && (
        <div
          className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-semibold border border-blue-200 dark:border-blue-800"
          title={`${freezes} Pelindung Streak tersedia`}
        >
          <span>🧊</span>
          <span>{freezes}</span>
        </div>
      )}
    </div>
  );
};
