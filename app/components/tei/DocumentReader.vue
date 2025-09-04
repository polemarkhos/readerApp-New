<template>
  <div class="tei-reader">
    <!-- Document Header -->
    <header class="mb-8 pb-6 border-b border-gray-200">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ document.title }}</h1>
      <div class="flex flex-wrap gap-4 text-sm text-gray-600">
        <span v-if="document.author" class="flex items-center">
          <Icon name="heroicons:user" class="w-4 h-4 mr-1" />
          {{ document.author }}
        </span>
        <span v-if="document.language" class="flex items-center">
          <Icon name="heroicons:language" class="w-4 h-4 mr-1" />
          {{ document.language }}
        </span>
        <span v-if="document.pubDate" class="flex items-center">
          <Icon name="heroicons:calendar" class="w-4 h-4 mr-1" />
          {{ document.pubDate }}
        </span>
      </div>
      <p v-if="document.description" class="mt-3 text-gray-700 italic">
        {{ document.description }}
      </p>
    </header>

    <!-- Reading Controls -->
    <div class="reading-controls mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="viewMode = 'full'"
        >
          Full Text
        </button>
        <button
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === 'chapters' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="viewMode = 'chapters'"
        >
          By Chapters
        </button>
      </div>

      <!-- Font Size Controls -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Font Size:</span>
        <button
          class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          @click="decreaseFontSize"
        >
          A-
        </button>
        <span class="text-sm px-2">{{ fontSize }}px</span>
        <button
          class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          @click="increaseFontSize"
        >
          A+
        </button>
      </div>
    </div>

    <!-- Content Display -->
    <div 
      class="tei-content prose prose-lg max-w-none"
      :style="{ fontSize: `${fontSize}px`, lineHeight: '1.7' }"
    >
      <!-- Full Text View -->
      <div v-if="viewMode === 'full'" class="full-text-view">
        <div v-html="formattedContent"></div>
      </div>

      <!-- Chapter View -->
      <div v-else-if="viewMode === 'chapters'" class="chapter-view">
        <TeiChapterSection
          v-for="chapter in parsedContent.chapters"
          :key="chapter.id"
          :chapter="chapter"
          :current-chapter="currentChapter"
          @navigate="scrollToChapter"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TeiParser, type TeiContent, type TeiChapter } from '~/utils/teiParser'

interface Props {
  document: {
    id: number
    title: string
    author?: string
    language?: string
    description?: string
    pubDate?: string
    xmlContent: string
  }
}

const props = defineProps<Props>()

// Reactive state
const viewMode = ref<'full' | 'chapters'>('full')
const fontSize = ref(16)
const currentChapter = ref<string | null>(null)

// Parse TEI content
const parsedContent = computed<TeiContent>(() => {
  try {
    return TeiParser.parseXmlContent(props.document.xmlContent)
  } catch (error) {
    console.error('Failed to parse TEI content:', error)
    return {
      title: props.document.title,
      author: props.document.author,
      content: 'Failed to parse document content.',
      chapters: [],
      metadata: { keywords: [] }
    }
  }
})

// Format content for display
const formattedContent = computed(() => {
  return TeiParser.formatContentForDisplay(parsedContent.value.content)
})

// Font size controls
const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
  }
}

// Chapter navigation
const scrollToChapter = (chapterId: string) => {
  currentChapter.value = chapterId
  const element = document.getElementById(chapterId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Detect current chapter while scrolling
const updateCurrentChapter = () => {
  if (viewMode.value !== 'chapters') return

  const chapterElements = document.querySelectorAll('[data-chapter-id]')
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  for (const element of chapterElements) {
    const rect = element.getBoundingClientRect()
    if (rect.top <= 100 && rect.bottom > 100) {
      currentChapter.value = element.getAttribute('data-chapter-id')
      break
    }
  }
}

// Set up scroll listener
onMounted(() => {
  window.addEventListener('scroll', updateCurrentChapter)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateCurrentChapter)
})
</script>

<style scoped>
.tei-reader {
  max-width: 800px;
  margin: 0 auto;
}

.tei-content {
  text-align: justify;
}

.tei-content :deep(p) {
  margin-bottom: 1rem;
}

.tei-content :deep(blockquote) {
  margin: 1.5rem 0;
}

.tei-content :deep(.page-break) {
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
}

.tei-content :deep(.poem) {
  font-style: italic;
  margin: 2rem 0;
}

.tei-content :deep(.verse) {
  margin-bottom: 0.5rem;
}
</style>
