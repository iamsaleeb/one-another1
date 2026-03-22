import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'com.oneanother.app',
  appName: '1Another',
  webDir: 'public',
  server: isDev
    ? {
        // 10.0.2.2 maps to host machine's localhost in the Android emulator.
        // If using a physical device, replace with your machine's local IP (e.g. 192.168.x.x).
        url: 'http://10.0.2.2:3000',
        cleartext: true,
      }
    : undefined,
};

export default config;
