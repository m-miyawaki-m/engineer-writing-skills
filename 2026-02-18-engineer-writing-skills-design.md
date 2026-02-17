# engineer-writing-skills プロジェクト設計

## 概要
エンジニアの日々の業務に必要な日本語力（具体化・抽象化、報告、論理的文章構成 等）を体系的に分類・分析・学習するプロジェクト。

english-for-it-engineers と同じアーキテクチャ（Vue 3 + Vite + JSON + GitHub Pages）を採用し、コンテンツとカテゴリを差し替える。

## 対象者
自分自身（個人学習）

## スキルカテゴリ

| ID | カテゴリ | 内容例 |
|----|---------|--------|
| concretization-abstraction | 具体化・抽象化 | 要件分解、共通点抽出、粒度調整 |
| reporting | 報告・連絡 | 進捗報告、障害報告、エスカレーション |
| explanation | 説明・提案 | 仕様説明、技術選定提案、レビューコメント |
| logical-writing | 論理的思考・文章構成 | MECE、結論ファースト、因果関係 |
| questioning | 質問・確認 | 要件確認、曖昧さ指摘、質問の型 |

## ディレクトリ構造

```
~/dev/engineer-writing-skills/
├── app/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── components/
│   │       ├── Sidebar.vue
│   │       ├── TermList.vue
│   │       ├── SearchFilter.vue
│   │       ├── TermCard.vue
│   │       ├── SkillGuide.vue
│   │       └── ReadingPage.vue
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── plans/
│   ├── references/
│   │   ├── terms.json
│   │   └── readings.json
│   ├── exercises/
│   └── curriculum/
├── .claude/
│   ├── commands/
│   │   ├── analyze.md
│   │   ├── exercise.md
│   │   └── plan.md
│   └── settings.json
├── CLAUDE.md
└── .github/workflows/deploy.yml
```

## データ構造

### terms.json
```json
{
  "terms": [{ "id", "term", "type", "category", "meaning", "example", "antiPattern", "usage", "createdAt" }],
  "patterns": [{ "id", "term", "type", "category", "meaning", "goodExample", "badExample", "usage", "createdAt" }]
}
```

### readings.json
英語プロジェクトと同構造。左に悪い例、右に良い例の対比。または実際の報告文の分析。

## サイドバー構成
- 用語一覧
- 実例読解
- スキル解説（具体化・抽象化）
- スキル解説（報告・連絡）
- スキル解説（説明・提案）
- スキル解説（論理・構成）
- スキル解説（質問・確認）

## カスタムコマンド
- `/analyze` - 文章の構成・表現の改善点を分析し、terms.json に蓄積
- `/exercise` - 指定テーマで練習問題を生成
- `/plan` - 学習プランを作成

## 技術スタック
- Vue 3 + Vite
- GitHub Pages（静的ホスティング）
- JSON データファイル（git 管理）
