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
