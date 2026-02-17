<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import readingsData from '@data/readings.json'

marked.setOptions({
  breaks: true,
  gfm: true
})

function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}

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
            <div class="col-text markdown-body" v-html="renderMarkdown(para.bad)"></div>
          </div>
          <div class="comparison-col good-col">
            <div class="col-label">良い例</div>
            <div class="col-text markdown-body" v-html="renderMarkdown(para.good)"></div>
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
}

.col-text.markdown-body :deep(h2) {
  font-size: 1rem;
  font-weight: 700;
  margin: 12px 0 6px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.col-text.markdown-body :deep(h2:first-child) {
  margin-top: 0;
}

.col-text.markdown-body :deep(h3) {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 10px 0 4px 0;
}

.col-text.markdown-body :deep(p) {
  margin: 4px 0;
}

.col-text.markdown-body :deep(ul),
.col-text.markdown-body :deep(ol) {
  margin: 4px 0;
  padding-left: 20px;
}

.col-text.markdown-body :deep(li) {
  margin: 2px 0;
}

.col-text.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 0.85rem;
}

.col-text.markdown-body :deep(th),
.col-text.markdown-body :deep(td) {
  padding: 4px 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  text-align: left;
}

.col-text.markdown-body :deep(th) {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.04);
}

.col-text.markdown-body :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.85em;
}

.col-text.markdown-body :deep(strong) {
  font-weight: 700;
}

.col-text.markdown-body :deep(input[type="checkbox"]) {
  margin-right: 4px;
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
