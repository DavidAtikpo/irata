-- CreateTable
CREATE TABLE "webirata"."Document" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "cloudinaryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "devisId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_cloudinaryId_key" ON "webirata"."Document"("cloudinaryId");

-- AddForeignKey
ALTER TABLE "webirata"."Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "webirata"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webirata"."Document" ADD CONSTRAINT "Document_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "webirata"."Devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
