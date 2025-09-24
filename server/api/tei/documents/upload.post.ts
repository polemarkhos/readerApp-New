import { teiDocumentRepository } from '../../../repository/teiDocument'
import { TeiParser } from '../../../../utils/teiParser'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { filename, xmlContent, userId } = body

    if (!filename || !xmlContent) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Filename and XML content are required'
      })
    }

    // Parse TEI content to extract metadata
    let parsedContent
    try {
      parsedContent = TeiParser.parseXmlContent(xmlContent)
    } catch (parseError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid TEI XML format',
        data: parseError
      })
    }

    // Create TEI document in database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const teiDocument = await prisma.teiDocument.create({
      data: {
        title: parsedContent.metadata.title || filename.replace(/\.[^/.]+$/, ''),
        filename,
        xmlContent,
        fileSize: Buffer.byteLength(xmlContent, 'utf8'),
        encoding: 'UTF-8',
        author: parsedContent.metadata.author,
        editor: parsedContent.metadata.editor,
        publisher: parsedContent.metadata.publisher,
        pubDate: parsedContent.metadata.pubDate,
        language: parsedContent.metadata.language,
        description: parsedContent.metadata.description,
        userId: userId ? parseInt(userId) : null,

        // Create metadata record
        metadata: {
          create: {
            titleStmt: parsedContent.metadata.title ? { title: parsedContent.metadata.title } : null,
            publicationStmt: parsedContent.metadata.publisher ? { 
              publisher: parsedContent.metadata.publisher,
              date: parsedContent.metadata.pubDate 
            } : null,
            keywords: parsedContent.metadata.keywords,
            genre: parsedContent.metadata.genre
          }
        },

        // Create divisions if they exist
        divisions: parsedContent.chapters.length > 0 ? {
          create: parsedContent.chapters.map((chapter, index) => ({
            type: 'chapter',
            level: chapter.level,
            n: chapter.order.toString(),
            head: chapter.title,
            xmlId: chapter.id,
            content: chapter.content,
            order: chapter.order
          }))
        } : undefined
      },
      include: {
        metadata: true,
        divisions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      data: teiDocument,
      message: 'TEI document uploaded successfully'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload TEI document',
      data: error
    })
  }
})
