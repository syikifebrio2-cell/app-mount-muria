import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.muriatrail.app",
  appName: "Muria Trail",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1B4332",
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1B4332",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
