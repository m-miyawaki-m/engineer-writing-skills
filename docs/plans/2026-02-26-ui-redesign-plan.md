# UI/UXリデザイン 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** engineer-writing-skills を JSON+ハードコード構造から Markdown 記事ベースの 2 カラムレイアウトに移行する

**Architecture:** ai-knowledge-note で実証済みのパターンを移植。`content/` ディレクトリに Markdown ファイルを配置し、Vite の `import.meta.glob` で一括読み込み。`useArticles.js` composable で frontmatter パース + Marked で HTML 変換。コンポーネントは App.vue / Sidebar.vue / ArticlePage.vue の 3 つに集約。

**Tech Stack:** Vue 3 (Composition API) + Vite 7 + Marked 17

**設計書:** `docs/plans/2026-02-26-ui-redesign-design.md`

---

## Task 1: content ディレクトリ構造の作成

**Files:**
- Create: `content/concretization-abstraction/_category.yml`
- Create: `content/reporting/_category.yml`
- Create: `content/explanation/_category.yml`
- Create: `content/logical-writing/_category.yml`
- Create: `content/questioning/_category.yml`

**Step 1: ディレクトリと _category.yml を作成**

```bash
mkdir -p content/concretization-abstraction content/reporting content/explanation content/logical-writing content/questioning
```

各 `_category.yml` の内容:

`content/concretization-abstraction/_category.yml`:
```yaml
name: "具体化・抽象化"
order: 1
```

`content/reporting/_category.yml`:
```yaml
name: "報告・連絡"
order: 2
```

`content/explanation/_category.yml`:
```yaml
name: "説明・提案"
order: 3
```

`content/logical-writing/_category.yml`:
```yaml
name: "論理的思考・文章構成"
order: 4
```

`content/questioning/_category.yml`:
```yaml
name: "質問・確認"
order: 5
```

**Step 2: コミット**

```bash
git add content/
git commit -m "feat: content ディレクトリと _category.yml を作成"
```

---

## Task 2: 移行スクリプトの作成

**Files:**
- Create: `scripts/migrate-to-markdown.js`

**Step 1: 移行スクリプトを作成**

3 つのソースを Markdown に変換する Node.js スクリプト。

```javascript
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const contentDir = join(root, 'content')

// --- 1. SkillGuide.vue からスキルデータを抽出 ---
// SkillGuide.vue のハードコードデータをここに JS オブジェクトとして複製する。
// Vue ファイルから直接 import できないため、データ部分だけ抽出して貼り付け。

// SkillGuide.vue の skillData をそのままコピー（巨大なため、実行時に
// SkillGuide.vue を読み込んで正規表現で抽出する方式を使う）
const skillVuePath = join(root, 'app/src/components/SkillGuide.vue')
const skillVueContent = readFileSync(skillVuePath, 'utf-8')

// skillData オブジェクトを eval で取得（開発用スクリプトのため許容）
const skillDataMatch = skillVueContent.match(/const skillData = (\{[\s\S]*?\n\})/)
if (!skillDataMatch) {
  console.error('skillData not found in SkillGuide.vue')
  process.exit(1)
}

// Function コンストラクタで安全に評価
const skillData = new Function(`return ${skillDataMatch[1]}`)()

// --- 2. terms.json を読み込み ---
const termsJson = JSON.parse(readFileSync(join(root, 'docs/references/terms.json'), 'utf-8'))

// --- 3. readings.json を読み込み ---
const readingsJson = JSON.parse(readFileSync(join(root, 'docs/references/readings.json'), 'utf-8'))

// --- ユーティリティ ---
function slugify(name) {
  // 日本語名からスラッグを生成（英語のIDがあればそれを使う）
  return name
    .toLowerCase()
    .replace(/[（）()]/g, '')
    .replace(/[\s・/／]+/g, '-')
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toMarkdown(frontmatter, sections) {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v.join(', ')}]`
      return `${k}: "${v}"`
    })
    .join('\n')

  return `---\n${fm}\n---\n\n${sections.join('\n\n')}\n`
}

