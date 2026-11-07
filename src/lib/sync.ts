import { createClient } from "@supabase/supabase-js";
import { db } from "./db";

export interface SyncStatus {
  lastSyncAt?: string;
  isSyncing: boolean;
  error?: string;
}

let syncStatus: SyncStatus = {
  isSyncing: false,
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export async function syncWithSupabase(): Promise<SyncStatus> {
  if (!supabase) {
    return {
      isSyncing: false,
      error: "Supabase belum dikonfigurasi (mode offline aktif).",
    };
  }

  if (syncStatus.isSyncing) return syncStatus;
  syncStatus.isSyncing = true;
  syncStatus.error = undefined;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      syncStatus.isSyncing = false;
      return syncStatus;
    }

    const lastSync = localStorage.getItem("verba_last_sync_time") || "1970-01-01T00:00:00.000Z";
    const nowIso = new Date().toISOString();

    const localWords = await db.userWords
      .where("updatedAt")
      .above(lastSync)
      .toArray();

    if (localWords.length > 0) {
      const payload = localWords.map((w) => ({
        ...w,
        user_id: user.id,
      }));
      await supabase.from("user_words").upsert(payload, { onConflict: "id" });
    }

    const { data: remoteWords } = await supabase
      .from("user_words")
      .select("*")
      .gt("updatedAt", lastSync);

    if (remoteWords && remoteWords.length > 0) {
      await db.userWords.bulkPut(remoteWords);
    }

    localStorage.setItem("verba_last_sync_time", nowIso);
    syncStatus = {
      isSyncing: false,
      lastSyncAt: nowIso,
    };
    return syncStatus;
  } catch (err) {
    syncStatus = {
      isSyncing: false,
      error: err instanceof Error ? err.message : String(err),
    };
    return syncStatus;
  }
}
