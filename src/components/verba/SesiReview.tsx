import React, { useState } from "react";
import type { UserWord } from "@/lib/db";
import { lookupDictionary, getDistractors } from "@/lib/dict/dictionaryEngine";
import { scheduleReview, type FSRSRating } from "@/lib/fsrs";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, VolumeX } from "lucide-react";

export interface ReviewQuestion {
  word: UserWord;
  mode: "meaning_to_word" | "word_to_meaning" | "fill_blank" | "synonym_guess";
  prompt: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
}

export interface SesiReviewProps {
  queue: UserWord[];
  isOpen: boolean;
  onClose: () => void;
  onFinishSession: (reviewedItems: Array<{ wordId: string; rating: FSRSRating }>, totalXp: number) => void;
}

export const SesiReview: React.FC<SesiReviewProps> = ({
  queue,
  isOpen,
  onClose,
  onFinishSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [reviewedResults, setReviewedResults] = useState<
    Array<{ wordId: string; rating: FSRSRating }>
  >([]);

  if (!isOpen || queue.length === 0) return null;

  const currentWord = queue[currentIndex];
  const dictData = lookupDictionary(currentWord.lemma);

  const question: ReviewQuestion = (() => {
    const lemma = currentWord.lemma;
    const meaning = currentWord.ownMeaning || dictData?.meaning || "arti kata";

    const distractors = getDistractors(lemma, "word", 3);
    const options = [lemma, ...distractors].sort(() => 0.5 - Math.random());

    if (dictData && dictData.examples.length > 0) {
      const ex = dictData.examples[0];
      const blanked = ex.sentence.replace(new RegExp(`\\b${lemma}\\b`, "i"), "_____");
      if (blanked !== ex.sentence) {
        return {
          word: currentWord,
          mode: "fill_blank",
          prompt: `Lengkapi kalimat: "${blanked}"`,
          correctAnswer: lemma,
          options,
          explanation: `Terjemahan: "${ex.translation}"`,
        };
      }
    }

    return {
      word: currentWord,
      mode: "meaning_to_word",
      prompt: `Kata bahasa Inggris yang bermakna: "${meaning}"`,
      correctAnswer: lemma,
      options,
      explanation: dictData?.definition,
    };
  })();

  const handleOptionClick = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt.toLowerCase() === question.correctAnswer.toLowerCase();
    const rating: FSRSRating = isCorrect ? 3 : 1;

    setReviewedResults((prev) => [...prev, { wordId: currentWord.id, rating }]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const xpEarned = reviewedResults.reduce(
        (acc, r) => acc + (r.rating >= 3 ? 10 : 2),
        25
      );
      onFinishSession(reviewedResults, xpEarned);
      onClose();
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-surface rounded-3xl p-6 border border-border shadow-cozy-lg flex flex-col justify-between min-h-[460px]">
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-text-muted">
            <span className="font-semibold text-accent uppercase tracking-wider">
              Sesi Review
            </span>
            <span className="font-tabular font-bold text-text">
              {currentIndex + 1} / {queue.length}
            </span>
          </div>
          <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-5 rounded-2xl bg-surface2/70 border border-border text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
              {question.mode === "fill_blank" ? "Kalimat Rumpang" : "Tebak Kata"}
            </span>
            <h3 className="text-xl font-bold text-text leading-snug">
              {question.prompt}
            </h3>
          </div>

          <div className="space-y-2.5 mb-6">
            {question.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt.toLowerCase() === question.correctAnswer.toLowerCase();

              let btnStyle = "bg-surface border-border text-text hover:border-accent";
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-green-100 dark:bg-green-950/60 border-green-500 text-green-900 dark:text-green-200 font-bold";
                } else if (isSelected) {
                  btnStyle = "bg-red-100 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200";
                } else {
                  btnStyle = "opacity-40 border-border";
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleOptionClick(opt)}
                  className={`w-full py-3.5 px-4 rounded-2xl border text-sm font-semibold transition-all text-left flex items-center justify-between shadow-sm active:scale-[0.98] ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && question.explanation && (
            <div className="p-3 rounded-2xl bg-surface2/60 border border-border text-xs text-text-muted mb-4 animate-fade-in">
              <p>{question.explanation}</p>
            </div>
          )}
        </div>

        <div>
          {isAnswered ? (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{currentIndex + 1 < queue.length ? "Lanjut ke Kata Berikutnya" : "Selesaikan Sesi (+25 XP Bonus)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-xs text-text-muted hover:text-text font-medium transition-colors text-center"
            >
              Tunda Sesi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
