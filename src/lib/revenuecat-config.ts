import { Capacitor } from '@capacitor/core';

export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: Capacitor.getPlatform() === 'ios'
    ? 'com.app0410.budgetshukin.premium.monthly' // iOSの製品ID
    : 'com.app0410.budgetshukin.premium.monthly', // Androidの製品ID
};

export const REVENUECAT_CONFIG = {
  API_KEY: {
    ios: 'appl_YOUR_IOS_API_KEY', // iOSのAPIキーに置き換える
    android: 'goog_YOUR_ANDROID_API_KEY', // AndroidのAPIキーに置き換える
  },
  ENTITLEMENTS: {
    PREMIUM: 'premium',
  },
  OFFERINGS: {
    DEFAULT: 'default',
  },
};
