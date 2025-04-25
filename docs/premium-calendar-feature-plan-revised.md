---
title: プレミアムカレンダー機能改善計画（改訂版）
author: GitHub Copilot
date: 2025-04-25
status: 計画改訂中
priority: 高
---

# プレミアムカレンダー機能改善計画（改訂版）

## 概要

現在実装されているプレミアム向けカレンダー機能について、UIの改善とエラー修正を行います。特に、複数日にわたるイベント（集金期間）の表示方法を改善し、より直感的で視覚的に優れたカレンダー表示を実現します。

## 現状の課題

1. **UI/UX上の問題**
   - 複数日イベントが連続したバーではなく、独立したアイテムとして表示されている
   - モバイル表示での最適化が不十分
   - イベントの色分けが不明瞭

2. **技術的な問題**
   - コンポーネントのエクスポート/インポートの不一致によるエラー
   - `Icons`コンポーネントでの不足アイコン（`star`など）

3. **パフォーマンスの問題**
   - 多数のイベントがある場合のレンダリング最適化
   - 日付計算のパフォーマンス

## 改善計画

### 1. エラー修正 (優先度：高)

- **アイコンコンポーネントの修正**
  - 必要なアイコン (`Star`、`ChevronLeft`、`ChevronRight`) を `icons.ts` に追加済み
  - 他のアイコンも包括的に確認し、必要に応じて追加

- **コンポーネントのエクスポート/インポート統一**
  - `BottomNavigation.tsx`と`layout.tsx`のインポート方法を統一
  - 名前付きエクスポート（named export）の一貫した使用を確認

- **依存関係の明確化**
  - `@fullcalendar` 関連パッケージの導入検討（モックから本格実装へ移行する場合）
  ```bash
  npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
  ```

### 2. UI改善 (優先度：中)

#### 2.1 複数日イベントの表示改善

現在のモックカレンダー実装をCSS Gridの特性を活かして改善します：

```tsx
// src/app/calendar/page.tsx のMockCalendarコンポーネントを修正

// イベントのレンダリング部分を改善
const renderEvents = () => {
  // 週の開始インデックスを取得（現在の月のカレンダーグリッドでの位置）
  const monthStart = new Date(2025, 3, 1); // 4月1日
  const startDayIndex = monthStart.getDay(); // 0=日曜, 1=月曜, ...
  
  return events.map(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // カレンダーグリッドでの位置を計算
    const eventStartDay = startDate.getDate();
    const eventEndDay = endDate.getDate();
    const startPosition = startDayIndex + eventStartDay - 1;
    const eventLength = eventEndDay - eventStartDay + 1;
    
    // グリッド位置を計算（行と列）
    const startRow = Math.floor(startPosition / 7);
    const startCol = startPosition % 7;
    const spanCols = Math.min(7 - startCol, eventLength);
    
    // イベントバーのスタイル
    const style = {
      gridRow: `${startRow + 1} / span 1`,
      gridColumn: `${startCol + 1} / span ${spanCols}`,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      borderRadius: '4px',
      padding: '2px 4px',
      fontSize: '0.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      zIndex: 10,
    };
    
    return (
      <div
        key={event.id}
        style={style}
        className="event-bar cursor-pointer"
        onClick={() => onEventClick(event.eventId)}
      >
        {event.title}
      </div>
    );
  });
};
```

#### 2.2 カレンダーグリッドの構造改善

```tsx
// カレンダーグリッドをより柔軟なレイアウトに変更
<div className="calendar-grid">
  {/* 曜日ヘッダー */}
  <div className="calendar-days-header">
    {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
      <div key={day} className="calendar-header-cell">
        {day}
      </div>
    ))}
  </div>
  
  {/* 日付セルのグリッド */}
  <div className="calendar-cells-container">
    {/* 空白セル（月の開始前） */}
    {Array.from({ length: startDayIndex }).map((_, i) => (
      <div key={`empty-start-${i}`} className="calendar-cell calendar-cell-inactive"></div>
    ))}
    
    {/* 日付セル */}
    {Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const isToday = today.getDate() === dayNum;
      
      return (
        <div 
          key={`day-${dayNum}`} 
          className={`calendar-cell ${isToday ? 'calendar-cell-today' : ''}`}
        >
          <div className="calendar-date-label">{dayNum}</div>
        </div>
      );
    })}
    
    {/* 空白セル（月の終了後） */}
    {Array.from({ length: endEmptyCells }).map((_, i) => (
      <div key={`empty-end-${i}`} className="calendar-cell calendar-cell-inactive"></div>
    ))}
  </div>
  
  {/* イベントレイヤー（別のレイヤーでイベントを表示） */}
  <div className="calendar-events-layer">
    {renderEvents()}
  </div>
</div>
```

#### 2.3 スタイル定義の追加

