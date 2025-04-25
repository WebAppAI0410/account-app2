'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import useTranslation from '@/hooks/use-translation'

interface PageHeaderProps {
  title: string
  description?: string
  onMenuClick?: () => void // メニュー用のコールバックを追加
}

/**
 * ページのヘッダーコンポーネント
 * 戻るボタンとページタイトルを表示する
 */
export function PageHeader({ title, description, onMenuClick }: PageHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-background z-10">
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          size="icon"
          aria-label={t('Back to Events')}
          className="mr-2"
        >
          <Icons.arrowLeft className="h-5 w-5" />
          <span className="sr-only">{t('Back to Events')}</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {onMenuClick && (
        <Button
          onClick={onMenuClick}
          variant="ghost"
          size="icon"
          aria-label={t('Toggle Menu')}
        >
          <Icons.menu className="h-5 w-5" />
          <span className="sr-only">{t('Toggle Menu')}</span>
        </Button>
      )}
    </div>
  )
}