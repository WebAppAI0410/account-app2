'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import useTranslation from '@/hooks/use-translation'
import { Icons } from '@/components/icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/context/SubscriptionContext'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function PlansPage() {
  const { t } = useTranslation()
  const { currentPlan, isPremium, expiryDate, upgradeToPremium, downgradeToFree, restorePurchases } = useSubscription()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDowngrading, setIsDowngrading] = useState(false)

  // 有効期限を表示用にフォーマット
  const formatExpiryDate = (date: Date | null): string => {
    if (!date) return '';
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // プレミアムへのアップグレード処理
  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      await upgradeToPremium()
      toast({
        title: "プレミアムへのアップグレードが完了しました",
        description: "すべての機能が利用可能になりました。",
      })
    } catch (error) {
      console.error("アップグレード中にエラーが発生しました:", error)
      toast({
        title: "アップグレードに失敗しました",
        description: "後でもう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 無料プランへのダウングレード処理
  const handleDowngrade = async () => {
    setIsDowngrading(true)
    try {
      await downgradeToFree()
      toast({
        title: "無料プランへのダウングレードが完了しました",
        description: "次回から無料プランの制限が適用されます。",
      })
    } catch (error) {
      console.error("ダウングレード中にエラーが発生しました:", error)
      toast({
        title: "ダウングレードに失敗しました",
        description: "後でもう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsDowngrading(false)
    }
  }

  // 購入の復元処理
  const handleRestore = async () => {
    setIsLoading(true)
    try {
      await restorePurchases()
      toast({
        title: "購入情報の確認が完了しました",
        description: isPremium 
          ? "プレミアム機能が復元されました。" 
          : "復元可能なプレミアムプランがありません。",
      })
    } catch (error) {
      console.error("購入復元中にエラーが発生しました:", error)
      toast({
        title: "購入情報の復元に失敗しました",
        description: "後でもう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title={t('Plan Information')} 
      />
      
      <div className="flex-1 p-4 space-y-6 pb-[60px] md:pb-[100px]"> {/* 広告バナー用の下部パディング */}
        {/* 現在のプラン情報カード */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Icons.user className="h-5 w-5" />
                現在のプラン
              </CardTitle>
              <Badge variant={isPremium ? "default" : "outline"}>
                {isPremium ? "プレミアム" : "無料プラン"}
              </Badge>
            </div>
            {isPremium && (
              <CardDescription>
                有効期限: {formatExpiryDate(expiryDate)}まで
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>プレミアムプランをご利用中です</AlertTitle>
                <AlertDescription>
                  すべての機能をご利用いただけます。広告は表示されません。
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>無料プランをご利用中です</AlertTitle>
                <AlertDescription>
                  プレミアムにアップグレードすると、すべての機能を制限なくご利用いただけます。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.creditCard className="h-5 w-5" />
              {t('Feature Comparison')}
            </CardTitle>
            <CardDescription>
              無料プランとプレミアムプランの機能比較
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t('Feature')}</TableHead>
                  <TableHead>{t('Free Plan')}</TableHead>
                  <TableHead>{t('Premium Plan')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">イベント数</TableCell>
                  <TableCell>3件まで</TableCell>
                  <TableCell>無制限</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">参加者数（1イベントあたり）</TableCell>
                  <TableCell>10名まで</TableCell>
                  <TableCell>無制限</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">費用項目数（1イベントあたり）</TableCell>
                  <TableCell>10件まで</TableCell>
                  <TableCell>無制限</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">広告表示</TableCell>
                  <TableCell>あり</TableCell>
                  <TableCell>なし</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">データエクスポート</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">高度な分析機能</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">支払い催促機能</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">テンプレート機能</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.coins className="h-5 w-5" />
              {t('Pricing')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Free Plan')}</CardTitle>
                  <CardDescription>基本機能を無料で利用可能</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">¥0</div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>基本的なイベント管理</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>参加者の支払い管理</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>費用の記録と管理</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {!isPremium ? (
                    <div className="w-full text-center text-sm text-muted-foreground">
                      現在ご利用中のプラン
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleDowngrade}
                      disabled={isDowngrading}
                    >
                      {isDowngrading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        "ダウングレード"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <Card className={isPremium ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{t('Premium Plan')}</CardTitle>
                  <CardDescription>高度な機能で効率的な管理を実現</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">¥480<span className="text-base font-normal">/月</span></div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>無制限のイベント作成</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>無制限の参加者追加</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>広告なしの快適な操作</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>高度な機能を全て利用可能</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {!isPremium ? (
                    <Button 
                      className="w-full"
                      onClick={handleUpgrade}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        "プレミアムにアップグレード"
                      )}
                    </Button>
                  ) : (
                    <div className="w-full text-center text-sm text-muted-foreground">
                      現在ご利用中のプラン
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRestore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "購入情報を復元する"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ※ この画面はデモ用です。実際の課金処理は行われません。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}