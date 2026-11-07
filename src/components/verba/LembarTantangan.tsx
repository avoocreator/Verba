import React, { useState } from "react";
import type { LayerType } from "@/lib/db";
import { getProgressiveHint } from "@/lib/dict/dictionaryEngine";
import { judgeGuess, judgeDefinition, judgeSentence } from "@/lib/ai";
import { Sparkles, Lightbulb, Flag, X, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export interface LembarTantanganProps {
  layer: LayerType;
  layerTitle: string;
  targetWord: string;
  indonesianMeaning: string;
  officialList?: string[];
  officialDefinition?: string;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (data: {
    unlockedValue: string;
    method: "guess" | "hint" | "quiz" | "surrender";
    xpAwarded: number;
    foundBySelf?: boolean;
    isSeedCandidate?: boolean;
    seedWord?: string;
  }) => void;
}

export const LembarTantangan: React.FC<LembarTantanganProps> = ({
  layer,
  layerTitle,
  targetWord,
  indonesianMeaning,
  officialList = [],
  officialDefinition = "",
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [hintStage, setHintStage] = useState<0 | 1 | 2>(0);
  const [feedback, setFeedback] = useState<{
    type: "success" | "almost" | "error" | "info";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentHint =
    hintStage > 0 && officialList.length > 0
      ? getProgressiveHint(officialList[0], hintStage as 1 | 2 | 3)
      : null;

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (layer === "synonyms" || layer === "antonyms" || layer === "related_words") {
        const result = await judgeGuess({
          targetWord,
          guess: inputVal,
          layer,
          officialList,
        });

        if (result.status === "valid_in_list" || result.status === "valid_discovery") {
          const isDiscovery = result.status === "valid_discovery";
          const xp = isDiscovery ? 30 : hintStage === 0 ? 20 : hintStage === 1 ? 15 : 10;
          setFeedback({ type: "success", text: result.explanation });

          setTimeout(() => {
            onUnlocked({
              unlockedValue: inputVal.trim(),
              method: hintStage > 0 ? "hint" : "guess",
              xpAwarded: xp,
              foundBySelf: isDiscovery,
              isSeedCandidate: true,
              seedWord: inputVal.trim(),
            });
            onClose();
          }, 1200);
        } else if (result.status === "almost") {
          setFeedback({ type: "almost", text: result.explanation });
        } else {
          setFeedback({ type: "error", text: result.explanation });
        }
      } else if (layer === "definition") {
        const result = await judgeDefinition({
          targetWord,
          userDefinition: inputVal,
          officialDefinition,
          indonesianMeaning,
        });

        if (result.status === "accurate" || result.status === "partial") {
          setFeedback({ type: "success", text: result.feedback });
          setTimeout(() => {
            onUnlocked({
              unlockedValue: officialDefinition,
              method: "guess",
              xpAwarded: 20,
            });
            onClose();
          }, 1200);
        } else {
          setFeedback({ type: "error", text: result.feedback });
        }
      } else if (layer === "examples") {
        const result = await judgeSentence({
          targetWord,
          sentence: inputVal,
        });

        if (result.grammarCorrect) {
          setFeedback({ type: "success", text: result.feedback });
          setTimeout(() => {
            onUnlocked({
              unlockedValue: inputVal.trim(),
              method: "guess",
              xpAwarded: 25,
            });
            onClose();
          }, 1200);
        } else {
          setFeedback({ type: "error", text: result.feedback });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseHint = () => {
    if (hintStage === 0) setHintStage(1);
    else if (hintStage === 1) setHintStage(2);
  };

  const handleSurrender = () => {
    const revealedVal = officialList[0] || officialDefinition || "Terbuka";
    onUnlocked({
      unlockedValue: revealedVal,
      method: "surrender",
      xpAwarded: 5,
      isSeedCandidate: layer === "synonyms" || layer === "antonyms",
      seedWord: officialList[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 border border-border shadow-cozy-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-wood">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-text">Buka Tantangan: {layerTitle}</h3>
              <p className="text-xs text-text-muted">Kata: "{targetWord}" ({indonesianMeaning})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface2/60 border border-border mb-4 text-xs text-text leading-relaxed">
          {layer === "synonyms" && (
            <p>Tebak kata lain dalam bahasa Inggris yang memiliki makna serupa dengan <b>"{targetWord}"</b>.</p>
          )}
          {layer === "antonyms" && (
            <p>Tebak kata dalam bahasa Inggris yang bermakna lawan kata dari <b>"{targetWord}"</b>.</p>
          )}
          {layer === "definition" && (
            <p>Tuliskan pengertian kata <b>"{targetWord}"</b> dengan kata-katamu sendiri (boleh bahasa Indonesia atau Inggris).</p>
          )}
          {layer === "examples" && (
            <p>Buat satu kalimat bahasa Inggris buatanmu yang memuat kata <b>"{targetWord}"</b>.</p>
          )}
          {layer === "ipa" && (
            <p>Ketuk tombol buka untuk menampilkan simbol fonetik IPA pengucapan kata.</p>
          )}
        </div>

        {currentHint && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>Petunjuk: <b>{currentHint.hintText}</b></span>
          </div>
        )}

        {layer !== "ipa" ? (
          <form onSubmit={handleGuessSubmit} className="space-y-3">
            <div className="relative">
              {layer === "definition" || layer === "examples" ? (
                <textarea
                  rows={3}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    layer === "definition"
                      ? "Jelaskan maknanya di sini..."
                      : `e.g. She achieved her goal...`
                  }
                  className="w-full p-3.5 rounded-2xl bg-surface2 border border-border text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ketik tebakanmu di sini..."
                  className="w-full px-4 py-3 rounded-2xl bg-surface2 border border-border text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              )}
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                  feedback.type === "success"
                    ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200"
                    : feedback.type === "almost"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200"
                    : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !inputVal.trim()}
              className="w-full py-3.5 rounded-2xl bg-accent text-accent-contrast font-semibold text-sm hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{isSubmitting ? "Menilai..." : "Kirim Jawaban"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              onUnlocked({
                unlockedValue: targetWord,
                method: "guess",
                xpAwarded: 10,
              });
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-accent text-accent-contrast font-semibold text-sm hover:bg-accent-hover transition-colors shadow-sm active:scale-95"
          >
            Buka Simbol IPA (+10 XP)
          </button>
        )}

        {layer !== "ipa" && (
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <button
              type="button"
              onClick={handleUseHint}
              disabled={hintStage >= 2}
              className="flex items-center gap-1 hover:text-text disabled:opacity-40 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {hintStage === 0
                  ? "Beri Petunjuk 1"
                  : hintStage === 1
                  ? "Petunjuk 2 (Panjang)"
                  : "Petunjuk Maksimal"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSurrender}
              className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Menyerah & Buka (+5 XP)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
