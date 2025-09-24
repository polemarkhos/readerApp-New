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
    <div class="tei-content prose prose-lg max-w-none">
      <!-- Debug info (keeping for now) -->
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
        <h3 class="text-blue-800 font-semibold">Debug Info</h3>
        <p class="text-blue-600 text-sm">Document title: {{ document.title }}</p>
        <p class="text-blue-600 text-sm">Divisions available: {{ document.divisions?.length || 0 }}</p>
        <p class="text-blue-600 text-sm">XML Content length: {{ document.xmlContent?.length || 'No content' }}</p>
      </div>
      
      <!-- Extracted content -->
      <div class="content-display" v-html="textContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  document: {
    id: number
    title: string
    author?: string
    language?: string
    description?: string
    pubDate?: string
    xmlContent: string
    divisions?: Array<{
      id: number
      head: string
      content: string
      xmlId: string
      order: number
      type: string
      level: number
      n: string
    }>
  }
}

const props = defineProps<Props>()

// Simple content extraction without complex parsing
const textContent = computed(() => {
  // If we have divisions from the database, use them
  if (props.document.divisions && props.document.divisions.length > 0) {
    return props.document.divisions
      .sort((a, b) => a.order - b.order)
      .map(division => `<h2>${division.head}</h2><p>${division.content}</p>`)
      .join('')
  }
  
  // Fallback: extract content from XML using simple regex
  const xmlContent = props.document.xmlContent || ''
  
  // Simple regex to extract text between <p> tags
  const paragraphs = xmlContent.match(/<p[^>]*>(.*?)<\/p>/gs) || []
  const cleanParagraphs = paragraphs.map(p => 
    p.replace(/<[^>]*>/g, '').trim()
  ).filter(p => p.length > 0)
  
  if (cleanParagraphs.length > 0) {
    return cleanParagraphs.map(p => `<p class="mb-4">${p}</p>`).join('')
  }
  
  // Last fallback: show a message
  return '<p class="text-gray-600">Content could not be extracted from this TEI document.</p>'
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
