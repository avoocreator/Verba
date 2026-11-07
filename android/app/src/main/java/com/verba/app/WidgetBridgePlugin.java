package com.verba.app;

import android.content.Context;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void push(PluginCall call) {
        String snapshot = call.getString("snapshot");
        if (snapshot == null || snapshot.isEmpty()) {
            call.reject("snapshot kosong");
            return;
        }
        Context ctx = getContext();
        ctx.getSharedPreferences(VerbaWidgetProvider.PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(VerbaWidgetProvider.KEY_SNAPSHOT, snapshot)
                .apply();
        VerbaWidgetProvider.updateAll(ctx);
        call.resolve();
    }
}
