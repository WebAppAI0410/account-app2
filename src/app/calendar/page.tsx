'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import useTranslation from '@/hooks/use-translation';
import { useEvents } from '@/context/EventsContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { parseISO, isSameMonth, format, isSameDay, isWithinInterval } from 'date-fns';
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

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

// 改良版カレンダー(月表示)コンポーネント
const EnhancedCalendar: React.FC<{
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}> = ({ events, onEventClick }) => {
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
    <div className="calendar-container relative pb-16">
      {/* 月切替ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <Icons.chevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('previous_month')}</span>
          </Button>
          <h3 className="font-medium">{formattedMonth}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="sr-only">{t('next_month')}</span>
          </Button>
        </div>
      </div>
      
      <div className="calendar-grid relative">
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
    </div>
  );
};

// 週表示カレンダーコンポーネント
const EnhancedWeekCalendar: React.FC<{
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}> = ({ events, onEventClick }) => {
  const { t } = useTranslation();
  const { 
    currentDate,
    formattedWeek,
    weekDays,
    prevWeek,
    nextWeek,
    calculateEventPosition
  } = useCalendar('week');
  
  // この週に表示するイベントをフィルタリング
  const visibleEvents = events.filter(event => {
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    
    // 週の日付範囲と重なるイベントを表示
    return weekDays.some(day => 
      isWithinInterval(day.date, { start: startDate, end: endDate }) ||
      isWithinInterval(startDate, { start: day.date, end: day.date }) ||
      isWithinInterval(endDate, { start: day.date, end: day.date })
    );
  });
  
  // イベントバーを描画
  const renderWeekEventBars = () => {
    const eventHeight = 22;
    const eventMargin = 2;
    const cellWidth = 100 / 7;
    
    return visibleEvents.flatMap((event, eventIndex) => {
      const startDate = parseISO(event.start);
      const endDate = parseISO(event.end);
      
      // 週表示用の位置計算
      const position = calculateEventPosition(startDate, endDate);
      
      if (!position || position.span === undefined || position.span <= 0) return null;
      
      const verticalOffset = (eventIndex % 5) * (eventHeight + eventMargin);
      
      return (
        <div
          key={`week-${event.id}`}
          className="week-calendar-event"
          style={{
            backgroundColor: event.backgroundColor,
            borderColor: event.borderColor,
            top: `${40 + verticalOffset}px`,
            left: `${position.startCol * cellWidth}%`,
            width: `${position.span * cellWidth - 1}%`,
            height: `${eventHeight}px`,
          }}
          onClick={() => onEventClick(event.eventId)}
          title={event.title}
        >
          {event.title}
        </div>
      );
    });
  };
  
  return (
    <div className="week-calendar-container">
      {/* 週切替ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevWeek}>
            <Icons.chevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('previous_week')}</span>
          </Button>
          <h3 className="font-medium">{formattedWeek}</h3>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="sr-only">{t('next_week')}</span>
          </Button>
        </div>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="week-calendar-header">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div key={day} className={`${index === 0 ? 'text-red-500' : ''}`}>
            {day}
          </div>
        ))}
      </div>
      
      {/* 週グリッド */}
      <div className="week-calendar-grid">
        {weekDays.map((day, index) => {
          const isToday = day.isToday;
          const isOtherMonth = !day.isCurrentMonth;
          
          return (
            <div
              key={`week-day-${index}`}
              className={`week-calendar-day ${isToday ? 'week-calendar-day-today' : ''} ${isOtherMonth ? 'week-calendar-day-othermonth' : ''}`}
            >
              <div className={`week-calendar-day-header ${index === 0 ? 'text-red-500' : ''}`}>
                {format(day.date, 'M/d')}
              </div>
            </div>
          );
        })}
        
        {/* イベントバー（絶対配置でオーバーレイ） */}
        <div className="week-calendar-event-container">
          {renderWeekEventBars()}
        </div>
      </div>
    </div>
  );
};

