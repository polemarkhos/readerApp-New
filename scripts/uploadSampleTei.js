// Sample script to upload a TEI document
// Usage: node scripts/uploadSampleTei.js

const sampleTeiXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xml:lang="en">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Sample TEI Document</title>
        <author>Jane Doe</author>
        <editor>John Editor</editor>
      </titleStmt>
      <publicationStmt>
        <publisher>Digital Humanities Press</publisher>
        <date>2024</date>
      </publicationStmt>
      <sourceDesc>
        <p>A sample TEI document for testing the reader application.</p>
      </sourceDesc>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords>
          <term>sample</term>
          <term>testing</term>
          <term>digital humanities</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <body>
      <div type="chapter" xml:id="ch1" n="1">
        <head>Chapter 1: Introduction</head>
        <p>This is the first chapter of our sample TEI document. It demonstrates how TEI XML can be used to encode literary and scholarly texts with rich metadata and structural markup.</p>
        <p>TEI (Text Encoding Initiative) provides a comprehensive framework for <hi rend="italic">digital text encoding</hi> that preserves both the content and structure of documents.</p>
        <quote>
          <p>"The best way to understand TEI is to see it in action."</p>
        </quote>
      </div>
      <div type="chapter" xml:id="ch2" n="2">
        <head>Chapter 2: Features</head>
        <p>This chapter showcases various TEI features supported by our reader:</p>
        <list>
          <item>Hierarchical document structure</item>
          <item>Rich text formatting with <hi rend="bold">bold</hi> and <hi rend="italic">italic</hi> text</item>
          <item>Quotations and citations</item>
          <item>Poetry and verse structures</item>
        </list>
        <lg type="poem">
          <l>Here is a sample poem line,</l>
          <l>To show how verse appears.</l>
          <l>Each line is properly encoded,</l>
          <l>As TEI text engineering.</l>
        </lg>
      </div>
      <div type="chapter" xml:id="ch3" n="3">
        <head>Chapter 3: Conclusion</head>
        <p>This sample document demonstrates the power of TEI XML for digital text representation. The reader application can parse this structure and present it in a user-friendly format.</p>
        <p>Features like table of contents generation, search functionality, and responsive reading interfaces make digital texts more accessible to modern readers.</p>
      </div>
    </body>
  </text>
</TEI>`

async function uploadSampleDocument() {
  try {
    const response = await fetch('http://localhost:3000/api/tei/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'sample-tei-document.xml',
        xmlContent: sampleTeiXml,
        userId: null // Optional: add a user ID if you have users
      })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Sample TEI document uploaded successfully!')
      console.log('📄 Document ID:', result.data.id)
      console.log('📚 Title:', result.data.title)
      console.log('👤 Author:', result.data.author)
      console.log('🔗 View at: http://localhost:3000/tei/documents/' + result.data.id)
    } else {
      console.error('❌ Upload failed:', result)
    }
  } catch (error) {
    console.error('❌ Error uploading document:', error)
  }
}

uploadSampleDocument()
