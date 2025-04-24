# ハンバーガーメニュー動作修正計画 – ブラッシュアップ版

## 1. 背景
- モバイルではメニュー開閉時にスライドインシート（Sheet）＋オーバーレイが動作  
- タブレット/デスクトップではオーバーレイが効かず、イベント一覧領域が右に伸びる  
- `src/components/ui/sidebar.tsx:270:9` 周辺で React フックの重複呼び出しによるパースエラー発生  

## 2. コンポーネント構成とデータフロー
```mermaid
flowchart LR
  subgraph SidebarProvider
    direction TB
    A[useSidebar() state<br/>expanded／collapsed] --> B[SidebarTrigger]
    A --> C[SidebarOverlay]
    A --> D[Sidebar (aside)]
  end
  B -->|toggleSidebar| A
  C -->|onClick| A
  A -->|state| E[MainContent width]
```

## 3. 修正ポイント

### 3.1 メインコンテンツの幅制御
- ファイル: `src/app/page.tsx`  
- **Before**  
  ```tsx
  className="flex-1 p-4 tablet:mr-[--sidebar-width] desktop:mr-[--sidebar-width]"
  ```  
- **After**  
  ```tsx
  className="flex-1 p-4
    transition-all duration-300 ease-in-out
    tablet:w-[calc(100%-var(--sidebar-width))]
    desktop:w-[calc(100%-var(--sidebar-width))]
    overflow-x-hidden
  "
  ```

### 3.2 オーバーレイの統合
- ファイル: `src/components/ui/sidebar.tsx`  
- 新規追加:  
  ```tsx
  const SidebarOverlay = React.forwardRef<HTMLDivElement, {
    open: boolean; onClick: ()=>void;
  }>((props, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
        props.open ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={props.onClick}
      aria-hidden={!props.open}
    />
  ));
  ```  
- `Sidebar` コンポーネント返却部に挿入:
  ```tsx
  <SidebarOverlay open={state==="expanded"} onClick={toggleSidebar} />
  <aside className="z-50 ...">{/* メニュー */}</aside>
  ```

### 3.3 React フック呼び出しの修正
- 同一コンポーネント内での `useSidebar()` 重複呼び出しを解消  
- 修正後:
  ```ts
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile,
    toggleSidebar
  } = useSidebar();
  ```

## 4. 対応ファイル一覧
| 項目                       | パス                                         |
|----------------------------|----------------------------------------------|
| メインコンテンツ幅制御     | `src/app/page.tsx`                           |
| SidebarOverlay追加         | `src/components/ui/sidebar.tsx`              |
| フック呼び出し修正         | `src/components/ui/sidebar.tsx` (同上)       |

## 5. テスト計画
1. モバイル（<768px）でシート＋オーバーレイ動作  
2. タブレット（768px–1024px）でオーバーレイ＋幅制御  
3. デスクトップ（>1024px）で同上  
4. キーボードショートカット（⌘/Ctrl+B）動作確認  
5. ARIA 属性検証（`aria-expanded`, `aria-controls`）

## 6. 実装スケジュール
- 準備・レビュー（0.5日）  
- コア実装（1日）  
- 動作確認・リファクタリング（1日）  
- ドキュメント更新・マージ（0.5日）