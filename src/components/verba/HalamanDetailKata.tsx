import React, { useState } from "react";
import type { UserWord, WordUnlock, LayerType } from "@/lib/db";
import { lookupDictionary } from "@/lib/dict/dictionaryEngine";
import { StatusIcon } from "../assets/StatusIcons";
import { SlotTerkunci } from "./SlotTerkunci";
import { LembarTantangan } from "./LembarTantangan";
import { PopupSeed } from "./PopupSeed";
import { ClaimSeedModal } from "./ClaimSeedModal";
import { ArrowLeft, Trash2, Sprout, Sparkles, BookOpen } from "lucide-react";

export interface HalamanDetailKataProps {
  word: UserWord;
  unlocks: WordUnlock[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onSaveUnlock: (unlock: Omit<WordUnlock, "id" | "createdAt" | "updatedAt">) => void;
  onPlantNewSeed: (seedLemma: string, relationType: string) => void;
  onClaimSuccess: (updatedWord: UserWord, xp: number) => void;
}

export const HalamanDetailKata: React.FC<HalamanDetailKataProps> = ({
  word,
  unlocks,
  onBack,
  onDelete,
  onSaveUnlock,
  onPlantNewSeed,
  onClaimSuccess,
}) => {
  const dictData = lookupDictionary(word.lemma);

  const [activeChallenge, setActiveChallenge] = useState<{
    layer: LayerType;
    title: string;
    officialList?: string[];
    officialDefinition?: string;
  } | null>(null);

  const [popupSeedData, setPopupSeedData] = useState<{
    newWord: string;
    relationType: string;
    xp: number;
  } | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const isLayerUnlocked = (layer: LayerType) => unlocks.some((u) => u.layer === layer && !u.deleted);
  const getUnlockRecord = (layer: LayerType) => unlocks.find((u) => u.layer === layer && !u.deleted);

  const totalLayers = 9;
  const unlockedCount = [
    "definition",
    "examples",
    "synonyms",
    "antonyms",
    "related_words",
    "verb_forms",
    "collocations",
    "ipa",
    "common_mistakes",
  ].filter((l) => isLayerUnlocked(l as LayerType)).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-12 animate-fade-in select-none">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface border border-border text-xs font-semibold text-text hover:bg-surface2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-accent" />
          <span>Kembali ke Bank</span>
        </button>

        <button
          onClick={() => {
            if (confirm(`Hapus "${word.lemma}" dari kebun kosakatamu?`)) {
              onDelete(word.id);
            }
          }}
          className="p-2 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Hapus kata"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-surface border border-border shadow-cozy relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusIcon status={word.status} size={36} />
              <h1 className="text-3xl font-extrabold text-text tracking-tight">
                {word.lemma}
              </h1>
            </div>

            <p className="text-sm text-text-muted font-medium mb-3">
              {isLayerUnlocked("ipa")
                ? dictData?.ipa || "/.../"
                : "🔒 Simbol fonetik IPA terkunci"}
            </p>

            <div className="p-3 rounded-2xl bg-surface2/60 border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-0.5">
                Arti Versimu
              </span>
              <p className="text-sm font-semibold text-text">
                {word.ownMeaning || "Belum ada arti"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-surface2 border border-border text-xs font-bold font-tabular text-text">
              {unlockedCount} / {totalLayers} Terbuka
            </span>

            {word.status === "seed" && (
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="px-3.5 py-1.5 rounded-2xl bg-accent text-accent-contrast text-xs font-bold hover:bg-accent-hover transition-colors shadow-sm flex items-center gap-1 active:scale-95"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Klaim Jadi Sprout</span>
              </button>
            )}
          </div>
        </div>

        {word.contextNote && (
          <p className="mt-4 text-xs text-text-muted italic bg-surface2/40 px-3 py-1.5 rounded-xl border border-border/50">
            Konteks: "{word.contextNote}"
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
          Lapisan Materi Terkunci
        </h3>

        <SlotTerkunci
          layer="definition"
          title="Definisi Resmi (Bahasa Inggris)"
          isUnlocked={isLayerUnlocked("definition")}
          method={getUnlockRecord("definition")?.method}
          unlockedContent={<p className="italic">"{dictData?.definition || "Definisi resmi"}"</p>}
          onOpenChallenge={() =>
            setActiveChallenge({
              layer: "definition",
              title: "Definisi Resmi",
              officialDefinition: dictData?.definition,
            })
          }
        />

        <SlotTerkunci
          layer="examples"
          title="Contoh Kalimat Penggunaan"
          isUnlocked={isLayerUnlocked("examples")}
          method={getUnlockRecord("examples")?.method}
          unlockedContent={
            <div className="space-y-2">
              {(dictData?.examples || []).map((ex, i) => (
                <div key={i} className="text-xs">
                  <p className="font-medium text-text">"{ex.sentence}"</p>
                  <p className="text-text-muted italic mt-0.5">— {ex.translation}</p>
                </div>
              ))}
            </div>
          }
          onOpenChallenge={() =>
            setActiveChallenge({
              layer: "examples",
              title: "Contoh Kalimat",
            })
          }
        />

        <SlotTerkunci
          layer="synonyms"
          title="Sinonim (Membuka Seed Baru 🌱)"
          isUnlocked={isLayerUnlocked("synonyms")}
          method={getUnlockRecord("synonyms")?.method}
          totalSlots={dictData?.synonyms.length || 3}
          unlockedSlots={isLayerUnlocked("synonyms") ? dictData?.synonyms.length || 3 : 0}
          unlockedContent={
            <div className="flex flex-wrap gap-2">
              {(dictData?.synonyms || []).map((syn, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-surface2 text-xs font-semibold text-accent border border-border"
                >
                  🌱 {syn}
                </span>
              ))}
            </div>
          }
          onOpenChallenge={() =>
            setActiveChallenge({
              layer: "synonyms",
              title: "Sinonim Kata",
              officialList: dictData?.synonyms || [],
            })
          }
        />

        <SlotTerkunci
          layer="antonyms"
          title="Antonim / Lawan Kata"
          isUnlocked={isLayerUnlocked("antonyms")}
          method={getUnlockRecord("antonyms")?.method}
          totalSlots={dictData?.antonyms.length || 2}
          unlockedSlots={isLayerUnlocked("antonyms") ? dictData?.antonyms.length || 2 : 0}
          unlockedContent={
            <div className="flex flex-wrap gap-2">
              {(dictData?.antonyms || []).map((ant, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-surface2 text-xs font-semibold text-red-700 dark:text-red-400 border border-border"
                >
                  ⚡ {ant}
                </span>
              ))}
            </div>
          }
          onOpenChallenge={() =>
            setActiveChallenge({
              layer: "antonyms",
              title: "Antonim Kata",
              officialList: dictData?.antonyms || [],
            })
          }
        />

        <SlotTerkunci
          layer="collocations"
          title="Kolokasi & Pasangan Frasa Alami"
          isUnlocked={isLayerUnlocked("collocations")}
          method={getUnlockRecord("collocations")?.method}
          unlockedContent={
            <ul className="list-disc list-inside space-y-1 text-xs">
              {(dictData?.collocations || []).map((c, i) => (
                <li key={i} className="text-text font-medium">
                  {c}
                </li>
              ))}
            </ul>
          }
          onOpenChallenge={() =>
            setActiveChallenge({
              layer: "collocations",
              title: "Kolokasi Kata",
              officialList: dictData?.collocations || [],
            })
          }
        />

        {dictData?.forms && (
          <SlotTerkunci
            layer="verb_forms"
            title="Bentuk Tata Bahasa (V1, V2, V3 / Forms)"
            isUnlocked={isLayerUnlocked("verb_forms")}
            method={getUnlockRecord("verb_forms")?.method}
            unlockedContent={
              <div className="text-xs space-y-1">
                {dictData.forms.verb && (
                  <p>
                    <b>V1:</b> {dictData.forms.verb.v1} · <b>V2:</b> {dictData.forms.verb.v2} ·{" "}
                    <b>V3:</b> {dictData.forms.verb.v3} · <b>V-ing:</b> {dictData.forms.verb.ving}
                  </p>
                )}
                {dictData.forms.adjective && (
                  <p>
                    <b>Comparative:</b> {dictData.forms.adjective.comparative} ·{" "}
                    <b>Superlative:</b> {dictData.forms.adjective.superlative}
                  </p>
                )}
              </div>
            }
            onOpenChallenge={() =>
              setActiveChallenge({
                layer: "verb_forms",
                title: "Bentuk Kata",
                officialList: [
                  dictData.forms?.verb?.v2 || "",
                  dictData.forms?.adjective?.comparative || "",
                ].filter(Boolean),
              })
            }
          />
        )}

        <SlotTerkunci
          layer="ipa"
          title="Simbol Fonetik IPA"
          isUnlocked={isLayerUnlocked("ipa")}
          method={getUnlockRecord("ipa")?.method}
          unlockedContent={<p className="text-sm font-bold text-accent">{dictData?.ipa}</p>}
          onOpenChallenge={() =>
            setActiveChallenge({
              layer: "ipa",
              title: "Simbol Fonetik IPA",
            })
          }
        />

        {dictData?.commonMistakes && (
          <SlotTerkunci
            layer="common_mistakes"
            title="Catatan Kesalahan Khas Pelajar Indonesia"
            isUnlocked={isLayerUnlocked("common_mistakes")}
            method={getUnlockRecord("common_mistakes")?.method}
            unlockedContent={
              <div className="text-xs space-y-1.5">
                <p className="text-text">{dictData.commonMistakes}</p>
                {dictData.usageNotes && (
                  <p className="text-text-muted mt-2 pt-2 border-t border-border/60">
                    <b>Catatan Penggunaan:</b> {dictData.usageNotes}
                  </p>
                )}
              </div>
            }
            onOpenChallenge={() =>
              setActiveChallenge({
                layer: "common_mistakes",
                title: "Kesalahan Umum",
                officialDefinition: dictData.commonMistakes,
              })
            }
          />
        )}
      </div>

      {activeChallenge && (
        <LembarTantangan
          layer={activeChallenge.layer}
          layerTitle={activeChallenge.title}
          targetWord={word.lemma}
          indonesianMeaning={word.ownMeaning || dictData?.meaning || ""}
          officialList={activeChallenge.officialList}
          officialDefinition={activeChallenge.officialDefinition}
          isOpen={true}
          onClose={() => setActiveChallenge(null)}
          onUnlocked={(data) => {
            onSaveUnlock({
              userWordId: word.id,
              layer: activeChallenge.layer,
              slotKey: `${activeChallenge.layer}_0`,
              unlockedValue: data.unlockedValue,
              method: data.method,
              xpAwarded: data.xpAwarded,
              foundBySelf: data.foundBySelf,
            });

            if (data.isSeedCandidate && data.seedWord) {
              onPlantNewSeed(
                data.seedWord,
                activeChallenge.layer === "synonyms" ? "Sinonim" : "Antonim"
              );
              setPopupSeedData({
                newWord: data.seedWord,
                relationType: activeChallenge.layer === "synonyms" ? "Sinonim" : "Antonim",
                xp: data.xpAwarded,
              });
            }
          }}
        />
      )}

      {popupSeedData && (
        <PopupSeed
          isOpen={true}
          newWord={popupSeedData.newWord}
          sourceWord={word.lemma}
          relationType={popupSeedData.relationType}
          xpEarned={popupSeedData.xp}
          onClose={() => setPopupSeedData(null)}
          onGoToBank={() => {
            setPopupSeedData(null);
            onBack();
          }}
        />
      )}

      <ClaimSeedModal
        word={word}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onClaimSuccess={onClaimSuccess}
      />
    </div>
  );
};
