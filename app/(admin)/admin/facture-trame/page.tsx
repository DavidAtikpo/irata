"use client";

import { useEffect, useState } from 'react';
import InvoiceTemplate, { InvoiceData, InvoiceLineItem } from '@/components/InvoiceTemplate';

const defaultData: InvoiceData = {
  title: 'TRAME BDC DEVIS FACTURE',
  codeNumberLabel: 'Numéro de code',
  codeNumber: 'ENR-CIDFA-COMP 002',
  revisionLabel: 'Révision',
  revision: '00',
  creationDateLabel: 'Création date',
  creationDate: new Date().toLocaleDateString('fr-FR'),
  company: {
    name: 'CI.DES',
    contactName: 'CHEZ CHAGNEAU',
    addressLines: ['17270 BORESSE-ET-MARTRON', 'admin38@cides.fr'],
    siret: '87840789900011',
    invoiceNumberLabel: 'FACTURE N°',
    invoiceNumber: 'CI.FF 2508 000',
    invoiceDateLabel: 'Le',
    invoiceDate: new Date().toLocaleDateString('fr-FR'),
  },
  customer: {
    companyTitle: 'FRANCE TRAVAIL DR BRETAGNE',
    addressLines: ['Adresses :'],
    siretLabel: 'N°SIRET :',
    siret: '13000548108070',
    convLabel: 'N°Convention (Enregistrement)',
    conv: '41C27G263296',
    name: '',
    email: '',
    phone: '',
  },
  recipient: {
    name: 'Monsieur Prénom NOM',
    addressLines: ['16 rue des Mésanges', '56330 CAMORS'],
    phone: '+33 6 24 67 13 65',
  },
  items: [
    {
      reference: 'CI.IFF',
      designation:
        'Formation Cordiste IRATA sur 5 jours\nDu 31/03/2025 au 04/04/2025\nSoit 40 heures',
      quantity: 1,
      unitPrice: 1350,
      tva: 0,
    },
  ],
  footerRight: 'Page 1 sur 2',
  showQr: true,
};

