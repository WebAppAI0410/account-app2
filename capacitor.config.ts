import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.app0410.budgetshukin',
  appName: '予算・集金管理',
  webDir: 'out', // Next.jsのビルド出力ディレクトリ
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      splashFullScreen: false,
      splashImmersive: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
  server: {
    url: 'http://localhost:9002',
    cleartext: true
  }
};

export default config;
