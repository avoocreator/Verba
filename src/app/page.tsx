"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuidv4 } from "uuid";
import { db, type UserWord, type WordUnlock, type DailyLog } from "@/lib/db";
import { calculateLevelFromTotalXp, LEVEL_REWARDS } from "@/lib/xp";
import { calculateStreakFromLogs, getLocalDateString } from "@/lib/streak";
import { WORLDS, getWorldById, getUnlockedWorlds } from "@/lib/worlds";
import { normalizeWord, lookupDictionary } from "@/lib/dict/dictionaryEngine";
import { updateWidgetSnapshot } from "@/lib/widget";

import { BannerDunia } from "@/components/assets/BannerDunia";
import { StatusIcon } from "@/components/assets/StatusIcons";
import { MascotPucuk } from "@/components/assets/MascotPucuk";
import { LencanaStreak } from "@/components/verba/LencanaStreak";
import { BarProgres } from "@/components/verba/BarProgres";
import { KartuKata } from "@/components/verba/KartuKata";
import { HalamanDetailKata } from "@/components/verba/HalamanDetailKata";
import { TambahKataModal } from "@/components/verba/TambahKataModal";
import { SesiReview } from "@/components/verba/SesiReview";
import { LevelUpModal } from "@/components/verba/LevelUpModal";
import { OnboardingModal } from "@/components/verba/OnboardingModal";
import { ClaimSeedModal } from "@/components/verba/ClaimSeedModal";

import {
  Sparkles,
  Search,
  Plus,
  Play,
  Moon,
  Sun,
  Flame,
  BookOpen,
  Calendar,
  Layers,
  Settings,
  Download,
  Upload,
  Shield,
  HelpCircle,
  Award,
  RefreshCw,
  Home,
  CheckCircle,
} from "lucide-react";

