# engineer-writing-skills 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** エンジニア向け日本語ライティングスキル学習アプリを、english-for-it-engineers と同一アーキテクチャで構築する

**Architecture:** Vue 3 + Vite の SPA。JSON データファイルでコンテンツ管理、状態ベースのページ切替（Vue Router 不使用）、GitHub Pages にデプロイ

**Tech Stack:** Vue 3 (Composition API / `<script setup>`), Vite 7, GitHub Actions, GitHub Pages

---

## 設計書 整合性チェック結果

参照プロジェクト（english-for-it-engineers）と設計書を突合し、以下の不整合・未定義事項を検出・解決した。

### 1. データ構造の不整合

| 項目 | 設計書 | 問題 | 解決 |
|------|--------|------|------|
| terms.json の terms 配列フィールド | `id, term, type, category, meaning, example, antiPattern, usage, createdAt` | 参照プロジェクトにある `source`, `session` が未定義 | 本プロジェクトでは不要（英語学習の出典管理とは用途が異なる）。設計書通りで進める |
| terms.json の patterns 配列フィールド | `id, term, type, category, meaning, goodExample, badExample, usage, createdAt` | 整合性OK | そのまま採用 |
| readings.json | 「英語プロジェクトと同構造」とだけ記載 | paragraphs の構造が未定義 | 参照の `en/ja` を `bad/good`（悪い例/良い例）に読み替え。annotations は `type: "skill"/"improvement"/"note"` に変更 |

### 2. コンポーネントの不整合

| 項目 | 設計書 | 問題 | 解決 |
|------|--------|------|------|
| SkillGuide.vue | 設計書に記載あり | 5カテゴリ分の内容が未定義 | 各カテゴリにつき 3〜5 個のスキル項目をハードコードで実装 |
| ReadingPage.vue | 設計書に記載あり | 構造の詳細なし | 参照プロジェクトの ReadingPage.vue をベースに、bad/good 対比表示に改変 |

### 3. 未定義事項

| 項目 | 解決 |
|------|------|
| style.css | 設計書のディレクトリ構造に未記載 → `app/src/assets/style.css` に配置（参照準拠） |
| index.html | 未記載 → `app/index.html` に配置（参照準拠） |
| vite.config.js の base パス | 未記載 → `/engineer-writing-skills/` を設定 |
| `@data` エイリアス | 未記載 → `../docs/references` へのエイリアスを設定（参照準拠） |
| サイドバーのページID | 未記載 → `terms`, `reading`, `skill-concretization-abstraction`, `skill-reporting`, `skill-explanation`, `skill-logical-writing`, `skill-questioning` |

---

## Task 1: プロジェクトスキャフォールディング

**Files:**
- Create: `app/package.json`
- Create: `app/vite.config.js`
- Create: `app/index.html`
- Create: `app/src/main.js`
- Create: `app/src/assets/style.css`
- Create: `.gitignore`

**Step 1: package.json を作成**

```json
{
  "name": "engineer-writing-skills",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.25"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.2",
    "vite": "^7.3.1"
  }
}
```

**Step 2: vite.config.js を作成**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: '/engineer-writing-skills/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@data': resolve(__dirname, '../docs/references')
    }
  }
})
```

**Step 3: index.html を作成**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>エンジニア日本語ライティングスキル</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Step 4: main.js を作成**

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'

createApp(App).mount('#app')
```

**Step 5: style.css を作成**

