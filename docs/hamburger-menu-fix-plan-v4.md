# ハンバーガーメニュー動作修正計画 v4

## 現在の問題点

前回の修正（v3）により、タブレット端末でメニューボタンを押したときにイベント画面の左端の位置が変わらなくなりましたが、以下の2つの新たな問題が発生しています：

1. **イベント一覧が右に伸びてしまう問題**
   - メニューボタンを押すと、イベント一覧の幅が広がってしまう
   - イベント一覧の位置および縮尺が変わらないようにする必要がある

2. **メニュー画面の背景が薄暗くならない問題**
   - モバイル版では、メニュー画面に移ったときに背景が薄暗くなる（オーバーレイ効果）
   - タブレット版でも同様のオーバーレイ効果を実装する必要がある

## 問題の視覚的表現

### 問題1: イベント一覧が右に伸びる問題

```
【現在の動作】
メニュー閉じ時:
+---------------------------+
|                           |
|  イベント一覧             |
|                           |
+---------------------------+

メニュー開き時:
+---------------------------+------+
|                           |      |
|  イベント一覧             | メニ |
|  (右に伸びてしまう)       | ュー |
+---------------------------+------+

【期待する動作】
メニュー閉じ時:
+---------------------------+
|                           |
|  イベント一覧             |
|                           |
+---------------------------+

メニュー開き時:
+---------------------+------+
|                     |      |
|  イベント一覧       | メニ |
|  (幅が縮小される)   | ュー |
+---------------------+------+
```

### 問題2: メニュー画面の背景が薄暗くならない問題

```
【現在の動作 - タブレット】
メニュー開き時:
+---------------------------+------+
|                           |      |
|  イベント一覧             | メニ |
|  (背景が通常のまま)       | ュー |
+---------------------------+------+

【期待する動作 - タブレット】
メニュー開き時:
+---------------------------+------+
|                           |      |
|  イベント一覧             | メニ |
|  (背景が薄暗くなる)       | ュー |
+---------------------------+------+

【現在の動作 - モバイル】
メニュー開き時:
+---------------------------+
| ///////////////////////// |
| // イベント一覧        // |
| // (背景が薄暗くなる)  // |
| ///////////////////////// |
+---------------------------+
|                           |
|  メニュー                 |
|                           |
+---------------------------+
```

## 原因分析

### 問題1: イベント一覧が右に伸びる問題

現在の実装では、サイドバーが開いたときにメインコンテンツに右マージンを追加しています：

```tsx
// 現在の実装
const mainContentClass = React.useMemo(() => {
  return cn(
    "flex-1 p-4 space-y-4 w-full",
    !isMobile && "transition-all duration-300 ease-in-out",
    isTablet && state === "expanded" && "tablet:mr-[--sidebar-width]",
    isTablet && state === "collapsed" && "tablet:mr-0",
    // ...
  );
}, [isMobile, isTablet, isDesktop, state]);
```

この実装では、以下の問題があります：

1. `w-full`クラスによりコンテンツの幅が常に100%に設定されている
2. `mr-[--sidebar-width]`によって右マージンが追加されるが、コンテンツ自体の幅は変わらない
3. 結果として、コンテンツが右に伸びてしまう

### 問題2: メニュー画面の背景が薄暗くならない問題

モバイル版では、`Sheet`コンポーネントがオーバーレイを提供していますが、タブレット/デスクトップ版では直接サイドバーを表示しているため、オーバーレイ効果がありません：

```tsx
// モバイル版（オーバーレイあり）
if (isMobile) {
  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
      <SheetContent
        // ...
      >
        {/* ... */}
      </SheetContent>
    </Sheet>
  );
}

// タブレット/デスクトップ版（オーバーレイなし）
return (
  <div
    ref={ref}
    className={cn("group peer hidden md:block text-sidebar-foreground", tabletStyles)}
    // ...
  >
    {/* ... */}
  </div>
);
```

この実装では、以下の問題があります：

1. タブレット/デスクトップ版ではオーバーレイ要素が存在しない
2. サイドバーが開いても背景が薄暗くならない
3. モバイル版とタブレット/デスクトップ版でユーザー体験に一貫性がない

## 解決策の比較

### 問題1: イベント一覧が右に伸びる問題

