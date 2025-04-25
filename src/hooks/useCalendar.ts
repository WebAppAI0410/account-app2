import { useState, useMemo } from 'react';
import { addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  
  // カレンダーの状態を計算
  const calendarState = useMemo(() => {
    const firstDay = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const dayOfWeek = getDay(firstDay); // 0=日曜, 1=月曜, ...
    
    // 現在の月の表示用フォーマット
    const formattedMonth = format(currentDate, 'yyyy年MM月', { locale: ja });
    
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      formattedMonth,
      daysInMonth,
      startDayIndex: dayOfWeek,
      endEmptyCells: (7 - ((dayOfWeek + daysInMonth) % 7)) % 7,
      today: new Date(),
    };
  }, [currentDate]);
  
  // イベントのカレンダー位置計算関数
  const calculateEventPosition = (startDate: Date, endDate: Date) => {
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
  };
  
  return {
    currentDate,
    ...calendarState,
    prevMonth,
    nextMonth,
    calculateEventPosition,
  };
}