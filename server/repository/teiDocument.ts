import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TeiDocumentRepository {
  /**
   * Get all TEI documents with basic metadata
   */
  async getAllDocuments() {
    return await prisma.teiDocument.findMany({
      select: {
        id: true,
        title: true,
        filename: true,
        author: true,
        language: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        fileSize: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Get a specific TEI document by ID with full content
   */
  async getDocumentById(id: number) {
    return await prisma.teiDocument.findUnique({
      where: { id },
      include: {
        metadata: true,
        divisions: {
          orderBy: [
            { level: 'asc' },
            { order: 'asc' }
          ]
        },
        annotations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Get document divisions in hierarchical structure
   */
  async getDocumentStructure(documentId: number) {
    const divisions = await prisma.teiDivision.findMany({
      where: { teiDocumentId: documentId },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' }
      ]
    })

    // Build hierarchical structure
    const divisionMap = new Map()
    const rootDivisions: any[] = []

    // Create map and identify roots
    divisions.forEach(division => {
      divisionMap.set(division.id, { ...division, children: [] })
      if (!division.parentId) {
        rootDivisions.push(divisionMap.get(division.id))
      }
    })

    // Build parent-child relationships
    divisions.forEach(division => {
      if (division.parentId) {
        const parent = divisionMap.get(division.parentId)
        if (parent) {
          parent.children.push(divisionMap.get(division.id))
        }
      }
    })

    return rootDivisions
  }

  /**
   * Get documents by user ID
   */
  async getDocumentsByUserId(userId: number) {
    return await prisma.teiDocument.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        filename: true,
        author: true,
        language: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  }

  /**
   * Search TEI documents by title or author
   */
  async searchDocuments(query: string) {
    return await prisma.teiDocument.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        filename: true,
        author: true,
        language: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}

export const teiDocumentRepository = new TeiDocumentRepository()
