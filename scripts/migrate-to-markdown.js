/**
 * migrate-to-markdown.js
 *
 * 3 つのデータソースを Markdown 記事に変換するスクリプト
 *   1. SkillGuide.vue  -- skillData (5 カテゴリ, 71 アイテム)
 *   2. terms.json       -- terms (~40) + patterns (~10)
 *   3. readings.json    -- readings (5+)
 *
 * 使い方:
 *   node scripts/migrate-to-markdown.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

/** 日本語対応のスラッグ化: スペース・ドットをハイフンに、連続ハイフンを統合 */
function slugify(name) {
  return name
    .trim()
    .replace(/[\s.・]+/g, '-')       // スペース・ドット・中点 → ハイフン
    .replace(/[()（）【】「」]/g, '') // 括弧類を除去
    .replace(/--+/g, '-')            // 連続ハイフンを統合
    .replace(/^-|-$/g, '')           // 先頭・末尾のハイフンを除去
}

/** YAML frontmatter 付き Markdown を生成 */
function buildMarkdown({ title, tags, created, updated, sections }) {
  const tagStr = tags.map(t => `"${t}"`).join(', ')
  let md = `---\ntitle: "${title}"\ntags: [${tagStr}]\ncreated: "${created}"\nupdated: "${updated}"\n---\n`
  for (const { heading, body } of sections) {
    md += `\n## ${heading}\n\n${body}\n`
  }
  return md
}

/** ファイルを書き出し (ディレクトリがなければ作成) */
function writeFile(filePath, content) {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, content, 'utf-8')
}

// ---------------------------------------------------------------------------
// 1. SkillGuide.vue から skillData を抽出
// ---------------------------------------------------------------------------

function extractSkillData() {
  const vuePath = join(ROOT, 'app/src/components/SkillGuide.vue')
  const skillVueContent = readFileSync(vuePath, 'utf-8')

  // skillData オブジェクトを抽出 (行 19 ~ 482 付近)
  const skillDataMatch = skillVueContent.match(
    /const skillData = (\{[\s\S]*?\n\})\s*\n\s*const currentSkill/
  )
  if (!skillDataMatch) {
    throw new Error('skillData の抽出に失敗しました')
  }

  // new Function で JS オブジェクトとして評価
  const fn = new Function(`return ${skillDataMatch[1]}`)
  return fn()
}

// ---------------------------------------------------------------------------
// 2. スキルアイテム → Markdown
// ---------------------------------------------------------------------------

function migrateSkillItems(skillData) {
  const files = {} // { category: { slug: filePath } }
  let count = 0

  for (const [category, data] of Object.entries(skillData)) {
    files[category] = {}
    for (const item of data.items) {
      const slug = slugify(item.name)
      const filePath = join(ROOT, 'content', category, `${slug}.md`)
      const sections = [
        { heading: '説明', body: item.description },
        { heading: '具体例', body: item.example },
        { heading: 'ポイント', body: item.tip },
      ]
      const md = buildMarkdown({
        title: item.name,
        tags: ['スキル'],
        created: '2026-02-18',
        updated: '2026-02-26',
        sections,
      })
      writeFile(filePath, md)
      files[category][slug] = filePath
      count++
    }
  }

  console.log(`[skill] ${count} 件の Markdown を生成しました`)
  return files
}

// ---------------------------------------------------------------------------
// 3. terms.json → Markdown (term + pattern)
// ---------------------------------------------------------------------------

