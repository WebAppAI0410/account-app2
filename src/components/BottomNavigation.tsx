'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useTranslation from '@/hooks/use-translation';
import { useSubscription } from '@/context/SubscriptionContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const [showPremiumDialog, setShowPremiumDialog] = React.useState(false);

  // タブのパスとアイコン設定
  const tabs = [
    {
      name: t('Home'),
      path: '/',
      icon: <Icons.home className="h-5 w-5" />,
      isPremium: false,
    },
    {
      name: t('Calendar'),
      path: '/calendar',
      icon: <Icons.calendar className="h-5 w-5" />,
      isPremium: true,
    },
  ];

  // タブ切り替え処理
  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.isPremium && !isPremium) {
      // プレミアム機能で、無料ユーザーの場合はダイアログを表示
      setShowPremiumDialog(true);
    } else {
      // 通常のナビゲーション
      router.push(tab.path);
    }
  };

  // プランページへ移動
  const handleUpgrade = () => {
    setShowPremiumDialog(false);
    router.push('/plans');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 md:h-14 bg-background border-t border-border flex justify-around items-center z-40 pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Button
              key={tab.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 h-full rounded-none flex flex-col items-center justify-center gap-1 py-1",
                isActive && "bg-accent text-accent-foreground",
                tab.isPremium && !isPremium && "text-muted-foreground"
              )}
              onClick={() => handleTabClick(tab)}
            >
              <div className="relative">
                {tab.icon}
                {tab.isPremium && !isPremium && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>
              <span className="text-[10px]">{tab.name}</span>
            </Button>
          );
        })}
      </div>

      {/* プレミアム機能制限ダイアログ */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Icons.star className="h-5 w-5 mr-2 text-yellow-500" />
              {t('Premium Feature')}
            </DialogTitle>
            <DialogDescription>
              {t('This calendar feature is available only for premium users. Upgrade to access all features.')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <Icons.calendar className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-center text-muted-foreground mb-2">
              {t('Calendar view allows you to visualize all your event collection periods.')}
            </p>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-green-500" />
                {t('Monthly, weekly and daily views')}
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-green-500" />
                {t('Collection period visualization')}
              </li>
              <li className="flex items-center">
                <Icons.check className="h-4 w-4 mr-2 text-green-500" />
                {t('Quick navigation to events')}
              </li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
              {t('Close')}
            </Button>
            <Button onClick={handleUpgrade}>
              {t('Upgrade to Premium')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}