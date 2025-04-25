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

// 広告バナーの高さ（px）
const BANNER_HEIGHT = 50; // モバイル
const BANNER_HEIGHT_MD = 90; // md以上

export function BottomNavigation() {
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

  // mdサイズでバナー高さを切り替え。有料プランなら0。
  const [bottomPx, setBottomPx] = React.useState(isPremium ? 0 : BANNER_HEIGHT);
  React.useEffect(() => {
    const updateBottom = () => {
      if (isPremium) {
        setBottomPx(0);
      } else if (window.innerWidth >= 768) {
        setBottomPx(BANNER_HEIGHT_MD);
      } else {
        setBottomPx(BANNER_HEIGHT);
      }
    };
    updateBottom();
    window.addEventListener('resize', updateBottom);
    return () => window.removeEventListener('resize', updateBottom);
  }, [isPremium]);

  return (
    <>
      <nav
        className={cn(
          'fixed left-0 w-full z-40 flex justify-around items-center border-t border-gray-200 shadow-sm transition-all',
          'h-[56px] md:h-[64px]',
          'bg-white dark:bg-gray-900', // ダークモード時の背景
        )}
        style={{
          bottom: `calc(${bottomPx}px + env(safe-area-inset-bottom, 0px))`,
        }}
        aria-label="ボトムナビゲーション"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.path}
            variant={pathname === tab.path ? 'default' : 'ghost'}
            className={cn(
              'flex-1 flex flex-col items-center justify-center rounded-none h-full',
              pathname !== tab.path && 'bg-white dark:bg-gray-900 dark:text-gray-200 hover:dark:bg-gray-800',
            )}
            onClick={() => handleTabClick(tab)}
            aria-current={pathname === tab.path ? 'page' : undefined}
            style={{
              opacity: 1,
              pointerEvents: 'auto',
              visibility: 'visible',
            }}
          >
            {tab.icon}
            <span className="text-xs mt-1">{tab.name}</span>
          </Button>
        ))}
      </nav>
      {/* プレミアム誘導ダイアログ */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('プレミアム機能のご案内')}</DialogTitle>
            <DialogDescription>
              {t('この機能はプレミアムプラン限定です。アップグレードするとご利用いただけます。')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setShowPremiumDialog(false);
              router.push('/plans');
            }}>{t('アップグレード')}</Button>
            <Button variant="ghost" onClick={() => setShowPremiumDialog(false)}>{t('閉じる')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}