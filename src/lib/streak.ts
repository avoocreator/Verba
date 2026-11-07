import type { DailyLog } from "./db";

export type WidgetStreakState = "completed_today" | "threatened" | "broken" | "just_started";

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPreviousDateString(dateStr: string, daysAgo = 1): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - daysAgo);
  return getLocalDateString(date);
}

export function calculateStreakFromLogs(
  logs: DailyLog[],
  availableFreezes: number,
  now = new Date()
): {
  streak: number;
  consumedFreezes: number;
  remainingFreezes: number;
  widgetState: WidgetStreakState;
  completedToday: boolean;
} {
  const completedLogs = logs.filter((l) => l.sessionComplete && !l.deleted);
  const completedDateSet = new Set(completedLogs.map((l) => l.date));

  if (completedDateSet.size === 0) {
    return {
      streak: 0,
      consumedFreezes: 0,
      remainingFreezes: availableFreezes,
      widgetState: "just_started",
      completedToday: false,
    };
  }

  const todayStr = getLocalDateString(now);
  const yesterdayStr = getPreviousDateString(todayStr, 1);
  const completedToday = completedDateSet.has(todayStr);

  let currentStreak = 0;
  let remainingFreezes = Math.min(2, Math.max(0, availableFreezes));
  let consumedFreezes = 0;

  let checkDate = completedToday ? todayStr : yesterdayStr;

  if (!completedToday && !completedDateSet.has(yesterdayStr)) {
    if (remainingFreezes > 0) {
      const dayBeforeYesterday = getPreviousDateString(yesterdayStr, 1);
      if (completedDateSet.has(dayBeforeYesterday)) {
        remainingFreezes -= 1;
        consumedFreezes += 1;
        checkDate = dayBeforeYesterday;
      } else {
        return {
          streak: 0,
          consumedFreezes: 0,
          remainingFreezes,
          widgetState: "broken",
          completedToday: false,
        };
      }
    } else {
      return {
        streak: 0,
        consumedFreezes: 0,
        remainingFreezes: 0,
        widgetState: "broken",
        completedToday: false,
      };
    }
  }

  while (true) {
    if (completedDateSet.has(checkDate)) {
      currentStreak += 1;
      checkDate = getPreviousDateString(checkDate, 1);
    } else if (remainingFreezes > 0) {
      const prev = getPreviousDateString(checkDate, 1);
      if (completedDateSet.has(prev)) {
        remainingFreezes -= 1;
        consumedFreezes += 1;
        checkDate = prev;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let widgetState: WidgetStreakState = "just_started";
  if (completedToday) {
    widgetState = "completed_today";
  } else if (currentStreak > 0) {
    const currentHour = now.getHours();
    widgetState = currentHour >= 15 ? "threatened" : "just_started";
  } else {
    widgetState = "broken";
  }

  return {
    streak: currentStreak,
    consumedFreezes,
    remainingFreezes,
    widgetState,
    completedToday,
  };
}
