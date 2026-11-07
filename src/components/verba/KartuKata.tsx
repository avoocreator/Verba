import React from "react";
import type { UserWord } from "@/lib/db";
import { StatusIcon } from "../assets/StatusIcons";
import { Lock, ChevronRight, Sprout } from "lucide-react";

export interface KartuKataProps {
  word: UserWord;
  unlockedCount: number;
  totalLayers?: number;
  onSelect: () => void;
  onClaim?: () => void;
  className?: string;
}

export const KartuKata: React.FC<KartuKataProps> = ({
  word,
  unlockedCount,
  totalLayers = 9,
  onSelect,
  onClaim,
  className = "",
}) => {
  const isSeed = word.status === "seed";

  return (
    <div
      onClick={onSelect}
      className={`group relative p-4 rounded-3xl bg-surface border border-border shadow-cozy hover:shadow-cozy-lg transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <StatusIcon status={word.status} size={32} />
            <div>
              <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors leading-tight">
                {word.lemma}
              </h3>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                {word.ownMeaning || "Belum ada arti"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface2 text-xs font-semibold text-text font-tabular border border-border shrink-0">
            <Lock className="w-3 h-3 text-text-muted" />
            <span>
              {unlockedCount}/{totalLayers}
            </span>
          </div>
        </div>

        {word.contextNote && (
          <p className="text-[11px] text-text-muted italic bg-surface2/40 px-2.5 py-1 rounded-xl mb-3 line-clamp-1">
            "{word.contextNote}"
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1">
          {word.status === "seed" && "🌱 Seed (Belum Diklaim)"}
          {word.status === "sprout" && "🌿 Sprout (Dalam Belajar)"}
          {word.status === "grown" && "🌳 Grown (Kuat)"}
          {word.status === "bloom" && "🌸 Bloom (Kuasai Penuh)"}
        </span>

        {isSeed && onClaim ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClaim();
            }}
            className="px-3 py-1 rounded-xl bg-accent text-accent-contrast text-xs font-bold hover:bg-accent-hover transition-colors shadow-sm flex items-center gap-1"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Klaim</span>
          </button>
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </div>
  );
};