参照プロジェクトと同一のグローバルスタイル（リセット、フォント、背景色）。

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Sans', 'Noto Sans JP', sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}
```

**Step 6: .gitignore を作成**

```
node_modules/
dist/
.DS_Store
*.local
```

**Step 7: npm install を実行**

Run: `cd app && npm install`
Expected: `node_modules` ディレクトリ生成、ロックファイル作成

**Step 8: コミット**

```bash
git add app/package.json app/vite.config.js app/index.html app/src/main.js app/src/assets/style.css .gitignore app/package-lock.json
git commit -m "feat: scaffold Vue 3 + Vite project"
```

---

## Task 2: データファイル作成

**Files:**
- Create: `docs/references/terms.json`
- Create: `docs/references/readings.json`

**Step 1: terms.json を初期データ付きで作成**

各カテゴリから 1〜2 件ずつ、計 10 件程度のシードデータ。

```json
{
  "terms": [
    {
      "id": "conclusion-first-1",
      "term": "結論ファースト",
      "type": "term",
      "category": "logical-writing",
      "meaning": "最初に結論を述べ、その後に理由や詳細を展開する文章構成法",
      "example": "【結論】本機能はリリース可能です。【理由】全テストが通過し、レビューも完了しています。",
      "antiPattern": "テストを実行しました。全件通過しました。レビューも終わりました。なので、リリース可能です。",
      "usage": "報告・提案・レビューコメントなど、相手に素早く要点を伝えたい場面",
      "createdAt": "2026-02-18"
    },
    {
      "id": "granularity-adjustment-1",
      "term": "粒度調整",
      "type": "term",
      "category": "concretization-abstraction",
      "meaning": "情報の詳細度を相手や目的に合わせて適切に調整すること",
      "example": "【マネージャー向け】認証基盤の移行が完了し、全サービスで新方式が稼働中です。【開発者向け】OAuth 2.0 + PKCE への移行が完了。既存の Session Cookie 認証は 3/1 に廃止予定。",
      "antiPattern": "認証の移行が終わりました。（相手に関わらず同一粒度）",
      "usage": "報告先に応じて技術詳細の深さを変える場面",
      "createdAt": "2026-02-18"
    },
    {
      "id": "escalation-1",
      "term": "エスカレーション",
      "type": "term",
      "category": "reporting",
      "meaning": "自分の権限や能力では対応できない問題を上位者に報告・判断を仰ぐこと",
      "example": "【状況】本番DBのレプリケーション遅延が30分を超えています。【影響】読み取り系APIのデータ不整合リスクあり。【判断依頼】サービス一時停止の判断をお願いします。",
      "antiPattern": "DBがなんかおかしいです。どうしましょう？",
      "usage": "障害対応、リソース不足、方針判断が必要な場面",
      "createdAt": "2026-02-18"
    },
    {
      "id": "ambiguity-elimination-1",
      "term": "曖昧さ排除",
      "type": "term",
      "category": "questioning",
      "meaning": "「適切に」「なるべく早く」等の曖昧表現を具体的な条件・数値に置き換えること",
      "example": "「なるべく早く」→「今週金曜 17:00 まで」、「適切に処理」→「バリデーションエラー時は 400 を返し、エラー内容を errors 配列に格納」",
      "antiPattern": "適切にエラーハンドリングしてください。なるべく早くお願いします。",
      "usage": "要件定義、タスク依頼、レビューコメント",
      "createdAt": "2026-02-18"
    },
    {
      "id": "specification-explanation-1",
      "term": "仕様説明の型",
      "type": "term",
      "category": "explanation",
      "meaning": "仕様を【目的→入力→処理→出力→制約】の順で体系的に説明する方法",
      "example": "【目的】ユーザーのセッション管理。【入力】ログインリクエスト（email, password）。【処理】認証後 JWT を発行。【出力】access_token（有効期限15分）+ refresh_token。【制約】同時セッション数は最大5。",
      "antiPattern": "ログインしたら JWT を返します。",
      "usage": "設計レビュー、API仕様説明、新機能の概要説明",
      "createdAt": "2026-02-18"
    }
  ],
  "patterns": [
    {
      "id": "mece-decomposition-1",
      "term": "MECE分解",
      "type": "pattern",
      "category": "concretization-abstraction",
      "meaning": "漏れなくダブりなく要素を分解する思考法",
      "goodExample": "障害原因を【ネットワーク層】【アプリケーション層】【データベース層】【インフラ層】に分類して調査",
      "badExample": "障害原因を【サーバー】【ネットワーク】【システム】に分類（サーバーとシステムの境界が曖昧で重複あり）",
      "usage": "要件分解、障害分析、タスク分割、テスト観点の洗い出し",
      "createdAt": "2026-02-18"
    },
    {
      "id": "progress-report-template-1",
      "term": "進捗報告テンプレート",
      "type": "pattern",
      "category": "reporting",
      "meaning": "【完了/進行中/未着手/ブロッカー】の4区分で進捗を構造化する報告パターン",
      "goodExample": "【完了】API設計・実装（3/3タスク）\n【進行中】フロント実装（2/5タスク、今日中に3/5予定）\n【未着手】E2Eテスト\n【ブロッカー】ステージング環境の権限待ち（インフラチームに依頼済み）",
      "badExample": "APIは終わりました。フロントをやっています。テストはまだです。あと環境の件があります。",
      "usage": "デイリースタンドアップ、週次報告、プロジェクト状況共有",
      "createdAt": "2026-02-18"
    },
    {
      "id": "review-comment-pattern-1",
      "term": "レビューコメントの型",
      "type": "pattern",
      "category": "explanation",
      "meaning": "【指摘レベル＋理由＋改善案】を明示するコードレビューコメントの書き方",
      "goodExample": "[must] N+1クエリが発生しています。ユーザー100件でクエリが101回実行されます。`includes(:posts)` を追加して eager loading にしてください。",
      "badExample": "ここ、パフォーマンス悪そうです。",
      "usage": "コードレビュー、設計レビュー、ドキュメントレビュー",
      "createdAt": "2026-02-18"
    },
    {
      "id": "causal-chain-1",
      "term": "因果関係の連鎖",
      "type": "pattern",
      "category": "logical-writing",
      "meaning": "原因→結果を明示的に繋いで論理の飛躍を防ぐ文章構成パターン",
      "goodExample": "メモリリークが発生（原因）→ GC頻度が増加（結果1/原因2）→ レスポンスタイムが悪化（結果2/原因3）→ タイムアウトエラーが多発（最終結果）",
      "badExample": "メモリリークがあったのでタイムアウトが多発しました。（中間の因果が省略されていて論理が飛躍）",
      "usage": "障害報告の原因分析、技術選定の根拠説明",
      "createdAt": "2026-02-18"
    },
    {
      "id": "question-template-1",
      "term": "質問の型",
      "type": "pattern",
      "category": "questioning",
      "meaning": "【前提共有＋自分の理解＋具体的な質問】で構成する質問パターン",
      "goodExample": "【前提】認証APIの仕様書 v2.1 を読みました。【自分の理解】refresh_token の有効期限は30日で、期限切れ時は再ログインが必要と理解しています。【質問】refresh_token を自動延長する仕組みは意図的に入れていないのでしょうか？セキュリティ要件との兼ね合いを確認したいです。",
      "badExample": "refresh_token の仕様がよくわかりません。教えてください。",
      "usage": "仕様確認、技術的な疑問の解消、レビューでの確認",
      "createdAt": "2026-02-18"
    }
  ]
}
```

**Step 2: readings.json を初期データ付きで作成**

bad/good 対比形式の実例読解データ。1件のシードデータ。

```json
{
  "readings": [
    {
      "id": "incident-report-example",
      "title": "障害報告の改善例",
      "source": "社内障害報告テンプレート",
      "category": "reporting",
      "level": "中級",
      "createdAt": "2026-02-18",
      "paragraphs": [
        {
          "bad": "今日の14時頃にサーバーが落ちました。たぶんメモリが足りなくなったと思います。再起動したら直りました。",
          "good": "【発生日時】2/18 14:03〜14:21（約18分間）\n【影響範囲】本番APIサーバー2台中1台（web-02）が応答不能\n【原因】バッチ処理のメモリリークにより OOM Killer が発動\n【対応】14:15 に検知、14:21 にプロセス再起動で復旧\n【再発防止】バッチ処理のメモリ上限設定を追加（PR #234）",
          "annotations": [
            {
              "text": "14時頃",
              "type": "improvement",
              "color": "orange",
              "note": "「頃」は曖昧。正確な時刻（14:03）を記載すべき"
            },
            {
              "text": "サーバーが落ちました",
              "type": "improvement",
              "color": "orange",
              "note": "どのサーバーか、影響範囲が不明。「web-02が応答不能」と具体化"
            },
            {
              "text": "たぶん",
              "type": "improvement",
              "color": "orange",
              "note": "推測と事実を区別する。ログやメトリクスに基づく原因を記載"
            },
            {
              "text": "直りました",
              "type": "improvement",
              "color": "orange",
              "note": "何をして直ったのか（対応）と再発防止策が欠落"
            },
            {
              "text": "【発生日時】",
              "type": "skill",
              "color": "blue",
              "note": "5W1H の When を正確に記載。時刻と影響時間を明示"
            },
            {
              "text": "【再発防止】",
              "type": "skill",
              "color": "green",
              "note": "報告の締めに再発防止策を入れることで、報告の価値が大幅に向上"
            }
          ]
        }
      ]
    }
  ]
}
```

**Step 3: コミット**

```bash
git add docs/references/terms.json docs/references/readings.json
git commit -m "feat: add seed data for terms and readings"
```

---

## Task 3: CLAUDE.md とプロジェクト設定

**Files:**
- Create: `CLAUDE.md`
- Create: `.claude/commands/analyze.md`
- Create: `.claude/commands/exercise.md`
- Create: `.claude/commands/plan.md`

**Step 1: CLAUDE.md を作成**

```markdown
# engineer-writing-skills