export default function FactureTramePage() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings/invoice');
        if (res.ok) {
          const json = await res.json();
          if (json.invoiceTemplate) {
            setData(json.invoiceTemplate as InvoiceData);
          }
        }
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = () => window.print();

  const updateCompany = (field: keyof InvoiceData['company'], value: any) => {
    setData(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };
  const updateCustomer = (field: keyof InvoiceData['customer'], value: any) => {
    setData(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
  };
  const updateRecipient = (field: keyof InvoiceData['recipient'], value: any) => {
    setData(prev => ({ ...prev, recipient: { ...prev.recipient, [field]: value } }));
  };

  const updateItem = (index: number, patch: Partial<InvoiceLineItem>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { reference: '', designation: '', quantity: 1, unitPrice: 0, tva: 0 },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage('');
      const res = await fetch('/api/admin/settings/invoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde');
      setMessage('Modèle de facture enregistré');
    } catch (e) {
      setMessage("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/admin/invoice/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Erreur génération PDF');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const num = data.company.invoiceNumber?.replace(/\s+/g, '_') || 'modele';
      a.download = `facture_${num}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setMessage('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trame de facture</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditor((v) => !v)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 print:hidden"
            aria-expanded={showEditor}
            aria-controls="invoice-editor"
          >
            {showEditor ? 'Masquer la modification' : 'Modifier'}
          </button>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60 print:hidden"
          >
            {downloading ? 'Génération…' : 'Télécharger PDF'}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 print:hidden"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 print:hidden"
          >
            Imprimer
          </button>
        </div>
      </div>

      {message && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 print:hidden">{message}</div>
      )}

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 gap-4">
        {showEditor && (
          <div id="invoice-editor" className="bg-white rounded border p-3 space-y-3 text-sm print:hidden max-h-[80vh] overflow-auto">
          {loading ? (
            <div>Chargement…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Titre</label>
                  <input className="w-full border rounded px-2 py-1" value={data.title}
                    onChange={e => setData({ ...data, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Numéro de code</label>
                  <input className="w-full border rounded px-2 py-1" value={data.codeNumber ?? ''}
                    onChange={e => setData({ ...data, codeNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Révision</label>
                  <input className="w-full border rounded px-2 py-1" value={String(data.revision ?? '')}
                    onChange={e => setData({ ...data, revision: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date de création</label>
                  <input className="w-full border rounded px-2 py-1" value={data.creationDate ?? ''}
                    onChange={e => setData({ ...data, creationDate: e.target.value })} />
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-medium mb-2">Société</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border rounded px-2 py-1" placeholder="Nom"
                    value={data.company.name}
                    onChange={e => updateCompany('name', e.target.value)} />
                  <input className="border rounded px-2 py-1" placeholder="Contact"
                    value={data.company.contactName ?? ''}
                    onChange={e => updateCompany('contactName', e.target.value)} />
                  <textarea className="col-span-2 border rounded px-2 py-1" rows={2}
                    placeholder={'Adresses (une par ligne)'}
                    value={(data.company.addressLines || []).join('\n')}
                    onChange={e => updateCompany('addressLines', e.target.value.split('\n'))}
                  />
                  <input className="border rounded px-2 py-1" placeholder="SIRET"
                    value={data.company.siret ?? ''}
                    onChange={e => updateCompany('siret', e.target.value)} />
                  <input className="border rounded px-2 py-1" placeholder="FACTURE N°"
                    value={data.company.invoiceNumber ?? ''}
                    onChange={e => updateCompany('invoiceNumber', e.target.value)} />
                  <input className="border rounded px-2 py-1" placeholder="Date facture (Le)"
                    value={data.company.invoiceDate ?? ''}
                    onChange={e => updateCompany('invoiceDate', e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-medium mb-2">Client</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border rounded px-2 py-1" placeholder="Intitulé"
                    value={data.customer.companyTitle ?? ''}
                    onChange={e => updateCustomer('companyTitle', e.target.value)} />
                  <textarea className="col-span-2 border rounded px-2 py-1" rows={2}
                    placeholder={'Adresses (une par ligne)'}
                    value={(data.customer.addressLines || []).join('\n')}
                    onChange={e => updateCustomer('addressLines', e.target.value.split('\n'))}
                  />
                  <input className="border rounded px-2 py-1" placeholder="N°SIRET"
                    value={data.customer.siret ?? ''}
                    onChange={e => updateCustomer('siret', e.target.value)} />
                  <input className="border rounded px-2 py-1" placeholder="N°Convention"
                    value={data.customer.conv ?? ''}
                    onChange={e => updateCustomer('conv', e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-medium mb-2">Destinataire</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border rounded px-2 py-1 col-span-2" placeholder="Nom"
                    value={data.recipient.name}
                    onChange={e => updateRecipient('name', e.target.value)} />
                  <textarea className="col-span-2 border rounded px-2 py-1" rows={2}
                    placeholder={'Adresses (une par ligne)'}
                    value={(data.recipient.addressLines || []).join('\n')}
                    onChange={e => updateRecipient('addressLines', e.target.value.split('\n'))}
                  />
                  <input className="border rounded px-2 py-1" placeholder="Téléphone"
                    value={data.recipient.phone ?? ''}
                    onChange={e => updateRecipient('phone', e.target.value)} />
                  <input className="border rounded px-2 py-1" placeholder="Email"
                    value={data.recipient.email ?? ''}
                    onChange={e => updateRecipient('email', e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-medium mb-2">Articles</h3>
                <div className="space-y-3">
                  {data.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 border rounded p-2">
                      <input className="col-span-2 border rounded px-2 py-1" placeholder="Référence"
                        value={it.reference}
                        onChange={e => updateItem(idx, { reference: e.target.value })} />
                      <textarea className="col-span-5 border rounded px-2 py-1" rows={2} placeholder="Désignation"
                        value={it.designation}
                        onChange={e => updateItem(idx, { designation: e.target.value })} />
                      <input type="number" className="col-span-1 border rounded px-2 py-1" placeholder="Qté"
                        value={it.quantity}
                        onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} />
                      <input type="number" className="col-span-2 border rounded px-2 py-1" placeholder="PU"
                        value={it.unitPrice}
                        onChange={e => updateItem(idx, { unitPrice: Number(e.target.value) })} />
                      <input type="number" className="col-span-1 border rounded px-2 py-1" placeholder="TVA %"
                        value={it.tva}
                        onChange={e => updateItem(idx, { tva: Number(e.target.value) })} />
                      <button onClick={() => removeItem(idx)} className="col-span-1 text-red-600 hover:underline">Suppr.</button>
                    </div>
                  ))}
                  <button onClick={addItem} className="px-3 py-1 border rounded hover:bg-gray-50">Ajouter un article</button>
                </div>
              </div>
            </>
          )}
          </div>
        )}

        {/* Preview */}
        <div className="overflow-auto">
          <InvoiceTemplate data={data} />
        </div>
      </div>
    </div>
  );
}


