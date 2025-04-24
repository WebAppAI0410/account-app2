# ハンバーガーメニュー動作修正プラン (v2)

## 問題の特定

`src/app/page.tsx` にあるハンバーガーメニューボタンのクリックハンドラーの実装が、DOMを直接操作しているため、特にモバイル環境でメニューが開かない問題が発生しています。この方法はReactのコンテキストベースのサイドバー実装と連携がうまくいっていません。

## 修正プラン

`src/app/page.tsx` のハンバーガーメニューボタンのクリックハンドラーを修正し、`src/components/ui/sidebar.tsx` で提供されている `useSidebar` フックを利用するように変更します。

### 1. `useSidebar` フックのインポート

`src/app/page.tsx` に `useSidebar` フックをインポートします。

```typescript
import { useSidebar } from '@/components/ui/sidebar';
```

### 2. `useSidebar` フックの使用

`Home` コンポーネント内で `useSidebar` フックを呼び出し、サイドバーの状態を制御するための関数 (`toggleSidebar`) を取得します。

```jsx
export default function Home() {
  // ... 既存のコード ...
  const { toggleSidebar } = useSidebar(); // toggleSidebarを取得
  // ... 既存のコード ...
}
```

### 3. クリックハンドラーの修正

ハンバーガーメニューボタンの `onClick` ハンドラーを、取得した `toggleSidebar` 関数を直接呼び出すように変更します。

```jsx
<Button
  variant="ghost"
  size="icon"
  onClick={toggleSidebar} // DOM操作ではなく、フックの関数を直接呼び出す
  className="bg-background/80 backdrop-blur-sm"
  aria-label={t('Open Menu')}
>
  <Icons.menu className="h-5 w-5" />
  <span className="sr-only">メニューを開く</span>
</Button>
```

### 4. SidebarProviderの確認

`src/app/page.tsx` の `SidebarProvider` が適切にコンポーネントツリーをラップしていることを確認します。`defaultOpen={false}` は初期表示非表示のために維持します。

```jsx
return (
  <SidebarProvider defaultOpen={false}>
    {/* アプリケーションのメインコンテンツ */}
  </SidebarProvider>
);
```

## 期待される結果

この修正により、ハンバーガーメニューボタンがクリックされた際に、DOM操作に依存せず、SidebarContextを通じてサイドバー（モバイルではSheet）の開閉状態が直接制御されるようになります。これにより、すべてのデバイスでメニューが正しく開閉するようになります。

## 実装手順

1. `src/app/page.tsx` を Code モードで開きます。
2. `useSidebar` フックをインポートします。
3. `Home` コンポーネント内で `useSidebar` を呼び出します。
4. ハンバーガーメニューボタンの `onClick` ハンドラーを `toggleSidebar` を呼び出すように修正します。

```mermaid
graph TD
    A[問題特定: DOM操作によるメニュー開閉] --> B[修正計画作成]
    B --> C1[useSidebarフックのインポート]
    B --> C2[useSidebarフックの使用]
    B --> C3[onClickハンドラー修正]
    C1 --> D[実装とテスト]
    C2 --> D
    C3 --> D
    D --> E[完了]