#!/usr/bin/env node
/**
 * コンテンツ品質改善スクリプト
 *
 * 1. カテゴリ間重複の統合（3ペア）
 * 2. パターンファイルの統合（10ペア）
 * 3. 「用語としての意味」セクション削除（28ファイル）
 * 4. セクション名の標準化
 * 5. タグ正規化（スキル/用語/パターン → カテゴリ名）
 * 6. 見出しレベル修正（例文内の ## → ###）
 * 7. テーブルインデント修正
 * 8. ファイル名の特殊文字修正
 * 9. カテゴリ移動
 * 10. updated 日付更新
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.join(__dirname, '..', 'content')
const TODAY = '2026-02-26'

// ─── カテゴリ名マップ ──────────────────────────────────────────────
const CATEGORY_NAMES = {
  'concretization-abstraction': '具体化・抽象化',
  'reporting': '報告・連絡',
  'explanation': '説明・提案',
  'logical-writing': '論理的思考・文章構成',
  'questioning': '質問・確認',
}

// ─── 統計 ────────────────────────────────────────────────────────
const stats = {
  crossCategoryMerged: 0,
  patternMerged: 0,
  termSectionRemoved: 0,
  sectionsRenamed: 0,
  tagsNormalized: 0,
  headingsFixed: 0,
  tablesFixed: 0,
  filesRenamed: 0,
  filesMoved: 0,
  datesUpdated: 0,
  filesDeleted: 0,
  filesProcessed: 0,
}

// ─── ヘルパー ────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return null
  const yamlStr = match[1]
  const body = match[2]
  const data = {}
  for (const line of yamlStr.split('\n')) {
    const kvMatch = line.match(/^(\w+):\s*(.+)$/)
    if (!kvMatch) continue
    const [, key, value] = kvMatch
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^"/, '').replace(/"$/, ''))
    } else if (value.startsWith('"') && value.endsWith('"')) {
      data[key] = value.slice(1, -1)
    } else {
      data[key] = value
    }
  }
  return { data, body }
}

function buildFrontmatter(data) {
  const lines = ['---']
  if (data.title) lines.push(`title: "${data.title}"`)
  if (data.tags) lines.push(`tags: [${data.tags.map(t => `"${t}"`).join(', ')}]`)
  if (data.created) lines.push(`created: "${data.created}"`)
  if (data.updated) lines.push(`updated: "${data.updated}"`)
  lines.push('---')
  return lines.join('\n')
}

/** ファイル本文をセクション（## ）単位で分割 */
function parseSections(body) {
  const sections = []
  let current = { heading: '', content: '' }
  for (const line of body.split('\n')) {
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      if (current.heading || current.content.trim()) {
        sections.push({ ...current, content: current.content })
      }
      current = { heading: line.replace('## ', ''), content: '' }
    } else {
      current.content += line + '\n'
    }
  }
  if (current.heading || current.content.trim()) {
    sections.push({ ...current, content: current.content })
  }
  return sections
}

function buildBody(sections) {
  return sections
    .map(s => s.heading ? `## ${s.heading}\n${s.content}` : s.content)
    .join('')
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf-8')
}

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    stats.filesDeleted++
  }
}

function getCategory(filePath) {
  const rel = path.relative(CONTENT_DIR, filePath)
  return rel.split(path.sep)[0]
}

// ─── Step 1: カテゴリ間重複の統合 ───────────────────────────────

console.log('\n📦 Step 1: カテゴリ間重複の統合')
console.log('─'.repeat(60))

const CROSS_CATEGORY_MERGES = [
  {
    keep: 'explanation/ログレベル設計.md',
    remove: 'logical-writing/ログレベル設計.md',
  },
  {
    keep: 'explanation/AI出力の検証と責任.md',
    remove: 'logical-writing/AI出力の検証と責任.md',
  },
  {
    keep: 'reporting/EOLEnd-of-Life管理.md',
    remove: 'concretization-abstraction/EOLEnd-of-Life管理.md',
  },
]

