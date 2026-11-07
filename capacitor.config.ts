import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.verba.app",
  appName: "Verba",
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_verba",
      iconColor: "#4A7A45",
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
