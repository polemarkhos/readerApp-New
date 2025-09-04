<template>
  <li :class="['toc-item', `level-${entry.level}`]">
    <button
      :class="[
        'w-full text-left py-1 px-2 rounded transition-colors',
        'hover:bg-gray-200',
        currentSection === entry.id ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700'
      ]"
      @click="$emit('navigate', entry.id)"
    >
      <span :style="{ paddingLeft: `${(entry.level - 1) * 16}px` }">
        {{ entry.title }}
      </span>
    </button>
  </li>
</template>

<script setup lang="ts">
import type { TocEntry } from '~/utils/teiParser'

interface Props {
  entry: TocEntry
  currentSection?: string
}

defineProps<Props>()

defineEmits<{
  navigate: [sectionId: string]
}>()
</script>

<style scoped>
.level-1 {
  font-weight: 600;
}

.level-2 {
  font-weight: 500;
}

.level-3 {
  font-size: 0.9em;
}

.level-4,
.level-5,
.level-6 {
  font-size: 0.85em;
  color: #6b7280;
}
</style>
