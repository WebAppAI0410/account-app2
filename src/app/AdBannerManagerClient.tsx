'use client'; // This component needs to be a client component to use hooks

import { useEffect, useState } from 'react';
import { useAdMob } from '@/hooks/useAdMob';

export default function AdBannerManagerClient() {
  const { showBanner, hideBanner, bannerVisible, isAdMobAvailable, isWebDevelopment } = useAdMob();
  const [bannerDisplayed, setBannerDisplayed] = useState(false);

  useEffect(() => {
    // Show banner when the component mounts - with improved handling
    const displayBanner = async () => {
      try {
        // Banner visibility state check with improved debugging
        console.log('[AdBanner] Current banner state:', { bannerVisible, bannerDisplayed });
        
        // Only show if not already visible
        if (bannerVisible) {
          console.log('[AdBanner] Banner already visible, skipping display');
          return;
        }
        
        console.log('[AdBanner] Attempting to show banner ad...');
        const success = await showBanner();
        console.log('[AdBanner] showBanner() result:', success);
        
        setBannerDisplayed(success);
        
        if (success) {
          console.log('[AdBanner] Banner displayed successfully');
        } else {
          // If banner fails to display, retry after a delay
          console.log('[AdBanner] Banner not displayed, will retry in 3 seconds');
          setTimeout(displayBanner, 3000);
        }
      } catch (error) {
        console.error('[AdBanner] Error displaying banner:', error);
      }
    };
    
    // Only attempt to show banner if AdMob is available
    if (isAdMobAvailable) {
      console.log('[AdBanner] AdMob is available, calling displayBanner()');
      displayBanner();
    } else {
      console.log('[AdBanner] AdMob is not available, skipping banner display');
    }

    // NOTE: We've removed the cleanup function that hides banner on unmount
    // This fixes the issue with the banner disappearing when navigating back from detail pages
    // The banner will persist between page navigations
  }, [showBanner, isAdMobAvailable, bannerVisible, bannerDisplayed]);
  
  // Log component state for debugging
  console.log('AdBannerManagerClient render:', {
    isWebDevelopment,
    bannerVisible,
    bannerDisplayed,
    isAdMobAvailable
  });

  // In web development, we render a placeholder with fixed positioning at the bottom
  if (isWebDevelopment && bannerVisible) {
    return (
      <div
        className="fixed bottom-0 left-0 w-full h-[50px] md:h-[90px] bg-gray-100 border-t border-gray-200 z-50 pb-safe"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden="true"
        data-testid="ad-banner-placeholder"
      >
        <div className="flex items-center justify-center h-full text-sm text-gray-500">
          広告バナー位置
        </div>
      </div>
    );
  }

  // Native banner is fixed at the bottom by the SDK, but we return a container for consistency
  return bannerVisible ? <div className="fixed bottom-0 left-0 w-full z-50" /> : null;
}
