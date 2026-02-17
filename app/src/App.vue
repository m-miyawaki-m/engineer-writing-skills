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
