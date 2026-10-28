import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.halabacityfc.app',
  appName: 'Halaba City FC',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: 'onLaunch',
      // Point to static update-check file on GitHub raw
      updateUrl: 'https://raw.githubusercontent.com/abdmalik0/halaba-fc/main/public/update-check.json',
      statsUrl: '',
    },
  },
};

export default config;