// 重複チェック用の Set（同じスラッグが既に使われていないか）
const usedSlugs = new Map() // slug -> category

// --- 4. SkillGuide データを変換 ---
console.log('=== SkillGuide items ===')
for (const [catSlug, catData] of Object.entries(skillData)) {
  for (const item of catData.items) {
    const slug = slugify(item.name)
    const filePath = join(contentDir, catSlug, `${slug}.md`)

    const frontmatter = {
      title: item.name,
      tags: ['スキルガイド', catData.title],
      created: '2026-02-18',
      updated: '2026-02-26'
    }

    const sections = [`## 説明\n\n${item.description}`]

    if (item.example) {
      sections.push(`## 具体例\n\n${item.example}`)
    }

    if (item.tip) {
      sections.push(`## ポイント\n\n${item.tip}`)
    }

    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, toMarkdown(frontmatter, sections))
    usedSlugs.set(`${catSlug}/${slug}`, 'skill')
    console.log(`  ✓ ${filePath}`)
  }
}

// --- 5. terms.json の terms を変換 ---
console.log('\n=== Terms ===')
for (const term of termsJson.terms) {
  const catSlug = term.category
  let slug = slugify(term.term)

  // スキルガイドで同じスラッグが使われている場合はサフィックスを付ける
  const key = `${catSlug}/${slug}`
  if (usedSlugs.has(key)) {
    // スキルガイドに既に同名の記事がある → 統合（追記）
    const existingPath = join(contentDir, catSlug, `${slug}.md`)
    const existing = readFileSync(existingPath, 'utf-8')

    let appendContent = ''
    if (term.meaning) appendContent += `\n\n## 用語としての定義\n\n${term.meaning}`
    if (term.example) appendContent += `\n\n## 用語の例\n\n${term.example}`
    if (term.antiPattern) appendContent += `\n\n## アンチパターン\n\n${term.antiPattern}`
    if (term.usage) appendContent += `\n\n## 活用場面\n\n${term.usage}`

    // frontmatter の tags に「用語」を追加
    const updatedContent = existing.replace(
      /tags: \[([^\]]*)\]/,
      (match, tags) => {
        if (!tags.includes('用語')) {
          return `tags: [${tags}, 用語]`
        }
        return match
      }
    )

    writeFileSync(existingPath, updatedContent + appendContent)
    console.log(`  ✓ (merged) ${existingPath}`)
    continue
  }

  const filePath = join(contentDir, catSlug, `${slug}.md`)
  const frontmatter = {
    title: term.term,
    tags: ['用語', termsJson.terms.find(t => t.category === catSlug)
      ? Object.entries(skillData).find(([k]) => k === catSlug)?.[1]?.title || catSlug
      : catSlug],
    created: term.createdAt || '2026-02-18',
    updated: '2026-02-26'
  }

  const sections = []
  if (term.meaning) sections.push(`## 説明\n\n${term.meaning}`)
  if (term.example) sections.push(`## 良い例\n\n${term.example}`)
  if (term.antiPattern) sections.push(`## アンチパターン\n\n${term.antiPattern}`)
  if (term.usage) sections.push(`## 活用場面\n\n${term.usage}`)

  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, toMarkdown(frontmatter, sections))
  usedSlugs.set(key, 'term')
  console.log(`  ✓ ${filePath}`)
}

// --- 6. terms.json の patterns を変換 ---
console.log('\n=== Patterns ===')
for (const pattern of termsJson.patterns) {
  const catSlug = pattern.category
  let slug = slugify(pattern.term)

  const key = `${catSlug}/${slug}`
  if (usedSlugs.has(key)) {
    slug = `${slug}-pattern`
  }

  const filePath = join(contentDir, catSlug, `${slug}.md`)
  const catTitle = Object.entries(skillData).find(([k]) => k === catSlug)?.[1]?.title || catSlug

  const frontmatter = {
    title: pattern.term,
    tags: ['パターン', catTitle],
    created: pattern.createdAt || '2026-02-18',
    updated: '2026-02-26'
  }

  const sections = []
  if (pattern.meaning) sections.push(`## 説明\n\n${pattern.meaning}`)
  if (pattern.goodExample) sections.push(`## 良い例\n\n${pattern.goodExample}`)
  if (pattern.badExample) sections.push(`## 悪い例\n\n${pattern.badExample}`)
  if (pattern.usage) sections.push(`## 活用場面\n\n${pattern.usage}`)

  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, toMarkdown(frontmatter, sections))
  usedSlugs.set(`${catSlug}/${slug}`, 'pattern')
  console.log(`  ✓ ${filePath}`)
}

