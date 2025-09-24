import { teiDocumentRepository } from '../../../../repository/teiDocument'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid document ID'
      })
    }

    const structure = await teiDocumentRepository.getDocumentStructure(Number(id))
    
    return {
      success: true,
      data: structure
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch document structure',
      data: error
    })
  }
})