function migrateTerms(existingFiles) {
  const termsPath = join(ROOT, 'docs/references/terms.json')
  const { terms, patterns } = JSON.parse(readFileSync(termsPath, 'utf-8'))
  let termCount = 0
  let patternCount = 0
  let mergeCount = 0

  // --- terms ---
  for (const t of terms) {
    const slug = slugify(t.term)
    const category = t.category

    // 同一カテゴリ・同一スラッグのスキルファイルが既にあれば追記マージ
    if (existingFiles[category] && existingFiles[category][slug]) {
      const filePath = existingFiles[category][slug]
      let existing = readFileSync(filePath, 'utf-8')

      // tags に "用語" を追加
      existing = existing.replace(
        /tags: \[([^\]]*)\]/,
        (match, inner) => {
          if (inner.includes('用語')) return match
          return `tags: [${inner}, "用語"]`
        }
      )

      // 用語セクションを追記
      const extra = buildTermSections(t)
      existing = existing.trimEnd() + '\n' + extra
      writeFile(filePath, existing)
      mergeCount++
    } else {
      // 新規ファイル
      const filePath = join(ROOT, 'content', category, `${slug}.md`)
      const sections = [
        { heading: '意味', body: t.meaning },
        { heading: '具体例', body: t.example },
        { heading: 'アンチパターン', body: t.antiPattern },
        { heading: '使いどころ', body: t.usage },
      ]
      const md = buildMarkdown({
        title: t.term,
        tags: ['用語'],
        created: t.createdAt || '2026-02-18',
        updated: '2026-02-26',
        sections,
      })
      writeFile(filePath, md)
      if (!existingFiles[category]) existingFiles[category] = {}
      existingFiles[category][slug] = filePath
    }
    termCount++
  }

  // --- patterns 配列 (pattern 型 + term 型が混在) ---
  for (const p of patterns) {
    const category = p.category

    if (p.type === 'term') {
      // patterns 配列に含まれる term 型 → terms と同じ処理
      const slug = slugify(p.term)

      if (existingFiles[category] && existingFiles[category][slug]) {
        // 既存スキルファイルにマージ
        const filePath = existingFiles[category][slug]
        let existing = readFileSync(filePath, 'utf-8')
        existing = existing.replace(
          /tags: \[([^\]]*)\]/,
          (match, inner) => {
            if (inner.includes('用語')) return match
            return `tags: [${inner}, "用語"]`
          }
        )
        const extra = buildTermSections(p)
        existing = existing.trimEnd() + '\n' + extra
        writeFile(filePath, existing)
        mergeCount++
      } else {
        // 新規ファイル
        const filePath = join(ROOT, 'content', category, `${slug}.md`)
        const sections = [
          { heading: '意味', body: p.meaning },
          { heading: '具体例', body: p.example },
          { heading: 'アンチパターン', body: p.antiPattern },
          { heading: '使いどころ', body: p.usage },
        ]
        const md = buildMarkdown({
          title: p.term,
          tags: ['用語'],
          created: p.createdAt || '2026-02-18',
          updated: '2026-02-26',
          sections,
        })
        writeFile(filePath, md)
        if (!existingFiles[category]) existingFiles[category] = {}
        existingFiles[category][slug] = filePath
      }
      termCount++
    } else {
      // 実際の pattern 型
      const baseSlug = slugify(p.term)

      // 同一スラッグが既存ならサフィックス "-pattern" を付ける
      let slug = baseSlug
      if (existingFiles[category] && existingFiles[category][baseSlug]) {
        slug = `${baseSlug}-pattern`
      }

      const filePath = join(ROOT, 'content', category, `${slug}.md`)
      const sections = [
        { heading: '概要', body: p.meaning },
        { heading: '良い例', body: p.goodExample },
        { heading: '悪い例', body: p.badExample },
        { heading: '使いどころ', body: p.usage },
      ]
      const md = buildMarkdown({
        title: p.term,
        tags: ['パターン'],
        created: p.createdAt || '2026-02-18',
        updated: '2026-02-26',
        sections,
      })
      writeFile(filePath, md)
      if (!existingFiles[category]) existingFiles[category] = {}
      existingFiles[category][slug] = filePath
      patternCount++
    }
  }

  console.log(
    `[terms] ${termCount} 件の用語, ${patternCount} 件のパターンを生成しました (${mergeCount} 件はスキルとマージ)`
  )
}

/** 用語の追記セクションを組み立てる */
function buildTermSections(t) {
  let md = ''
  md += `\n## 用語としての意味\n\n${t.meaning}\n`
  if (t.antiPattern) {
    md += `\n## アンチパターン\n\n${t.antiPattern}\n`
  }
  if (t.usage) {
    md += `\n## 使いどころ\n\n${t.usage}\n`
  }
  return md
}

// ---------------------------------------------------------------------------
// 4. readings.json → Markdown
// ---------------------------------------------------------------------------

function migrateReadings(existingFiles) {
  const readingsPath = join(ROOT, 'docs/references/readings.json')
  const { readings } = JSON.parse(readFileSync(readingsPath, 'utf-8'))
  let count = 0

  for (const r of readings) {
    const baseSlug = slugify(r.title)
    const category = r.category

    // 同一スラッグが既存ならサフィックス "-reading" を付ける
    let slug = baseSlug
    if (existingFiles[category] && existingFiles[category][baseSlug]) {
      slug = `${baseSlug}-reading`
    }

    const filePath = join(ROOT, 'content', category, `${slug}.md`)
    const sections = [
      { heading: '概要', body: `出典: ${r.source} / レベル: ${r.level}` },
    ]

    // paragraphs を変換
    for (let i = 0; i < r.paragraphs.length; i++) {
      const p = r.paragraphs[i]
      const idx = r.paragraphs.length > 1 ? ` ${i + 1}` : ''

      sections.push({
        heading: `悪い例${idx}`,
        body: p.bad,
      })
      sections.push({
        heading: `良い例${idx}`,
        body: p.good,
      })

      // annotations をまとめて「解説」セクションにする
      if (p.annotations && p.annotations.length > 0) {
        const annotationLines = p.annotations.map(a => {
          const typeLabel =
            a.type === 'improvement'
              ? '改善点'
              : a.type === 'skill'
                ? 'スキル'
                : 'ノート'
          return `- **${typeLabel}**: 「${a.text}」 -- ${a.note}`
        })
        sections.push({
          heading: `解説${idx}`,
          body: annotationLines.join('\n'),
        })
      }
    }

    const md = buildMarkdown({
      title: r.title,
      tags: ['読み物', r.level],
      created: r.createdAt || '2026-02-18',
      updated: '2026-02-26',
      sections,
    })
    writeFile(filePath, md)
    if (!existingFiles[category]) existingFiles[category] = {}
    existingFiles[category][slug] = filePath
    count++
  }

  console.log(`[readings] ${count} 件の読み物を生成しました`)
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------

function main() {
  console.log('=== Markdown 移行スクリプト開始 ===\n')

  // 1. skillData 抽出 & 変換
  const skillData = extractSkillData()
  const existingFiles = migrateSkillItems(skillData)

  // 2. terms/patterns 変換 (マージ含む)
  migrateTerms(existingFiles)

  // 3. readings 変換
  migrateReadings(existingFiles)

  // サマリー
  let total = 0
  for (const category of Object.values(existingFiles)) {
    total += Object.keys(category).length
  }
  console.log(`\n=== 完了: 合計 ${total} ファイル ===`)
}

main()
