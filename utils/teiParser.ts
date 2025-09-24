/**
 * TEI XML Parser utilities for extracting and formatting content
 */
import { DOMParser as XMLDOMParser } from '@xmldom/xmldom'

// Use browser DOMParser on client, xmldom on server
const getParser = () => {
  if (typeof window !== 'undefined' && window.DOMParser) {
    return window.DOMParser
  }
  return XMLDOMParser
}

// Check if we're running on client (browser supports querySelector)
const isClient = () => typeof window !== 'undefined'

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
    try {
      // Create a DOM parser for XML
      const Parser = getParser()
      const parser = new Parser()
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
      
      // Check for parsing errors (XMLDOM specific)
      if (!xmlDoc.documentElement || xmlDoc.documentElement.tagName === 'parsererror') {
        console.error('XML Parsing error: Invalid XML structure')
        throw new Error('Invalid XML content: malformed XML')
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
    } catch (error) {
      console.error('Error in parseXmlContent:', error)
      throw error
    }
  }

  /**
   * Extract metadata from TEI header
   */
  private static extractMetadata(xmlDoc: Document): TeiMetadata {
    const teiHeader = this.getElementByTagName(xmlDoc, 'teiHeader')
    if (!teiHeader) return { keywords: [] }

    const titleStmt = this.getElementByTagName(teiHeader, 'titleStmt')
    const publicationStmt = this.getElementByTagName(teiHeader, 'publicationStmt')
    const sourceDesc = this.getElementByTagName(teiHeader, 'sourceDesc')

    return {
      title: titleStmt ? this.getElementByTagName(titleStmt, 'title')?.textContent?.trim() : undefined,
      author: titleStmt ? this.getElementByTagName(titleStmt, 'author')?.textContent?.trim() : undefined,
      editor: titleStmt ? this.getElementByTagName(titleStmt, 'editor')?.textContent?.trim() : undefined,
      publisher: publicationStmt ? this.getElementByTagName(publicationStmt, 'publisher')?.textContent?.trim() : undefined,
      pubDate: publicationStmt ? this.getElementByTagName(publicationStmt, 'date')?.textContent?.trim() : undefined,
      language: xmlDoc.documentElement.getAttribute('xml:lang') || undefined,
      description: sourceDesc ? this.getElementByTagName(sourceDesc, 'p')?.textContent?.trim() : undefined,
      keywords: this.extractKeywords(teiHeader),
      genre: undefined // Will implement later if needed
    }
  }

  /**
   * Extract keywords from TEI header
   */
  private static extractKeywords(teiHeader: Element): string[] {
    const keywords: string[] = []
    const keywordParent = this.getElementByTagName(teiHeader, 'keywords')
    
    if (keywordParent) {
      const termElements = this.getElementsByTagName(keywordParent, 'term')
      termElements.forEach(el => {
        const keyword = el.textContent?.trim()
        if (keyword) {
          keywords.push(keyword)
        }
      })
    }

    return keywords
  }

  /**
   * Extract main text content from TEI body
   */
  private static extractTextContent(xmlDoc: Document): string {
    const textElement = this.getElementByTagName(xmlDoc, 'text')
    if (!textElement) return ''
    
    const body = this.getElementByTagName(textElement, 'body')
    if (!body) return ''

    // Clean up the text content
    const textContent = body.textContent || ''
    return textContent.replace(/\s+/g, ' ').trim()
  }

  /**
   * Extract chapter/division structure
   */
  private static extractChapters(xmlDoc: Document): TeiChapter[] {
    const textElement = this.getElementByTagName(xmlDoc, 'text')
    if (!textElement) return []
    
    const body = this.getElementByTagName(textElement, 'body')
    if (!body) return []

    const chapters: TeiChapter[] = []
    const divElements = this.getElementsByTagName(body, 'div')

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
    const headElement = this.getElementByTagName(div, 'head')
    const title = headElement?.textContent?.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} ${order}`

    // Get content (simple text extraction for now)
    const content = div.textContent?.replace(/\s+/g, ' ').trim() || ''

    // Extract child chapters
    const childDivs = this.getElementsByTagName(div, 'div')
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
    if (!xmlContent.trim()) {
      return '<p>No content available.</p>'
    }
    
    // If it's plain text without XML tags, wrap in paragraphs
    if (!xmlContent.includes('<')) {
      return xmlContent
        .split(/\n\n+/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p class="mb-4">${paragraph}</p>`)
        .join('')
    }
    
    // If it contains XML, process the markup
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
    const Parser = getParser()
    const parser = new Parser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
    
    const textElement = this.getElementByTagName(xmlDoc, 'text')
    if (!textElement) return ''
    
    return textElement.textContent?.replace(/\s+/g, ' ').trim() || ''
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

  /**
   * Helper method to get first element by tag name
   */
  private static getElementByTagName(parent: Document | Element, tagName: string): Element | null {
    if (isClient() && 'querySelector' in parent) {
      // On client, we can use querySelector
      return (parent as any).querySelector(tagName)
    } else {
      // On server, use getElementsByTagName
      const elements = parent.getElementsByTagName(tagName)
      return elements.length > 0 ? elements[0] : null
    }
  }

  /**
   * Helper method to get all elements by tag name as array
   */
  private static getElementsByTagName(parent: Document | Element, tagName: string): Element[] {
    if (isClient() && 'querySelectorAll' in parent) {
      // On client, we can use querySelectorAll
      return Array.from((parent as any).querySelectorAll(tagName))
    } else {
      // On server, use getElementsByTagName
      const nodeList = parent.getElementsByTagName(tagName)
      return Array.from(nodeList)
    }
  }
}

export interface TocEntry {
  id: string
  title: string
  level: number
  order: number
}
