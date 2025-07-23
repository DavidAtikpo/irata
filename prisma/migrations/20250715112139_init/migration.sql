-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "webirata";

-- CreateEnum
CREATE TYPE "webirata"."Role" AS ENUM ('USER', 'ADMIN', 'GESTIONNAIRE');

-- CreateEnum
CREATE TYPE "webirata"."Statut" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE', 'ANNULE');

-- CreateTable
CREATE TABLE "webirata"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "webirata"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webirata"."Formation" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "niveau" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webirata"."Demande" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statut" "webirata"."Statut" NOT NULL DEFAULT 'EN_ATTENTE',
    "session" TEXT NOT NULL,
    "message" TEXT,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webirata"."Devis" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "mail2" TEXT NOT NULL DEFAULT 'atikpododzi4@gmail.com',
    "adresseLivraison" TEXT,
    "dateLivraison" TIMESTAMP(3),
    "dateExamen" TIMESTAMP(3),
    "adresse" TEXT,
    "siret" TEXT,
    "numNDA" TEXT,
    "dateFormation" TIMESTAMP(3),
    "suiviPar" TEXT,
    "designation" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "unite" TEXT NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "tva" DOUBLE PRECISION NOT NULL,
    "exoneration" TEXT,
    "datePriseEffet" TIMESTAMP(3),
    "montant" DOUBLE PRECISION NOT NULL,
    "iban" TEXT,
    "bic" TEXT,
    "banque" TEXT,
    "intituleCompte" TEXT,
    "signature" TEXT,
    "statut" "webirata"."Statut" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webirata"."Contrat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "devisId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "profession" TEXT,
    "dateSignature" TIMESTAMP(3) NOT NULL,
    "signature" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',

    CONSTRAINT "Contrat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webirata"."Settings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "company" JSONB NOT NULL,
    "formation" JSONB NOT NULL,
    "email" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "webirata"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Devis_demandeId_key" ON "webirata"."Devis"("demandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Contrat_devisId_key" ON "webirata"."Contrat"("devisId");

-- CreateIndex
CREATE INDEX "Contrat_devisId_idx" ON "webirata"."Contrat"("devisId");

-- CreateIndex
CREATE INDEX "Contrat_userId_idx" ON "webirata"."Contrat"("userId");

-- AddForeignKey
ALTER TABLE "webirata"."Demande" ADD CONSTRAINT "Demande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "webirata"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webirata"."Devis" ADD CONSTRAINT "Devis_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "webirata"."Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webirata"."Devis" ADD CONSTRAINT "Devis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "webirata"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webirata"."Contrat" ADD CONSTRAINT "Contrat_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "webirata"."Devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webirata"."Contrat" ADD CONSTRAINT "Contrat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "webirata"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
