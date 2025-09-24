<template>
  <div class="tei-reader-page min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button
              @click="navigateTo('/tei')"
              icon="pi pi-arrow-left"
              label="Back to Library"
              severity="secondary"
              size="small"
            />
            <div v-if="data?.success">
              <h2 class="font-semibold text-gray-900 truncate max-w-md">
                {{ data.data.title }}
              </h2>
              <p v-if="data.data.author" class="text-sm text-gray-600">
                by {{ data.data.author }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Toggle TOC -->
            <Button
              @click="showToc = !showToc"
              :icon="showToc ? 'pi pi-eye-slash' : 'pi pi-list'"
              :label="showToc ? 'Hide TOC' : 'Show TOC'"
              severity="secondary"
              size="small"
            />
            <!-- Full Screen -->
            <Button
              @click="toggleFullscreen"
              icon="pi pi-expand"
              label="Fullscreen"
              severity="secondary"
              size="small"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center min-h-[50vh]">
      <div class="text-center">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
        <p class="mt-4 text-gray-600">Loading document...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-8">
      <div class="text-center py-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Document</h3>
          <p class="text-red-600">{{ error.message || 'Document not found' }}</p>
          <div class="flex gap-2 justify-center mt-4">
            <Button @click="refresh()" label="Try Again" size="small" />
            <Button @click="navigateTo('/tei')" label="Back to Library" severity="secondary" size="small" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="data?.success" class="flex">
      <!-- Table of Contents Sidebar -->
      <aside 
        v-if="showToc" 
        class="toc-sidebar w-80 bg-white shadow-lg border-r border-gray-200 fixed left-0 top-16 h-full overflow-y-auto z-20 lg:relative lg:top-0"
      >
        <div class="p-4">
          <TableOfContents
            :toc-entries="tableOfContents"
            :current-section="currentSection"
            @navigate="navigateToSection"
          />
        </div>
      </aside>

      <!-- Overlay for mobile TOC -->
      <div 
        v-if="showToc" 
        class="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
        @click="showToc = false"
      ></div>

      <!-- Document Content -->
      <main :class="['flex-1', showToc ? 'lg:ml-0' : '']">
        <div class="container mx-auto px-4 py-8">
          <!-- Debug info -->
          <div class="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
            <h3 class="text-green-800 font-semibold">Page Debug Info</h3>
            <p class="text-green-600 text-sm">Data loaded: {{ !!data }}</p>
            <p class="text-green-600 text-sm">Data success: {{ data?.success }}</p>
            <p class="text-green-600 text-sm">Document exists: {{ !!data?.data }}</p>
            <p class="text-green-600 text-sm">Document title: {{ data?.data?.title }}</p>
            <p class="text-green-600 text-sm">XML content length: {{ data?.data?.xmlContent?.length }}</p>
          </div>
          
          <DocumentReader
            v-if="data?.data"
            :document="data.data"
            @chapter-change="currentSection = $event"
          />
          <div v-else class="bg-red-50 p-4 rounded-lg border border-red-200">
            <p class="text-red-800">No document data available</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TeiParser, type TocEntry } from '../../../../utils/teiParser'

// Get document ID from route
const route = useRoute()
const documentId = computed(() => Number(route.params.id))

// Reactive state
const showToc = ref(true)
const currentSection = ref<string | null>(null)

// Fetch document data
const { data, pending, error, refresh } = await useFetch(`/api/tei/documents/${documentId.value}`)

// Compute table of contents
const tableOfContents = computed<TocEntry[]>(() => {
  if (!data.value?.success) return []
  
  try {
    const parsedContent = TeiParser.parseXmlContent(data.value.data.xmlContent)
    return TeiParser.createTableOfContents(parsedContent.chapters)
  } catch (error) {
    console.error('Failed to create table of contents:', error)
    return []
  }
})

// Navigation
const navigateToSection = (sectionId: string) => {
  currentSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  // Hide TOC on mobile after navigation
  if (window.innerWidth < 1024) {
    showToc.value = false
  }
}

// Fullscreen functionality
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

// Handle responsive TOC
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    showToc.value = true
  }
}

// SEO and meta
watchEffect(() => {
  if (data.value?.success) {
    useHead({
      title: `${data.value.data.title} - TEI Reader`,
      meta: [
        { name: 'description', content: data.value.data.description || `Read ${data.value.data.title} in TEI format` },
        { name: 'author', content: data.value.data.author }
      ]
    })
  }
})

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // Auto-hide TOC on mobile
  if (window.innerWidth < 1024) {
    showToc.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Handle route changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      refresh()
    }
  }
)
</script>

<style scoped>
.tei-reader-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.toc-sidebar {
  transition: transform 0.3s ease-in-out;
}

@media (max-width: 1023px) {
  .toc-sidebar {
    transform: translateX(0);
  }
}

/* Full screen styles */
:fullscreen .toc-sidebar {
  display: none;
}

:fullscreen main {
  margin-left: 0 !important;
}
</style>
