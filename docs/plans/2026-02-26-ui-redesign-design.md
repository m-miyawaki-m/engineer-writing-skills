# 設計書: UI/UXリデザイン — Markdown記事ベースへの移行

**作成日:** 2026-02-26
**ステータス:** 承認済み

---

## 1. 背景・課題

### 現状の問題点

- **SkillGuide.vue が652行**: 71個のスキル教材がJSにハードコード。メンテナンス困難
- **検索が用語一覧だけ**: スキルガイド(71項目)と読解例(5件)は検索対象外
- **3種類のコンテンツがバラバラの構造**: 用語(JSON)、スキルガイド(ハードコードJS)、読解例(JSON)で形式が統一されていない
- **カテゴリ定義が3箇所に重複**: SearchFilter.vue, TermCard.vue, SkillGuide.vue

### 方針

- 利用者: 自分専用
- 主な使い方: スキルガイドを読む
- コンテンツ管理: Markdownで書きたい
- ai-knowledge-noteで実証済みのパターンを移植

---

## 2. コンテンツ構造

### データモデルの変更

| 項目 | Before | After |
|---|---|---|
| スキルガイド | SkillGuide.vue 内ハードコード (71項目) | `content/カテゴリ/*.md` |
| 用語・パターン | `docs/references/terms.json` (40項目) | `content/カテゴリ/*.md` (タグ: 用語/パターン) |
| 読解例 | `docs/references/readings.json` (5件) | `content/カテゴリ/*.md` (タグ: 読解例) |
| メタデータ | JSON フィールド | frontmatter (YAML) |

### ディレクトリ構成

```
content/
├── concretization-abstraction/
│   ├── _category.yml       # { name: "具体化・抽象化", order: 1 }
│   ├── granularity-adjustment.md
│   ├── mece-decomposition.md
│   └── ...
├── reporting/
│   ├── _category.yml
│   ├── conclusion-first.md
│   ├── incident-report.md
│   └── ...
├── explanation/
│   ├── _category.yml
│   └── ...
├── logical-writing/
│   ├── _category.yml
│   └── ...
└── questioning/
    ├── _category.yml
    └── ...
```

### Markdown ファイル形式

```markdown
---
title: "結論ファースト"
tags: [用語, 報告]
created: 2026-02-18
updated: 2026-02-26
---

## 説明

報告・連絡において、最も重要な結論を最初に伝える手法。

## 良い例

> 【結論】本日のリリースは予定通り完了しました。
> 【詳細】...

## 悪い例

> 今日の午前中にいろいろ作業をして...（結論が最後）

## 活用場面

障害報告、進捗報告、意思決定の依頼など。
```

---

## 3. UIレイアウト

### 2カラムレイアウト（ai-knowledge-noteと同一）

```
┌─────────────────┬──────────────────────────────────────────┐
│  SIDEBAR        │  MAIN CONTENT                            │
│  (280px)        │  (max-width: 800px, centered)            │
│                 │                                          │
│  ┌───────────┐  │  記事タイトル                             │
│  │ 🔍 検索   │  │  タグ: 用語, 報告                        │
│  └───────────┘  │                                          │
│                 │  ## 説明                                  │
│  具体化・抽象化 │  本文...                                  │
│   ├ 粒度調整   │                                          │
│   └ MECE分解   │  ## 良い例                                │
│                 │  > ...                                   │
│  報告・連絡    │                                          │
│   ├ 結論ファースト│  ## 悪い例                              │
│   └ 障害報告   │  > ...                                   │
│                 │                                          │
│  ...           │                                          │
└─────────────────┴──────────────────────────────────────────┘
```

### 削除するコンポーネント

- SearchFilter.vue, TermList.vue, TermCard.vue, SkillGuide.vue, ReadingPage.vue
- 現在のSidebar.vue（新しいものに置換）

---

## 4. 技術アーキテクチャ

### ai-knowledge-noteからの流用

| 要素 | 流用元 |
|---|---|
| useArticles.js | 自前frontmatterパーサー + Marked + import.meta.glob |
| Sidebar.vue | カテゴリ+記事一覧+検索+タグフィルタ |
| ArticlePage.vue | Markdown HTML表示+タグ+Wikilink |
| App.vue | 2カラムレイアウト+モバイル対応 |

### コンポーネント構成

```
App.vue ─────────── ルート
├── Sidebar.vue ──── 左サイドバー
└── ArticlePage.vue ─ 記事表示
```

7コンポーネント → 3コンポーネント。

### 依存パッケージ

- `marked` — 既にインストール済み (17.0.2)
- `gray-matter` — 不要（自前パーサー使用）

---

## 5. データ移行

### 移行対象と件数

| ソース | 件数 | 移行先 |
|---|---|---|
| SkillGuide.vue ハードコード | 71項目 | `content/カテゴリ/*.md` |
| docs/references/terms.json の terms | ~40項目 | `content/カテゴリ/*.md` (タグ: 用語) |
| docs/references/terms.json の patterns | 複数 | `content/カテゴリ/*.md` (タグ: パターン) |
| docs/references/readings.json | 5件 | `content/カテゴリ/*.md` (タグ: 読解例) |

### 移行スクリプト

Node.jsスクリプトで3つのソース（SkillGuide.vue内データ・terms.json・readings.json）をMarkdownに変換。