エンジニアの業務に必要な日本語ライティングスキルを体系的に学習するプロジェクト。

## 技術スタック

- Vue 3 + Vite（`app/` ディレクトリ）
- GitHub Pages（静的ホスティング）
- JSON データファイル（`docs/references/`）

## ディレクトリ構造

- `app/` - Vue 3 + Vite アプリケーション
- `docs/plans/` - 設計・実装計画
- `docs/references/` - terms.json, readings.json
- `docs/exercises/` - 練習問題
- `docs/curriculum/` - 学習カリキュラム

## 開発コマンド

- `cd app && npm run dev` - 開発サーバー起動
- `cd app && npm run build` - プロダクションビルド

## コンテンツカテゴリ

| ID | カテゴリ |
|----|---------|
| concretization-abstraction | 具体化・抽象化 |
| reporting | 報告・連絡 |
| explanation | 説明・提案 |
| logical-writing | 論理的思考・文章構成 |
| questioning | 質問・確認 |

## コミット規約

Conventional Commits 形式を使用。
```

**Step 2: カスタムコマンドを作成**

`analyze.md`:
```markdown
文章の構成・表現を分析し、改善点を指摘してください。分析結果を terms.json に追加すべき用語・パターンがあれば提案してください。

分析対象: $ARGUMENTS
```

`exercise.md`:
```markdown
指定テーマで練習問題を生成してください。問題は「悪い例を改善する」形式とします。