// --- 7. readings.json を変換 ---
console.log('\n=== Readings ===')
for (const reading of readingsJson.readings) {
  const catSlug = reading.category
  let slug = slugify(reading.title)

  const key = `${catSlug}/${slug}`
  if (usedSlugs.has(key)) {
    slug = `${slug}-reading`
  }

  const filePath = join(contentDir, catSlug, `${slug}.md`)
  const catTitle = Object.entries(skillData).find(([k]) => k === catSlug)?.[1]?.title || catSlug

  const frontmatter = {
    title: reading.title,
    tags: ['読解例', catTitle, reading.level || ''],
    created: reading.createdAt || '2026-02-18',
    updated: '2026-02-26'
  }

  const sections = []
  sections.push(`## 概要\n\n出典: ${reading.source}`)

  for (let i = 0; i < reading.paragraphs.length; i++) {
    const p = reading.paragraphs[i]
    const num = reading.paragraphs.length > 1 ? ` ${i + 1}` : ''

    if (p.bad) {
      sections.push(`## 悪い例${num}\n\n${p.bad}`)
    }
    if (p.good) {
      sections.push(`## 良い例${num}\n\n${p.good}`)
    }
    if (p.annotations && p.annotations.length > 0) {
      const annotationLines = p.annotations.map(a => {
        const icon = a.type === 'improvement' ? '⚠️' : a.type === 'skill' ? '✅' : '📝'
        return `- ${icon} **${a.text}**: ${a.note}`
      })
      sections.push(`## 解説${num}\n\n${annotationLines.join('\n')}`)
    }
  }

  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, toMarkdown(frontmatter, sections))
  usedSlugs.set(`${catSlug}/${slug}`, 'reading')
  console.log(`  ✓ ${filePath}`)
}

console.log(`\n=== Summary ===`)
console.log(`Total files: ${usedSlugs.size}`)
for (const type of ['skill', 'term', 'pattern', 'reading']) {
  const count = [...usedSlugs.values()].filter(v => v === type).length
  console.log(`  ${type}: ${count}`)
}
```

**Step 2: スクリプトを実行**

```bash
cd /home/m-miyawaki/dev/engineer-writing-skills
node scripts/migrate-to-markdown.js
```

期待: `content/` 以下に ~100 件の `.md` ファイルが生成される

**Step 3: 生成されたファイルを確認**

```bash
find content -name "*.md" | wc -l
find content -name "*.md" | head -20
cat content/reporting/障害報告の型.md  # サンプル確認
```

**Step 4: コミット**

```bash
git add scripts/ content/
git commit -m "feat: 移行スクリプトで全コンテンツを Markdown に変換"
```

---

## Task 3: useArticles.js composable の作成

**Files:**
- Create: `app/src/composables/useArticles.js`

**Step 1: useArticles.js を作成**

ai-knowledge-note の実装を流用。**重要な修正点:**
- `import { Marked } from 'marked'`（`marked.Marked` ではない）
- `import.meta.glob` のパスは `../../../content/**/*.md`（ファイル相対パス）
- `gray-matter` は使わない（自前 `parseFrontmatter`）

```javascript
import { ref, computed } from 'vue'
import { Marked } from 'marked'