| 解決策 | 説明 | メリット | デメリット |
|--------|------|----------|------------|
| **幅ベースの調整** | サイドバーが開いたときにメインコンテンツの幅を縮小する | ・イベント一覧の位置が変わらない<br>・レスポンシブ対応が容易 | ・コンテンツの再レイアウトが発生する |
| **位置ベースの調整** | メインコンテンツの位置を左に移動する | ・コンテンツの幅が変わらない | ・スクロールバーの位置が変わる<br>・実装が複雑になる |
| **グリッドレイアウト** | CSSグリッドを使用してレイアウトを制御する | ・柔軟なレイアウト制御<br>・コードがシンプルになる | ・既存のレイアウトを大幅に変更する必要がある |

**選択した解決策**: 幅ベースの調整

理由：
- 実装が比較的シンプル
- 既存のコードへの変更が最小限
- ユーザー体験が向上する

### 問題2: メニュー画面の背景が薄暗くならない問題

| 解決策 | 説明 | メリット | デメリット |
|--------|------|----------|------------|
| **オーバーレイコンポーネント** | 専用のオーバーレイコンポーネントを追加する | ・モバイル版と同様の体験<br>・クリックでサイドバーを閉じられる | ・追加のDOM要素が必要 |
| **背景色の変更** | メインコンテンツの背景色を変更する | ・追加のDOM要素が不要 | ・クリックでサイドバーを閉じられない<br>・トランジションが複雑になる |
| **既存コンポーネントの拡張** | `Sheet`コンポーネントをタブレット/デスクトップでも使用する | ・コードの一貫性が高まる | ・既存のコンポーネントの変更が必要<br>・副作用のリスクがある |

**選択した解決策**: オーバーレイコンポーネント

理由：
- モバイル版と同様のユーザー体験を提供できる
- クリックでサイドバーを閉じる機能を実装できる
- 既存のコードへの影響が最小限

## 詳細な実装計画

### 1. イベント一覧の位置および縮尺を固定する

#### 1.1 メインコンテンツの幅を調整

```tsx
// src/app/page.tsx
const mainContentClass = React.useMemo(() => {
  return cn(
    // ベースクラス
    "flex-1 p-4 space-y-4",
    
    // 幅の制御（サイドバーの状態に応じて変更）
    "transition-all duration-300 ease-in-out",
    
    // タブレット特有のスタイリング - 幅を調整
    isTablet && "tablet:w-full",
    isTablet && state === "expanded" && "tablet:w-[calc(100%-var(--sidebar-width))]",
    
    // デスクトップ特有のスタイリング - 幅を調整
    isDesktop && "desktop:w-full",
    isDesktop && state === "expanded" && "desktop:w-[calc(100%-var(--sidebar-width))]",
    
    // 最大幅を設定して、コンテンツが広がりすぎないようにする
    "max-w-full"
  );
}, [isMobile, isTablet, isDesktop, state]);
```

#### 1.2 コンテナのスタイリングを調整

```tsx
// src/app/page.tsx
return (
  <div className="flex flex-col min-h-screen relative overflow-x-hidden">
    {/* ... */}
    <main 
      className={mainContentClass}
      style={{ 
        transitionProperty: 'width, margin',
        transform: 'translateZ(0)',
        willChange: 'width, margin'
      }}
      aria-label={t('Events')}
    >
      {/* ... */}
    </main>
    {/* ... */}
  </div>
);
```

### 2. メニュー画面の背景を薄暗くする

#### 2.1 オーバーレイコンポーネントの追加

```tsx
// src/components/ui/sidebar.tsx
const SidebarOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { 
    open: boolean;
    onClick?: () => void;
  }
>(({ open, onClick, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out",
        open ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      onClick={onClick}
      aria-hidden={!open}
      {...props}
    />
  );
});
SidebarOverlay.displayName = "SidebarOverlay";
```

#### 2.2 Sidebarコンポーネントの修正

```tsx
// src/components/ui/sidebar.tsx
// タブレット/デスクトップ版
if (!isMobile) {
  return (
    <>
      {/* オーバーレイ - サイドバーが開いているときのみ表示 */}
      <SidebarOverlay 
        open={state === "expanded"} 
        onClick={toggleSidebar}
        data-testid="sidebar-overlay"
      />
      
      {/* サイドバー */}
      <div
        ref={ref}
        className={cn(
          "group peer hidden md:block text-sidebar-foreground",
          tabletStyles,
          // z-indexをオーバーレイより上に設定
          "z-50"
        )}
        style={transitionStyle}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        aria-hidden={state === "collapsed"}
      >
        {/* ... */}
      </div>
    </>
  );
}
```

### 3. アクセシビリティとパフォーマンスの向上

#### 3.1 アクセシビリティの向上

```tsx
// src/components/ui/sidebar.tsx
// SidebarTriggerコンポーネントの修正
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      aria-expanded={state === "expanded"}
      aria-controls="sidebar-content"
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
```

