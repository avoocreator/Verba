export interface WidgetSnapshot {
  lastStudyDate: string;
  streak: number;
  freezes: number;
  level: number;
  world: string;
  dueCount: number;
  themeColor: string;
  updatedAt: string;
}

const WIDGET_STORAGE_KEY = "verba_widget_snapshot";

export async function updateWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(snapshot));

    const cap = (window as unknown as { Capacitor?: { Plugins?: { WidgetBridge?: { updateSnapshot: (data: { snapshot: string }) => Promise<void> } } } }).Capacitor;
    if (cap?.Plugins?.WidgetBridge) {
      await cap.Plugins.WidgetBridge.updateSnapshot({
        snapshot: JSON.stringify(snapshot),
      });
    }
  } catch (err) {
    console.warn("Failed to update widget snapshot:", err);
  }
}

export function getWidgetSnapshot(): WidgetSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WIDGET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
