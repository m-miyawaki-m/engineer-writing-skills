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
