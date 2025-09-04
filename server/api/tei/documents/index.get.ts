import { teiDocumentRepository } from '~/server/repository/teiDocument'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const searchQuery = query.q as string

    if (searchQuery) {
      // Search documents
      const documents = await teiDocumentRepository.searchDocuments(searchQuery)
      return {
        success: true,
        data: documents,
        total: documents.length
      }
    } else {
      // Get all documents
      const documents = await teiDocumentRepository.getAllDocuments()
      return {
        success: true,
        data: documents,
        total: documents.length
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch TEI documents',
      data: error
    })
  }
})
