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
