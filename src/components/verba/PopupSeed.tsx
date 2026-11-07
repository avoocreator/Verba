import React from "react";
import { StatusIcon } from "../assets/StatusIcons";
import { Sparkles, ArrowRight } from "lucide-react";

export interface PopupSeedProps {
  newWord: string;
  sourceWord: string;
  relationType: string;
  xpEarned: number;
  isOpen: boolean;
  onClose: () => void;
  onGoToBank?: () => void;
}

export const PopupSeed: React.FC<PopupSeedProps> = ({
  newWord,
  sourceWord,
  relationType,
  xpEarned,
  isOpen,
  onClose,
  onGoToBank,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface rounded-3xl p-6 border border-border shadow-cozy-lg text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-4 shadow-sm animate-bounce">
          <StatusIcon status="seed" size={48} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-accent text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kata Baru Ditanam!</span>
        </div>

        <h3 className="text-2xl font-bold text-text mb-1 tracking-tight">
          "{newWord}"
        </h3>

        <p className="text-sm text-text-muted mb-4 leading-relaxed">
          Sebagai <span className="font-semibold text-text">{relationType}</span> dari{" "}
          <span className="font-semibold text-text">"{sourceWord}"</span>, benih ini otomatis ditanam di kebunmu sebagai <span className="font-semibold text-accent">🌱 Seed</span>!
        </p>

        <div className="px-4 py-2 rounded-2xl bg-surface2 text-text text-sm font-bold font-tabular border border-border mb-6">
          +{xpEarned} XP diperoleh 🎉
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-accent text-accent-contrast font-semibold text-sm hover:bg-accent-hover transition-colors shadow-sm active:scale-95"
          >
            Lanjutkan Belajar
          </button>
          {onGoToBank && (
            <button
              onClick={onGoToBank}
              className="w-full py-2.5 rounded-2xl text-text-muted hover:text-text font-medium text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <span>Lihat di Bank Kata</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
