'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import useTranslation from '@/hooks/use-translation';
import { useEvents } from '@/context/EventsContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// FullCalendarの実際の実装は、必要なライブラリがインストールされる時点で行う
// ここではモックアップバージョンを作成
const MockCalendar: React.FC<{
  events: any[];
  onEventClick: (eventId: string) => void;
  view: 'month' | 'week' | 'day';
}> = ({ events, onEventClick, view }) => {
  const { t } = useTranslation();
  const today = new Date();
  const currentMonth = format(today, 'MMMM yyyy', { locale: ja });
  
  // 仮のカレンダーUI
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Icons.chevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">{currentMonth}</h3>
          <Button variant="ghost" size="icon">
            <Icons.chevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* カレンダー本体 - 簡易版 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 1日前の空白セル */}
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={`empty-start-${i}`} className="h-24 border rounded-sm bg-muted/20"></div>
        ))}
        
        {/* 4月の日付セル */}
        {Array.from({ length: 30 }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = dayNum === 25; // 4月25日が今日と仮定
          
          // この日付に該当するイベントをフィルタリング
          const dayEvents = events.filter(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            const currentDate = new Date(2025, 3, dayNum); // 4月の日付
            return currentDate >= startDate && currentDate <= endDate;
          });
          
          return (
            <div 
              key={`day-${dayNum}`} 
              className={`h-24 border rounded-sm p-1 ${isToday ? 'bg-primary/10 border-primary' : ''}`}
            >
              <div className={`text-xs mb-1 ${isToday ? 'font-bold' : ''}`}>{dayNum}</div>
              
              {/* イベント表示 */}
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded bg-primary/20 cursor-pointer truncate"
                    onClick={() => onEventClick(event.eventId)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* 月末の空白セル */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="h-24 border rounded-sm bg-muted/20"></div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-center text-muted-foreground">
        {t('Calendar view mode')}: {view === 'month' ? t('Month') : view === 'week' ? t('Week') : t('Day')}
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { events } = useEvents();
  const { isPremium } = useSubscription();
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // プレミアムでないユーザーはカレンダーにアクセスできない
    // BottomNavigationで制御されているが、URL直接アクセスにも対応
    if (!isPremium) {
      router.push('/');
    }
  }, [isPremium, router]);

  // イベントデータをカレンダー表示用に変換
  const calendarEvents = events.map(event => ({
    id: `cal-${event.id}`,
    title: event.name,
    start: event.collectionStartDate || event.date,
    end: event.collectionEndDate || event.date,
    backgroundColor: `hsl(${parseInt(event.id) * 137.5 % 360}, 70%, 50%)`, // イベントIDに基づく色
    borderColor: `hsl(${parseInt(event.id) * 137.5 % 360}, 70%, 50%)`,
    eventId: event.id
  }));

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  // SSR対応のためにクライアントサイドレンダリングを確認
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={t('Calendar')}
        description={t('View your event collection periods')}
      />
      
      <div className="flex-1 p-4 space-y-4 pb-[60px] md:pb-[100px]">
        {/* 表示モード切替 */}
        <div className="flex justify-end">
          <Select
            value={calendarView}
            onValueChange={(value: any) => setCalendarView(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t('View')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('Month')}</SelectItem>
              <SelectItem value="week">{t('Week')}</SelectItem>
              <SelectItem value="day">{t('Day')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* カレンダー表示部分 */}
        <Card>
          <CardContent className="pt-6">
            <MockCalendar 
              events={calendarEvents} 
              onEventClick={handleEventClick} 
              view={calendarView} 
            />
          </CardContent>
        </Card>
        
        {/* 凡例 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('Legend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {t('Each color represents a different event. Click on an event to view details.')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}