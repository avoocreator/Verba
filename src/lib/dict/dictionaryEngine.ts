import { DICTIONARY_DATABASE, type DictWord } from "./dictionaryData";

const IRREGULAR_MAP: Record<string, string> = {
  went: "go",
  gone: "go",
  ran: "run",
  running: "run",
  ate: "eat",
  eaten: "eat",
  eating: "eat",
  wrote: "write",
  written: "write",
  writing: "write",
  spoke: "speak",
  spoken: "speak",
  speaking: "speak",
  thought: "think",
  thinking: "think",
  saw: "see",
  seen: "see",
  seeing: "see",
  took: "take",
  taken: "take",
  taking: "take",
  children: "child",
  people: "person",
  mice: "mouse",
  geese: "goose",
  feet: "foot",
  teeth: "tooth",
  achieved: "achieve",
  achieving: "achieve",
  pondered: "ponder",
  pondering: "ponder",
  thrived: "thrive",
  thriving: "thrive",
  embraced: "embrace",
  embracing: "embrace",
  sparked: "spark",
  sparking: "spark",
  nurtured: "nurture",
  nurturing: "nurture",
};

export function normalizeWord(rawWord: string): string {
  const cleaned = rawWord.trim().toLowerCase();
  if (IRREGULAR_MAP[cleaned]) {
    return IRREGULAR_MAP[cleaned];
  }

  const exact = DICTIONARY_DATABASE.find((w) => w.lemma === cleaned);
  if (exact) return exact.lemma;

  if (cleaned.endsWith("ing") && cleaned.length > 5) {
    const baseWithoutIng = cleaned.slice(0, -3);
    const withE = baseWithoutIng + "e";
    if (DICTIONARY_DATABASE.some((w) => w.lemma === withE)) return withE;
    if (DICTIONARY_DATABASE.some((w) => w.lemma === baseWithoutIng)) return baseWithoutIng;
  }

  if (cleaned.endsWith("ed") && cleaned.length > 4) {
    const baseWithoutEd = cleaned.slice(0, -2);
    const withE = baseWithoutEd + "e";
    if (DICTIONARY_DATABASE.some((w) => w.lemma === withE)) return withE;
    if (DICTIONARY_DATABASE.some((w) => w.lemma === baseWithoutEd)) return baseWithoutEd;
  }

  if (cleaned.endsWith("es") && cleaned.length > 4) {
    const baseWithoutEs = cleaned.slice(0, -2);
    if (DICTIONARY_DATABASE.some((w) => w.lemma === baseWithoutEs)) return baseWithoutEs;
  }

  if (cleaned.endsWith("s") && cleaned.length > 3 && !cleaned.endsWith("ss")) {
    const baseWithoutS = cleaned.slice(0, -1);
    if (DICTIONARY_DATABASE.some((w) => w.lemma === baseWithoutS)) return baseWithoutS;
  }

  return cleaned;
}

export function lookupDictionary(word: string): DictWord | undefined {
  const lemma = normalizeWord(word);
  return DICTIONARY_DATABASE.find((w) => w.lemma === lemma);
}

export function searchDictionary(filters: {
  query?: string;
  letter?: string;
  level?: string;
}): DictWord[] {
  return DICTIONARY_DATABASE.filter((w) => {
    if (filters.letter && filters.letter !== "all") {
      if (w.lemma.charAt(0).toLowerCase() !== filters.letter.toLowerCase()) {
        return false;
      }
    }
    if (filters.level && filters.level !== "all") {
      if (w.level.toUpperCase() !== filters.level.toUpperCase()) {
        return false;
      }
    }
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      const matchLemma = w.lemma.toLowerCase().includes(q);
      const matchMeaning = w.meaning.toLowerCase().includes(q);
      const matchDef = w.definition.toLowerCase().includes(q);
      if (!matchLemma && !matchMeaning && !matchDef) return false;
    }
    return true;
  });
}

export function getDistractors(
  targetLemma: string,
  type: "word" | "meaning",
  count = 3
): string[] {
  const pool = DICTIONARY_DATABASE.filter((w) => w.lemma !== targetLemma);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((w) => (type === "word" ? w.lemma : w.meaning));
}

export function getProgressiveHint(
  targetWord: string,
  level: 1 | 2 | 3
): { hintText: string; isFullReveal: boolean } {
  const word = targetWord.trim();
  const len = word.length;

  if (level === 1) {
    const first = word.charAt(0).toUpperCase();
    const blanks = Array(len - 1).fill("•").join(" ");
    return {
      hintText: `${first} ${blanks} (${len} huruf)`,
      isFullReveal: false,
    };
  }

  if (level === 2) {
    const first = word.charAt(0).toUpperCase();
    const last = word.charAt(len - 1);
    const middle = Array(len - 2).fill("•").join(" ");
    return {
      hintText: `${first} ${middle} ${last} (${len} huruf)`,
      isFullReveal: false,
    };
  }

  return {
    hintText: word,
    isFullReveal: true,
  };
}
