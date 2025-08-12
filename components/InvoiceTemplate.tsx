"use client";

import Image from "next/image";
import React from "react";

export interface InvoiceLineItem {
  reference: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  tva: number; // percent
  imageUrl?: string;
}

export interface InvoiceData {
  title: string;
  codeNumberLabel?: string;
  codeNumber?: string;
  revisionLabel?: string;
  revision?: string | number;
  creationDateLabel?: string;
  creationDate?: string; // e.g. "09/05/2023"

  company: {
    name: string;
    contactName?: string;
    addressLines: string[];
    email?: string;
    phone?: string;
    siret?: string;
    nif?: string;
    invoiceNumberLabel?: string;
    invoiceNumber?: string;
    invoiceDateLabel?: string;
    invoiceDate?: string;
  };
  // Stagiaire pour affichage
  trainee?: {
    fullName?: string;
    email?: string;
  };

  customer: {
    name: string;
    addressLines: string[];
    email?: string;
    phone?: string;
    siretLabel?: string;
    siret?: string;
    convLabel?: string;
    conv?: string;
    companyTitle?: string;
  };

  recipient: {
    name: string;
    addressLines: string[];
    email?: string;
    phone?: string;
  };

  items: InvoiceLineItem[];

  footerLeft?: string;
  footerRight?: string;
  showQr?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const totalHT = data.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const totalTVA = data.items.reduce((sum, it) => sum + (it.quantity * it.unitPrice * it.tva) / 100, 0);
  const totalTTC = totalHT + totalTVA;

  return (
    <div className="w-full bg-white shadow rounded-md overflow-hidden border print:border-0">
      {/* A4 ratio container */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {/* Header with Logo and Info Table */}
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            <Image src="/logo.png" alt="CI.DES Logo" width={60} height={60} />
          </div>
          <div className="flex-1">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="border p-2 font-bold">Titre</td>
                  <td className="border p-2 font-bold">{data.codeNumberLabel ?? "Numéro de code"}</td>
                  <td className="border p-2 font-bold">{data.revisionLabel ?? "Révision"}</td>
                  <td className="border p-2 font-bold">{data.creationDateLabel ?? "Création date"}</td>
                </tr>
                <tr>
                  <td className="border p-2">{data.title}</td>
                  <td className="border p-2">{data.codeNumber}</td>
                  <td className="border p-2">{String(data.revision ?? "")}</td>
                  <td className="border p-2">{data.creationDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Company / Customer blocks + Numéro facture et stagiaire */}
        <div className="mt-6 grid grid-cols-12 gap-4">
          <div className="col-span-6 border rounded p-3 text-[11px]">
            <div className="font-semibold mb-1">{data.company.name}</div>
            {data.company.contactName && <div>{data.company.contactName}</div>}
            {data.company.addressLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            {data.company.email && <div>Email: {data.company.email}</div>}
            {data.company.phone && <div>Port: {data.company.phone}</div>}
            {data.company.siret && <div>SIRET: {data.company.siret}</div>}
            <div className="mt-2">
              <span className="font-semibold">{data.company.invoiceNumberLabel ?? "FACTURE N°"}</span> {data.company.invoiceNumber}
            </div>
            {data.company.invoiceDate && (
              <div>
                <span className="font-semibold">{data.company.invoiceDateLabel ?? "Le"}</span> {data.company.invoiceDate}
              </div>
            )}
          </div>

          <div className="col-span-6 border rounded p-3 text-[11px]">
            <div className="font-semibold mb-1">{data.customer.companyTitle ?? "FRANCE TRAVAIL DR BRETAGNE"}</div>
            {data.customer.addressLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            {data.customer.siret && (
              <div>
                {data.customer.siretLabel ?? "N°SIRET:"} <span className="font-medium">{data.customer.siret}</span>
              </div>
            )}
            {data.customer.conv && (
              <div>
                {data.customer.convLabel ?? "N°Convention:"} <span className="font-medium">{data.customer.conv}</span>
              </div>
            )}
            {data.trainee?.fullName && (
              <div className="mt-2">
                <span className="font-semibold">Stagiaire:</span> {data.trainee.fullName}
              </div>
            )}
            {data.trainee?.email && (
              <div>
                <span className="font-semibold">Email:</span> {data.trainee.email}
              </div>
            )}
          </div>
        </div>

        {/* Recipient */}
        <div className="mt-6 text-center text-[12px]">
          <div className="font-semibold">{data.recipient.name}</div>
          {data.recipient.addressLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          <div>{data.recipient.phone ? `Port: ${data.recipient.phone}` : null}</div>
          {data.recipient.email && <div>Email: {data.recipient.email}</div>}
        </div>

        {/* Table */}
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px] border">
              <thead className="bg-gray-50">
                <tr className="divide-x">
                  <th className="px-3 py-2 text-left font-medium">Référence</th>
                  <th className="px-3 py-2 text-left font-medium">désignation</th>
                  <th className="px-3 py-2 text-right font-medium">Quantité</th>
                  <th className="px-3 py-2 text-right font-medium">pU Vente</th>
                  <th className="px-3 py-2 text-right font-medium">TVA</th>
                  <th className="px-3 py-2 text-right font-medium">Montant HT</th>
                  <th className="px-3 py-2 text-center font-medium">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((it, idx) => {
                  const montantHT = it.quantity * it.unitPrice;
                  return (
                    <tr key={idx} className="divide-x">
                      <td className="px-3 py-2 align-top">{it.reference}</td>
                      <td className="px-3 py-2 align-top whitespace-pre-line">{it.designation}</td>
                      <td className="px-3 py-2 align-top text-right">{it.quantity.toFixed(2)}</td>
                      <td className="px-3 py-2 align-top text-right">{formatCurrency(it.unitPrice)}</td>
                      <td className="px-3 py-2 align-top text-right">{it.tva.toFixed(2)} %</td>
                      <td className="px-3 py-2 align-top text-right">{formatCurrency(montantHT)}</td>
                      <td className="px-3 py-2 align-top text-center">
                        {it.imageUrl ? (
                          <Image
                            src={it.imageUrl}
                            alt="item"
                            width={40}
                            height={40}
                            className="inline-block rounded"
                          />
                        ) : (
                          <div className="mx-auto h-10 w-8 bg-gray-100 border rounded" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals */}
              <tfoot>
                <tr className="divide-x bg-gray-50">
                  <td className="px-3 py-2" colSpan={5}>
                    <span className="text-sm font-medium">Total HT</span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(totalHT)}</td>
                  <td className="px-3 py-2" />
                </tr>
                <tr className="divide-x bg-gray-50">
                  <td className="px-3 py-2" colSpan={5}>
                    <span className="text-sm font-medium">Total TVA</span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(totalTVA)}</td>
                  <td className="px-3 py-2" />
                </tr>
                <tr className="divide-x bg-gray-100">
                  <td className="px-3 py-2" colSpan={5}>
                    <span className="text-sm font-semibold">Total TTC</span>
                  </td>
                  <td className="px-3 py-2 text-right font-bold">{formatCurrency(totalTTC)}</td>
                  <td className="px-3 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between text-[10px] text-gray-600 border-t pt-3">
          <div className="text-center flex-1">
            <div><strong>CI.DES sasu</strong> · Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011 · VAT : FR71878407899</div>
          </div>
          <div className="ml-4">{data.footerRight ?? "Page 1 sur 1"}</div>
        </div>
      </div>
    </div>
  );
}


