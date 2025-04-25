import { useState, useMemo } from 'react';
import { 
  addMonths, subMonths, 
  addWeeks, subWeeks, 
  addDays, subDays, 
  getDaysInMonth, 
  startOfMonth, getDay, 
  format, 
  startOfWeek, endOfWeek,
  isSameDay
} from 'date-fns';
import { ja } from 'date-fns/locale';

export function useCalendar(initialView: 'month' | 'week' | 'day' = 'month') {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>(initialView);
  
  // 月の移動
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  
  // 週の移動
  const prevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const nextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  
  // 日の移動
  const prevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const nextDay = () => setCurrentDate(prev => addDays(prev, 1));
  
  // 今日に移動
  const goToToday = () => setCurrentDate(new Date());
  
  // 表示の切り替え
  const changeView = (newView: 'month' | 'week' | 'day') => setView(newView);
  
  // カレンダーの状態を計算
  const calendarState = useMemo(() => {
    const firstDay = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const dayOfWeek = getDay(firstDay); // 0=日曜, 1=月曜, ...
    
    // 現在の月の表示用フォーマット
    const formattedMonth = format(currentDate, 'yyyy年MM月', { locale: ja });
    
    // 週の開始日・終了日
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    
    // 週の表示用フォーマット
    const formattedWeek = `${format(weekStart, 'MM月dd日', { locale: ja })}〜${format(weekEnd, 'MM月dd日', { locale: ja })}`;
    
    // 日の表示用フォーマット
    const formattedDay = format(currentDate, 'yyyy年MM月dd日(eee)', { locale: ja });
    
    // 週のデータを計算
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: date.getMonth() === currentDate.getMonth()
      };
    });
    
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      formattedMonth,
      daysInMonth,
      startDayIndex: dayOfWeek,
      endEmptyCells: (7 - ((dayOfWeek + daysInMonth) % 7)) % 7,
      today: new Date(),
      weekStart,
      weekEnd,
      formattedWeek,
      formattedDay,
      weekDays,
    };
  }, [currentDate]);
  
  // イベントのカレンダー位置計算関数
  const calculateEventPosition = (startDate: Date, endDate: Date) => {
    // 月表示用の位置計算
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const startDayIndex = getDay(monthStart);
      
      // 月の開始日からの日数を計算
      const eventStartDay = startDate.getDate();
      const eventEndDay = endDate.getDate();
      
      // カレンダーグリッド上の位置
      const startGridIndex = startDayIndex + eventStartDay - 1;
      const eventLength = eventEndDay - eventStartDay + 1;
      
      // 行と列の位置を計算
      const startRow = Math.floor(startGridIndex / 7);
      const startCol = startGridIndex % 7;
      
      // 週をまたぐかどうか
      const isWeekSpanning = (startCol + eventLength) > 7;
      
      // 最初の週のスパン（列数）
      const firstWeekSpan = isWeekSpanning ? 7 - startCol : eventLength;
      
      // 2週目以降のスパン（ある場合）
      const remainingSpan = isWeekSpanning ? eventLength - (7 - startCol) : 0;
      
      return {
        startRow,
        startCol,
        eventLength,
        isWeekSpanning,
        firstWeekSpan,
        remainingSpan,
      };
    } 
    // 週表示用の位置計算
    else if (view === 'week') {
      const weekStart = calendarState.weekStart;
      // 週の開始日からの相対位置を計算
      const diffStart = Math.max(0, Math.floor((startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
      const diffEnd = Math.min(6, Math.floor((endDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        startCol: diffStart,
        endCol: diffEnd,
        span: diffEnd - diffStart + 1
      };
    }
    // 日表示用（デフォルト値を返す）
    return {
      startRow: 0,
      startCol: 0,
      eventLength: 1,
      isWeekSpanning: false,
      firstWeekSpan: 1,
      remainingSpan: 0,
    };
  };
  
  return {
    currentDate,
    view,
    ...calendarState,
    prevMonth,
    nextMonth,
    prevWeek,
    nextWeek,
    prevDay,
    nextDay,
    goToToday,
    changeView,
    calculateEventPosition,
  };
}