// ブラウザ用の軽量 frontmatter パーサー（gray-matter は Node.js 専用）
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const yamlStr = match[1]
  const content = match[2]
  const data = {}

  for (const line of yamlStr.split('\n')) {
    const kvMatch = line.match(/^(\w+):\s*(.+)$/)
    if (!kvMatch) continue
    const [, key, value] = kvMatch

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim())
    } else if (value.startsWith('"') && value.endsWith('"')) {
      data[key] = value.slice(1, -1)
    } else {
      data[key] = value
    }
  }

  return { data, content }
}

// content/**/*.md を文字列として一括読み込み
// パスはこのファイル（app/src/composables/）からの相対パス
const mdModules = import.meta.glob('../../../content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// _category.yml を読み込み
const categoryModules = import.meta.glob('../../../content/**/_category.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// [[表示テキスト]] Wikilink をクリック可能なリンクに変換する marked 拡張
function createWikilinkExtension(articles) {
  return {
    extensions: [{
      name: 'wikilink',
      level: 'inline',
      start(src) { return src.indexOf('[[') },
      tokenizer(src) {
        const match = src.match(/^\[\[([^\]]+)\]\]/)
        if (match) {
          return {
            type: 'wikilink',
            raw: match[0],
            text: match[1]
          }
        }
      },
      renderer(token) {
        const article = articles.find(a =>
          a.title === token.text ||
          a.title.includes(token.text) ||
          token.text.includes(a.title)
        )
        if (article) {
          return `<a href="#" class="wikilink" data-slug="${article.slug}">${token.text}</a>`
        }
        return `<span class="wikilink-unresolved">${token.text}</span>`
      }
    }]
  }
}

function parseCategory(raw) {
  const lines = raw.trim().split('\n')
  const result = {}
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*"?([^"]*)"?$/)
    if (match) {
      const [, key, value] = match
      result[key] = isNaN(value) ? value : Number(value)
    }
  }
  return result
}

