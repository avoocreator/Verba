import React, { useState } from "react";
import { normalizeWord, lookupDictionary } from "@/lib/dict/dictionaryEngine";
import { Plus, X, ArrowRight, BookOpen, AlertCircle } from "lucide-react";

export interface TambahKataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    lemma: string;
    ownMeaning: string;
    contextNote: string;
  }) => { success: boolean; error?: string };
}

export const TambahKataModal: React.FC<TambahKataModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [rawWord, setRawWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [context, setContext] = useState("");
  const [normalizedPreview, setNormalizedPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWordChange = (val: string) => {
    setRawWord(val);
    setErrorMsg(null);
    if (val.trim()) {
      const norm = normalizeWord(val);
      setNormalizedPreview(norm !== val.trim().toLowerCase() ? norm : "");

      const dictMatch = lookupDictionary(val);
      if (dictMatch && !meaning) {
        setMeaning(dictMatch.meaning);
      }
    } else {
      setNormalizedPreview("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawWord.trim()) return;

    const lemma = normalizeWord(rawWord);
    const res = onAdd({
      lemma,
      ownMeaning: meaning.trim(),
      contextNote: context.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || "Gagal menambahkan kata.");
    } else {
      setRawWord("");
      setMeaning("");
      setContext("");
      setNormalizedPreview("");
      setErrorMsg(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface rounded-3xl p-6 border border-border shadow-cozy-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-green-100 dark:bg-green-950/60 text-accent">
              <Plus className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-text">Tanam Kata Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Kata Bahasa Inggris *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={rawWord}
              onChange={(e) => handleWordChange(e.target.value)}
              placeholder="e.g. eloquent, resilient, ponder..."
              className="w-full px-4 py-2.5 rounded-2xl bg-surface2 border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {normalizedPreview && (
              <p className="mt-1 text-[11px] text-accent flex items-center gap-1 font-medium">
                <span>Bentuk dasar: <b>"{normalizedPreview}"</b></span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Arti Versimu (Bahasa Indonesia)
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. fasih berbicara, tangguh..."
              className="w-full px-4 py-2.5 rounded-2xl bg-surface2 border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-[10px] text-text-muted">
              Boleh diisi nanti saat kamu mengklaim tunas ini.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Catatan Konteks (Di mana kamu menemukannya?)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Artikel tech, lirik lagu Coldplay, podcast..."
              className="w-full px-4 py-2.5 rounded-2xl bg-surface2 border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs flex items-center gap-1.5 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Simpan ke Kebun (+5 XP)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
