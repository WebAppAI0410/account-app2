# モバイル対応イベント新規作成UI実装手順案

## 背景
- iPadではSidebarが常時表示され、イベント新規作成ボタンが見える。  
- iPhone等のモバイル画面（幅768px未満）ではSidebarがSheet（ドロワー）として非表示のため、ボタンが見えない。

## 解決策
- モバイル時にハンバーガーメニューとフローティングアクションボタン(FAB)を追加し、UI操作を容易にする。

## 実装手順
1. **useIsMobile フックの利用**  
   - `src/hooks/use-mobile.tsx` の `useIsMobile()` を利用してモバイル判定を行う。

2. **サイドバー開閉状態の取得**  
   - `SidebarProvider` から `setOpenMobile` を取得し、UIコンポーネントで呼び出せるようにする。

3. **ハンバーガーメニューの追加**  
   - `src/app/page.tsx` のヘッダー部分に、モバイル時のみ表示されるハンバーガーメニュー（≡）ボタンを追加。  
   - ボタンの `onClick` で `setOpenMobile(true)` を呼び出し、サイドバーのSheetを開く。

4. **フローティングアクションボタン(FAB)の追加**  
   - `src/app/page.tsx` のメインコンテンツエリアに、モバイル時のみ右下固定表示のFAB（➕）を追加。  
   - `onClick` で `setIsCreateEventOpen(true)` を呼び出し、既存の `EventCreateDialog` を開く。

5. **スタイル調整**  
   - Tailwind CSSの `fixed bottom-4 right-4 z-50` 等を活用し、FABが他の要素と重ならないよう調整。  
   - ハンバーガーメニューは `md:hidden` などでモバイル時のみ表示。

6. **動作確認・テスト**  
   - iPhone実機またはシミュレータで、サイドバーの開閉とFAB利用時のダイアログ表示をテスト。

## UIイメージ

```mermaid
flowchart TB
  subgraph MobileScreen["モバイル画面"]
    direction TB
    Header[≡ ヘッダー<br/>(ハンバーガーメニュー)]:::header
    List[イベント一覧]
    FAB(➕):::fab
    Sidebar[サイドバー（Sheet）]:::sidebar
  end

  Header -- タップ --> Sidebar
  FAB -- タップ --> Dialog[イベント新規作成ダイアログ]

  classDef header fill:#fbbf24,stroke:#f59e42,color:#222,stroke-width:2px;
  classDef fab fill:#3b82f6,stroke:#3b82f6,color:#fff,stroke-width:2px;
  classDef sidebar fill:#f3f4f6,stroke:#888,stroke-width:2px;
  style MobileScreen fill:#f3f4f6,stroke:#cccccc,stroke-width:1px;