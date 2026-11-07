import React, { useState } from "react";
import type { UserWord } from "@/lib/db";
import { StatusIcon } from "../assets/StatusIcons";
import { judgeSentence } from "@/lib/ai";
import { Sprout, X, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export interface ClaimSeedModalProps {
  word: UserWord;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: (updatedWord: UserWord, xp: number) => void;
}

export const ClaimSeedModal: React.FC<ClaimSeedModalProps> = ({
  word,
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const [meaning, setMeaning] = useState(word.ownMeaning || "");
  const [sentence, setSentence] = useState("");
  const [context, setContext] = useState(word.contextNote || "");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meaning.trim()) {
      setErrorMsg("Harap masukkan arti versimu.");
      return;
    }
    if (!sentence.trim()) {
      setErrorMsg("Harap buat satu kalimat contoh yang memuat kata ini.");
      return;
    }

    setIsEvaluating(true);
    setErrorMsg(null);

    try {
      const result = await judgeSentence({
        targetWord: word.lemma,
        sentence,
      });

      if (!result.grammarCorrect && result.status === "needs_improvement") {
        setErrorMsg(result.feedback);
        return;
      }

      const updated: UserWord = {
        ...word,
        status: "sprout",
        ownMeaning: meaning.trim(),
        ownSentence: sentence.trim(),
        contextNote: context.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      onClaimSuccess(updated, 25);
      onClose();
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface rounded-3xl p-6 border border-border shadow-cozy-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-950/60 flex items-center justify-center text-accent">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">Klaim Benih Jadi Sprout</h3>
              <p className="text-xs text-text-muted">Kata: "{word.lemma}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          Tunas akan tumbuh dan kata ini akan mulai masuk ke jadwal kuis harian setelah kamu memasukkan arti versimu dan membuat satu kalimat sendiri.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Arti Versimu (Bahasa Indonesia) *
            </label>
            <input
              type="text"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. mencapai, fasih, tangguh..."
              className="w-full px-4 py-2.5 rounded-2xl bg-surface2 border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Satu Kalimat Buatanmu (Bahasa Inggris) *
            </label>
            <textarea
              required
              rows={2}
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={`Contoh: I want to ${word.lemma} my dream...`}
              className="w-full p-3 rounded-2xl bg-surface2 border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Catatan Konteks (Opsional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Didengar dari film / lagu / buku..."
              className="w-full px-4 py-2.5 rounded-2xl bg-surface2 border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs flex items-start gap-1.5 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full mt-2 py-3 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>{isEvaluating ? "Menilai Kalimat..." : "Tumbuhkan Menjadi Sprout (+25 XP)"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
