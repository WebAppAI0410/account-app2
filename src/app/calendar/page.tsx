'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import useTranslation from '@/hooks/use-translation';
import { useEvents } from '@/context/EventsContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { parseISO, isSameMonth } from 'date-fns';
import {
  Card,
  CardContent,
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
import { useCalendar } from '@/hooks/useCalendar';

// カレンダーイベントの型定義
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  eventId: string;
}

// 改良版カレンダーコンポーネント
const EnhancedCalendar: React.FC<{
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  view: 'month' | 'week' | 'day';
}> = ({ events, onEventClick, view }) => {
  const { t } = useTranslation();
  const { 
    currentDate,
    formattedMonth,
    daysInMonth, 
    startDayIndex,
    endEmptyCells,
    prevMonth,
    nextMonth,
    calculateEventPosition
  } = useCalendar();
  
  // 今日の日付
  const today = new Date();
  
  // この月に表示するイベントをフィルタリング
  const visibleEvents = events.filter(event => {
    // 月内に1日でもかかっていれば表示対象
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    return (
      (startDate <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) &&
      (endDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
    );
  });

  // 週ごとにイベントバーを分割して描画
  const renderEventBars = () => {
    const cellHeight = 80;
    const headerHeight = 30;
    const eventHeight = 22;
    const eventMargin = 2;
    const cellWidth = 100 / 7;
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // 週の開始日を列挙
    const getWeekStart = (date: Date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0,0,0,0);
      return d;
    };

    return visibleEvents.flatMap((event, eventIndex) => {
      const startDate = parseISO(event.start);
      const endDate = parseISO(event.end);
      // 表示範囲を当月内に制限
      const rangeStart = startDate < firstDayOfMonth ? firstDayOfMonth : startDate;
      const rangeEnd = endDate > lastDayOfMonth ? lastDayOfMonth : endDate;
      // 週ごとに分割
      const bars = [];
      let barStart = new Date(rangeStart);
      barStart.setHours(0,0,0,0);
      while (barStart <= rangeEnd) {
        const weekStart = getWeekStart(barStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        // バーの終了は週の終わりかイベントの終了日か早い方
        const barEnd = new Date(Math.min(weekEnd.getTime(), rangeEnd.getTime()));
        // カレンダーグリッド上の位置
        const startDay = (barStart.getDate() === 1 && barStart.getMonth() === currentDate.getMonth())
          ? startDayIndex + barStart.getDate() - 1
          : barStart.getDay();
        const startRow = Math.floor((barStart.getDate() === 1 && barStart.getMonth() === currentDate.getMonth() ? startDayIndex + barStart.getDate() - 1 : (barStart.getDate() - 1 + startDayIndex)) / 7);
        const startCol = barStart.getDay();
        const span = (barEnd.getTime() - barStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const verticalOffset = (eventIndex % 3) * (eventHeight + eventMargin);
        bars.push(
          <div
            key={`${event.id}-${barStart.toISOString()}`}
            className="calendar-event-bar"
            style={{
              backgroundColor: event.backgroundColor,
              borderColor: event.borderColor,
              top: `${cellHeight * startRow + headerHeight + verticalOffset}px`,
              left: `${startCol * cellWidth}%`,
              width: `${span * cellWidth - 1}%`,
              height: `${eventHeight}px`,
            }}
            onClick={() => onEventClick(event.eventId)}
            title={event.title}
          >
            {event.title}
          </div>
        );
        // 次の週へ
        barStart = new Date(barEnd);
        barStart.setDate(barStart.getDate() + 1);
      }
      return bars;
    });
  };
  
  return (
    <div className="calendar-container relative pb-16"> {/* 相対位置指定を追加 */}
      {/* 月切替ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <Icons.chevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('Previous Month')}</span>
          </Button>
          <h3 className="font-medium">{formattedMonth}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="sr-only">{t('Next Month')}</span>
          </Button>
        </div>
      </div>
      
      <div className="calendar-grid relative"> {/* 相対位置指定を追加 */}
        {/* 曜日ヘッダー */}
        <div className="calendar-days-header">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={day} className={`calendar-header-cell ${index === 0 ? 'text-red-500' : ''}`}>
              {day}
            </div>
          ))}
        </div>
        
        {/* 日付グリッド */}
        <div className="calendar-cells-container">
          {/* 月初めの空白セル */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-start-${i}`} className="calendar-cell calendar-cell-inactive" />
          ))}
          
          {/* 日付セル */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = today.getDate() === dayNum && 
                           today.getMonth() === currentDate.getMonth() && 
                           today.getFullYear() === currentDate.getFullYear();
            
            return (
              <div 
                key={`day-${dayNum}`} 
                className={`calendar-cell ${isToday ? 'calendar-cell-today' : ''}`}
              >
                <div className={`calendar-date-label ${(startDayIndex + i) % 7 === 0 ? 'text-red-500' : ''}`}>
                  {dayNum}
                </div>
              </div>
            );
          })}
          
          {/* 月末の空白セル */}
          {Array.from({ length: endEmptyCells }).map((_, i) => (
            <div key={`empty-end-${i}`} className="calendar-cell calendar-cell-inactive" />
          ))}
        </div>
        
        {/* イベントバー（絶対配置でオーバーレイ） */}
        <div className="calendar-events-container">
          {renderEventBars()}
        </div>
      </div>
      
      {/* カレンダービューモード */}
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
            <EnhancedCalendar 
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