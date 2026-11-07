package com.verba.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class VerbaWidgetProvider extends AppWidgetProvider {

    public static final String PREFS = "verba_widget";
    public static final String KEY_SNAPSHOT = "snapshot";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            manager.updateAppWidget(id, buildViews(context));
        }
    }

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, VerbaWidgetProvider.class));
        for (int id : ids) {
            manager.updateAppWidget(id, buildViews(context));
        }
    }

    private static RemoteViews buildViews(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_verba_4x2);

        JSONObject snap = null;
        try {
            String raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_SNAPSHOT, null);
            if (raw != null) snap = new JSONObject(raw);
        } catch (Exception ignored) {}

        int streak = snap != null ? snap.optInt("streak", 0) : 0;
        int level = snap != null ? snap.optInt("level", 1) : 1;
        int freezes = snap != null ? snap.optInt("freezes", 0) : 0;
        int dueCount = snap != null ? snap.optInt("dueCount", 0) : 0;
        String world = snap != null ? snap.optString("world", "forest") : "forest";
        String lastStudyDate = snap != null ? snap.optString("lastStudyDate", "") : "";

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        String today = sdf.format(new Date());

        int currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        boolean isStudiedToday = today.equals(lastStudyDate);
        boolean isThreatened = !isStudiedToday && streak > 0 && currentHour >= 15;

        views.setTextViewText(R.id.widget_streak_count, String.valueOf(streak));
        views.setTextViewText(R.id.widget_level_text, "Level " + level);
        views.setTextViewText(R.id.widget_world_name, getWorldName(world));

        if (isStudiedToday) {
            views.setTextViewText(R.id.widget_status_title, "Aman! Sesi Selesai 🔥");
            views.setTextViewText(R.id.widget_status_subtitle, dueCount + " kata dalam kebunmu");
        } else if (isThreatened) {
            views.setTextViewText(R.id.widget_status_title, "Streak Terancam! ⚡");
            views.setTextViewText(R.id.widget_status_subtitle, "Belajar sore ini agar streak tidak putus");
        } else {
            views.setTextViewText(R.id.widget_status_title, "Waktunya Merawat Kebun 🌱");
            views.setTextViewText(R.id.widget_status_subtitle, dueCount + " kartu kata siap direview");
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("verba://today"));
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_btn_action, pendingIntent);

        return views;
    }

    private static String getWorldName(String worldId) {
        switch (worldId) {
            case "lake": return "🏞️ Tepi Danau";
            case "field": return "🌼 Padang Bunga";
            case "mountain": return "⛰️ Kaki Gunung";
            case "beach": return "🏖️ Pantai Senja";
            case "night": return "🌌 Malam Berbintang";
            case "sky": return "☁️ Taman Langit";
            default: return "🌲 Hutan Pagi";
        }
    }
}
