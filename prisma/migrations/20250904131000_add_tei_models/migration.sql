-- CreateTable
CREATE TABLE "public"."tei_documents" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "xmlContent" TEXT NOT NULL,
    "fileSize" INTEGER,
    "encoding" TEXT NOT NULL DEFAULT 'UTF-8',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "author" TEXT,
    "editor" TEXT,
    "publisher" TEXT,
    "pubDate" TEXT,
    "language" TEXT,
    "description" TEXT,
    "userId" INTEGER,

    CONSTRAINT "tei_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tei_metadata" (
    "id" SERIAL NOT NULL,
    "teiDocumentId" INTEGER NOT NULL,
    "titleStmt" JSONB,
    "editionStmt" JSONB,
    "publicationStmt" JSONB,
    "sourceDesc" JSONB,
    "profileDesc" JSONB,
    "encodingDesc" JSONB,
    "revisionDesc" JSONB,
    "keywords" TEXT[],
    "genre" TEXT,
    "period" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tei_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tei_divisions" (
    "id" SERIAL NOT NULL,
    "teiDocumentId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "n" TEXT,
    "head" TEXT,
    "xmlId" TEXT,
    "content" TEXT NOT NULL,
    "startOffset" INTEGER,
    "endOffset" INTEGER,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tei_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tei_annotations" (
    "id" SERIAL NOT NULL,
    "teiDocumentId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "startOffset" INTEGER,
    "endOffset" INTEGER,
    "xmlId" TEXT,
    "xpath" TEXT,
    "selectedText" TEXT,
    "tags" TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tei_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tei_documents_filename_key" ON "public"."tei_documents"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "tei_metadata_teiDocumentId_key" ON "public"."tei_metadata"("teiDocumentId");

-- CreateIndex
CREATE INDEX "tei_divisions_teiDocumentId_level_order_idx" ON "public"."tei_divisions"("teiDocumentId", "level", "order");

-- CreateIndex
CREATE INDEX "tei_annotations_teiDocumentId_userId_idx" ON "public"."tei_annotations"("teiDocumentId", "userId");

-- CreateIndex
CREATE INDEX "tei_annotations_type_idx" ON "public"."tei_annotations"("type");

-- AddForeignKey
ALTER TABLE "public"."tei_documents" ADD CONSTRAINT "tei_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tei_metadata" ADD CONSTRAINT "tei_metadata_teiDocumentId_fkey" FOREIGN KEY ("teiDocumentId") REFERENCES "public"."tei_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tei_divisions" ADD CONSTRAINT "tei_divisions_teiDocumentId_fkey" FOREIGN KEY ("teiDocumentId") REFERENCES "public"."tei_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tei_divisions" ADD CONSTRAINT "tei_divisions_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."tei_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tei_annotations" ADD CONSTRAINT "tei_annotations_teiDocumentId_fkey" FOREIGN KEY ("teiDocumentId") REFERENCES "public"."tei_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tei_annotations" ADD CONSTRAINT "tei_annotations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
