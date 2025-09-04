<template>
  <section 
    :id="chapter.id"
    :data-chapter-id="chapter.id"
    :class="[
      'chapter-section mb-8 pb-6',
      chapter.level === 1 ? 'border-b border-gray-200' : ''
    ]"
  >
    <!-- Chapter Header -->
    <header class="mb-4">
      <h2 
        :class="[
          'font-bold mb-3',
          getHeaderClass(chapter.level)
        ]"
      >
        {{ chapter.title }}
      </h2>
    </header>

    <!-- Chapter Content -->
    <div 
      v-if="chapter.content"
      class="chapter-content"
      v-html="formatContent(chapter.content)"
    ></div>

    <!-- Child Chapters -->
    <div v-if="chapter.children.length > 0" class="child-chapters mt-6">
      <TeiChapterSection
        v-for="childChapter in chapter.children"
        :key="childChapter.id"
        :chapter="childChapter"
        :current-chapter="currentChapter"
        @navigate="$emit('navigate', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { TeiParser, type TeiChapter } from '~/utils/teiParser'

interface Props {
  chapter: TeiChapter
  currentChapter?: string | null
}

defineProps<Props>()

defineEmits<{
  navigate: [chapterId: string]
}>()

// Get appropriate header class based on chapter level
const getHeaderClass = (level: number): string => {
  const classes = {
    1: 'text-2xl text-gray-900',
    2: 'text-xl text-gray-800',
    3: 'text-lg text-gray-800',
    4: 'text-base text-gray-700',
    5: 'text-base text-gray-700',
    6: 'text-sm text-gray-600'
  }
  return classes[level as keyof typeof classes] || classes[6]
}

// Format chapter content for display
const formatContent = (content: string): string => {
  return TeiParser.formatContentForDisplay(content)
}
</script>

<style scoped>
.chapter-section {
  scroll-margin-top: 4rem;
}

.chapter-content :deep(p) {
  margin-bottom: 1rem;
  text-align: justify;
}

.chapter-content :deep(blockquote) {
  margin: 1.5rem 0;
}

.chapter-content :deep(.page-break) {
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 2rem 0;
}

.chapter-content :deep(.poem) {
  font-style: italic;
  margin: 2rem 0;
  padding-left: 1rem;
}

.chapter-content :deep(.verse) {
  margin-bottom: 0.5rem;
}

.child-chapters {
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #f3f4f6;
}
</style>
