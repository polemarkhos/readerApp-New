<template>
  <div class="tei-toc bg-gray-50 p-4 rounded-lg border">
    <h3 class="font-bold text-lg mb-4">Table of Contents</h3>
    <nav>
      <ul class="space-y-2">
        <TocItem 
          v-for="entry in tocEntries" 
          :key="entry.id"
          :entry="entry"
          :current-section="currentSection"
          @navigate="$emit('navigate', $event)"
        />
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { TocEntry } from '../../../utils/teiParser'

interface Props {
  tocEntries: TocEntry[]
  currentSection?: string
}

defineProps<Props>()

defineEmits<{
  navigate: [sectionId: string]
}>()
</script>

<style scoped>
.tei-toc {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
