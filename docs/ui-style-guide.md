# UIデザイン・配色ガイド（2025年4月24日更新）

## カラーパレット

| 用途         | Lightモード | Darkモード |
|--------------|-------------|------------|
| 背景         | #FFFFFF     | #121212    |
| カード       | #FFFFFF     | #1E1E1E    |
| プライマリ   | #6200EE     | #BB86FC    |
| セカンダリ   | #009688     | #03DAC6    |
| アクセント   | #FF9800     | #FFB74D    |
| デストラクティブ | #F44336 | #CF6679    |
| テキスト     | #121212     | #FFFFFF    |
| ミュート     | #757575     | #BBBBBB    |

## デザイン原則

- **シンプルさ**: 必要最小限の要素で最大の効果を
- **一貫性**: 同じ機能には同じ視覚表現を
- **フォーカス**: 重要な情報・アクションを視覚的に際立たせる
- **間隔**: 余白を効果的に使い、視覚的な呼吸を確保
- **アクセシビリティ**: 色だけに依存せず、形や位置でも情報を伝える

## スタイル要素

### タイポグラフィ
- **見出し**: システムフォント、太字（700）、サイズは階層ごとに
  - H1: 24px/1.2 (`text-2xl font-bold`)
  - H2: 20px/1.2 (`text-xl font-bold`)
  - H3: 16px/1.25 (`text-base font-semibold`)
- **本文**: システムフォント、標準（400）、16px/1.5 (`text-base`)
- **補助テキスト**: システムフォント、標準（400）、14px/1.5 (`text-sm text-muted-foreground`)

### スペーシング
- **コンポーネント内部**: 16px (`p-4`)
- **コンポーネント間**: 24px (`space-y-6`)
- **セクション間**: 32px (`my-8`)
- **カード内要素間**: 12px (`space-y-3`)

### 効果
- **角丸**: 8px (`rounded-lg`)
- **影**:
  - 標準: 1px 4px 0 rgba(0,0,0,0.04) (`shadow-sm`)
  - 浮き出し要素: 0 4px 6px -1px rgba(0,0,0,0.1) (`shadow-md`)
- **トランジション**:
  - 速度: 0.2〜0.3秒 (`transition-all duration-200`) 
  - イージング: ease-in-out (`ease-in-out`)

## コンポーネント特性

### ボタン
- **プライマリ**: 背景色=プライマリ、テキスト=白
  - `bg-primary text-primary-foreground hover:bg-primary/90`
- **セカンダリ**: 背景色=セカンダリ、テキスト=白
  - `bg-secondary text-secondary-foreground hover:bg-secondary/90`
- **アウトライン**: 枠線=ボーダー、テキスト=フォアグラウンド
  - `border border-input bg-background hover:bg-accent`
- **ゴースト**: 背景なし、テキスト=フォアグラウンド
  - `hover:bg-accent hover:text-accent-foreground`
- **リンク**: 下線、テキスト=プライマリ
  - `text-primary underline-offset-4 hover:underline`

### カード
- 白背景、薄い影、角丸8px
- ヘッダー、コンテンツ、フッターは一貫したパディング
- `bg-card text-card-foreground rounded-lg shadow-sm border`

### フォーム要素
- ラベルはフィールドの上、左揃え
- エラーメッセージは赤色、フィールドの下
- フォーカス状態は明確なリング効果
- 必須項目はアスタリスクではなく「必須」ラベル

### サイドバー/ナビゲーション
- アクティブ項目は視覚的に明確に（背景色変更+左ボーダー）
- ホバー状態は軽い背景色変更
- アイコンとテキストの間は適切な間隔

## 実装ガイドライン

### CSS変数の活用
- すべての色はCSS変数経由で参照
- コンポーネント間でスタイルを共有する際はユーティリティクラス優先

### レスポンシブ設計
- モバイルファースト（基本スタイルはモバイル向け）
- ブレークポイント:
  - md (768px): タブレット対応
  - lg (1024px): デスクトップ対応

### アクセシビリティ対応
- フォーカス可能要素は明確なフォーカス表示
- カラーコントラスト比は4.5:1以上を維持
- aria属性を適切に使用

---

このガイドは継続的に進化するもので、新機能開発時や定期的なデザインレビュー時に更新してください。
