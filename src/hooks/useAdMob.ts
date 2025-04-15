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

  // Show mock banner in web development mode
  const showMockBanner = (options: MockBannerOptions = {}) => {
    // Remove any existing mock banner first
    removeMockBanner();
    
    // Create mock banner element
    const mockBanner = document.createElement('div');
    mockBanner.id = 'mock-admob-banner';
    mockBanner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: ${options.height || 50}px;
      background-color: ${options.bgColor || '#f0f0f0'};
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: sans-serif;
      color: ${options.textColor || '#333'};
      transition: opacity 0.3s ease;
    `;
    mockBanner.innerHTML = options.message || 'AdMob Banner Ad (Mock for Web Development)';
    document.body.appendChild(mockBanner);
    return true;
  };

  // Remove mock banner
  const removeMockBanner = () => {
    const existingMock = document.getElementById('mock-admob-banner');
    if (existingMock && existingMock.parentNode) {
      existingMock.parentNode.removeChild(existingMock);
    }
  };

  // Show mock interstitial in web development mode
  const showMockInterstitial = async (): Promise<boolean> => {
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
    `;
    
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="background-color: #333; padding: 20px; border-radius: 8px; text-align: center; max-width: 80%;">
        <h2 style="margin-top: 0;">AdMob Interstitial Ad</h2>
        <p>This is a mock interstitial ad for web development.</p>
        <button id="mock-interstitial-close" style="
          padding: 8px 16px;
          background-color: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 20px;
        ">Close Ad</button>
      </div>
    `;
    mockInterstitial.appendChild(content);
    document.body.appendChild(mockInterstitial);
    
    // Simulate the interstitial ad display time and dismissal
    return new Promise(resolve => {
      const closeButton = document.getElementById('mock-interstitial-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          if (mockInterstitial.parentNode) {
            mockInterstitial.parentNode.removeChild(mockInterstitial);
          }
          resolve(true);
        });
      }
      
      // Auto-close after 5 seconds (optional)
      // setTimeout(() => {
      //   if (mockInterstitial.parentNode) {
      //     mockInterstitial.parentNode.removeChild(mockInterstitial);
      //   }
      //   resolve(true);
      // }, 5000);
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
