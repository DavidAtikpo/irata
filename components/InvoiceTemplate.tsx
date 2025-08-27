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

export interface InvoiceTemplateProps {
  data: InvoiceData;
  showPaymentButton?: boolean;
  onPaymentClick?: () => void;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID';
  paidAmount?: number;
  hasSelectedInvoice?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function InvoiceTemplate({ 
  data, 
  showPaymentButton = false, 
  onPaymentClick, 
  paymentStatus = 'PENDING',
  paidAmount = 0,
  hasSelectedInvoice = false
}: InvoiceTemplateProps) {
  const totalHT = data.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const totalTVA = data.items.reduce((sum, it) => sum + (it.quantity * it.unitPrice * it.tva) / 100, 0);
  const totalTTC = totalHT + totalTVA;

  return (
    <div className="w-full bg-white shadow rounded-md overflow-hidden border print:border-0">
      {/* A4 ratio container */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {/* Header with Logo and Info Table */}
        <div className="flex flex-col sm:flex-row items-start">
          <div className="mr-4 flex-shrink-0 mb-4 sm:mb-0">
            <Image src="/logo.png" alt="CI.DES Logo" width={60} height={60} />
          </div>
          <div className="flex-1">
            {/* Desktop Table */}
            <div className="hidden sm:block">
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
            
            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2">
              <div className="border rounded p-2">
                <div className="font-bold text-xs text-gray-600">Titre</div>
                <div className="text-sm">{data.title}</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-bold text-xs text-gray-600">{data.codeNumberLabel ?? "Numéro de code"}</div>
                <div className="text-sm">{data.codeNumber}</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-bold text-xs text-gray-600">{data.revisionLabel ?? "Révision"}</div>
                <div className="text-sm">{String(data.revision ?? "")}</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-bold text-xs text-gray-600">{data.creationDateLabel ?? "Création date"}</div>
                <div className="text-sm">{data.creationDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Company / Customer blocks + Numéro facture et stagiaire */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 border rounded p-3 text-[11px]">
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

          <div className="lg:col-span-6 border rounded p-3 text-[11px]">
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
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {data.items.map((it, idx) => {
              const montantHT = it.quantity * it.unitPrice;
              return (
                <div key={idx} className="border rounded-lg p-4 bg-white">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Référence:</span>
                      <div className="text-gray-900">{it.reference}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Quantité:</span>
                      <div className="text-gray-900 text-right">{it.quantity.toFixed(2)}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Désignation:</span>
                      <div className="text-gray-900 whitespace-pre-line">{it.designation}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Prix unitaire:</span>
                      <div className="text-gray-900 text-right">{formatCurrency(it.unitPrice)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">TVA:</span>
                      <div className="text-gray-900 text-right">{it.tva.toFixed(2)} %</div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Montant HT:</span>
                      <div className="text-gray-900 text-right font-semibold">{formatCurrency(montantHT)}</div>
                    </div>
                    {it.imageUrl && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Image:</span>
                        <div className="mt-1">
                          <Image
                            src={it.imageUrl}
                            alt="item"
                            width={60}
                            height={60}
                            className="rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Mobile Totals */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Total HT:</span>
                  <span className="font-semibold">{formatCurrency(totalHT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total TVA:</span>
                  <span className="font-semibold">{formatCurrency(totalTVA)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total TTC:</span>
                  <span className="font-bold text-lg">{formatCurrency(totalTTC)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-600 border-t pt-3 space-y-2 sm:space-y-0">
          <div className="text-center sm:text-left flex-1">
            <div><strong>CI.DES sasu</strong> · Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011 · VAT : FR71878407899</div>
          </div>
          <div className="sm:ml-4">Page 1 sur 1</div>
        </div>

        {/* Payment Section */}
        {showPaymentButton && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* Payment Status Info */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Montant total:</span>
                  <span className="ml-2 text-gray-900">{formatCurrency(totalTTC)}</span>
                </div>
                {paymentStatus === 'PARTIAL' && paidAmount > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Montant payé:</span>
                    <span className="ml-2 text-green-600">{formatCurrency(paidAmount)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Reste à payer:</span>
                  <span className="ml-2 text-red-600 font-semibold">
                    {paymentStatus === 'PARTIAL' && paidAmount > 0 
                      ? formatCurrency(totalTTC - paidAmount)
                      : formatCurrency(totalTTC)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            {(paymentStatus === 'PENDING' || paymentStatus === 'PARTIAL') && onPaymentClick && hasSelectedInvoice && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onPaymentClick}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {paymentStatus === 'PARTIAL' 
                    ? `Payer le reste (${formatCurrency(totalTTC - paidAmount)})`
                    : `Payer cette facture (${formatCurrency(totalTTC)})`
                  }
                </button>
              </div>
            )}



            {/* Success Message for Paid Invoice */}
            {paymentStatus === 'PAID' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Facture payée avec succès !</h3>
                <p className="text-gray-600">Votre facture a été entièrement payée.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