テーマ: $ARGUMENTS
```

`plan.md`:
```markdown
指定スキルカテゴリの学習プランを作成してください。

カテゴリ: $ARGUMENTS
```

**Step 3: コミット**

```bash
git add CLAUDE.md .claude/commands/
git commit -m "feat: add CLAUDE.md and custom commands"
```

---

## Task 4: Sidebar.vue コンポーネント

**Files:**
- Create: `app/src/components/Sidebar.vue`

**Step 1: Sidebar.vue を作成**

```vue
<script setup>
defineProps({
  currentPage: { type: String, required: true }
})

const emit = defineEmits(['navigate'])

const pages = [
  { id: 'terms', label: '用語一覧' },
  { id: 'reading', label: '実例読解' },
  { id: 'skill-concretization-abstraction', label: '具体化・抽象化' },
  { id: 'skill-reporting', label: '報告・連絡' },
  { id: 'skill-explanation', label: '説明・提案' },
  { id: 'skill-logical-writing', label: '論理・構成' },
  { id: 'skill-questioning', label: '質問・確認' }
]
</script>

<template>
  <nav class="sidebar">
    <div class="sidebar-title">Menu</div>
    <ul class="nav-list">
      <li
        v-for="page in pages"
        :key="page.id"
        class="nav-item"
        :class="{ active: currentPage === page.id }"
        @click="emit('navigate', page.id)"
      >
        {{ page.label }}
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.sidebar-title {
  padding: 16px;
  font-weight: 700;
  font-size: 1.1rem;
  border-bottom: 1px solid #e0e0e0;
}

.nav-list {
  list-style: none;
}

.nav-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s;
  border-right: 3px solid transparent;
}

.nav-item:hover {
  background: #f5f5f5;
}

.nav-item.active {
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 600;
  border-right-color: #1565c0;
}
</style>
```

**Step 2: ビルド確認**

Run: `cd app && npx vite build 2>&1 | tail -5`
Expected: ビルドは App.vue が無いためまだ失敗するが、Sidebar.vue の構文エラーがないことを確認

**Step 3: コミット**

```bash
git add app/src/components/Sidebar.vue
git commit -m "feat: add Sidebar navigation component"
```

---

## Task 5: SearchFilter.vue コンポーネント

**Files:**
- Create: `app/src/components/SearchFilter.vue`

**Step 1: SearchFilter.vue を作成**

```vue
<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  selectedCategory: { type: String, default: 'all' },
  selectedType: { type: String, default: 'all' }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCategory',
  'update:selectedType'
])

const categories = [
  { value: 'all', label: 'すべて' },
  { value: 'concretization-abstraction', label: '具体化・抽象化' },
  { value: 'reporting', label: '報告・連絡' },
  { value: 'explanation', label: '説明・提案' },
  { value: 'logical-writing', label: '論理・構成' },
  { value: 'questioning', label: '質問・確認' }
]

const types = [
  { value: 'all', label: 'すべて' },
  { value: 'term', label: '用語' },
  { value: 'pattern', label: 'パターン' }
]
</script>

