# サイドバーコンポーネントのエラー修正 v2

## エラー内容

```
Error: ./src/components/ui/sidebar.tsx:267:9 Parsing ecmascript source code failed
```

## 問題の原因

`src/components/ui/sidebar.tsx`ファイルの267行目付近でエラーが発生しています。詳細に調査したところ、以下の問題が見つかりました：

1. **コードスタイルの不一致**: `SidebarOverlay`コンポーネント（160-180行目）の定義がセミコロン（`;`）で終わっていますが、ファイル内の他のコンポーネント定義はセミコロンなしで終わっています。

```tsx
// 問題のある部分（160-180行目）
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
}); // ← このセミコロンが問題
```

2. **重複したフック呼び出し**: 同じコンポーネント内で`useSidebar`フックを複数回呼び出しています。

## 修正方法

### 1. セミコロンの削除

`SidebarOverlay`コンポーネントの定義からセミコロンを削除します：

```tsx
// 修正後
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
  )
}) // セミコロンを削除
```

### 2. フック呼び出しの統一

`Sidebar`コンポーネント内で`useSidebar`フックを1回だけ呼び出すようにします：

```tsx
// 修正前
const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
// ...
const { toggleSidebar } = useSidebar() // 2回目の呼び出し

// 修正後
const { isMobile, state, openMobile, setOpenMobile, toggleSidebar } = useSidebar()
```

これらの修正により、Reactフックの呼び出しルールに準拠し、コードスタイルの一貫性が保たれ、エラーが解消されます。