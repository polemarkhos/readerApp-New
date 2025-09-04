<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">TEI Document Library</h1>
      <p class="text-gray-600">Browse and read TEI XML encoded texts</p>
    </header>

    <!-- Search and Filters -->
    <div class="mb-6">
      <div class="flex gap-4 items-center">
        <div class="flex-1">
          <InputText
            v-model="searchQuery"
            placeholder="Search documents by title, author, or description..."
            class="w-full"
            @input="onSearchInput"
          />
        </div>
        <Button
          @click="searchDocuments"
          icon="pi pi-search"
          label="Search"
          size="small"
        />
        <Button
          v-if="searchQuery"
          @click="clearSearch"
          icon="pi pi-times"
          label="Clear"
          severity="secondary"
          size="small"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
      <p class="mt-4 text-gray-600">Loading documents...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Documents</h3>
        <p class="text-red-600">{{ error.message || 'An unexpected error occurred' }}</p>
        <Button @click="refresh()" class="mt-4" label="Try Again" />
      </div>
    </div>

    <!-- Documents List -->
    <div v-else-if="data?.success && data.data.length > 0" class="space-y-4">
      <!-- Results Summary -->
      <div class="text-sm text-gray-600 mb-4">
        Found {{ data.total }} document{{ data.total !== 1 ? 's' : '' }}
        <span v-if="searchQuery">for "{{ searchQuery }}"</span>
      </div>

      <!-- Document Cards -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="document in data.data"
          :key="document.id"
          class="document-card bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateToDocument(document.id)"
        >
          <div class="p-6">
            <!-- Document Title -->
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ document.title }}
            </h3>

            <!-- Author -->
            <p v-if="document.author" class="text-sm text-gray-600 mb-2 flex items-center">
              <Icon name="heroicons:user" class="w-4 h-4 mr-1" />
              {{ document.author }}
            </p>

            <!-- Description -->
            <p v-if="document.description" class="text-sm text-gray-700 mb-3 line-clamp-3">
              {{ document.description }}
            </p>

            <!-- Metadata -->
            <div class="flex flex-wrap gap-2 items-center text-xs text-gray-500">
              <span v-if="document.language" class="bg-gray-100 px-2 py-1 rounded">
                {{ document.language.toUpperCase() }}
              </span>
              <span v-if="document.fileSize" class="bg-gray-100 px-2 py-1 rounded">
                {{ formatFileSize(document.fileSize) }}
              </span>
              <span class="bg-gray-100 px-2 py-1 rounded">
                {{ formatDate(document.createdAt) }}
              </span>
            </div>

            <!-- Read Button -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <Button
                label="Read Document"
                icon="pi pi-book"
                class="w-full"
                size="small"
                @click.stop="navigateToDocument(document.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="bg-gray-50 rounded-lg p-8">
        <Icon name="heroicons:document-text" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ searchQuery ? 'No documents found' : 'No TEI documents available' }}
        </h3>
        <p class="text-gray-600">
          {{ searchQuery 
            ? 'Try adjusting your search terms or clearing the search to see all documents.' 
            : 'Upload some TEI XML files to get started reading.' 
          }}
        </p>
        <Button 
          v-if="searchQuery"
          @click="clearSearch"
          label="View All Documents"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Search functionality
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

// Fetch documents
const { data, pending, error, refresh } = await $fetch('/api/tei/documents', {
  query: computed(() => ({
    q: searchQuery.value || undefined
  })),
  server: false,
  watch: [searchQuery]
})

// Search with debounce
const onSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    searchDocuments()
  }, 300)
}

const searchDocuments = () => {
  // Trigger reactivity - the watcher will handle the actual fetch
  refresh()
}

const clearSearch = () => {
  searchQuery.value = ''
  refresh()
}

// Navigation
const navigateToDocument = (documentId: number) => {
  navigateTo(`/tei/documents/${documentId}`)
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// SEO
useHead({
  title: 'TEI Document Library',
  meta: [
    { name: 'description', content: 'Browse and read TEI XML encoded texts in your digital library.' }
  ]
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-card {
  transition: all 0.2s ease-in-out;
}

.document-card:hover {
  transform: translateY(-2px);
}
</style>