for (const { keep, remove } of CROSS_CATEGORY_MERGES) {
  const keepPath = path.join(CONTENT_DIR, keep)
  const removePath = path.join(CONTENT_DIR, remove)

  const keepRaw = readFile(keepPath)
  const removeRaw = readFile(removePath)
  if (!keepRaw || !removeRaw) {
    console.log(`  ⚠️ スキップ: ${keep} or ${remove} not found`)
    continue
  }

  const keepParsed = parseFrontmatter(keepRaw)
  const removeParsed = parseFrontmatter(removeRaw)
  if (!keepParsed || !removeParsed) continue

  const keepSections = parseSections(keepParsed.body)
  const removeSections = parseSections(removeParsed.body)

  // removeParsed から keepParsed にない有用セクションを追加
  const keepHeadings = new Set(keepSections.map(s => s.heading))

  // セクション名の正規化マッピング
  const sectionMap = {
    '意味': '説明',
    'アンチパターン': '悪い例',
    '使いどころ': '活用場面',
  }

  for (const sec of removeSections) {
    const normalized = sectionMap[sec.heading] || sec.heading
    if (!keepHeadings.has(normalized) && !keepHeadings.has(sec.heading) && sec.heading) {
      keepSections.push({ heading: normalized, content: sec.content })
    }
  }

  // 具体例: remove版がテーブル付きなら置換
  const removeExample = removeSections.find(s => s.heading === '具体例')
  const keepExample = keepSections.find(s => s.heading === '具体例')
  if (removeExample && keepExample && removeExample.content.includes('|') && !keepExample.content.includes('|')) {
    keepExample.content = removeExample.content
  }

  const newBody = buildBody(keepSections)
  const category = getCategory(keepPath)
  keepParsed.data.tags = [CATEGORY_NAMES[category]]
  keepParsed.data.updated = TODAY
  const newContent = buildFrontmatter(keepParsed.data) + '\n' + newBody
  fs.writeFileSync(keepPath, newContent, 'utf-8')
  deleteFile(removePath)
  stats.crossCategoryMerged++
  console.log(`  ✅ ${keep} ← ${remove}`)
}

// ─── Step 2: パターンファイルの統合 ──────────────────────────────

console.log('\n📦 Step 2: パターンファイルの統合')
console.log('─'.repeat(60))

// -pattern suffix pairs
const patternPairs = []

function findPatternPairs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      findPatternPairs(full)
    } else if (entry.name.endsWith('-pattern.md')) {
      const baseName = entry.name.replace('-pattern.md', '.md')
      const basePath = path.join(dir, baseName)
      if (fs.existsSync(basePath)) {
        patternPairs.push({ base: basePath, pattern: full })
      }
    }
  }
}
findPatternPairs(CONTENT_DIR)

// 追加: V字モデル工程対応パターン.md ↔ V字モデル工程対応.md
const vBasePath = path.join(CONTENT_DIR, 'logical-writing', 'V字モデル工程対応.md')
const vPatternPath = path.join(CONTENT_DIR, 'logical-writing', 'V字モデル工程対応パターン.md')
if (fs.existsSync(vBasePath) && fs.existsSync(vPatternPath)) {
  patternPairs.push({ base: vBasePath, pattern: vPatternPath })
}

for (const { base, pattern } of patternPairs) {
  const baseRaw = readFile(base)
  const patternRaw = readFile(pattern)
  if (!baseRaw || !patternRaw) continue

  const baseParsed = parseFrontmatter(baseRaw)
  const patternParsed = parseFrontmatter(patternRaw)
  if (!baseParsed || !patternParsed) continue

  const baseSections = parseSections(baseParsed.body)
  const patternSections = parseSections(patternParsed.body)

  // パターンから有用セクションを追加
  const baseHeadings = new Set(baseSections.map(s => s.heading))
  const sectionMap = {
    '概要': '説明',
    '良い例': '具体例',
    'アンチパターン': '悪い例',
    '使いどころ': '活用場面',
  }

  for (const sec of patternSections) {
    const normalized = sectionMap[sec.heading] || sec.heading
    if (!baseHeadings.has(normalized) && !baseHeadings.has(sec.heading) && sec.heading) {
      baseSections.push({ heading: normalized, content: sec.content })
    }
  }

  const newBody = buildBody(baseSections)
  const category = getCategory(base)
  baseParsed.data.tags = [CATEGORY_NAMES[category]]
  baseParsed.data.updated = TODAY
  const newContent = buildFrontmatter(baseParsed.data) + '\n' + newBody
  fs.writeFileSync(base, newContent, 'utf-8')
  deleteFile(pattern)
  stats.patternMerged++
  const baseRel = path.relative(CONTENT_DIR, base)
  const patternRel = path.relative(CONTENT_DIR, pattern)
  console.log(`  ✅ ${baseRel} ← ${patternRel}`)
}

