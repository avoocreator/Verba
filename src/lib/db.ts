import Dexie, { type Table } from "dexie";

export type WordStatus = "seed" | "sprout" | "grown" | "bloom";

export type LayerType =
  | "definition"
  | "examples"
  | "synonyms"
  | "antonyms"
  | "related_words"
  | "verb_forms"
  | "noun_forms"
  | "adjective_forms"
  | "collocations"
  | "ipa"
  | "cefr"
  | "common_mistakes"
  | "usage_notes";

export interface FSRSCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface UserWord {
  id: string;
  lemma: string;
  wordId?: string;
  status: WordStatus;
  ownMeaning?: string;
  ownSentence?: string;
  contextNote?: string;
  parentWordId?: string;
  fsrsCard?: FSRSCard;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface WordUnlock {
  id: string;
  userWordId: string;
  layer: LayerType;
  slotKey: string;
  unlockedValue: string;
  method: "guess" | "hint" | "quiz" | "surrender";
  hintLevel?: number;
  xpAwarded: number;
  foundBySelf?: boolean;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface ReviewLog {
  id: string;
  userWordId: string;
  mode: "meaning_to_word" | "word_to_meaning" | "fill_blank" | "synonym_guess" | "produce_sentence";
  rating: 1 | 2 | 3 | 4;
  at: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface DailyLog {
  id: string;
  date: string;
  xp: number;
  itemsDone: number;
  sessionComplete: boolean;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface Profile {
  id: string;
  xp: number;
  level: number;
  selectedWorld: string;
  freezes: number;
  streakDays: number;
  lastActiveDate: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  theme: "light" | "dark" | "system";
  remindersEnabled: boolean;
  reminderTime: string;
  language: "id";
  reduceMotion: boolean;
  createdAt: string;
  updatedAt: string;
}

export class VerbaDatabase extends Dexie {
  userWords!: Table<UserWord, string>;
  unlocks!: Table<WordUnlock, string>;
  reviews!: Table<ReviewLog, string>;
  dailyLog!: Table<DailyLog, string>;
  profile!: Table<Profile, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("VerbaDB");
    this.version(1).stores({
      userWords: "id, lemma, status, parentWordId, updatedAt, deleted",
      unlocks: "id, userWordId, layer, slotKey, updatedAt, deleted",
      reviews: "id, userWordId, at, updatedAt, deleted",
      dailyLog: "id, date, sessionComplete, updatedAt, deleted",
      profile: "id, updatedAt",
      settings: "id, updatedAt",
    });
  }
}

export const db = new VerbaDatabase();