```css
/* CSS（globals.cssまたは新しいスタイルファイルに追加） */

.calendar-grid {
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100%;
  position: relative;
}

.calendar-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-header-cell {
  text-align: center;
  font-weight: 500;
  padding: 8px 0;
}

.calendar-cells-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  grid-auto-rows: minmax(80px, auto);
}

.calendar-cell {
  border: 1px solid var(--border);
  padding: 4px;
  min-height: 80px;
  position: relative;
}

.calendar-cell-inactive {
  background-color: var(--muted);
  opacity: 0.5;
}

.calendar-cell-today {
  background-color: var(--primary-light);
  border-color: var(--primary);
}

.calendar-date-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.calendar-events-layer {
  position: absolute;
  top: 30px; /* 曜日ヘッダーの高さ + 余白 */
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(auto-fill, minmax(80px, auto));
  pointer-events: none;
}

.calendar-events-layer .event-bar {
  pointer-events: auto;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .calendar-cells-container {
    grid-auto-rows: minmax(60px, auto);
  }
  
  .calendar-cell {
    min-height: 60px;
  }
  
  .calendar-events-layer .event-bar {
    font-size: 0.65rem;
    padding: 1px 2px;
  }
}
```

### 3. コード構造の改善 (優先度：中)

#### 3.1 カレンダー機能のモジュール化

カレンダーUI関連のロジックをカスタムフック・コンポーネントに分離し、メンテナンス性を向上させます：

```tsx
// src/hooks/useCalendar.ts
import { useState, useMemo } from 'react';
import { addMonths, subMonths, getDaysInMonth, startOfMonth } from 'date-fns';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  
  // カレンダーの状態を計算
  const calendarState = useMemo(() => {
    const firstDay = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const dayOfWeek = firstDay.getDay();
    
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      daysInMonth,
      startDayIndex: dayOfWeek,
      endEmptyCells: (7 - ((dayOfWeek + daysInMonth) % 7)) % 7,
    };
  }, [currentDate]);
  
  return {
    currentDate,
    ...calendarState,
    prevMonth,
    nextMonth,
  };
}
```

#### 3.2 専用コンポーネント化

```tsx
// src/components/calendar/CalendarGrid.tsx
import { useCalendar } from '@/hooks/useCalendar';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CalendarGridProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

export function CalendarGrid({ events, onEventClick }: CalendarGridProps) {
  const {
    currentDate,
    year,
    month,
    daysInMonth,
    startDayIndex,
    endEmptyCells,
    prevMonth,
    nextMonth,
  } = useCalendar();
  
  // ...既存のレンダリングロジックを活用
}

// src/components/calendar/CalendarEventBar.tsx
interface CalendarEventBarProps {
  event: CalendarEvent;
  startPosition: number;
  eventLength: number;
  onClick: (eventId: string) => void;
}

export function CalendarEventBar({ event, startPosition, eventLength, onClick }: CalendarEventBarProps) {
  // イベントバーの表示ロジック
}
```

### 4. 既存コンテキストとの連携強化 (優先度：低)

- **EventsContext との連携**
  - イベントの追加・更新時にカレンダービューでの表示を即時更新
  - カレンダービュー内での操作（ドラッグ&ドロップなど）をEventContextに反映

- **SubscriptionContext との連携**
  - プレミアム機能として、カレンダー上でのイベント期間編集機能を追加
  - 無料ユーザー向けの簡易プレビュー機能（月表示のみ、操作不可）

## 実装ステップ（優先順位）

1. **エラー修正 (1日)**
   - 既に実施したアイコン追加の確認
   - ボトムナビゲーションのエクスポート/インポート確認

2. **基本的なカレンダー表示改善 (2日)**
   - CSS Gridを活用した複数日イベント表示の実装
   - レスポンシブデザインの調整
   - 色分け・視認性の改善

3. **詳細機能の実装 (3日)**
   - カレンダーUI操作の改善（月切替、日付選択など）
   - イベントの詳細表示機能
   - （オプション）ドラッグ&ドロップ機能

4. **テストとバグ修正 (1日)**
   - 様々なデバイスサイズでのUIチェック
   - 異なる長さのイベント期間でのテスト
   - エッジケース（月またぎ・週またぎ）のテスト

## 今後の拡張可能性

1. **フルカレンダーライブラリ導入**
   - モックからライブラリベースの実装に移行し、より高度な機能を活用

2. **集金状況の可視化**
   - カレンダー上でイベントの集金状況を色・パターンで表示
   - 進捗度合いの視覚化

3. **iPhone/Androidネイティブカレンダー連携**
   - デバイスのカレンダーアプリとの同期
   - リマインダー機能の追加

## 技術的考慮事項

1. **パフォーマンス最適化**
   - 日付計算のメモ化（useMemo, useCallback）
   - 不要な再レンダリングの防止

2. **アクセシビリティ対応**
   - キーボードナビゲーション
   - スクリーンリーダー対応
   - 十分なコントラスト比

3. **セキュリティ考慮**
   - 日付関連の入力バリデーション
   - XSS対策（ユーザー入力の適切なエスケープ）