// ─── Step 3: ファイル名修正 ─────────────────────────────────────

console.log('\n📝 Step 3: ファイル名修正')
console.log('─'.repeat(60))

const FILE_RENAMES = [
  {
    old: 'concretization-abstraction/AI導入調査：ゼロから成果報告まで.md',
    new: 'concretization-abstraction/AI導入調査-ゼロから成果報告まで.md',
  },
  {
    old: 'logical-writing/V字モデル：設計とテストの観点ずれ.md',
    new: 'logical-writing/V字モデル-設計とテストの観点ずれ.md',
  },
]

for (const rename of FILE_RENAMES) {
  const oldPath = path.join(CONTENT_DIR, rename.old)
  const newPath = path.join(CONTENT_DIR, rename.new)
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath)
    stats.filesRenamed++
    console.log(`  ✅ ${rename.old} → ${rename.new}`)
  }
}

// 特殊: 詳細テスト機能テスト-/-FT.md (ディレクトリになっている)
const ftDirPath = path.join(CONTENT_DIR, 'logical-writing', '詳細テスト機能テスト-')
const ftFilePath = path.join(ftDirPath, '-FT.md')
const ftNewPath = path.join(CONTENT_DIR, 'logical-writing', '詳細テスト-機能テスト-FT.md')
if (fs.existsSync(ftFilePath)) {
  const content = fs.readFileSync(ftFilePath, 'utf-8')
  fs.writeFileSync(ftNewPath, content, 'utf-8')
  fs.unlinkSync(ftFilePath)
  fs.rmdirSync(ftDirPath)
  stats.filesRenamed++
  console.log(`  ✅ 詳細テスト機能テスト-/-FT.md → 詳細テスト-機能テスト-FT.md`)
}

// ─── Step 4: カテゴリ移動 ───────────────────────────────────────

console.log('\n📂 Step 4: カテゴリ移動')
console.log('─'.repeat(60))

const CATEGORY_MOVES = [
  {
    from: 'concretization-abstraction/コードリーディング.md',
    to: 'explanation/コードリーディング.md',
  },
  {
    from: 'concretization-abstraction/ジュニアエンジニアの成長ロードマップ.md',
    to: 'logical-writing/ジュニアエンジニアの成長ロードマップ.md',
  },
]

for (const move of CATEGORY_MOVES) {
  const fromPath = path.join(CONTENT_DIR, move.from)
  const toPath = path.join(CONTENT_DIR, move.to)
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath)
    stats.filesMoved++
    console.log(`  ✅ ${move.from} → ${move.to}`)
  }
}

// ─── Step 5: 全ファイル一括処理 ─────────────────────────────────

console.log('\n🔧 Step 5: 全ファイルのコンテンツ修正')
console.log('─'.repeat(60))

function collectMdFiles(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMdFiles(full))
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      files.push(full)
    }
  }
  return files
}

const allFiles = collectMdFiles(CONTENT_DIR)

// 見出し内の ## を ### に修正すべきファイル
const H2_FIX_FILES = new Set([
  'プルリクエストの書き方.md',
  'TODOチェックリスト作成.md',
  'TODOチェックリスト設計.md',
])

