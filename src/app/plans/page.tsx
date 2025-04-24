'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import useTranslation from '@/hooks/use-translation'
import { Icons } from '@/components/icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check } from 'lucide-react'

export default function PlansPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title={t('Plan Information')} 
      />
      
      <div className="flex-1 p-4 space-y-6 pb-[60px] md:pb-[100px]"> {/* 広告バナー用の下部パディング */}
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
              </Card>

              <Card>
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
              </Card>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              ※ プレミアムプランは現在開発中です。今後のアップデートをお待ちください。
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}