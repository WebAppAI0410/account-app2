---
title: プレミアムカレンダー機能実装計画
author: GitHub Copilot
date: 2025-04-25
status: 計画段階
priority: 高
---

# プレミアムカレンダー機能実装計画

## 概要

有料（プレミアム）プランのユーザーのみが使用できるカレンダー機能を実装します。このカレンダーでは、各イベントの集金期間が視覚的に表示され、月ごとの収支管理が容易になります。

## 実装内容

### 1. カレンダーページの作成

- `src/app/calendar/page.tsx`にカレンダーページを作成
- 外部ライブラリとして`@fullcalendar/react`を使用
- イベントの集金期間がカレンダー上で色付きのバーとして表示

### 2. ナビゲーションタブの追加

- アプリ下部にタブナビゲーション（`BottomNavigation`）を追加
  - ホーム（イベント一覧）
  - カレンダー
- `src/components/BottomNavigation.tsx`として実装
- 既存のハンバーガーメニュー（右上）は引き続き設定へのアクセスに使用

### 3. プレミアム機能制限の実装

- `useSubscription`フックを使用してユーザーのプラン状態を確認
- 無料プランユーザーがカレンダータブを押した場合：
  - プレミアム機能の説明モーダルを表示
  - プレミアムへのアップグレードを促す
- プレミアムユーザーは制限なくカレンダー機能を利用可能

### 4. カレンダー表示機能

- 月表示、週表示、日表示の切り替え
- イベントの集金期間を視覚化
  - 開始日から終了日までを色付きバーで表示
  - イベント名をバーに表示
- イベントバーをクリックすると詳細画面へ遷移

## 技術仕様

### 使用ライブラリ

- `@fullcalendar/react`: カレンダーUIコンポーネント
- `@fullcalendar/daygrid`: 月表示
- `@fullcalendar/timegrid`: 週/日表示
- `@fullcalendar/interaction`: ユーザーインタラクション

### データ構造

```typescript
// カレンダーイベントの型定義
interface CalendarEvent {
  id: string;
  title: string; // イベント名
  start: string; // 集金開始日（ISO形式）
  end: string;   // 集金終了日（ISO形式）
  backgroundColor?: string; // イベントカラー
  borderColor?: string;
  eventId: string; // 元のイベントID（詳細ページへのリンク用）
}

// イベントデータをカレンダーイベントに変換する関数
function convertToCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map(event => ({
    id: `cal-${event.id}`,
    title: event.name,
    start: event.collectionStartDate || event.date,
    end: event.collectionEndDate || event.date,
    backgroundColor: generateEventColor(event.id),
    borderColor: generateEventColor(event.id),
    eventId: event.id
  }));
}
```

## UI/UXデザイン

### BottomNavigation

```
+---------------------------+
|                           |
|      (アプリコンテンツ)    |
|                           |
+---------------------------+
|    [ホーム] [カレンダー]    |  <- タブナビゲーション
+---------------------------+
```

### カレンダー画面

```
+---------------------------+
| 2025年4月           ≡     | <- 右上にハンバーガーメニュー
+---------------------------+
| 日 月 火 水 木 金 土       |
| -- -- 1  2  3  4  5       |
| 6  7  8  9  10 11 12      |
| 13 14 15 16 17 18 19      |
| 20 21 22 23 24 25 26      |  <- 今日（25日）
| 27 28 29 30 -- -- --      |
+---------------------------+
|     [飲み会]              |  <- 4/25-26の範囲で表示
+---------------------------+
|    [ホーム] [カレンダー]    |
+---------------------------+
```

### プレミアム機能制限モーダル

```
+---------------------------+
|      プレミアム機能       |
|                           |
| このカレンダー機能は      |
| プレミアムプラン限定です。 |
|                           |
| [詳細を見る]  [アップグレード] |
|                           |
| [閉じる]                  |
+---------------------------+
```

## 実装手順

1. 必要なライブラリのインストール
   ```bash
   npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
   ```

2. `BottomNavigation`コンポーネントの作成（ホームとカレンダーの2タブ）
3. `CalendarPage`コンポーネントの作成
4. プレミアム機能制限モーダルの実装
5. `EventsContext`と`SubscriptionContext`の連携
6. UIスタイリングとレスポンシブ対応
7. テストとバグ修正

## 注意事項

- 広告バナーとの兼ね合いを考慮し、画面下部の余白を適切に確保する
- プレミアム機能の価値をユーザーに理解してもらうため、無料ユーザーには機能の一部をプレビュー表示する
- カレンダーUIはモバイルファーストで設計し、タッチ操作に最適化する

## エラー修正計画

### 問題の特定

カレンダーページを押すと以下のエラーが発生しています ：

```
Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
```

### 想定される原因

1. **コンポーネントのエクスポート問題**
   - `BottomNavigation.tsx`コンポーネントが適切にエクスポートされていないか、インポート側で誤った方法でインポートしている
   - `Calendar`ページコンポーネントの問題

2. **依存関係の問題**
   - 必要なライブラリがインストールされていない
   - `@fullcalendar`などの外部依存関係がモックで置き換えられているため、実際のコンポーネントが存在しない

3. **Named Export vs Default Export の混同**
   - コンポーネントが named export されているのに default import されている（またはその逆）

4. **ビルドプロセスの問題**
   - TypeScriptのコンパイルエラー
   - Next.jsのルーティング問題

### 修正手順

