import { teiDocumentRepository } from '../../../repository/teiDocument'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid document ID'
      })
    }

    const document = await teiDocumentRepository.getDocumentById(Number(id))
    
    if (!document) {
      throw createError({
        statusCode: 404,
        statusMessage: 'TEI document not found'
      })
    }

    return {
      success: true,
      data: document
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch TEI document',
      data: error
    })
  }
})
