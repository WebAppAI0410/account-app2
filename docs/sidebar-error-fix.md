# サイドバーコンポーネントのエラー修正

## エラー内容

```
Error: ./src/components/ui/sidebar.tsx:270:9 Parsing ecmascript source code failed
```

## 問題の原因

`src/components/ui/sidebar.tsx`ファイルの270行目付近でエラーが発生しています。詳細に調査したところ、以下の問題が見つかりました：

**Reactフックの呼び出しルール違反**：`Sidebar`コンポーネント内で`useSidebar`フックを2回呼び出しています。

1. 最初の呼び出し（202行目）：
```tsx
const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
```

2. 2回目の呼び出し（265行目）：
```tsx
// useSidebarからtoggleSidebarを取得
const { toggleSidebar } = useSidebar()
```

Reactのルールでは、同じコンポーネント内でフックを条件付きで呼び出したり、複数回呼び出したりすることはできません。これがエラーの原因です。

## 修正方法

最初の`useSidebar`呼び出しで`toggleSidebar`も一緒に取得するように修正します：

```tsx
// 修正前
const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

// 修正後
const { isMobile, state, openMobile, setOpenMobile, toggleSidebar } = useSidebar()
```

そして、265-266行目の2回目の`useSidebar`呼び出しを削除します：

```tsx
// 削除する部分
// useSidebarからtoggleSidebarを取得
const { toggleSidebar } = useSidebar()
```

この修正により、Reactフックの呼び出しルールに準拠し、エラーが解消されます。