export function useArticles() {
  // カテゴリ情報をパース
  const categories = {}
  for (const [path, raw] of Object.entries(categoryModules)) {
    const catSlug = path.match(/content\/([^/]+)\//)?.[1]
    if (catSlug) {
      categories[catSlug] = parseCategory(raw)
    }
  }

  // 記事をパース
  const articleList = []
  for (const [path, raw] of Object.entries(mdModules)) {
    const slug = path.match(/\/([^/]+)\.md$/)?.[1]
    const category = path.match(/content\/([^/]+)\//)?.[1]
    if (!slug || !category) continue

    const { data: frontmatter, content } = parseFrontmatter(raw)
    articleList.push({
      slug,
      category,
      title: frontmatter.title || slug,
      tags: frontmatter.tags || [],
      created: frontmatter.created || null,
      updated: frontmatter.updated || null,
      rawContent: content
    })
  }

  // marked インスタンスを設定（Wikilink 対応）
  const markedInstance = new Marked()
  markedInstance.use(createWikilinkExtension(articleList))

  // HTML を生成
  for (const article of articleList) {
    article.html = markedInstance.parse(article.rawContent)
  }

  // カテゴリ順でソート
  const sortedCategories = computed(() => {
    return Object.entries(categories)
      .sort(([, a], [, b]) => (a.order || 99) - (b.order || 99))
      .map(([slug, meta]) => ({ slug, ...meta }))
  })

  // カテゴリ別記事マップ
  const articlesByCategory = computed(() => {
    const map = {}
    for (const cat of sortedCategories.value) {
      map[cat.slug] = articleList
        .filter(a => a.category === cat.slug)
        .sort((a, b) => (a.title > b.title ? 1 : -1))
    }
    return map
  })

  // 全タグ一覧
  const allTags = computed(() => {
    const tags = new Set()
    for (const a of articleList) {
      for (const t of a.tags) tags.add(t)
    }
    return [...tags].sort()
  })

  // 記事検索
  function searchArticles(query) {
    if (!query) return articleList
    const q = query.toLowerCase()
    return articleList.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.rawContent.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  // スラッグで記事を取得
  function getArticle(slug) {
    return articleList.find(a => a.slug === slug) || null
  }

  return {
    articles: articleList,
    categories: sortedCategories,
    articlesByCategory,
    allTags,
    searchArticles,
    getArticle
  }
}
```

**Step 2: コミット**

```bash
git add app/src/composables/
git commit -m "feat: useArticles.js composable を追加"
```

---

## Task 4: Sidebar.vue の作成（新規）

**Files:**
- Create: `app/src/components/Sidebar.vue` (既存を完全置換)

**Step 1: Sidebar.vue を ai-knowledge-note ベースで作成**

ai-knowledge-note の Sidebar.vue をほぼそのまま流用。ヘッダーのテキストとテーマカラーを変更。

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  articlesByCategory: { type: Object, default: () => ({}) },
  selectedSlug: { type: String, default: '' },
  filterTag: { type: String, default: '' }
})

const emit = defineEmits(['select', 'clear-filter'])

const searchQuery = ref('')
const expandedCategories = ref(new Set())

// 初期状態で全カテゴリを展開
watch(() => props.categories, (cats) => {
  if (cats.length > 0 && expandedCategories.value.size === 0) {
    cats.forEach(c => expandedCategories.value.add(c.slug))
  }
}, { immediate: true })

const filteredArticles = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const tag = props.filterTag

  const result = {}
  for (const [catSlug, articles] of Object.entries(props.articlesByCategory)) {
    let filtered = articles
    if (tag) {
      filtered = filtered.filter(a => a.tags.includes(tag))
    }
    if (q) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        (a.rawContent && a.rawContent.toLowerCase().includes(q))
      )
    }
    if (filtered.length > 0) result[catSlug] = filtered
  }
  return result
})

function toggleCategory(slug) {
  if (expandedCategories.value.has(slug)) {
    expandedCategories.value.delete(slug)
  } else {
    expandedCategories.value.add(slug)
  }
}

function selectArticle(slug) {
  emit('select', slug)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Writing Skills</h2>
    </div>

    <div class="sidebar-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="記事を検索..."
        class="search-input"
      />
    </div>

    <div v-if="filterTag" class="sidebar-filter">
      <span class="filter-label">タグ: {{ filterTag }}</span>
      <button class="filter-clear" @click="emit('clear-filter')">✕</button>
    </div>

    <nav class="sidebar-nav">
      <template v-for="cat in categories" :key="cat.slug">
        <div
          v-if="filteredArticles[cat.slug]?.length"
          class="category-group"
        >
          <button
            class="category-header"
            @click="toggleCategory(cat.slug)"
          >
            <span class="category-arrow" :class="{ expanded: expandedCategories.has(cat.slug) }">
              ▶
            </span>
            {{ cat.name }}
            <span class="category-count">{{ filteredArticles[cat.slug]?.length || 0 }}</span>
          </button>

          <ul v-if="expandedCategories.has(cat.slug)" class="article-list">
            <li
              v-for="article in filteredArticles[cat.slug]"
              :key="article.slug"
              class="article-item"
              :class="{ selected: article.slug === selectedSlug }"
              @click="selectArticle(article.slug)"
            >
              {{ article.title }}
            </li>
          </ul>
        </div>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px 16px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #1565c0;
  margin: 0;
}

.sidebar-search {
  padding: 8px 16px;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.search-input:focus {
  border-color: #1565c0;
}

.sidebar-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 16px;
  background: #e3f2fd;
  font-size: 12px;
  color: #1565c0;
}

.filter-clear {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #1565c0;
  padding: 0 4px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #1565c0;
  text-align: left;
}

.category-header:hover {
  background: #f0f0f0;
}

.category-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  display: inline-block;
}

.category-arrow.expanded {
  transform: rotate(90deg);
}

.category-count {
  margin-left: auto;
  font-size: 11px;
  color: #999;
  font-weight: 400;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  padding: 6px 16px 6px 32px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.article-item:hover {
  background: #f0f0f0;
}

.article-item.selected {
  background: #e3f2fd;
  border-left-color: #1565c0;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    z-index: 100;
    transition: left 0.3s;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }

  .sidebar.open {
    left: 0;
  }
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/Sidebar.vue
git commit -m "feat: Sidebar.vue を 2 カラム記事ベースに置換"
```

---

## Task 5: ArticlePage.vue の作成

**Files:**
- Create: `app/src/components/ArticlePage.vue`

**Step 1: ArticlePage.vue を ai-knowledge-note ベースで作成**

ai-knowledge-note の ArticlePage.vue をほぼそのまま流用。テーマカラーを青系に変更。

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  article: { type: Object, default: null }
})

const emit = defineEmits(['navigate', 'tag-click'])

function handleContentClick(e) {
  const link = e.target.closest('.wikilink')
  if (link) {
    e.preventDefault()
    const slug = link.dataset.slug
    if (slug) emit('navigate', slug)
  }
}

const formattedDate = computed(() => {
  if (!props.article?.updated) return ''
  return String(props.article.updated)
})
</script>

<template>
  <main class="article-page">
    <template v-if="article">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div v-if="article.tags.length" class="article-tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="tag"
              @click="emit('tag-click', tag)"
            >
              {{ tag }}
            </span>
          </div>
          <span v-if="formattedDate" class="article-date">
            更新: {{ formattedDate }}
          </span>
        </div>
      </header>

      <div
        class="article-content"
        v-html="article.html"
        @click="handleContentClick"
      />
    </template>

    <div v-else class="article-empty">
      <p>左のメニューから記事を選択してください</p>
    </div>
  </main>
</template>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.article-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.article-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.tag:hover {
  background: #e0e0e0;
}

.article-date {
  font-size: 12px;
  color: #999;
}

.article-content {
  line-height: 1.8;
  color: #333;
  font-size: 15px;
}

.article-content :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.article-content :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 8px;
}

