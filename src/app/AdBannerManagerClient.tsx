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

    // Cleanup: hide banner on unmount if it was displayed
    return () => {
      if (bannerDisplayed) {
        console.log('[AdBanner] Component unmounting, hiding banner');
        hideBanner().catch(err => console.error('[AdBanner] Error hiding banner:', err));
      }
    };
  }, [showBanner, hideBanner, isAdMobAvailable, bannerVisible, bannerDisplayed]);
  
  // Log component state for debugging
  console.log('AdBannerManagerClient render:', {
    isWebDevelopment,
    bannerVisible,
    bannerDisplayed,
    isAdMobAvailable
  });

  // In web development, we might want to render a placeholder element to account for the space
  // occupied by the mock banner, depending on our layout requirements
  if (isWebDevelopment && bannerVisible) {
    return (
      <div 
        className="h-[50px] md:h-[90px] w-full" 
        aria-hidden="true"
        data-testid="ad-banner-placeholder"
      />
    );
  }

  // No visible UI component for native environment (banner is handled by native SDK)
  return null;
}
