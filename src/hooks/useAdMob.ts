import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdOptions, InterstitialAdPluginEvents } from '@capacitor-community/admob';

// --- Configuration ---
// Replace with your actual AdMob Ad Unit IDs
// It's highly recommended to use environment variables for these in a real app
const AD_UNIT_IDS = {
  // TODO: Replace with your real Ad Unit ID for banner (Android)
  android_banner: 'ca-app-pub-3940256099942544/6300978111', // Test ID
  // TODO: Replace with your real Ad Unit ID for banner (iOS)
  ios_banner: 'ca-app-pub-3940256099942544/2934735716', // Test ID
  // TODO: Replace with your real Ad Unit ID for interstitial (Android)
  android_interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test ID
  // TODO: Replace with your real Ad Unit ID for interstitial (iOS)
  ios_interstitial: 'ca-app-pub-3940256099942544/4411468910', // Test ID
};

// Helper function to get Ad Unit IDs, potentially from environment variables
const getAdUnitIds = () => {
  // In a production app, these would come from environment variables
  // e.g., process.env.NEXT_PUBLIC_ADMOB_ANDROID_BANNER_ID || AD_UNIT_IDS.android_banner
  return AD_UNIT_IDS;
};

// Helper function to get test device IDs
const getTestDevices = () => {
  // In a real app, these could come from environment variables
  // const testDeviceIds = process.env.NEXT_PUBLIC_ADMOB_TEST_DEVICES?.split(',') || [];
  return []; // Add your test device IDs here
};

// --- User Subscription Status ---
// In a real app, fetch this from your authentication/backend system
const useUserSubscription = () => {
  const [status, setStatus] = useState<'free' | 'paid'>('free');
  // TODO: Implement logic to fetch actual user subscription status
  const isFreeUser = status === 'free';
  return { isFreeUser };
};

// Types for mock banner elements (for web development)
interface MockBannerOptions {
  height?: number;
  message?: string;
  bgColor?: string;
  textColor?: string;
}

// Types for ad display tracking
interface AdDisplayLog {
  lastInterstitialShown: number;
  interstitialCountInLastFiveMinutes: number;
  lastBannerRotation: number;
  bannerTemplateIndex: number;
}

