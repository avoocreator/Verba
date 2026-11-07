import React, { useState } from "react";
import { MascotPucuk } from "../assets/MascotPucuk";
import { StatusIcon } from "../assets/StatusIcons";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onFinish,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface rounded-3xl p-6 border border-border shadow-cozy-lg text-center flex flex-col items-center">
        {step === 1 && (
          <div className="flex flex-col items-center">
            <MascotPucuk accessory="none" size={110} />
            <span className="mt-3 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-accent text-xs font-bold">
              Konsep Word Garden 🌱
            </span>
            <h3 className="text-xl font-extrabold text-text mt-2 mb-2">
              Kebun Kata Pribadimu
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Verba bukan sekadar kamus hafalan. Kosakatamu ditanam dari kata-kata yang kamu temukan sendiri di lagu, buku, atau film, lalu tumbuh bersama usahamu.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 my-4">
              <StatusIcon status="seed" size={36} />
              <span className="text-text-muted">➔</span>
              <StatusIcon status="sprout" size={36} />
              <span className="text-text-muted">➔</span>
              <StatusIcon status="grown" size={36} />
              <span className="text-text-muted">➔</span>
              <StatusIcon status="bloom" size={36} />
            </div>
            <span className="mt-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-wood text-xs font-bold">
              Tulis Dulu, Baru Buka 🔒
            </span>
            <h3 className="text-xl font-extrabold text-text mt-2 mb-2">
              Tidak Ada Bocoran
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Definisi, contoh, sinonim, dan bentuk kata awalnya terkunci. Kamu menebak atau menulis sendiri untuk membukanya. Sinonim yang terbuka otomatis menjadi Seed baru!
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center">
            <MascotPucuk accessory="hat" size={110} />
            <span className="mt-3 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold">
              7 Dunia Menanti 🌍
            </span>
            <h3 className="text-xl font-extrabold text-text mt-2 mb-2">
              Tumbuh Bersama Pucuk
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Tiap 5 level, kamu akan membuka dunia baru mulai dari Hutan Pagi, Tepi Danau, hingga Taman Langit. Rawat streak harianmu agar kebun tetap subur!
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? "w-6 bg-accent" : "w-2 bg-surface2"
              }`}
            />
          ))}
        </div>

        <div className="w-full flex items-center gap-2">
          {step < 3 ? (
            <>
              <button
                onClick={onFinish}
                className="w-1/3 py-3 rounded-2xl text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                Lewati
              </button>
              <button
                onClick={() => setStep(step + 1)}
                className="w-2/3 py-3 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onFinish}
              className="w-full py-3.5 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Mulai Menanam Kata</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