<template>
  <div class="search-filter">
    <input
      type="text"
      class="search-input"
      placeholder="用語・パターンを検索..."
      :value="searchQuery"
      @input="emit('update:searchQuery', $event.target.value)"
    />
    <div class="filter-row">
      <select
        class="filter-select"
        :value="selectedCategory"
        @change="emit('update:selectedCategory', $event.target.value)"
      >
        <option v-for="c in categories" :key="c.value" :value="c.value">
          {{ c.label }}
        </option>
      </select>
      <select
        class="filter-select"
        :value="selectedType"
        @change="emit('update:selectedType', $event.target.value)"
      >
        <option v-for="t in types" :key="t.value" :value="t.value">
          {{ t.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.search-filter {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-bottom: 8px;
  transition: border-color 0.15s;
}

.search-input:focus {
  outline: none;
  border-color: #1565c0;
}

.filter-row {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1565c0;
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/SearchFilter.vue
git commit -m "feat: add SearchFilter component"
```

---

## Task 6: TermCard.vue コンポーネント

**Files:**
- Create: `app/src/components/TermCard.vue`

**Step 1: TermCard.vue を作成**

```vue
<script setup>
defineProps({
  item: { type: Object, required: true }
})

const categoryLabels = {
  'concretization-abstraction': '具体化・抽象化',
  'reporting': '報告・連絡',
  'explanation': '説明・提案',
  'logical-writing': '論理・構成',
  'questioning': '質問・確認'
}
</script>

<template>
  <div class="term-card">
    <div class="card-header">
      <h3 class="term-name">{{ item.term }}</h3>
      <div class="badges">
        <span class="badge" :class="'badge-' + item.type">
          {{ item.type === 'term' ? '用語' : 'パターン' }}
        </span>
        <span class="badge badge-category">
          {{ categoryLabels[item.category] || item.category }}
        </span>
      </div>
    </div>
    <p class="meaning">{{ item.meaning }}</p>

    <template v-if="item.type === 'term'">
      <div class="example-section">
        <div class="example-label">良い例</div>
        <div class="example-text good">{{ item.example }}</div>
      </div>
      <div class="example-section" v-if="item.antiPattern">
        <div class="example-label">悪い例</div>
        <div class="example-text bad">{{ item.antiPattern }}</div>
      </div>
    </template>

    <template v-if="item.type === 'pattern'">
      <div class="example-section">
        <div class="example-label">良い例</div>
        <div class="example-text good">{{ item.goodExample }}</div>
      </div>
      <div class="example-section" v-if="item.badExample">
        <div class="example-label">悪い例</div>
        <div class="example-text bad">{{ item.badExample }}</div>
      </div>
    </template>

    <div class="usage" v-if="item.usage">
      <span class="usage-label">活用場面:</span> {{ item.usage }}
    </div>
  </div>
</template>

<style scoped>
.term-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.term-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.badges {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.badge-term {
  background: #e3f2fd;
  color: #1565c0;
}

.badge-pattern {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-category {
  background: #e8f5e9;
  color: #2e7d32;
}

.meaning {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 12px;
}

.example-section {
  margin-bottom: 8px;
}

.example-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  margin-bottom: 4px;
}

.example-text {
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.example-text.good {
  background: #e8f5e9;
  border-left: 3px solid #2e7d32;
}

.example-text.bad {
  background: #fce4ec;
  border-left: 3px solid #c62828;
}

.usage {
  font-size: 0.85rem;
  color: #777;
  margin-top: 8px;
}

.usage-label {
  font-weight: 600;
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/TermCard.vue
git commit -m "feat: add TermCard component"
```

---

## Task 7: TermList.vue コンポーネント

**Files:**
- Create: `app/src/components/TermList.vue`

**Step 1: TermList.vue を作成**

```vue
<script setup>
import { computed } from 'vue'
import TermCard from './TermCard.vue'

const props = defineProps({
  items: { type: Array, required: true },
  searchQuery: { type: String, default: '' },
  selectedCategory: { type: String, default: 'all' },
  selectedType: { type: String, default: 'all' }
})

const filteredItems = computed(() => {
  return props.items.filter(item => {
    const matchesSearch = !props.searchQuery ||
      item.term.includes(props.searchQuery) ||
      item.meaning.includes(props.searchQuery) ||
      (item.example && item.example.includes(props.searchQuery)) ||
      (item.goodExample && item.goodExample.includes(props.searchQuery))
    const matchesCategory = props.selectedCategory === 'all' ||
      item.category === props.selectedCategory
    const matchesType = props.selectedType === 'all' ||
      item.type === props.selectedType
    return matchesSearch && matchesCategory && matchesType
  })
})

const termCount = computed(() =>
  filteredItems.value.filter(i => i.type === 'term').length
)

const patternCount = computed(() =>
  filteredItems.value.filter(i => i.type === 'pattern').length
)
</script>

<template>
  <div class="term-list">
    <div class="stats">
      <span class="stat">用語: <strong>{{ termCount }}</strong></span>
      <span class="stat">パターン: <strong>{{ patternCount }}</strong></span>
      <span class="stat total">合計: <strong>{{ filteredItems.length }}</strong></span>
    </div>
    <TermCard v-for="item in filteredItems" :key="item.id" :item="item" />
    <div v-if="filteredItems.length === 0" class="empty">
      該当する用語・パターンがありません。
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: #777;
}

.stat.total {
  margin-left: auto;
}

.empty {
  text-align: center;
  color: #999;
  padding: 32px;
  font-size: 0.95rem;
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/TermList.vue
git commit -m "feat: add TermList component with filtering"
```

---

## Task 8: SkillGuide.vue コンポーネント

**Files:**
- Create: `app/src/components/SkillGuide.vue`

**Step 1: SkillGuide.vue を作成**

5カテゴリ分のスキル解説を props の `skillId` で切替表示するコンポーネント。

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  skillId: { type: String, required: true }
})

const skillData = {
  'concretization-abstraction': {
    title: '具体化・抽象化',
    description: '要件を適切な粒度に分解し、共通点を抽出して再構成するスキル',
    items: [
      {
        name: '粒度調整',
        description: '相手や目的に応じて情報の詳細レベルを変える',
        example: 'マネージャーには「認証基盤の移行完了」、開発者には「OAuth 2.0 + PKCE 移行完了、Session Cookie は 3/1 廃止」',
        tip: '報告先のロールと意思決定に必要な情報量を意識する'
      },
      {
        name: 'MECE分解',
        description: '漏れなくダブりなく要素を分解する',
        example: '障害調査を【ネットワーク層】【アプリ層】【DB層】【インフラ層】で切る',
        tip: '分解した要素同士に重複がないか、抜けている観点がないか確認する'
      },
      {
        name: '抽象化による共通化',
        description: '個別事象から共通パターンを抽出して再利用可能にする',
        example: '3つの障害事例から「外部API依存サービスの耐障害性不足」という共通課題を抽出',
        tip: '具体→抽象→具体 のサイクルで思考する'
      }
    ]
  },
  'reporting': {
    title: '報告・連絡',
    description: '正確で過不足のない報告・連絡を行うスキル',
    items: [
      {
        name: '障害報告の型',
        description: '発生日時・影響範囲・原因・対応・再発防止の5要素で構成',
        example: '【発生】2/18 14:03\n【影響】API 2台中1台停止\n【原因】OOM\n【対応】再起動\n【防止】メモリ上限追加',
        tip: '推測と事実を明確に分ける。「たぶん」「おそらく」は根拠と共に使う'
      },
      {
        name: '進捗報告の構造化',
        description: '完了・進行中・未着手・ブロッカーの4区分で報告',
        example: '【完了】3/3タスク\n【進行中】2/5タスク\n【未着手】E2E\n【ブロッカー】権限待ち',
        tip: '数値（n/m タスク）を入れることで客観的な進捗度が伝わる'
      },
      {
        name: 'エスカレーション',
        description: '判断を仰ぐべき状況を適切に上位者に報告',
        example: '【状況】+ 【影響】+ 【判断依頼】の3要素セット',
        tip: '「どうしましょう？」ではなく、選択肢を提示して判断を仰ぐ'
      }
    ]
  },
  'explanation': {
    title: '説明・提案',
    description: '技術的内容を相手に正確に伝え、提案を通すスキル',
    items: [
      {
        name: '仕様説明の型',
        description: '目的→入力→処理→出力→制約の順で説明',
        example: '【目的】セッション管理\n【入力】email, password\n【処理】JWT発行\n【出力】access_token + refresh_token\n【制約】同時5セッション',
        tip: '相手が「で、何をすればいいの？」と思わない説明を目指す'
      },
      {
        name: 'レビューコメントの型',
        description: '指摘レベル＋理由＋改善案の3要素',
        example: '[must] N+1クエリ発生。includes(:posts) を追加してください。',
        tip: '[must] [want] [nits] でレベルを明示すると優先度が伝わる'
      },
      {
        name: '技術選定の提案',
        description: '比較軸を明示した上で推奨案を提示',
        example: '【比較軸】パフォーマンス / 学習コスト / コミュニティ\n【候補】A / B / C\n【推奨】Bを推奨。理由は...',
        tip: '結論と根拠をセットにし、反論への事前対応も入れる'
      }
    ]
  },
  'logical-writing': {
    title: '論理的思考・文章構成',
    description: '論理の飛躍なく、読み手が追いやすい文章を構成するスキル',
    items: [
      {
        name: '結論ファースト',
        description: '最初に結論、次に理由・詳細を展開',
        example: '【結論】リリース可能です。【理由】全テスト通過、レビュー完了済み。',
        tip: '特に Slack やメールの1行目は結論にする'
      },
      {
        name: '因果関係の明示',
        description: '原因→結果の連鎖を省略せず書く',
        example: 'メモリリーク → GC頻度増加 → レスポンス悪化 → タイムアウト多発',
        tip: '「なので」「したがって」の前後で論理が繋がっているか確認する'
      },
      {
        name: 'PREP法',
        description: 'Point（結論）→ Reason（理由）→ Example（具体例）→ Point（再結論）',
        example: '【P】Redis を推奨します【R】レイテンシ要件を満たすため【E】ベンチマークで p99 < 5ms【P】よって Redis が最適です',
        tip: '短い文章でも PREP の流れを意識すると説得力が増す'
      }
    ]
  },
  'questioning': {
    title: '質問・確認',
    description: '的確な質問で認識齟齬を防ぎ、議論を前に進めるスキル',
    items: [
      {
        name: '質問の型',
        description: '前提共有＋自分の理解＋具体的質問の3要素',
        example: '【前提】仕様書v2.1を読みました\n【理解】refresh_tokenは30日で期限切れ\n【質問】自動延長しない設計は意図的ですか？',
        tip: '相手が「何を聞きたいのかわからない」と思わない質問を目指す'
      },
      {
        name: '曖昧さの指摘',
        description: '「適切に」「なるべく」を具体的条件に置き換える',
        example: '「なるべく早く」→「今週金曜17:00まで」\n「適切に処理」→「400を返しerrorsに格納」',
        tip: '曖昧ワード検出リスト: 適切に / なるべく / 必要に応じて / 等'
      },
      {
        name: 'クローズドクエスチョンの活用',
        description: 'Yes/No や選択式で回答しやすい質問にする',
        example: '✕「認証どうしますか？」\n○「認証は A.JWT B.Session C.OAuth のどれにしますか？」',
        tip: 'オープン→クローズドの順で絞り込むと効率的'
      }
    ]
  }
}

const currentSkill = computed(() => skillData[props.skillId] || null)
</script>

<template>
  <div class="skill-guide" v-if="currentSkill">
    <h1 class="guide-title">{{ currentSkill.title }}</h1>
    <p class="guide-description">{{ currentSkill.description }}</p>

    <div class="skill-card" v-for="(item, index) in currentSkill.items" :key="index">
      <h2 class="skill-name">{{ item.name }}</h2>
      <p class="skill-description">{{ item.description }}</p>
      <div class="skill-example">
        <div class="example-label">具体例</div>
        <div class="example-content">{{ item.example }}</div>
      </div>
      <div class="skill-tip">
        <span class="tip-label">ポイント:</span> {{ item.tip }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-guide {
  max-width: 800px;
}

.guide-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.guide-description {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 24px;
}

.skill-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.skill-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.skill-description {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 12px;
}

.skill-example {
  margin-bottom: 12px;
}

.example-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  margin-bottom: 4px;
}

.example-content {
  font-size: 0.9rem;
  background: #f5f5f5;
  padding: 10px 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.skill-tip {
  font-size: 0.85rem;
  color: #1565c0;
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 6px;
}

.tip-label {
  font-weight: 600;
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/SkillGuide.vue
git commit -m "feat: add SkillGuide component for 5 writing skill categories"
```

---

## Task 9: ReadingPage.vue コンポーネント

**Files:**
- Create: `app/src/components/ReadingPage.vue`

**Step 1: ReadingPage.vue を作成**

bad/good 対比形式の実例読解ビューア。アノテーションのクリック表示機能付き。

```vue
<script setup>
import { ref, computed } from 'vue'
import readingsData from '@data/readings.json'

const readings = ref(readingsData.readings)
const selectedReading = ref(null)
const selectedAnnotation = ref(null)
const searchQuery = ref('')

const filteredReadings = computed(() => {
  if (!searchQuery.value) return readings.value
  return readings.value.filter(r =>
    r.title.includes(searchQuery.value) ||
    r.category.includes(searchQuery.value)
  )
})

const categoryLabels = {
  'concretization-abstraction': '具体化・抽象化',
  'reporting': '報告・連絡',
  'explanation': '説明・提案',
  'logical-writing': '論理・構成',
  'questioning': '質問・確認'
}

const annotationColors = {
  improvement: '#e65100',
  skill: '#1565c0',
  note: '#2e7d32'
}

function selectReading(reading) {
  selectedReading.value = reading
  selectedAnnotation.value = null
}

function showAnnotation(annotation) {
  selectedAnnotation.value = annotation
}

function closeAnnotation() {
  selectedAnnotation.value = null
}
</script>

<template>
  <div class="reading-page">
    <template v-if="!selectedReading">
      <h1 class="page-title">実例読解</h1>
      <input
        type="text"
        class="search-input"
        placeholder="タイトル・カテゴリで検索..."
        v-model="searchQuery"
      />
      <div class="reading-list">
        <div
          class="reading-item"
          v-for="reading in filteredReadings"
          :key="reading.id"
          @click="selectReading(reading)"
        >
          <h3 class="reading-title">{{ reading.title }}</h3>
          <div class="reading-meta">
            <span class="badge">{{ categoryLabels[reading.category] || reading.category }}</span>
            <span class="level">{{ reading.level }}</span>
            <span class="date">{{ reading.createdAt }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <button class="back-button" @click="selectedReading = null">&larr; 一覧に戻る</button>
      <h1 class="page-title">{{ selectedReading.title }}</h1>
      <p class="reading-source">出典: {{ selectedReading.source }}</p>

      <div
        class="paragraph-pair"
        v-for="(para, index) in selectedReading.paragraphs"
        :key="index"
      >
        <div class="comparison">
          <div class="comparison-col bad-col">
            <div class="col-label">悪い例</div>
            <div class="col-text">{{ para.bad }}</div>
          </div>
          <div class="comparison-col good-col">
            <div class="col-label">良い例</div>
            <div class="col-text">{{ para.good }}</div>
          </div>
        </div>
        <div class="annotations" v-if="para.annotations && para.annotations.length">
          <div class="annotations-label">注釈</div>
          <div class="annotation-tags">
            <span
              class="annotation-tag"
              v-for="(ann, ai) in para.annotations"
              :key="ai"
              :style="{ borderColor: annotationColors[ann.type] || '#999', color: annotationColors[ann.type] || '#999' }"
              @click="showAnnotation(ann)"
            >
              {{ ann.text }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="annotation-modal" v-if="selectedAnnotation" @click.self="closeAnnotation">
      <div class="annotation-content">
        <button class="close-button" @click="closeAnnotation">&times;</button>
        <div class="annotation-type" :style="{ color: annotationColors[selectedAnnotation.type] }">
          {{ selectedAnnotation.type === 'improvement' ? '改善点' : selectedAnnotation.type === 'skill' ? 'スキル' : '補足' }}
        </div>
        <div class="annotation-text-label">「{{ selectedAnnotation.text }}」</div>
        <p class="annotation-note">{{ selectedAnnotation.note }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reading-page {
  max-width: 900px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #1565c0;
}

.reading-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reading-item {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.reading-item:hover {
  border-color: #1565c0;
}

.reading-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.reading-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.8rem;
  color: #777;
}

.badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.back-button {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 16px;
}

.back-button:hover {
  background: #f5f5f5;
}

.reading-source {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 24px;
}

.paragraph-pair {
  margin-bottom: 24px;
}

.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.comparison-col {
  padding: 12px;
  border-radius: 8px;
}

.bad-col {
  background: #fce4ec;
  border: 1px solid #f8bbd0;
}

.good-col {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
}

.col-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.bad-col .col-label {
  color: #c62828;
}

.good-col .col-label {
  color: #2e7d32;
}

.col-text {
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.annotations-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  margin-bottom: 6px;
}

.annotation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.annotation-tag {
  font-size: 0.75rem;
  padding: 3px 8px;
  border: 1px solid;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  transition: background 0.15s;
}

.annotation-tag:hover {
  background: #f5f5f5;
}

.annotation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.annotation-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
  position: relative;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.annotation-type {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.annotation-text-label {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.annotation-note {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/ReadingPage.vue
git commit -m "feat: add ReadingPage with bad/good comparison and annotations"
```

---

## Task 10: App.vue メインコンポーネント

**Files:**
- Create: `app/src/App.vue`

**Step 1: App.vue を作成**

全コンポーネントを統合し、ページ切替ロジックを実装。

```vue
<script setup>
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import SearchFilter from './components/SearchFilter.vue'
import TermList from './components/TermList.vue'
import ReadingPage from './components/ReadingPage.vue'
import SkillGuide from './components/SkillGuide.vue'
import termsData from '@data/terms.json'

const currentPage = ref('terms')
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedType = ref('all')

const allItems = computed(() => [
  ...termsData.terms,
  ...termsData.patterns
])

const currentSkillId = computed(() => {
  if (currentPage.value.startsWith('skill-')) {
    return currentPage.value.replace('skill-', '')
  }
  return null
})
</script>

<template>
  <Sidebar :currentPage="currentPage" @navigate="currentPage = $event" />
  <main class="main-content">
    <template v-if="currentPage === 'terms'">
      <h1 class="page-title">用語・パターン一覧</h1>
      <SearchFilter
        v-model:searchQuery="searchQuery"
        v-model:selectedCategory="selectedCategory"
        v-model:selectedType="selectedType"
      />
      <TermList
        :items="allItems"
        :searchQuery="searchQuery"
        :selectedCategory="selectedCategory"
        :selectedType="selectedType"
      />
    </template>
    <ReadingPage v-else-if="currentPage === 'reading'" />
    <SkillGuide v-else-if="currentSkillId" :skillId="currentSkillId" />
  </main>
</template>

<style scoped>
.main-content {
  margin-left: 200px;
  padding: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}
</style>
```

**Step 2: ビルド確認**

Run: `cd app && npm run build`
Expected: 正常にビルド完了

**Step 3: 開発サーバーで動作確認**

Run: `cd app && npm run dev`
Expected: ブラウザで全ページが表示・遷移可能

**Step 4: コミット**

```bash
git add app/src/App.vue
git commit -m "feat: add App.vue with page routing and component integration"
```

---

## Task 11: GitHub Actions デプロイワークフロー

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: deploy.yml を作成**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        working-directory: app
        run: npm ci
      - name: Build
        working-directory: app
        run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: app/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: コミット**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Task 12: ビルド検証と最終確認

**Step 1: クリーンビルド**

Run: `cd app && rm -rf node_modules dist && npm install && npm run build`
Expected: エラーなしでビルド完了

**Step 2: dist の確認**

Run: `ls app/dist/`
Expected: index.html, assets/ が存在

**Step 3: 全ファイルをコミット**

漏れがあれば追加コミット。

---

## 実行方法

Plan complete and saved to `docs/plans/2026-02-18-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