export default function VerbaApp() {
  const [activeTab, setActiveTab] = useState<"today" | "bank" | "garden" | "profile">("today");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [levelUpState, setLevelUpState] = useState<{ isOpen: boolean; level: number }>({
    isOpen: false,
    level: 1,
  });
  const [claimSeedWord, setClaimSeedWord] = useState<UserWord | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  const [isDarkMode, setIsDarkMode] = useState(false);

  const userWords = useLiveQuery(() => db.userWords.where("deleted").notEqual(1).toArray()) || [];
  const unlocks = useLiveQuery(() => db.unlocks.where("deleted").notEqual(1).toArray()) || [];
  const dailyLogs = useLiveQuery(() => db.dailyLog.toArray()) || [];
  const profile = useLiveQuery(() => db.profile.get("profile_main"));
  const settings = useLiveQuery(() => db.settings.get("settings_main"));

  const totalXp = profile?.xp || 0;
  const levelInfo = useMemo(() => calculateLevelFromTotalXp(totalXp), [totalXp]);

  const streakInfo = useMemo(() => {
    return calculateStreakFromLogs(dailyLogs, profile?.freezes || 0);
  }, [dailyLogs, profile?.freezes]);

  const currentWorldId = profile?.selectedWorld || "forest";
  const currentWorld = getWorldById(currentWorldId);

  useEffect(() => {
    async function initDB() {
      const existingProfile = await db.profile.get("profile_main");
      if (!existingProfile) {
        await db.profile.put({
          id: "profile_main",
          xp: 0,
          level: 1,
          selectedWorld: "forest",
          freezes: 1,
          streakDays: 0,
          lastActiveDate: getLocalDateString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setIsOnboardingOpen(true);
      }

      const count = await db.userWords.count();
      if (count === 0) {
        const now = new Date().toISOString();
        const starters: UserWord[] = [
          {
            id: uuidv4(),
            lemma: "achieve",
            status: "sprout",
            ownMeaning: "mencapai / meraih target",
            contextNote: "Kata pengantar kebun Verba",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uuidv4(),
            lemma: "eloquent",
            status: "seed",
            ownMeaning: "fasih berbicara",
            contextNote: "Ditemukan di pidato inspiratif",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uuidv4(),
            lemma: "resilient",
            status: "sprout",
            ownMeaning: "tangguh menghadapi kesulitan",
            contextNote: "Ditemukan di buku motivasi",
            createdAt: now,
            updatedAt: now,
          },
        ];
        await db.userWords.bulkPut(starters);
      }
    }
    initDB();
  }, []);

  useEffect(() => {
    if (profile) {
      updateWidgetSnapshot({
        lastStudyDate: getLocalDateString(),
        streak: streakInfo.streak,
        freezes: streakInfo.remainingFreezes,
        level: levelInfo.level,
        world: currentWorldId,
        dueCount: userWords.filter((w) => w.status !== "seed").length,
        themeColor: currentWorld.dominantColors[1],
        updatedAt: new Date().toISOString(),
      });
    }
  }, [streakInfo, levelInfo, currentWorldId, userWords, profile]);

  const addXp = async (amount: number) => {
    const newTotal = totalXp + amount;
    const oldLevel = levelInfo.level;
    const newLevelInfo = calculateLevelFromTotalXp(newTotal);

    await db.profile.update("profile_main", {
      xp: newTotal,
      level: newLevelInfo.level,
      updatedAt: new Date().toISOString(),
    });

    if (newLevelInfo.level > oldLevel) {
      setLevelUpState({ isOpen: true, level: newLevelInfo.level });
    }
  };

  const handleAddWord = (data: { lemma: string; ownMeaning: string; contextNote: string }) => {
    const existing = userWords.find(
      (w) => w.lemma.toLowerCase() === data.lemma.toLowerCase()
    );
    if (existing) {
      setSelectedWordId(existing.id);
      setActiveTab("bank");
      return { success: false, error: `Kata "${data.lemma}" sudah ada di kebunmu!` };
    }

    const now = new Date().toISOString();
    const newWord: UserWord = {
      id: uuidv4(),
      lemma: data.lemma,
      status: data.ownMeaning ? "sprout" : "seed",
      ownMeaning: data.ownMeaning || undefined,
      contextNote: data.contextNote || undefined,
      createdAt: now,
      updatedAt: now,
    };

    db.userWords.put(newWord);
    addXp(5);
    return { success: true };
  };

  const handleFinishReview = async (
    reviewedItems: Array<{ wordId: string; rating: any }>,
    xpEarned: number
  ) => {
    const today = getLocalDateString();
    const existingLog = await db.dailyLog.where("date").equals(today).first();

    if (existingLog) {
      await db.dailyLog.update(existingLog.id, {
        xp: existingLog.xp + xpEarned,
        itemsDone: existingLog.itemsDone + reviewedItems.length,
        sessionComplete: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.dailyLog.put({
        id: uuidv4(),
        date: today,
        xp: xpEarned,
        itemsDone: reviewedItems.length,
        sessionComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await addXp(xpEarned);
  };

  const filteredWords = useMemo(() => {
    return userWords.filter((w) => {
      if (selectedStatusFilter !== "all" && w.status !== selectedStatusFilter) {
        return false;
      }
      if (selectedLetter !== "all") {
        if (w.lemma.charAt(0).toLowerCase() !== selectedLetter.toLowerCase()) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchLemma = w.lemma.toLowerCase().includes(q);
        const matchMeaning = (w.ownMeaning || "").toLowerCase().includes(q);
        if (!matchLemma && !matchMeaning) return false;
      }
      return true;
    });
  }, [userWords, selectedStatusFilter, selectedLetter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      seed: userWords.filter((w) => w.status === "seed").length,
      sprout: userWords.filter((w) => w.status === "sprout").length,
      grown: userWords.filter((w) => w.status === "grown").length,
      bloom: userWords.filter((w) => w.status === "bloom").length,
    };
  }, [userWords]);

  const selectedWord = userWords.find((w) => w.id === selectedWordId);
  const selectedWordUnlocks = unlocks.filter((u) => u.userWordId === selectedWordId);

  const mascotAccessory = useMemo(() => {
    if (levelInfo.level >= 11) return "bag";
    if (levelInfo.level >= 6) return "scarf";
    if (levelInfo.level >= 2) return "hat";
    return "none";
  }, [levelInfo.level]);

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark" : ""}`}
      data-world={currentWorldId}
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={() => {
              setSelectedWordId(null);
              setActiveTab("today");
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-green-100 dark:bg-green-950/60 border border-border flex items-center justify-center">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <span className="text-lg font-extrabold text-text tracking-tight flex items-center gap-1.5">
                Verba
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                  v2
                </span>
              </span>
              <span className="text-[11px] text-text-muted block leading-none">
                Word Garden
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LencanaStreak
              streak={streakInfo.streak}
              freezes={streakInfo.remainingFreezes}
              state={streakInfo.widgetState}
            />

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
              title="Ganti Tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 pb-28 md:pb-12">
        {selectedWord ? (
          <HalamanDetailKata
            word={selectedWord}
            unlocks={selectedWordUnlocks}
            onBack={() => setSelectedWordId(null)}
            onDelete={async (id) => {
              await db.userWords.update(id, { deleted: true });
              setSelectedWordId(null);
            }}
            onSaveUnlock={async (unlockData) => {
              const now = new Date().toISOString();
              await db.unlocks.put({
                id: uuidv4(),
                ...unlockData,
                createdAt: now,
                updatedAt: now,
              });
              await addXp(unlockData.xpAwarded);
            }}
            onPlantNewSeed={async (seedLemma, relationType) => {
              const norm = normalizeWord(seedLemma);
              const exists = userWords.some((w) => w.lemma.toLowerCase() === norm.toLowerCase());
              if (!exists) {
                const now = new Date().toISOString();
                await db.userWords.put({
                  id: uuidv4(),
                  lemma: norm,
                  status: "seed",
                  parentWordId: selectedWord.id,
                  contextNote: `${relationType} dari "${selectedWord.lemma}"`,
                  createdAt: now,
                  updatedAt: now,
                });
              }
            }}
            onClaimSuccess={async (updatedWord, xp) => {
              await db.userWords.put(updatedWord);
              await addXp(xp);
            }}
          />
        ) : (
          <>
            {/* Hari Ini */}
            {activeTab === "today" && (
              <div className="space-y-4 animate-fade-in">
                <BannerDunia
                  worldId={currentWorldId}
                  level={levelInfo.level}
                  mascotAccessory={mascotAccessory}
                />

                <div className="p-4 rounded-3xl bg-surface border border-border shadow-cozy">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-wood flex items-center justify-center font-bold text-xs">
                        ⭐
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-text">
                          Level {levelInfo.level} — {LEVEL_REWARDS[levelInfo.level]?.title || "Penjelajah Kebun"}
                        </h4>
                        <p className="text-[11px] text-text-muted">
                          {LEVEL_REWARDS[levelInfo.level]?.description || "Terus tanam kata untuk membuka dunia baru!"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent font-tabular">
                      {levelInfo.currentLevelXp} / {levelInfo.nextLevelXpRequired} XP
                    </span>
                  </div>
                  <BarProgres
                    current={levelInfo.currentLevelXp}
                    total={levelInfo.nextLevelXpRequired}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-5 rounded-3xl bg-surface border border-border shadow-cozy flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-accent text-xs font-bold flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Review Harian</span>
                        </span>
                        <span className="text-xs text-text-muted font-tabular">
                          FSRS Spaced Repetition
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-text mb-1">
                        Asah Ingatan Kosakata
                      </h3>
                      <p className="text-xs text-text-muted mb-4 leading-relaxed">
                        Selesaikan 5 kartu review untuk mengamankan streak harianmu hari ini.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsReviewOpen(true)}
                      className="w-full py-3 rounded-2xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Mulai Sesi Review</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-3xl bg-surface border border-border shadow-cozy flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-wood text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Tanam Kata Baru</span>
                        </span>
                        <span className="text-xs text-text-muted">
                          +5 XP per kata
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-text mb-1">
                        Temukan Kosakata Baru?
                      </h3>
                      <p className="text-xs text-text-muted mb-4 leading-relaxed">
                        Tulis kata bahasa Inggris yang baru kamu dengar dari lagu, buku, atau podcast.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full py-3 rounded-2xl bg-surface2 border border-border text-text font-bold text-sm hover:border-accent transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-accent" />
                      <span>Tanam Kata Sekarang</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-surface border border-border shadow-cozy">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                      <span>Koleksi Kebun Kata</span>
                      <span className="text-xs text-text-muted font-normal font-tabular">
                        ({userWords.length} kata tertanam)
                      </span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("garden")}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Lihat Peta Kebun
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div
                      onClick={() => {
                        setSelectedStatusFilter("seed");
                        setActiveTab("bank");
                      }}
                      className="p-3 rounded-2xl bg-surface2/60 border border-border hover:border-accent cursor-pointer transition-colors text-center"
                    >
                      <StatusIcon status="seed" size={28} className="mx-auto mb-1" />
                      <span className="text-xs font-bold text-text block">
                        {statusCounts.seed} Seed
                      </span>
                      <span className="text-[10px] text-text-muted">Belum diklaim</span>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedStatusFilter("sprout");
                        setActiveTab("bank");
                      }}
                      className="p-3 rounded-2xl bg-surface2/60 border border-border hover:border-accent cursor-pointer transition-colors text-center"
                    >
                      <StatusIcon status="sprout" size={28} className="mx-auto mb-1" />
                      <span className="text-xs font-bold text-text block">
                        {statusCounts.sprout} Sprout
                      </span>
                      <span className="text-[10px] text-text-muted">Dalam review</span>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedStatusFilter("grown");
                        setActiveTab("bank");
                      }}
                      className="p-3 rounded-2xl bg-surface2/60 border border-border hover:border-accent cursor-pointer transition-colors text-center"
                    >
                      <StatusIcon status="grown" size={28} className="mx-auto mb-1" />
                      <span className="text-xs font-bold text-text block">
                        {statusCounts.grown} Grown
                      </span>
                      <span className="text-[10px] text-text-muted">Stabilitas &ge;14h</span>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedStatusFilter("bloom");
                        setActiveTab("bank");
                      }}
                      className="p-3 rounded-2xl bg-surface2/60 border border-border hover:border-accent cursor-pointer transition-colors text-center"
                    >
                      <StatusIcon status="bloom" size={28} className="mx-auto mb-1" />
                      <span className="text-xs font-bold text-text block">
                        {statusCounts.bloom} Bloom
                      </span>
                      <span className="text-[10px] text-text-muted">Dikuasai penuh</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Kata yang Baru Saja Ditanam
                    </h3>
                    <button
                      onClick={() => setActiveTab("bank")}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Buka Semua Bank Kata
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userWords.slice(0, 4).map((w) => {
                      const count = unlocks.filter((u) => u.userWordId === w.id).length;
                      return (
                        <KartuKata
                          key={w.id}
                          word={w}
                          unlockedCount={count}
                          onSelect={() => setSelectedWordId(w.id)}
                          onClaim={() => setClaimSeedWord(w)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bank */}
            {activeTab === "bank" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text tracking-tight">
                      Bank Kosakata
                    </h2>
                    <p className="text-xs text-text-muted">
                      Kelola dan buka lapisan kosakata yang kamu tanam sendiri.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-accent text-accent-contrast text-xs font-bold hover:bg-accent-hover transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tanam Kata</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kata atau arti dalam bank..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface border border-border text-sm text-text placeholder:text-text-muted/60 shadow-cozy focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: "all", label: "Semua Kata" },
                    { id: "seed", label: "🌱 Seed" },
                    { id: "sprout", label: "🌿 Sprout" },
                    { id: "grown", label: "🌳 Grown" },
                    { id: "bloom", label: "🌸 Bloom" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedStatusFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        selectedStatusFilter === tab.id
                          ? "bg-accent text-accent-contrast border-accent shadow-sm"
                          : "bg-surface text-text-muted border-border hover:border-accent/60"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                  {["all", ..."abcdefghijklmnopqrstuvwxyz".split("")].map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter)}
                      className={`w-7 h-7 shrink-0 rounded-xl font-bold uppercase transition-all flex items-center justify-center border ${
                        selectedLetter === letter
                          ? "bg-text text-bg border-text"
                          : "bg-surface text-text-muted border-border hover:bg-surface2"
                      }`}
                    >
                      {letter === "all" ? "★" : letter}
                    </button>
                  ))}
                </div>

                {filteredWords.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredWords.map((w) => {
                      const count = unlocks.filter((u) => u.userWordId === w.id).length;
                      return (
                        <KartuKata
                          key={w.id}
                          word={w}
                          unlockedCount={count}
                          onSelect={() => setSelectedWordId(w.id)}
                          onClaim={() => setClaimSeedWord(w)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-surface rounded-3xl border border-border shadow-cozy">
                    <p className="text-3xl mb-2">🔍</p>
                    <h4 className="text-base font-bold text-text mb-1">
                      Tidak Ada Kata Ditemukan
                    </h4>
                    <p className="text-xs text-text-muted mb-4">
                      Coba ganti filter atau tambahkan kata baru ke kebunmu.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 rounded-2xl bg-accent text-accent-contrast text-xs font-bold hover:bg-accent-hover transition-colors shadow-sm"
                    >
                      Tanam Kata Baru
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Kebun */}
            {activeTab === "garden" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-extrabold text-text tracking-tight">
                    Peta Word Garden
                  </h2>
                  <p className="text-xs text-text-muted">
                    Saksikan pertumbuhan kata-katamu dari benih hingga mekar sempurna.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-surface border border-border shadow-cozy space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon status="bloom" size={24} />
                      <h4 className="text-sm font-bold text-text">
                        Taman Bunga Bloom (Dikuasai Penuh)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {userWords.filter((w) => w.status === "bloom").map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWordId(w.id)}
                          className="px-3.5 py-1.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-800 text-xs font-bold text-pink-700 dark:text-pink-300 hover:scale-105 transition-transform"
                        >
                          🌸 {w.lemma}
                        </button>
                      ))}
                      {userWords.filter((w) => w.status === "bloom").length === 0 && (
                        <p className="text-xs text-text-muted italic">
                          Belum ada bunga Bloom. Luluskan tes kalimat untuk memekarkan kata!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon status="grown" size={24} />
                      <h4 className="text-sm font-bold text-text">
                        Hutan Pohon Grown (Kuat & Stabil)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {userWords.filter((w) => w.status === "grown").map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWordId(w.id)}
                          className="px-3.5 py-1.5 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-xs font-bold text-green-800 dark:text-green-300 hover:scale-105 transition-transform"
                        >
                          🌳 {w.lemma}
                        </button>
                      ))}
                      {userWords.filter((w) => w.status === "grown").length === 0 && (
                        <p className="text-xs text-text-muted italic">
                          Pohon tumbuh setelah stabilitas ingatan FSRS mencapai &ge;14 hari.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon status="sprout" size={24} />
                      <h4 className="text-sm font-bold text-text">
                        Petak Tunas Sprout (Dalam Belajar Aktif)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {userWords.filter((w) => w.status === "sprout").map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWordId(w.id)}
                          className="px-3.5 py-1.5 rounded-2xl bg-surface2 border border-border text-xs font-semibold text-accent hover:border-accent hover:scale-105 transition-transform"
                        >
                          🌿 {w.lemma}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon status="seed" size={24} />
                      <h4 className="text-sm font-bold text-text">
                        Tempat Persemaian Seed (Menunggu Diklaim)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {userWords.filter((w) => w.status === "seed").map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWordId(w.id)}
                          className="px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:scale-105 transition-transform"
                        >
                          🌱 {w.lemma}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profil */}
            {activeTab === "profile" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-extrabold text-text tracking-tight">
                    Profil & Dunia
                  </h2>
                  <p className="text-xs text-text-muted">
                    Sesuaikan dunia kebun, lihat pencapaian, dan atur data pribadimu.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-surface border border-border shadow-cozy flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <MascotPucuk accessory={mascotAccessory} size={75} />
                    <div>
                      <h3 className="text-lg font-bold text-text">
                        Pelajar Verba
                      </h3>
                      <p className="text-xs text-text-muted">
                        Total {totalXp} XP terkumpul · Level {levelInfo.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-accent font-tabular">
                      🔥 {streakInfo.streak}
                    </span>
                    <span className="text-[10px] text-text-muted block">Hari Beruntun</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-surface border border-border shadow-cozy">
                  <h3 className="text-sm font-bold text-text mb-1">
                    Pilih Dunia Kebun
                  </h3>
                  <p className="text-xs text-text-muted mb-4">
                    Tiap 5 level, kamu membuka pemandangan dan nuansa dunia baru.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {WORLDS.slice(0, 3).map((w) => {
                      const isUnlocked = levelInfo.level >= w.minLevel;
                      const isSelected = currentWorldId === w.id;

                      return (
                        <div
                          key={w.id}
                          onClick={async () => {
                            if (isUnlocked) {
                              await db.profile.update("profile_main", {
                                selectedWorld: w.id,
                              });
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all select-none ${
                            !isUnlocked
                              ? "opacity-50 bg-surface2 border-border cursor-not-allowed"
                              : isSelected
                              ? "bg-accent/15 border-accent shadow-sm cursor-pointer"
                              : "bg-surface2/60 border-border hover:border-accent/60 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xl">{w.emoji}</span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-accent text-accent-contrast text-[10px] font-bold">
                                Aktif
                              </span>
                            )}
                            {!isUnlocked && (
                              <span className="text-[10px] font-semibold text-text-muted">
                                Buka di Lvl {w.minLevel}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-text">{w.name}</h4>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">
                            {w.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-surface border border-border shadow-cozy space-y-3">
                  <h3 className="text-sm font-bold text-text mb-2">
                    Manajemen Data & Cadangan
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const dataStr =
                          "data:text/json;charset=utf-8," +
                          encodeURIComponent(JSON.stringify(userWords, null, 2));
                        const downloadAnchor = document.createElement("a");
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `verba_backup_${getLocalDateString()}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-surface2 border border-border text-xs font-bold text-text hover:border-accent transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-accent" />
                      <span>Ekspor Data (JSON)</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            "Reset semua kata dan mulai kebun dari awal? Tindakan ini tidak dapat dibatalkan."
                          )
                        ) {
                          await db.userWords.clear();
                          await db.unlocks.clear();
                          await db.dailyLog.clear();
                          await db.profile.update("profile_main", { xp: 0, level: 1 });
                          alert("Data kebun telah direset.");
                        }
                      }}
                      className="px-3.5 py-2 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      Hapus & Reset Kebun
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-surface border border-border shadow-cozy text-xs text-text-muted space-y-2">
                  <h4 className="font-bold text-text">Kredit & Lisensi Kamus</h4>
                  <p>
                    WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved.
                    Materi contoh kalimat disadur dan diadaptasi dari Tatoeba (CC BY 2.0).
                  </p>
                  <p className="text-[11px] pt-2 border-t border-border">
                    Verba v2 — Didesain dengan penuh perhatian untuk pelajar bahasa Inggris di Indonesia.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-cozy">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
          <button
            onClick={() => {
              setSelectedWordId(null);
              setActiveTab("today");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "today" && !selectedWordId
                ? "text-accent font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Hari Ini</span>
          </button>

          <button
            onClick={() => {
              setSelectedWordId(null);
              setActiveTab("bank");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "bank" || selectedWordId
                ? "text-accent font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Bank Kata</span>
          </button>

          <button
            onClick={() => {
              setSelectedWordId(null);
              setActiveTab("garden");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "garden"
                ? "text-accent font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Kebun</span>
          </button>

          <button
            onClick={() => {
              setSelectedWordId(null);
              setActiveTab("profile");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "profile"
                ? "text-accent font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Profil</span>
          </button>
        </div>
      </nav>

      <TambahKataModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWord}
      />

      <SesiReview
        queue={userWords.filter((w) => w.status !== "seed")}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onFinishSession={handleFinishReview}
      />

      {claimSeedWord && (
        <ClaimSeedModal
          word={claimSeedWord}
          isOpen={true}
          onClose={() => setClaimSeedWord(null)}
          onClaimSuccess={async (updated, xp) => {
            await db.userWords.put(updated);
            await addXp(xp);
          }}
        />
      )}

      <LevelUpModal
        newLevel={levelUpState.level}
        isOpen={levelUpState.isOpen}
        onClose={() => setLevelUpState({ isOpen: false, level: 1 })}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onFinish={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
