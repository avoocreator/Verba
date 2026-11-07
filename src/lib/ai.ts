import { z } from "zod";
import { lookupDictionary } from "./dict/dictionaryEngine";

export const GuessResultSchema = z.object({
  status: z.enum(["valid_in_list", "valid_discovery", "almost", "wrong"]),
  explanation: z.string(),
  nuanceDifference: z.string().optional(),
  discoveredWord: z.string().optional(),
  score: z.number().min(0).max(100),
});

export type GuessResult = z.infer<typeof GuessResultSchema>;

export const DefinitionResultSchema = z.object({
  status: z.enum(["accurate", "partial", "inaccurate"]),
  feedback: z.string(),
  score: z.number().min(0).max(100),
});

export type DefinitionResult = z.infer<typeof DefinitionResultSchema>;

export const SentenceResultSchema = z.object({
  status: z.enum(["natural", "acceptable", "needs_improvement"]),
  feedback: z.string(),
  grammarCorrect: z.boolean(),
  contextAppropriate: z.boolean(),
  suggestions: z.string().optional(),
});

export type SentenceResult = z.infer<typeof SentenceResultSchema>;

export async function judgeGuess(params: {
  targetWord: string;
  guess: string;
  layer: "synonyms" | "antonyms" | "related_words";
  officialList: string[];
}): Promise<GuessResult> {
  const guessClean = params.guess.trim().toLowerCase();
  const targetClean = params.targetWord.trim().toLowerCase();
  const listClean = params.officialList.map((w) => w.trim().toLowerCase());

  if (listClean.includes(guessClean)) {
    return {
      status: "valid_in_list",
      explanation: `Tepat sekali! "${params.guess}" adalah salah satu ${params.layer === "synonyms" ? "sinonim" : "antonim"} utama dari "${params.targetWord}".`,
      discoveredWord: guessClean,
      score: 100,
    };
  }

  if (guessClean === targetClean) {
    return {
      status: "wrong",
      explanation: `Kamu mengetik kata target itu sendiri. Coba tebak kata lain yang memiliki makna ${params.layer === "synonyms" ? "serupa" : "berlawanan"}.`,
      score: 0,
    };
  }

  const dictEntry = lookupDictionary(guessClean);
  if (dictEntry) {
    const matchReverse =
      (params.layer === "synonyms" && dictEntry.synonyms.map((s) => s.toLowerCase()).includes(targetClean)) ||
      (params.layer === "antonyms" && dictEntry.antonyms.map((s) => s.toLowerCase()).includes(targetClean));

    if (matchReverse) {
      return {
        status: "valid_discovery",
        explanation: `Luar biasa! "${params.guess}" adalah temuanmu sendiri yang sangat tepat dan valid! Kamu mendapat bonus XP.`,
        discoveredWord: guessClean,
        score: 95,
      };
    }
  }

  const isTypo = listClean.some(
    (item) =>
      item.startsWith(guessClean.slice(0, 3)) &&
      Math.abs(item.length - guessClean.length) <= 2
  );
  if (isTypo) {
    return {
      status: "almost",
      explanation: `Hampir tepat! Ejaan atau bentuk katamu sedikit berbeda dari kata resmi. Coba cek kembali ejaannya.`,
      score: 60,
    };
  }

  return {
    status: "wrong",
    explanation: `"${params.guess}" belum sesuai sebagai ${params.layer === "synonyms" ? "sinonim" : "antonim"} untuk "${params.targetWord}". Gunakan tombol Hint jika butuh bantuan!`,
    score: 20,
  };
}

export async function judgeDefinition(params: {
  targetWord: string;
  userDefinition: string;
  officialDefinition: string;
  indonesianMeaning: string;
}): Promise<DefinitionResult> {
  const text = params.userDefinition.trim().toLowerCase();
  if (text.length < 5) {
    return {
      status: "inaccurate",
      feedback: "Definisi terlalu pendek. Coba jelaskan dengan kalimat yang lebih lengkap.",
      score: 20,
    };
  }

  const meaningWords = params.indonesianMeaning.toLowerCase().split(/[\s/,-]+/);
  const matchedKeywords = meaningWords.filter((w) => w.length > 2 && text.includes(w));

  if (matchedKeywords.length > 0 || text.length >= 15) {
    return {
      status: "accurate",
      feedback: `Bagus sekali! Penjelasanmu sudah menangkap inti makna "${params.targetWord}" dengan baik.`,
      score: 90,
    };
  }

  return {
    status: "partial",
    feedback: `Penjelasanmu cukup mendekati. Bandingkan dengan definisi resmi yang kini sudah terbuka!`,
    score: 65,
  };
}

export async function judgeSentence(params: {
  targetWord: string;
  sentence: string;
}): Promise<SentenceResult> {
  const s = params.sentence.trim();
  const lowerSentence = s.toLowerCase();
  const lowerWord = params.targetWord.toLowerCase();

  if (!lowerSentence.includes(lowerWord)) {
    return {
      status: "needs_improvement",
      feedback: `Pastikan kalimatmu memuat kata target "${params.targetWord}".`,
      grammarCorrect: false,
      contextAppropriate: false,
      suggestions: `Contoh pemakaian: coba buat kalimat singkat yang menempatkan "${params.targetWord}" dengan jelas.`,
    };
  }

  if (s.split(/\s+/).length < 4) {
    return {
      status: "acceptable",
      feedback: "Kalimat diterima, namun coba buat kalimat yang lebih panjang di masa mendatang agar konteksnya makin kaya.",
      grammarCorrect: true,
      contextAppropriate: true,
    };
  }

  const startsWithCap = /^[A-Z]/.test(s);
  const endsWithPunct = /[.!?]$/.test(s);

  return {
    status: startsWithCap && endsWithPunct ? "natural" : "acceptable",
    feedback: `Kalimat yang bagus! Kata "${params.targetWord}" digunakan dengan tepat dalam konteks kalimatmu.`,
    grammarCorrect: true,
    contextAppropriate: true,
  };
}