// --- AdMob Hook ---
export const useAdMob = () => {
  const { isFreeUser } = useUserSubscription();
  const [isAdMobAvailable, setIsAdMobAvailable] = useState(false);
  const [isInterstitialLoading, setIsInterstitialLoading] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [adMobError, setAdMobError] = useState<Error | null>(null);
  
  // Use refs to track listeners and avoid dependencies in useEffect
  const listenersRef = useRef<any[]>([]);
  const prepareInterstitialRef = useRef<() => Promise<boolean>>();
  
  // Check if we're in web development mode
  const isWebDevelopment = !Capacitor.isNativePlatform() && process.env.NODE_ENV === 'development';
  
  // Ad display tracking
  const adDisplayLogRef = useRef<AdDisplayLog>({
    lastInterstitialShown: 0,
    interstitialCountInLastFiveMinutes: 0,
    lastBannerRotation: 0,
    bannerTemplateIndex: 0
  });
  
  // Banner templates for more realistic mock ads
  const bannerTemplates = [
    { 
      html: '<div style="display:flex;align-items:center;gap:8px;"><div style="width:40px;height:40px;background:#f44336;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">AD</div><div><strong>50% OFF!</strong><br>Limited time offer...</div></div>', 
      bg: '#f0f0f0' 
    },
    { 
      html: '<div style="display:flex;align-items:center;gap:8px;"><div style="width:40px;height:40px;background:#4285f4;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">AD</div><div><strong>New App!</strong><br>Try it now for free</div></div>', 
      bg: '#e9f0fe' 
    },
    { 
      html: '<div style="display:flex;align-items:center;gap:8px;"><div style="width:40px;height:40px;background:#0f9d58;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">AD</div><div><strong>Premium Version</strong><br>Upgrade today!</div></div>', 
      bg: '#e6f4ea' 
    }
  ];

  // Helper to get the next banner template (with rotation)
  const getNextBannerTemplate = () => {
    const now = Date.now();
    const log = adDisplayLogRef.current;
    
    // Rotate banners every 30 seconds
    if (now - log.lastBannerRotation > 30000) {
      log.bannerTemplateIndex = (log.bannerTemplateIndex + 1) % bannerTemplates.length;
      log.lastBannerRotation = now;
    }
    
    return bannerTemplates[log.bannerTemplateIndex];
  };
  
  // Show mock banner in web development mode
  const showMockBanner = (options: MockBannerOptions = {}) => {
    // Reduced chance to skip banner (5%) - simulates inventory issues
    if (Math.random() < 0.05) {
      console.log('Mock banner ad skipped (simulated inventory issue)');
      return false;
    }
    
    // Remove any existing mock banner first
    removeMockBanner();
    
    // Get template for the banner
    const template = getNextBannerTemplate();
    
    // Create mock banner element
    const mockBanner = document.createElement('div');
    mockBanner.id = 'mock-admob-banner';
    mockBanner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: ${options.height || 50}px;
      background-color: ${template.bg || options.bgColor || '#f0f0f0'};
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: sans-serif;
      color: ${options.textColor || '#333'};
      transition: opacity 0.3s ease;
      padding: 5px;
    `;
    mockBanner.innerHTML = template.html || options.message || 'AdMob Banner Ad (Mock for Web Development)';
    document.body.appendChild(mockBanner);
    
    // Set up banner rotation timer
    const rotationTimer = setInterval(() => {
      const newTemplate = getNextBannerTemplate();
      mockBanner.style.backgroundColor = newTemplate.bg || options.bgColor || '#f0f0f0';
      mockBanner.innerHTML = newTemplate.html || options.message || 'AdMob Banner Ad (Mock for Web Development)';
    }, 30000);
    
    // Store timer in a data attribute to clear it when removing the banner
    mockBanner.setAttribute('data-timer-id', String(rotationTimer));
    
    return true;
  };

  // Remove mock banner
  const removeMockBanner = () => {
    const existingMock = document.getElementById('mock-admob-banner');
    if (existingMock && existingMock.parentNode) {
      // Clear rotation timer if it exists
      const timerId = existingMock.getAttribute('data-timer-id');
      if (timerId) {
        clearInterval(parseInt(timerId));
      }
      existingMock.parentNode.removeChild(existingMock);
    }
  };

  // Check if interstitial can be shown (frequency capping)
  const canShowInterstitial = (): boolean => {
    const now = Date.now();
    const log = adDisplayLogRef.current;
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    // Reset counter if 5 minutes have passed
    if (log.lastInterstitialShown < fiveMinutesAgo) {
      log.interstitialCountInLastFiveMinutes = 0;
    }
    
    // Cooldown period: don't show ads more frequently than every 60 seconds
    if (now - log.lastInterstitialShown < 60000) {
      console.log('Interstitial skipped (cooldown period: ads cannot be shown more often than once per minute)');
      return false;
    }
    
    // Frequency cap: maximum 2 ads in a 5-minute period
    if (log.interstitialCountInLastFiveMinutes >= 2) {
      console.log('Interstitial skipped (frequency cap: maximum 2 ads per 5-minute period)');
      return false;
    }
    
    return true;
  };

  // Show mock interstitial in web development mode
  const showMockInterstitial = async (): Promise<boolean> => {
    // Check frequency cap
    if (!canShowInterstitial()) {
      return false;
    }
    
    // Create loading overlay to simulate ad loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'mock-admob-interstitial-loading';
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    loadingOverlay.innerHTML = `<div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 20px; height: 20px; border: 2px solid #4285f4; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
        <span>Loading ad...</span>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </div>`;
    document.body.appendChild(loadingOverlay);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    // Simulate occasional loading failures (10% chance)
    if (Math.random() < 0.1) {
      if (loadingOverlay.parentNode) {
        loadingOverlay.parentNode.removeChild(loadingOverlay);
      }
      console.log('Mock interstitial ad failed to load (simulated failure)');
      return false;
    }
    
    // Remove loading overlay
    if (loadingOverlay.parentNode) {
      loadingOverlay.parentNode.removeChild(loadingOverlay);
    }
    
    // Create mock interstitial element
    const mockInterstitial = document.createElement('div');
    mockInterstitial.id = 'mock-admob-interstitial';
    mockInterstitial.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      color: white;
      font-family: sans-serif;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="background-color: #333; padding: 20px; border-radius: 8px; text-align: center; max-width: 80%; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 12px; background-color: #ff5722; padding: 2px 5px; border-radius: 4px;">AD</span>
          <span style="font-size: 10px; color: #aaa;">Simulated Advertisement</span>
        </div>
        <h2 style="margin-top: 0; color: #4285f4;">Premium App Pro</h2>
        <div style="height: 100px; background: linear-gradient(45deg, #4285f4, #34a853); margin: 10px 0; border-radius: 6px; display: flex; justify-content: center; align-items: center;">
          <span style="font-weight: bold;">MOCK AD IMAGE</span>
        </div>
        <p>Experience the best features with our premium version!</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
          <button id="mock-interstitial-install" style="
            padding: 8px 16px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Install Now</button>
          <button id="mock-interstitial-close" style="
            padding: 8px 16px;
            background-color: transparent;
            color: #ddd;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;
    mockInterstitial.appendChild(content);
    document.body.appendChild(mockInterstitial);
    
    // Fade in animation
    setTimeout(() => {
      mockInterstitial.style.opacity = '1';
    }, 10);
    
    // Update interstitial display log
    const log = adDisplayLogRef.current;
    log.lastInterstitialShown = Date.now();
    log.interstitialCountInLastFiveMinutes++;
    
    // Simulate the interstitial ad display time and dismissal
    return new Promise(resolve => {
      const closeButton = document.getElementById('mock-interstitial-close');
      const installButton = document.getElementById('mock-interstitial-install');
      
      const closeAd = () => {
        mockInterstitial.style.opacity = '0';
        setTimeout(() => {
          if (mockInterstitial.parentNode) {
            mockInterstitial.parentNode.removeChild(mockInterstitial);
          }
          resolve(true);
        }, 300);
      };
      
      if (closeButton) {
        closeButton.addEventListener('click', closeAd);
      }
      
      if (installButton) {
        installButton.addEventListener('click', closeAd);
      }
      
      // Close after 15 seconds automatically if user doesn't interact
      setTimeout(closeAd, 15000);
    });
  };

  // Initialize AdMob and set up event listeners
  useEffect(() => {
    const initializeAdMob = async () => {
      // Clear any previous state
      setIsAdMobAvailable(false);
      setAdMobError(null);
      
      if (Capacitor.isNativePlatform()) {
        try {
          // Initialize AdMob on native platforms
          await AdMob.initialize({
            testingDevices: getTestDevices(),
            initializeForTesting: process.env.NODE_ENV !== 'production',
          });
          
          console.log('AdMob initialized successfully');
          setIsAdMobAvailable(true);
          
          // Store listeners in an array for later cleanup
          const listeners = [];
          
          // Add listeners for interstitial events
          listeners.push(
            AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
              console.log('Interstitial ad loaded');
              setIsInterstitialLoading(false);
            })
          );
          
          listeners.push(
            AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
              console.error('Interstitial ad failed to load:', error);
              setIsInterstitialLoading(false);
            })
          );
          
          listeners.push(
            AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
              console.log('Interstitial ad showed');
            })
          );
          
          listeners.push(
            AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error) => {
              console.error('Interstitial ad failed to show:', error);
              // Try again later
              if (prepareInterstitialRef.current) {
                setTimeout(prepareInterstitialRef.current, 5000);
              }
            })
          );
          
          listeners.push(
            AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
              console.log('Interstitial ad dismissed');
              // Pre-load next interstitial
              if (prepareInterstitialRef.current) {
                prepareInterstitialRef.current();
              }
            })
          );
          
          // Store listeners in ref for cleanup
          listenersRef.current = listeners;
          
        } catch (error) {
          handleError('initialization', error);
          setIsAdMobAvailable(false);
          setAdMobError(error instanceof Error ? error : new Error(String(error)));
        }
      } else {
        // Web environment
        console.log(`AdMob not available in ${
          isWebDevelopment ? 'web development' : 'web production'
        } environment`);
        
        // For web development, mark as available to use mock ads
        if (isWebDevelopment) {
          setIsAdMobAvailable(true);
        }
      }
    };
    
    initializeAdMob();
    
    // Cleanup
    return () => {
      // Remove all listeners on component unmount
      if (Capacitor.isNativePlatform() && listenersRef.current.length > 0) {
        listenersRef.current.forEach(listener => {
          if (listener && typeof listener.remove === 'function') {
            try {
              listener.remove();
            } catch (error) {
              console.error('Error removing listener:', error);
            }
          }
        });
        listenersRef.current = [];
      }
      
      // Remove web mock elements
      if (isWebDevelopment) {
        removeMockBanner();
        
        const mockInterstitial = document.getElementById('mock-admob-interstitial');
        if (mockInterstitial && mockInterstitial.parentNode) {
          mockInterstitial.parentNode.removeChild(mockInterstitial);
        }
      }
    };
  }, []); // No dependencies, this should only run once on mount
  
  // Helper for standardized error handling
  const handleError = (context: string, error: any) => {
    console.error(`AdMob ${context} error:`, error);
    
    // More detailed error information
    if (error instanceof Error) {
      console.error(`- Message: ${error.message}`);
      console.error(`- Stack: ${error.stack}`);
    } else if (typeof error === 'string') {
      console.error(`- Error string: ${error}`);
    } else {
      console.error('- Unknown error type:', error);
    }
    
    // Optional: Report to analytics or monitoring system
    // reportAdError(context, error);
    
    // Return the error for the caller to handle
    return error;
  };

  // --- Banner Ad Logic ---
  const showBanner = async (): Promise<boolean> => {
    // Check if user is paid or ads are not available
    if (!isFreeUser) {
      console.log('Banner ad skipped (paid user).');
      return false;
    }
    
    if (!isAdMobAvailable) {
      console.log('Banner ad skipped (not available).');
      return false;
    }
    
    // Handle web development environment
    if (isWebDevelopment) {
      console.log('Showing mock banner ad for web development');
      const result = showMockBanner();
      setBannerVisible(result);
      return result;
    }
    
    // Native environment logic
    if (Capacitor.isNativePlatform()) {
      const adUnitIds = getAdUnitIds();
      const options: BannerAdOptions = {
        adId: Capacitor.getPlatform() === 'ios' 
          ? adUnitIds.ios_banner 
          : adUnitIds.android_banner,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: process.env.NODE_ENV !== 'production',
      };
      
      try {
        console.log('Showing banner ad...');
        await AdMob.showBanner(options);
        setBannerVisible(true);
        return true;
      } catch (error) {
        handleError('banner display', error);
        setBannerVisible(false);
        return false;
      }
    }
    
    return false;
  };

  const hideBanner = async (): Promise<boolean> => {
    if (isWebDevelopment) {
      removeMockBanner();
      setBannerVisible(false);
      return true;
    }
    
    if (!isAdMobAvailable || !Capacitor.isNativePlatform()) {
      return false;
    }
    
    try {
      console.log('Hiding banner ad...');
      await AdMob.hideBanner();
      setBannerVisible(false);
      return true;
    } catch (error) {
      handleError('hiding banner', error);
      return false;
    }
  };

  const resumeBanner = async (): Promise<boolean> => {
    if (!isFreeUser) {
      console.log('Banner resume skipped (paid user).');
      return false;
    }
    
    if (isWebDevelopment && !bannerVisible) {
      return showBanner();
    }
    
    if (!isAdMobAvailable || !Capacitor.isNativePlatform()) {
      return false;
    }
    
    try {
      console.log('Resuming banner ad...');
      await AdMob.resumeBanner();
      setBannerVisible(true);
      return true;
    } catch (error) {
      handleError('resuming banner', error);
      return false;
    }
  };

  // --- Interstitial Ad Logic ---
  const prepareInterstitial = async (): Promise<boolean> => {
    if (!isFreeUser) {
      console.log('Interstitial preparation skipped (paid user).');
      return false;
    }
    
    if (!isAdMobAvailable) {
      console.log('Interstitial preparation skipped (not available).');
      return false;
    }
    
    if (isInterstitialLoading) {
      console.log('Interstitial preparation skipped (already loading).');
      return false;
    }
    
    // Don't need to prepare anything in web development mode
    if (isWebDevelopment) {
      console.log('Mock interstitial ready for web development');
      return true;
    }
    
    if (Capacitor.isNativePlatform()) {
      const adUnitIds = getAdUnitIds();
      const options: AdOptions = {
        adId: Capacitor.getPlatform() === 'ios' 
          ? adUnitIds.ios_interstitial 
          : adUnitIds.android_interstitial,
        isTesting: process.env.NODE_ENV !== 'production',
      };
      
      try {
        console.log('Preparing interstitial ad...');
        setIsInterstitialLoading(true);
        await AdMob.prepareInterstitial(options);
        // Loading state will be updated by the event listener
        return true;
      } catch (error) {
        handleError('preparing interstitial', error);
        setIsInterstitialLoading(false);
        return false;
      }
    }
    
    return false;
  };

  const showInterstitial = async (): Promise<boolean> => {
    if (!isFreeUser) {
      console.log('Interstitial skipped (paid user).');
      return false;
    }
    
    if (!isAdMobAvailable) {
      console.log('Interstitial skipped (not available).');
      return false;
    }
    
    // Check frequency cap (applies to both web and native)
    if (!canShowInterstitial()) {
      return false;
    }
    
    // For web development, show mock interstitial
    if (isWebDevelopment) {
      console.log('Showing mock interstitial for web development');
      return showMockInterstitial();
    }
    
    if (!Capacitor.isNativePlatform()) {
      return false;
    }
    
    if (isInterstitialLoading) {
      console.log('Interstitial show skipped (still loading).');
      return false;
    }
    
    try {
      console.log('Showing interstitial ad...');
      await AdMob.showInterstitial();
      
      // Update display log
      const log = adDisplayLogRef.current;
      log.lastInterstitialShown = Date.now();
      log.interstitialCountInLastFiveMinutes++;
      
      return true;
    } catch (error) {
      handleError('showing interstitial', error);
      
      // If showing failed, prepare a new one after a delay
      setTimeout(prepareInterstitial, 5000);
      return false;
    }
  };
  
  // Store the prepare function in a ref to access it in event listeners
  prepareInterstitialRef.current = prepareInterstitial;

  // Pre-load interstitial when available
  useEffect(() => {
    if (isFreeUser && isAdMobAvailable && !isInterstitialLoading) {
      console.log('Pre-loading interstitial ad');
      prepareInterstitial();
    }
  }, [isFreeUser, isAdMobAvailable]);

  // Return the hook interface
  return {
    isAdMobAvailable,
    isFreeUser,
    bannerVisible,
    isInterstitialLoading,
    adMobError,
    showBanner,
    hideBanner,
    resumeBanner,
    prepareInterstitial,
    showInterstitial,
    // Additional properties for debugging/development
    isWebDevelopment
  };
};