#### 3.2 パフォーマンスの最適化

```tsx
// src/app/page.tsx
// メモ化を使用して不要な再計算を防止
const mainContentStyle = React.useMemo(() => {
  return {
    transitionProperty: 'width, margin',
    transform: 'translateZ(0)',
    willChange: 'width, margin'
  };
}, []);

// ...

<main 
  className={mainContentClass}
  style={mainContentStyle}
  aria-label={t('Events')}
>
  {/* ... */}
</main>
```

## 高度なアニメーション最適化

### 1. FLIP技術の適用

FLIP（First, Last, Invert, Play）技術を使用して、より滑らかなアニメーションを実現します。

```tsx
// src/hooks/use-flip-animation.ts
export function useFlipAnimation(ref: React.RefObject<HTMLElement>, dependencies: any[]) {
  React.useEffect(() => {
    if (!ref.current) return;
    
    // First: 初期状態を記録
    const first = ref.current.getBoundingClientRect();
    
    // アニメーションフレームを待つ
    requestAnimationFrame(() => {
      if (!ref.current) return;
      
      // Last: 最終状態を記録
      const last = ref.current.getBoundingClientRect();
      
      // Invert: 変化を反転
      const deltaX = first.left - last.left;
      const deltaWidth = first.width / last.width;
      
      // 変化を適用
      ref.current.style.transform = `translateX(${deltaX}px) scaleX(${deltaWidth})`;
      ref.current.style.transformOrigin = 'left';
      
      // Play: アニメーションを実行
      requestAnimationFrame(() => {
        if (!ref.current) return;
        
        ref.current.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
        ref.current.style.transform = 'translateX(0) scaleX(1)';
        
        // トランジション終了後にスタイルをリセット
        const onTransitionEnd = () => {
          if (!ref.current) return;
          
          ref.current.style.transition = '';
          ref.current.style.transform = '';
          ref.current.style.transformOrigin = '';
          
          ref.current.removeEventListener('transitionend', onTransitionEnd);
        };
        
        ref.current.addEventListener('transitionend', onTransitionEnd);
      });
    });
  }, dependencies);
}
```

### 2. CSS変数を使用した動的なトランジション

```tsx
// src/app/page.tsx
// CSSカスタムプロパティを使用して動的なトランジションを実現
React.useEffect(() => {
  // サイドバーの状態に応じてCSSカスタムプロパティを更新
  document.documentElement.style.setProperty(
    '--main-content-width',
    state === "expanded" ? `calc(100% - var(--sidebar-width))` : '100%'
  );
}, [state]);

// ...

const mainContentStyle = React.useMemo(() => {
  return {
    width: 'var(--main-content-width, 100%)',
    transitionProperty: 'width, margin',
    transform: 'translateZ(0)',
    willChange: 'width, margin'
  };
}, []);
```

## 実装の優先順位と段階的アプローチ

### フェーズ1: 基本機能の実装（優先度: 高）

1. **メインコンテンツの幅調整**
   - `src/app/page.tsx`のメインコンテンツクラスを更新
   - 幅ベースの調整に変更

2. **オーバーレイコンポーネントの追加**
   - `src/components/ui/sidebar.tsx`に`SidebarOverlay`コンポーネントを追加
   - `Sidebar`コンポーネント内でオーバーレイを使用

### フェーズ2: 最適化とリファクタリング（優先度: 中）

1. **パフォーマンスの最適化**
   - メモ化を使用して不要な再計算を防止
   - GPUアクセラレーションを活用

2. **アクセシビリティの向上**
   - ARIA属性の追加
   - キーボードナビゲーションの改善

### フェーズ3: 高度な機能と拡張（優先度: 低）

1. **高度なアニメーション**
   - FLIP技術の適用
   - CSS変数を使用した動的なトランジション

2. **コードの再利用性と拡張性**
   - カスタムフックの作成
   - コンポーネントの抽象化

## 潜在的な問題点と対策

### 1. レスポンシブ対応の問題

**問題**: 様々な画面サイズでレイアウトが崩れる可能性がある

**対策**:
- ブレークポイントを細かく設定する
- `calc()`関数を使用して動的な幅を計算する
- 最小幅と最大幅を設定して、極端なケースに対応する

```tsx
// 最小幅と最大幅を設定
isTablet && state === "expanded" && "tablet:w-[calc(100%-var(--sidebar-width))] tablet:min-w-[320px]",
```

### 2. トランジションの問題

**問題**: 幅の変更によるトランジションがスムーズでない可能性がある