1. **エクスポート方法の確認と修正**
   ```typescript
   // src/components/BottomNavigation.tsx
   // 修正前 ：
   export function BottomNavigation() { ... }
   
   // 修正後（必要に応じて） ：
   export default function BottomNavigation() { ... }
   ```

   ```typescript
   // src/app/layout.tsx
   // 修正前 ：
   import { BottomNavigation } from '@/components/BottomNavigation';
   
   // 修正後（必要に応じて） ：
   import BottomNavigation from '@/components/BottomNavigation';
   ```

2. **カレンダーページのコンポーネント確認**
   - カレンダーページコンポーネントが適切に`default export`されていることを確認
   - Mockedコンポーネントが正しく実装されているか確認

3. **依存関係のインストール（本番環境用）**
   ```bash
   npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
   ```

4. **エラーの詳細調査**
   - React Developer Toolsを使ってコンポーネントツリーを確認
   - コンソールログを追加してデバッグ情報を取得

5. **コンポーネント階層の確認**
   - 各コンポーネントが正しい順序で初期化されているか確認
   - 親子関係に問題がないか確認

### タイムライン

1. エクスポート/インポート問題の修正（1時間）
2. 依存関係の確認と修正（30分）
3. コンポーネント実装の確認と修正（2時間）
4. ビルドとテスト（1時間）
5. 最終確認（30分）

### テスト計画

1. 修正後、ホーム画面からカレンダータブを押して遷移確認
2. URL直接入力でのカレンダーページアクセス確認
3. プレミアムユーザー/無料ユーザー両方での動作確認
4. モバイル/タブレット/デスクトップでの表示確認

## UI改善計画

現状のカレンダーUIでは、イベントが各日に独立してリスト表示されており、複数日にわたるイベントの集金期間がバーとして視覚的につながっていません。この問題を解決するために以下のUI改善を行います。

### 問題点

1. **連続性の欠如**: 現在の実装では、3日間の集金期間があるイベントは、3つの独立した小さなイベントとして表示されています
2. **直感的でない表示**: ユーザーがイベントの期間全体を一目で把握できない
3. **モバイル表示の制約**: モバイル画面では特に、小さな日付セル内にイベント情報が詰め込まれすぎている

### 改善案

#### 1. 複数日イベントのバー表示

1. **連続したバー表示**:
   - 複数日にわたるイベントは、その期間全体をカバーする連続したバーとして表示
   - 開始日から終了日まで途切れずに視覚的につながるデザイン

2. **CSS Grid技術の活用**:
   ```css
   .multi-day-event {
     grid-column: span [日数];
     background-color: [イベント固有の色];
     border-radius: 4px;
     margin: 1px;
     z-index: 1;
   }
   ```

3. **実装アプローチ**:
   - イベントのレンダリングロジックを変更し、各イベントの開始日と終了日から必要なグリッドセルスパンを計算
   - 週や月の境界をまたぐ場合の特別な処理を追加

#### 2. イベントバーのデザイン改善

1. **視覚的区別**:
   - 各イベントに一貫性のある固有の色を割り当て
   - 色のコントラストを確保して可読性を向上

2. **情報の最適化**:
   - 限られたスペースでも重要な情報が伝わるよう、情報の優先順位付け
   - イベント名を常に表示し、日付情報はホバー時または十分なスペースがある場合のみ表示

3. **デザイン例**:
   ```
   +-------------------------------+
   |  4月                          |
   +---+---+---+---+---+---+---+
   | 日| 月| 火| 水| 木| 金| 土|
   +---+---+---+---+---+---+---+
   |   |   | 1 | 2 | 3 | 4 | 5 |
   +---+---+---+---+---+---+---+
   | 6 | 7 | 8 | 9 | 10| 11| 12|
   +---+---------------+---+---+
   |   |  飲み会集金期間  |   |   | ← 3日間の集金期間が連続したバー
   +---+---+---+---+---+---+---+
   | 13| 14| 15| 16| 17| 18| 19|
   +---+---+---+---+---+---+---+
   ```

#### 3. レスポンシブ対応の強化

1. **画面サイズによる表示調整**:
   - デスクトップ: 完全な週表示と詳細なイベント情報
   - タブレット: 必要に応じてイベント表示を簡略化
   - モバイル: 縦向きで日表示、横向きで3日間表示などの柔軟な切替

2. **タッチインタラクションの最適化**:
   - タップでイベント詳細を表示
   - 長押しで追加オプションを表示（編集、削除など）

### 実装ステップ

1. **イベント配置ロジックの改善**:
   - 複数日イベントの配置アルゴリズムを実装
   - 重なりを考慮した適切なレイアウト処理

2. **CSS Grid レイアウトの実装**:
   ```typescript
   // イベントの日数に基づいてグリッドスパンを計算
   const calculateEventSpan = (event) => {
     const startDate = new Date(event.start);
     const endDate = new Date(event.end);
     const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
     return Math.min(daysDiff, 7); // 最大1週間までのスパン
   };
   ```

3. **FullCalendarライブラリの活用**:
   - `@fullcalendar/react`の`dayGridMonth`ビューを活用
   - カスタムイベントレンダリングでバーの表示をコントロール

4. **UI/UXテスト**:
   - さまざまな期間のイベントでのテスト
   - 異なるデバイスサイズでの表示確認

### 今後の拡張

1. **ドラッグ&ドロップ機能**:
   - イベントの集金期間を直接カレンダー上でドラッグして変更できる機能

2. **ビュー切替の拡張**:
   - アジェンダビュー: イベントをリスト形式で表示
   - タイムラインビュー: 時間軸ベースの表示

3. **インタラクティブ情報表示**:
   - イベントバーのホバー時に詳細情報をポップオーバー表示
   - 集金状況のサマリー情報を視覚的に表示（達成率など）