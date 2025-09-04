# Reader App - TEI XML Document Reader

A digital reading application built with Nuxt 3 that allows you to browse, search, and read TEI XML encoded texts with a professional e-book-like experience.

## Features

### 📚 **TEI XML Document Management**
- Complete database schema for storing TEI XML files and metadata
- Document browsing with search functionality
- Professional reading interface optimized for TEI content

### 🔍 **Document Library**
- Grid layout of document cards with metadata display
- Search by title, author, or description
- Document information including language, file size, and upload date
- Responsive design for all screen sizes

### 📖 **Advanced Reading Interface**
- **Reading Modes**: Full text or chapter-by-chapter view
- **Table of Contents**: Hierarchical navigation sidebar with smooth scrolling
- **Font Controls**: Adjustable font size (A-/A+) for comfortable reading
- **Responsive Design**: Mobile-friendly with collapsible TOC
- **Fullscreen Mode**: Distraction-free reading experience
- **Smart Formatting**: Converts TEI markup to beautifully styled HTML

### 🛠️ **TEI XML Processing**
- Automatic metadata extraction from TEI headers
- Support for complex document structures (chapters, sections, divisions)
- TEI markup conversion (`<hi>`, `<quote>`, `<lg>`, etc.) to styled HTML
- Hierarchical table of contents generation
- Text division handling with proper nesting

## Tech Stack

- **Framework**: Nuxt 3
- **Database**: PostgreSQL with Prisma ORM
- **UI Library**: PrimeVue 4 with custom theming
- **Styling**: Tailwind CSS
- **Icons**: Heroicons via Nuxt Icon

## Database Schema

The application includes comprehensive models for TEI document storage:

- **TeiDocument** - Main document storage with metadata
- **TeiMetadata** - Detailed TEI header information
- **TeiDivision** - Document structure and hierarchy
- **TeiAnnotation** - User annotations and highlights

## API Endpoints

- `GET /api/tei/documents` - List all documents with search
- `GET /api/tei/documents/[id]` - Get specific document with full content
- `GET /api/tei/documents/[id]/structure` - Get document structure/divisions

## Pages

- `/tei` - TEI Document Library (browse and search)
- `/tei/documents/[id]` - TEI Document Reader (full reading experience)

## Project Structure

```
app/
├── components/
│   └── tei/
│       ├── TableOfContents.vue    # Navigation sidebar
│       ├── TocItem.vue            # TOC entry component
│       ├── DocumentReader.vue     # Main reading interface
│       └── ChapterSection.vue     # Chapter display
├── pages/
│   └── tei/
│       ├── index.vue              # Document library
│       └── documents/[id].vue     # Document reader
server/
├── api/
│   └── tei/
│       └── documents/             # TEI API endpoints
├── repository/
│   └── teiDocument.ts             # Database operations
utils/
└── teiParser.ts                   # TEI XML processing utilities
prisma/
└── schema.prisma                  # Database schema with TEI models
```

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
