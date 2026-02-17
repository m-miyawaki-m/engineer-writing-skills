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
