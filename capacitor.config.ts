import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app0410.budgetshukin',
  appName: '予算・集金管理',
  // webDir: '.next' // Remove webDir when using a server URL
  server: {
    // Use localhost for simulators/emulators
    // Replace with your computer's local IP for physical devices if needed
    url: 'http://localhost:9002',
    cleartext: true // Allow cleartext traffic (HTTP) for local development
  }
};

export default config;