// 日表示カレンダーコンポーネント
const EnhancedDayCalendar: React.FC<{
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}> = ({ events, onEventClick }) => {
  const { t } = useTranslation();
  const { 
    currentDate,
    formattedDay,
    prevDay,
    nextDay,
  } = useCalendar('day');
  
  // この日に表示するイベントをフィルタリング
  const visibleEvents = events.filter(event => {
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    
    // 選択日と重なるイベントを表示
    return (
      (startDate <= currentDate && endDate >= currentDate) || 
      isSameDay(startDate, currentDate) || 
      isSameDay(endDate, currentDate)
    );
  });
  
  return (
    <div className="day-calendar-container">
      {/* 日付切替ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevDay}>
            <Icons.chevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('previous_day')}</span>
          </Button>
          <h3 className="font-medium">{formattedDay}</h3>
          <Button variant="ghost" size="icon" onClick={nextDay}>
            <Icons.chevronRight className="h-4 w-4" />
            <span className="sr-only">{t('next_day')}</span>
          </Button>
        </div>
      </div>
      
      {/* イベントリスト表示 */}
      <div className="day-calendar-events">
        <h4 className="text-sm font-medium mb-4">{t('events')}</h4>
        
        {visibleEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('no_events_for_day')}</p>
        ) : (
          <div className="space-y-2">
            {visibleEvents.map(event => (
              <div
                key={`day-event-${event.id}`}
                className="day-calendar-event"
                style={{
                  backgroundColor: event.backgroundColor,
                  borderColor: event.borderColor
                }}
                onClick={() => onEventClick(event.eventId)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-xs mt-1">
                  {format(parseISO(event.start), 'yyyy/MM/dd')} - {format(parseISO(event.end), 'yyyy/MM/dd')}
                </div>
              </div>
            ))}
          </div>
        )}
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
  const { toggleSidebar, state } = useSidebar();

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
  
  // 表示モードの切替
  const handleViewChange = (view: 'month' | 'week' | 'day') => {
    setCalendarView(view);
  };
  
  // 今日ボタンの処理
  const handleGoToToday = () => {
    // 現在のカレンダーフックインスタンスはコンポーネント内で作成されるため、ここでは新たにページをリロードする
    setIsClient(false);
    setTimeout(() => setIsClient(true), 0);
  };

  // SSR対応のためにクライアントサイドレンダリングを確認
  if (!isClient) {
    return null;
  }

  // 現在のビューに応じたカレンダーコンポーネントをレンダリング
  const renderCalendarView = () => {
    switch (calendarView) {
      case 'month':
        return <EnhancedCalendar events={calendarEvents} onEventClick={handleEventClick} />;
      case 'week':
        return <EnhancedWeekCalendar events={calendarEvents} onEventClick={handleEventClick} />;
      case 'day':
        return <EnhancedDayCalendar events={calendarEvents} onEventClick={handleEventClick} />;
      default:
        return <EnhancedCalendar events={calendarEvents} onEventClick={handleEventClick} />;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] min-h-screen relative overflow-x-hidden">
        {/* ハンバーガーメニューボタン */}
        <div className="fixed top-4 right-4 z-50">
          <SidebarTrigger
            className="bg-background/80 backdrop-blur-sm"
            aria-label={t('Open Menu')}
            aria-expanded={state === "expanded"}
            aria-controls="sidebar-content"
          >
            <Icons.menu className="h-5 w-5" />
            <span className="sr-only">メニューを開く</span>
          </SidebarTrigger>
        </div>
        {/* サイドバー */}
        <Sidebar side="right" id="sidebar-content">
          <SidebarHeader>
            <div className="flex items-center space-x-2">
              <Icons.coins className="h-6 w-6" />
              <h4 className="font-semibold text-md">{t('EventBalance')}</h4>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarTrigger>
                  <Icons.list className="mr-2 h-4 w-4" />
                  <span>{t('Events')}</span>
                </SidebarTrigger>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex justify-between items-center w-full px-3 py-2">
                  <div className="flex items-center">
                    <Icons.dark className="mr-2 h-4 w-4" />
                    <span>{t('Theme')}</span>
                  </div>
                  <ThemeToggle />
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/how-to')}
                >
                  <Icons.help className="mr-2 h-4 w-4" />
                  <span>{t('How to Use')}</span>
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/plans')}
                >
                  <Icons.creditCard className="mr-2 h-4 w-4" />
                  <span>{t('Plans')}</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-2">
              <Button variant="secondary" className="w-full">
                <Icons.plus className="mr-2 h-4 w-4" />
                {t('Create Event')}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="w-full p-2 md:p-0 space-y-4 transition-all duration-300 ease-in-out max-w-full" style={{transitionProperty: 'width, margin', transform: 'translateZ(0)', willChange: 'width, margin'}} aria-label="カレンダー">
          <PageHeader
            title={t('calendar')}
            description={t('calendar_description')}
          />
          {/* 表示モード切替と今日ボタン */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={handleGoToToday}>
              <Icons.calendar className="h-4 w-4 mr-1" />
              {t('today')}
            </Button>
            <Select
              value={calendarView}
              onValueChange={(value: any) => handleViewChange(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('view')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t('month')}</SelectItem>
                <SelectItem value="week">{t('week')}</SelectItem>
                <SelectItem value="day">{t('day')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* カレンダー表示部分 */}
          <Card>
            <CardContent className="pt-6 p-0 md:p-0">
              <div className="calendar-container w-full max-w-full md:px-4">
                {/* カレンダー本体 */}
                {renderCalendarView()}
              </div>
            </CardContent>
          </Card>
          {/* 凡例 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('legend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {t('legend_description')}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}