**対策**:
- トランジションのタイミング関数を最適化する
- GPUアクセラレーションを活用する
- トランジション対象のプロパティを明示的に指定する

```tsx
// トランジションの最適化
const transitionStyle = {
  transitionProperty: 'width, margin, transform',
  transitionDuration: '300ms',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
  transform: 'translateZ(0)', // GPUアクセラレーション
  willChange: 'width, margin, transform' // ブラウザに変更を予告
};
```

### 3. z-indexの競合

**問題**: オーバーレイとサイドバーのz-indexが他の要素と競合する可能性がある

**対策**:
- z-indexの値を適切に設定する
- スタッキングコンテキストを明示的に作成する
- z-indexの管理を一元化する

```tsx
// z-indexの管理
const Z_INDEX = {
  overlay: 40,
  sidebar: 50,
  trigger: 60
};

// 使用例
<SidebarOverlay 
  open={state === "expanded"} 
  onClick={toggleSidebar}
  style={{ zIndex: Z_INDEX.overlay }}
/>
```

## 詳細なテスト計画

### 1. 機能テスト

| テスト項目 | 期待される結果 | テスト方法 |
|------------|----------------|------------|
| メニューボタンのクリック | サイドバーが開き、オーバーレイが表示される | 手動テスト |
| オーバーレイのクリック | サイドバーが閉じる | 手動テスト |
| キーボードショートカット | Ctrl/Cmd+Bでサイドバーが開閉する | 手動テスト |
| フォーカス管理 | サイドバーが開いたとき、最初の要素にフォーカスが移る | スクリーンリーダーでテスト |

### 2. レスポンシブテスト

| デバイス | 画面サイズ | 期待される結果 |
|----------|------------|----------------|
| モバイル | <768px | サイドバーはスライドイン、背景は薄暗くなる |
| タブレット（縦向き） | 768px-834px | サイドバーは固定表示、メインコンテンツの幅が調整される、背景は薄暗くなる |
| タブレット（横向き） | 835px-1024px | サイドバーは固定表示、メインコンテンツの幅が調整される、背景は薄暗くなる |
| デスクトップ（小） | 1025px-1366px | サイドバーは固定表示、メインコンテンツの幅が調整される、背景は薄暗くなる |
| デスクトップ（大） | >1366px | サイドバーは固定表示、メインコンテンツの幅が調整される、背景は薄暗くなる |

### 3. パフォーマンステスト

| テスト項目 | 期待される結果 | テスト方法 |
|------------|----------------|------------|
| トランジションのスムーズさ | 60FPSでスムーズなアニメーション | Chrome DevToolsのPerformanceタブ |
| メモリ使用量 | メモリリークがない | Chrome DevToolsのMemoryタブ |
| レンダリングパフォーマンス | 不要な再レンダリングがない | React DevTools |

### 4. アクセシビリティテスト

| テスト項目 | 期待される結果 | テスト方法 |
|------------|----------------|------------|
| キーボードナビゲーション | キーボードのみで操作可能 | キーボードでのテスト |
| スクリーンリーダー対応 | スクリーンリーダーで正しく読み上げられる | NVDA/VoiceOverでテスト |
| コントラスト比 | WCAG AAレベルを満たす | axe DevTools |
| フォーカス管理 | フォーカスの移動が適切 | キーボードでのテスト |

## 実装スケジュール

1. **準備段階** (0.5日)
   - 現在のコードの詳細分析
   - テスト環境の準備

2. **コア機能の実装** (1日)
   - メインコンテンツの幅調整機能の実装
   - オーバーレイコンポーネントの実装

3. **最適化とリファクタリング** (0.5日)
   - パフォーマンスの最適化
   - アクセシビリティの向上

4. **テストと修正** (1日)
   - 機能テスト
   - レスポンシブテスト
   - パフォーマンステスト
   - アクセシビリティテスト

5. **ドキュメント作成とレビュー** (0.5日)
   - 実装の詳細ドキュメント作成
   - コードレビュー

**合計**: 3.5日

## 結論

この修正計画では、タブレット端末でのハンバーガーメニューの動作に関する2つの問題を解決します：

1. イベント一覧が右に伸びてしまう問題を、メインコンテンツの幅を動的に調整することで解決します。
2. メニュー画面の背景が薄暗くならない問題を、専用のオーバーレイコンポーネントを追加することで解決します。

これらの修正により、タブレット端末でのユーザー体験が向上し、モバイル版との一貫性が確保されます。また、アクセシビリティとパフォーマンスも考慮した実装となっています。
