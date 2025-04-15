'use client'; // This component needs to be a client component to use hooks

import { useEffect, useState } from 'react';
import { useAdMob } from '@/hooks/useAdMob';

export default function AdBannerManagerClient() {
  const { showBanner, hideBanner, bannerVisible, isAdMobAvailable, isWebDevelopment } = useAdMob();
  const [bannerDisplayed, setBannerDisplayed] = useState(false);

  useEffect(() => {
    // Show banner when the component mounts
    const displayBanner = async () => {
      try {
        const success = await showBanner();
        setBannerDisplayed(success);
        
        if (success) {
          console.log('Banner displayed successfully');
        } else {
          console.log('Banner not displayed');
        }
      } catch (error) {
        console.error('Error displaying banner:', error);
      }
    };
    
    displayBanner();

    // Cleanup: hide banner on unmount if it was displayed
    return () => {
      if (bannerDisplayed) {
        hideBanner().catch(err => console.error('Error hiding banner:', err));
      }
    };
  }, [showBanner, hideBanner, isAdMobAvailable]);

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
