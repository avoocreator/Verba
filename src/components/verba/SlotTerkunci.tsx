import React from "react";
import type { LayerType } from "@/lib/db";
import { Lock, Unlock, Sparkles, HelpCircle } from "lucide-react";

export interface SlotTerkunciProps {
  layer: LayerType;
  title: string;
  isUnlocked: boolean;
  unlockedContent?: React.ReactNode;
  method?: "guess" | "hint" | "quiz" | "surrender";
  totalSlots?: number;
  unlockedSlots?: number;
  onOpenChallenge?: () => void;
  className?: string;
}

export const SlotTerkunci: React.FC<SlotTerkunciProps> = ({
  title,
  isUnlocked,
  unlockedContent,
  method,
  totalSlots,
  unlockedSlots,
  onOpenChallenge,
  className = "",
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isUnlocked
          ? "bg-surface border-border shadow-cozy"
          : "bg-surface2/60 border-border/80 border-dashed hover:border-accent/60"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <span className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-950/60 text-accent flex items-center justify-center">
              <Unlock className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-wood flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </span>
          )}
          <h4 className="text-sm font-semibold text-text tracking-wide">{title}</h4>
        </div>

        {totalSlots !== undefined && (
          <div className="flex items-center gap-1 text-xs text-text-muted font-tabular font-medium">
            <span>
              {unlockedSlots ?? 0} / {totalSlots}
            </span>
          </div>
        )}
      </div>

      {isUnlocked ? (
        <div className="mt-2 text-sm text-text leading-relaxed">
          {unlockedContent}
          {method && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>
                Dibuka lewat:{" "}
                {method === "guess"
                  ? "Tebakan sendiri ✨"
                  : method === "hint"
                  ? "Bantuan hint"
                  : method === "quiz"
                  ? "Kuis harian"
                  : "Menyerah (XP)"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-text-muted italic flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 opacity-60" />
            <span>Terkunci. Tebak atau tulis untuk membuka.</span>
          </p>
          {onOpenChallenge && (
            <button
              onClick={onOpenChallenge}
              className="px-3.5 py-1.5 rounded-xl bg-accent text-accent-contrast text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm active:scale-95"
            >
              Buka Slot
            </button>
          )}
        </div>
      )}
    </div>
  );
};
