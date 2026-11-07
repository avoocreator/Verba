import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { LEVEL_REWARDS } from "@/lib/xp";
import { MascotPucuk } from "../assets/MascotPucuk";
import { Sparkles, Award, ArrowRight } from "lucide-react";

export interface LevelUpModalProps {
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  newLevel,
  isOpen,
  onClose,
}) => {
  const reward = LEVEL_REWARDS[newLevel];

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8FCB8A", "#4A7A45", "#F3DD9F", "#F08CAE", "#C49A6C"],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface rounded-3xl p-6 border border-border shadow-cozy-lg text-center flex flex-col items-center">
        <div className="mb-2">
          <MascotPucuk accessory="cheer" size={110} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Selamat! Level Baru Terbuka</span>
        </div>

        <h2 className="text-3xl font-extrabold text-text tracking-tight mb-1 font-tabular">
          Level {newLevel}
        </h2>

        {reward ? (
          <div className="w-full my-4 p-4 rounded-2xl bg-surface2 border border-border text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">
              {reward.type === "world" ? "🌍 Dunia Baru!" : "🎁 Hadiah Baru!"}
            </span>
            <h4 className="text-sm font-bold text-text mb-1">{reward.title}</h4>
            <p className="text-xs text-text-muted leading-relaxed">{reward.description}</p>
          </div>
        ) : (
          <p className="text-xs text-text-muted my-4">
            Terus rawat kebunmu! Tiap 5 level akan membuka dunia baru yang menakjubkan.
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Lanjutkan Merawat Kebun</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
