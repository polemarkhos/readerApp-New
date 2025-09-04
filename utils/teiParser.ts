/**
 * TEI XML Parser utilities for extracting and formatting content
 */

export interface TeiContent {
  title: string
  author?: string
  content: string
  chapters: TeiChapter[]
  metadata: TeiMetadata
}

export interface TeiChapter {
  id: string
  title: string
  content: string
  level: number
  order: number
  children: TeiChapter[]
}

export interface TeiMetadata {
  title?: string
  author?: string
  editor?: string
  publisher?: string
  pubDate?: string
  language?: string
  description?: string
  keywords: string[]
  genre?: string
}

export class TeiParser {
  /**
   * Parse TEI XML content and extract readable text
   */
  static parseXmlContent(xmlContent: string): TeiContent {
    // Create a DOM parser for XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Invalid XML content')
    }

    const metadata = this.extractMetadata(xmlDoc)
    const content = this.extractTextContent(xmlDoc)
    const chapters = this.extractChapters(xmlDoc)

    return {
      title: metadata.title || 'Untitled Document',
      author: metadata.author,
      content,
      chapters,
      metadata
    }
  }

  /**
   * Extract metadata from TEI header
   */
  private static extractMetadata(xmlDoc: Document): TeiMetadata {
    const teiHeader = xmlDoc.querySelector('teiHeader')
    if (!teiHeader) return { keywords: [] }

    const titleStmt = teiHeader.querySelector('titleStmt')
    const publicationStmt = teiHeader.querySelector('publicationStmt')
    const sourceDesc = teiHeader.querySelector('sourceDesc')

    return {
      title: titleStmt?.querySelector('title')?.textContent?.trim(),
      author: titleStmt?.querySelector('author')?.textContent?.trim(),
      editor: titleStmt?.querySelector('editor')?.textContent?.trim(),
      publisher: publicationStmt?.querySelector('publisher')?.textContent?.trim(),
      pubDate: publicationStmt?.querySelector('date')?.textContent?.trim(),
      language: xmlDoc.documentElement.getAttribute('xml:lang') || undefined,
      description: sourceDesc?.querySelector('p')?.textContent?.trim(),
      keywords: this.extractKeywords(teiHeader),
      genre: teiHeader.querySelector('textClass catRef')?.getAttribute('target')
    }
  }

  /**
   * Extract keywords from TEI header
   */
  private static extractKeywords(teiHeader: Element): string[] {
    const keywords: string[] = []
    const keywordElements = teiHeader.querySelectorAll('keywords term, textClass catRef')
    
    keywordElements.forEach(el => {
      const keyword = el.textContent?.trim() || el.getAttribute('target')?.replace('#', '')
      if (keyword) {
        keywords.push(keyword)
      }
    })

    return keywords
  }

  /**
   * Extract main text content from TEI body
   */
  private static extractTextContent(xmlDoc: Document): string {
    const body = xmlDoc.querySelector('text body')
    if (!body) return ''

    // Remove unwanted elements
    const clone = body.cloneNode(true) as Element
    const elementsToRemove = clone.querySelectorAll('note[place="foot"], pb, lb')
    elementsToRemove.forEach(el => el.remove())

    // Clean up the text content
    const textContent = clone.textContent || ''
    return textContent.replace(/\s+/g, ' ').trim()
  }

  /**
   * Extract chapter/division structure
   */
  private static extractChapters(xmlDoc: Document): TeiChapter[] {
    const body = xmlDoc.querySelector('text body')
    if (!body) return []

    const chapters: TeiChapter[] = []
    const divElements = body.querySelectorAll('div')

    divElements.forEach((div, index) => {
      const chapter = this.extractChapterFromDiv(div, 1, index + 1)
      if (chapter) {
        chapters.push(chapter)
      }
    })

    return chapters
  }

  /**
   * Extract chapter information from a div element
   */
  private static extractChapterFromDiv(div: Element, level: number, order: number): TeiChapter | null {
    const id = div.getAttribute('xml:id') || div.getAttribute('id') || `chapter-${order}`
    const type = div.getAttribute('type') || 'chapter'
    
    // Get chapter title from head element
    const headElement = div.querySelector(':scope > head')
    const title = headElement?.textContent?.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} ${order}`

    // Get content excluding nested divs
    const clone = div.cloneNode(true) as Element
    const nestedDivs = clone.querySelectorAll('div')
    nestedDivs.forEach(nestedDiv => nestedDiv.remove())
    
    const content = clone.textContent?.replace(/\s+/g, ' ').trim() || ''

    // Extract child chapters
    const childDivs = div.querySelectorAll(':scope > div')
    const children: TeiChapter[] = []
    
    childDivs.forEach((childDiv, childIndex) => {
      const childChapter = this.extractChapterFromDiv(childDiv, level + 1, childIndex + 1)
      if (childChapter) {
        children.push(childChapter)
      }
    })

    return {
      id,
      title,
      content,
      level,
      order,
      children
    }
  }

  /**
   * Format content for display (convert XML markup to HTML)
   */
  static formatContentForDisplay(xmlContent: string): string {
    return xmlContent
      .replace(/<p>/g, '<p class="mb-4">')
      .replace(/<hi rend="italic">/g, '<em>')
      .replace(/<hi rend="bold">/g, '<strong>')
      .replace(/<\/hi>/g, (match, offset, string) => {
        // Determine which closing tag to use based on the opening tag
        const beforeMatch = string.substring(0, offset)
        if (beforeMatch.lastIndexOf('<hi rend="italic">') > beforeMatch.lastIndexOf('<hi rend="bold">')) {
          return '</em>'
        } else {
          return '</strong>'
        }
      })
      .replace(/<quote>/g, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">')
      .replace(/<\/quote>/g, '</blockquote>')
      .replace(/<lg>/g, '<div class="poem my-4">')
      .replace(/<\/lg>/g, '</div>')
      .replace(/<l>/g, '<div class="verse">')
      .replace(/<\/l>/g, '</div>')
      .replace(/<pb[^>]*>/g, '<div class="page-break border-t border-gray-200 my-6 pt-4"></div>')
      .replace(/<lb[^>]*>/g, '<br>')
  }

  /**
   * Extract plain text content without XML markup
   */
  static extractPlainText(xmlContent: string): string {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
    
    // Remove unwanted elements
    const elementsToRemove = xmlDoc.querySelectorAll('note[place="foot"], pb, lb, teiHeader')
    elementsToRemove.forEach(el => el.remove())
    
    return xmlDoc.textContent?.replace(/\s+/g, ' ').trim() || ''
  }

  /**
   * Create table of contents from divisions
   */
  static createTableOfContents(chapters: TeiChapter[]): TocEntry[] {
    const toc: TocEntry[] = []

    const processChapter = (chapter: TeiChapter, level: number) => {
      toc.push({
        id: chapter.id,
        title: chapter.title,
        level: level,
        order: chapter.order
      })

      chapter.children.forEach(child => {
        processChapter(child, level + 1)
      })
    }

    chapters.forEach(chapter => processChapter(chapter, 1))
    return toc
  }
}

export interface TocEntry {
  id: string
  title: string
  level: number
  order: number
}