.article-content :deep(p) {
  margin: 0 0 12px;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 0 0 12px;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin-bottom: 4px;
}

.article-content :deep(strong) {
  font-weight: 600;
  color: #1a1a1a;
}

.article-content :deep(code) {
  background: #f5f5f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.article-content :deep(pre) {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 12px;
}

.article-content :deep(pre code) {
  background: none;
  padding: 0;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 6px 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.article-content :deep(th) {
  font-weight: 600;
  background: #f8f8f8;
}

.article-content :deep(blockquote) {
  border-left: 3px solid #1565c0;
  padding-left: 16px;
  margin: 12px 0;
  color: #555;
}

.article-content :deep(.wikilink) {
  color: #1565c0;
  text-decoration: none;
  border-bottom: 1px dashed #1565c0;
  cursor: pointer;
}

.article-content :deep(.wikilink:hover) {
  border-bottom-style: solid;
}

.article-content :deep(.wikilink-unresolved) {
  color: #999;
}

.article-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: #999;
}

@media (max-width: 768px) {
  .article-page {
    padding: 16px;
  }

  .article-title {
    font-size: 20px;
  }
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/components/ArticlePage.vue
git commit -m "feat: ArticlePage.vue を追加"
```

---

## Task 6: App.vue の書き換え

**Files:**
- Modify: `app/src/App.vue`

**Step 1: App.vue を 2 カラムレイアウトに書き換え**

旧コンポーネント（SearchFilter, TermList, ReadingPage, SkillGuide）の import を全て削除し、新しい Sidebar + ArticlePage 構成に置換。

```vue
<script setup>
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import ArticlePage from './components/ArticlePage.vue'
import { useArticles } from './composables/useArticles.js'

const { articles, categories, articlesByCategory, getArticle } = useArticles()

const selectedSlug = ref(null)
const sidebarOpen = ref(false)
const filterTag = ref('')

// 初期表示: 最初のカテゴリの最初の記事を選択
const firstCat = categories.value[0]
if (firstCat) {
  const firstArticles = articlesByCategory.value[firstCat.slug]
  if (firstArticles?.length) {
    selectedSlug.value = firstArticles[0].slug
  }
}

const selectedArticle = computed(() => {
  if (!selectedSlug.value) return null
  return getArticle(selectedSlug.value)
})

function handleSelect(slug) {
  selectedSlug.value = slug
  sidebarOpen.value = false
}

function handleNavigate(slug) {
  selectedSlug.value = slug
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleTagClick(tag) {
  filterTag.value = filterTag.value === tag ? '' : tag
}

function handleClearFilter() {
  filterTag.value = ''
}
</script>

<template>
  <div class="app-layout">
    <!-- Mobile header -->
    <header class="mobile-header">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
      <span class="mobile-title">Writing Skills</span>
    </header>

    <!-- Sidebar -->
    <Sidebar
      :categories="categories"
      :articles-by-category="articlesByCategory"
      :selected-slug="selectedSlug"
      :filter-tag="filterTag"
      :class="{ open: sidebarOpen }"
      @select="handleSelect"
      @clear-filter="handleClearFilter"
    />

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="main-area">
      <ArticlePage
        :article="selectedArticle"
        @navigate="handleNavigate"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

.mobile-header {
  display: none;
}

.main-area {
  flex: 1;
  overflow-y: auto;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    z-index: 50;
  }

  .menu-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 700;
    color: #1565c0;
  }

  .main-area {
    margin-top: 48px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
  }
}
</style>
```

**Step 2: コミット**

```bash
git add app/src/App.vue
git commit -m "feat: App.vue を 2 カラムレイアウトに書き換え"
```

---

## Task 7: 旧コンポーネントの削除

**Files:**
- Delete: `app/src/components/SearchFilter.vue`
- Delete: `app/src/components/TermList.vue`
- Delete: `app/src/components/TermCard.vue`
- Delete: `app/src/components/ReadingPage.vue`
- Delete: `app/src/components/SkillGuide.vue`

**Step 1: 旧コンポーネントを削除**

```bash
rm app/src/components/SearchFilter.vue \
   app/src/components/TermList.vue \
   app/src/components/TermCard.vue \
   app/src/components/ReadingPage.vue \
   app/src/components/SkillGuide.vue
