# RecipeTree

Soulmask のアイテムレシピを視覚的なツリー形式で表示するWebアプリケーションです。

![preview](./docs/preview.png)

## 機能

- 🔍 **インクリメンタル検索** — アイテム名をリアルタイムに絞り込み、候補一覧から選択できます
- 🌲 **レシピツリー表示** — 選択したアイテムの素材ツリーを自動レイアウトで表示します（[React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre)）
- ✅ **完了チェック機能** — ノードを右クリックすると「収集済み」としてマークでき、その先の素材がフェードアウトします
- 📦 **素材サマリー** — ノードをクリックするとサイドパネルに必要な基礎素材の合計数が表示されます
- 🏭 **作成施設表示** — 各アイテムの作成施設をサイドパネルで確認できます

## 使い方

1. 画面上部の検索ボックスにアイテム名を入力します
2. 候補リストから目的のアイテムを選択します
3. 「ツリーを表示」ボタンをクリックするか `Enter` を押します
4. ツリー上のノードを**左クリック**すると、サイドパネルに詳細が表示されます
5. ノードを**右クリック**すると収集済みとしてマークできます（ノードがフェードします）
6. 「クリア」ボタンでツリーをリセットできます

## 技術スタック

| カテゴリ | 使用技術 |
|---|---|
| フレームワーク | React 19 + Vite |
| グラフ描画 | [@xyflow/react](https://reactflow.dev/) (React Flow v12) |
| 自動レイアウト | [dagre](https://github.com/dagrejs/dagre) |
| アイコン | [lucide-react](https://lucide.dev/) |
| スタイル | Vanilla CSS（グラスモーフィズム、ダークモード） |

## プロジェクト構成

```
RecipeTree/
├── recipe-tree-app/          # フロントエンドアプリ
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx    # 検索バー
│   │   │   ├── CustomNode.jsx# レシピノード
│   │   │   └── SidePanel.jsx # アイテム詳細パネル
│   │   ├── hooks/
│   │   │   ├── useRecipeData.js   # レシピデータの読み込み
│   │   │   ├── useSearch.js       # 検索フィルタリング
│   │   │   └── useRecipeFlow.js   # ツリー構築・React Flow状態管理
│   │   ├── utils.js          # サブグラフ構築・素材計算・Dagreレイアウト
│   │   ├── recipes.json      # レシピデータ（日本語訳済み）
│   │   └── App.jsx           # エントリーコンポーネント
│   └── package.json
└── soulmask_data/            # 生データ・変換スクリプト
    ├── Game.po               # Soulmask ローカライズファイル
    ├── recipes.json          # 変換前レシピデータ
    ├── translated_recipes.json
    └── a.py                  # データ変換スクリプト
```

## セットアップ

```bash
cd recipe-tree-app
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## ビルド

```bash
npm run build
```

`dist/` フォルダに本番用ファイルが生成されます。

## レシピデータについて

`src/recipes.json` は Soulmask の `Game.po` ローカライズファイルを `soulmask_data/a.py` スクリプトで変換・日本語訳したものです。
データ構造は以下の通りです。

```jsonc
{
  "アイテム名": {
    "craft_station": "作成施設名",   // string または string[]
    "ingredients": {
      "素材名": 必要数,              // number
      ...
    }
  },
  ...
}
```
