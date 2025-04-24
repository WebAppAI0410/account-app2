'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import useTranslation from '@/hooks/use-translation'
import { Icons } from '@/components/icons'

export default function HowToUsePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title={t('How to Use the App')} 
      />
      
      <div className="flex-1 p-4 space-y-6 pb-[60px] md:pb-[100px]"> {/* 広告バナー用の下部パディング */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.list className="h-5 w-5" />
              {t('Create and Manage Events')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. {t('Create a New Event')}</h3>
              <p className="text-sm text-muted-foreground">
                イベント一覧画面の「+」ボタンをクリックして、新しいイベントを作成できます。
                イベント名、説明、集金期間などを入力します。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. {t('View Event Details')}</h3>
              <p className="text-sm text-muted-foreground">
                イベント一覧からイベントをクリックすると、詳細画面に移動します。
                ここで参加者や費用の管理ができます。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.user className="h-5 w-5" />
              {t('Manage Participants')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. {t('Add Participants')}</h3>
              <p className="text-sm text-muted-foreground">
                イベント詳細画面で「参加者を追加」ボタンをクリックし、参加者情報を入力します。
                名前、連絡先、請求額などを設定できます。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. {t('Track Payments')}</h3>
              <p className="text-sm text-muted-foreground">
                参加者の支払い状況を管理できます。支払いがあった場合はチェックボックスをオンにするか、
                金額を直接入力することで記録できます。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.coins className="h-5 w-5" />
              {t('Expense Management')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. {t('Record Expenses')}</h3>
              <p className="text-sm text-muted-foreground">
                イベント詳細画面で「費用を追加」ボタンをクリックし、費用情報を記録します。
                説明、金額、備考などを入力できます。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. {t('Track Financial Overview')}</h3>
              <p className="text-sm text-muted-foreground">
                イベント詳細画面の下部で財務概要を確認できます。
                総収入、総支出、残高などが自動計算されます。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.settings className="h-5 w-5" />
              {t('Additional Features')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. {t('Theme Settings')}</h3>
              <p className="text-sm text-muted-foreground">
                右上のメニューからダークモードとライトモードを切り替えることができます。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. {t('Responsive Design')}</h3>
              <p className="text-sm text-muted-foreground">
                このアプリはスマートフォン、タブレット、デスクトップなど、
                さまざまなデバイスで快適に使用できるように設計されています。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}