```

**Step 2: コミット**

```bash
git add -u app/src/components/
git commit -m "refactor: 旧コンポーネント 5 つを削除"
```

---

## Task 8: vite.config.js の更新

**Files:**
- Modify: `app/vite.config.js`

**Step 1: `@data` alias を削除**

旧 `@data` alias は terms.json / readings.json 向けだったが、もう不要。

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/engineer-writing-skills/',
  plugins: [vue()]
})
```

**Step 2: コミット**

```bash
git add app/vite.config.js
git commit -m "refactor: vite.config.js から不要な @data alias を削除"
```

---

## Task 9: 動作確認

**Step 1: 開発サーバーを起動**

```bash
cd /home/m-miyawaki/dev/engineer-writing-skills/app
npm run dev
```

**Step 2: ブラウザで確認**

確認項目:
- [ ] サイドバーに 5 カテゴリが表示される
- [ ] 各カテゴリに記事一覧が表示される
- [ ] 記事をクリックすると右側に本文が表示される
- [ ] 検索バーでタイトル・本文を横断検索できる
- [ ] タグをクリックするとフィルタがかかる
- [ ] モバイル表示（ウィンドウを狭めて）でハンバーガーメニューが動作する

**Step 3: エラーがあれば修正**

ブラウザコンソールで JS エラーがないことを確認。

---

## Task 10: ビルド確認

**Step 1: プロダクションビルド**

```bash
cd /home/m-miyawaki/dev/engineer-writing-skills/app
npm run build
```

期待: エラーなくビルド完了

**Step 2: プレビュー確認**

```bash
npm run preview
```

ブラウザで `/engineer-writing-skills/` にアクセスして表示確認。

**Step 3: コミット**

```bash
git add -A
git commit -m "chore: ビルド確認完了"
```

---

## Task 11: プッシュとデプロイ確認

**Step 1: プッシュ**

```bash
git push origin master
```

**Step 2: GitHub Pages デプロイ確認**

GitHub Actions のワークフロー完了を待ち、公開 URL で動作確認。