for (const filePath of allFiles) {
  const raw = readFile(filePath)
  if (!raw) continue

  const parsed = parseFrontmatter(raw)
  if (!parsed) continue

  let { data, body } = parsed
  const category = getCategory(filePath)
  const fileName = path.basename(filePath)
  let changed = false

  // ── 5a. タグ正規化 ──
  const catName = CATEGORY_NAMES[category]
  if (catName) {
    const oldTags = data.tags || []
    const hasReadingTag = oldTags.includes('読み物')

    if (hasReadingTag) {
      // 読み物: [読み物, カテゴリ名, レベル]
      const level = oldTags.find(t => ['初級', '中級', '上級'].includes(t))
      data.tags = level ? ['読み物', catName, level] : ['読み物', catName]
    } else {
      data.tags = [catName]
    }

    if (JSON.stringify(oldTags) !== JSON.stringify(data.tags)) {
      stats.tagsNormalized++
      changed = true
    }
  }

  // ── 5b. updated 日付更新 ──
  if (data.updated !== TODAY) {
    data.updated = TODAY
    stats.datesUpdated++
    changed = true
  }

  // ── 5c. セクション処理 ──
  const sections = parseSections(body)
  let sectionsChanged = false

  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = sections[i]

    // 「用語としての意味」セクション削除
    if (sec.heading === '用語としての意味') {
      sections.splice(i, 1)
      stats.termSectionRemoved++
      sectionsChanged = true
      continue
    }

    // セクション名の標準化
    const renames = {
      '意味': '説明',
      '概要': '説明',
      '良い例': '具体例',
      'アンチパターン': '悪い例',
      '使いどころ': '活用場面',
    }

    if (renames[sec.heading]) {
      sec.heading = renames[sec.heading]
      stats.sectionsRenamed++
      sectionsChanged = true
    }
  }

  // ── 5d. 例文内の ## → ### 修正 ──
  if (H2_FIX_FILES.has(fileName)) {
    let inExample = false
    for (const sec of sections) {
      if (sec.heading === '具体例') {
        inExample = true
        // 具体例セクション内の ## を ### に変換
        const lines = sec.content.split('\n')
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].startsWith('## ')) {
            lines[j] = '#' + lines[j] // ## → ###
            stats.headingsFixed++
            sectionsChanged = true
          }
        }
        sec.content = lines.join('\n')
      }
    }
  }

  // ── 5e. テーブルインデント修正 ──
  for (const sec of sections) {
    if (sec.content.includes('  |')) {
      const lines = sec.content.split('\n')
      let tableFixed = false
      for (let j = 0; j < lines.length; j++) {
        if (/^\s+\|/.test(lines[j])) {
          lines[j] = lines[j].replace(/^\s+/, '')
          tableFixed = true
        }
      }
      if (tableFixed) {
        sec.content = lines.join('\n')
        stats.tablesFixed++
        sectionsChanged = true
      }
    }
  }

  // ── 空セクション削除 ──
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].heading && !sections[i].content.trim()) {
      sections.splice(i, 1)
      sectionsChanged = true
    }
  }

  if (sectionsChanged) {
    body = buildBody(sections)
    changed = true
  }

  if (changed) {
    const newContent = buildFrontmatter(data) + '\n' + body
    fs.writeFileSync(filePath, newContent, 'utf-8')
    stats.filesProcessed++
  }
}

// ─── サマリー ────────────────────────────────────────────────────

const finalCount = collectMdFiles(CONTENT_DIR).length

console.log('\n' + '═'.repeat(60))
console.log('📊 実行結果サマリー:')
console.log(`  カテゴリ間重複統合:   ${stats.crossCategoryMerged}`)
console.log(`  パターン統合:         ${stats.patternMerged}`)
console.log(`  用語セクション削除:   ${stats.termSectionRemoved}`)
console.log(`  セクション名変更:     ${stats.sectionsRenamed}`)
console.log(`  タグ正規化:           ${stats.tagsNormalized}`)
console.log(`  見出しレベル修正:     ${stats.headingsFixed}`)
console.log(`  テーブル修正:         ${stats.tablesFixed}`)
console.log(`  ファイル名修正:       ${stats.filesRenamed}`)
console.log(`  カテゴリ移動:         ${stats.filesMoved}`)
console.log(`  日付更新:             ${stats.datesUpdated}`)
console.log(`  ファイル削除:         ${stats.filesDeleted}`)
console.log(`  ファイル変更:         ${stats.filesProcessed}`)
console.log(`  ─────────────────────────────`)
console.log(`  最終ファイル数:       ${finalCount}`)
console.log('═'.repeat(60))
